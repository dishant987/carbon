import { GoogleGenerativeAI } from '@google/generative-ai';
import { FootprintResult } from '../types';
import { ExternalServiceError } from '../utils/errors';
import { getCachedFootprint, setCachedFootprint } from './cache';
import logger from '../utils/logger';

let genAI: GoogleGenerativeAI | null = null;

export function getClient(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new ExternalServiceError('GEMINI_API_KEY is not configured');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export async function calculateFootprint(
  type: string,
  category: string,
  amount: number,
  unit: string
): Promise<FootprintResult> {
  const cached = await getCachedFootprint(type, category, amount, unit);
  if (cached) {
    return cached;
  }

  try {
    const client = getClient();
    const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = [
      'You are a carbon footprint calculator. Calculate the CO2 emissions in kg for:',
      '',
      `Activity type: ${type}`,
      `Category: ${category}`,
      `Amount: ${amount} ${unit}`,
      '',
      'Use standard emission factors from environmental databases.',
      'Return ONLY a valid JSON object with exactly these fields:',
      '{',
      '  "co2Kg": <number with 2 decimal places>,',
      '  "explanation": "<brief explanation of calculation>"',
      '}',
      '',
      'Example: {"co2Kg": 2.5, "explanation": "A car emits approximately 0.12 kg CO2 per km"}',
    ].join('\n');

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new ExternalServiceError('No valid JSON found in Gemini response');
    }

    const parsed: FootprintResult = JSON.parse(jsonMatch[0]);

    if (typeof parsed.co2Kg !== 'number' || typeof parsed.explanation !== 'string') {
      throw new ExternalServiceError('Invalid response structure from Gemini');
    }

    const footprint: FootprintResult = {
      co2Kg: Math.round(parsed.co2Kg * 100) / 100,
      explanation: parsed.explanation,
    };

    await setCachedFootprint(type, category, amount, unit, footprint);

    return footprint;
  } catch (error) {
    if (error instanceof ExternalServiceError) {
      throw error;
    }
    throw new ExternalServiceError(
      `Gemini API error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function generateTips(
  activities: Array<{ type: string; category: string; footprint: number }>
): Promise<string[]> {
  try {
    const client = getClient();
    const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const activitySummary = activities
      .map((a) => `- ${a.type}/${a.category}: ${a.footprint.toFixed(2)} kg CO2`)
      .join('\n');

    const prompt = [
      'Based on the following carbon footprint activities, provide 3-5 personalized tips',
      "to reduce the user's environmental impact. Be specific and actionable.",
      '',
      'Activities:',
      activitySummary || 'No activities recorded yet - provide general tips.',
      '',
      'Return ONLY a JSON array of strings. Example:',
      '["Replace car trips under 2km with walking", "Reduce food waste by meal planning"]',
    ].join('\n');

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return getDefaultTips();
    }

    const parsed: string[] = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return getDefaultTips();
    }

    return parsed;
  } catch {
    return getDefaultTips();
  }
}

function getDefaultTips(): string[] {
  return [
    'Consider using public transportation instead of personal vehicles.',
    'Reduce meat and dairy consumption to lower food carbon footprint.',
    'Switch to energy-efficient appliances and LED bulbs.',
    'Buy local and seasonal products to reduce shopping emissions.',
    'Practice the 3 Rs: Reduce, Reuse, Recycle whenever possible.',
    'Unplug electronics when not in use to save standby power.',
    'Take shorter showers and fix leaks to conserve water.',
    'Start composting food waste instead of sending it to landfill.',
  ];
}

export async function checkGeminiStatus(): Promise<{
  success: boolean;
  status: string;
  model: string;
  error?: string;
}> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return {
      success: false,
      status: 'Unconfigured',
      model: 'gemini-2.5-flash',
      error: 'GEMINI_API_KEY environment variable is not defined.',
    };
  }
  try {
    const client = getClient();
    const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: 'Respond with the word "OK" only.' }] }],
      generationConfig: { maxOutputTokens: 5 },
    });

    const text = result.response.text().trim();
    if (text) {
      return {
        success: true,
        status: 'Connected & Operational',
        model: 'gemini-2.5-flash',
      };
    }
    return {
      success: false,
      status: 'Degraded',
      model: 'gemini-2.5-flash',
      error: 'Received empty response from Gemini API.',
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown Gemini API error.';
    return {
      success: false,
      status: 'Connection Error',
      model: 'gemini-2.5-flash',
      error: message,
    };
  }
}
