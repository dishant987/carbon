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

export interface SustainabilityReport {
  grade: string;
  score: number;
  analysis: string;
  actionPlan: Array<{
    week: number;
    challengeName: string;
    description: string;
    expectedSavingKg: number;
  }>;
}

export async function generateSustainabilityReport(
  activities: Array<{ type: string; category: string; footprint: number; amount: number; unit: string }>,
  weeklyGoal: number
): Promise<SustainabilityReport> {
  try {
    const client = getClient();
    const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const activitySummary = activities
      .map((a) => `- ${a.type}/${a.category}: ${a.amount} ${a.unit} (${a.footprint.toFixed(2)} kg CO2)`)
      .join('\n');

    const prompt = [
      'You are a carbon emissions auditor. Create a Sustainability Report Card based on the user\'s activity log over the past 30 days.',
      `User's weekly target limit: ${weeklyGoal} kg CO2.`,
      '',
      'Activities log:',
      activitySummary || 'No activities logged in the last 30 days.',
      '',
      'Generate a JSON response containing:',
      '1. "grade": A letter grade (A+, A, A-, B+, B, B-, C+, C, C-, D, F) evaluating their environmental impact (lower total emissions relative to the goal is better).',
      '2. "score": An eco-score out of 100 (high score = excellent performance, low emissions; low score = high footprint).',
      '3. "analysis": A detailed, friendly, and actionable paragraph explaining the primary drivers of their emissions and what they did well.',
      '4. "actionPlan": An array of exactly 4 weekly challenges to help them reduce emissions next month.',
      'Each challenge must have: "week" (number 1-4), "challengeName" (string), "description" (string), "expectedSavingKg" (number, estimation of CO2 saved).',
      '',
      'Return ONLY a valid JSON object matching this structure:',
      '{',
      '  "grade": "B+",',
      '  "score": 82,',
      '  "analysis": "Your carbon footprint is primarily driven by your daily commute. However, you did great by consuming mostly vegetable-based meals.",',
      '  "actionPlan": [',
      '    {',
      '      "week": 1,',
      '      "challengeName": "Carpool to Work",',
      '      "description": "Share rides with colleagues twice this week.",',
      '      "expectedSavingKg": 12.5',
      '    },',
      '    ...',
      '  ]',
      '}'
    ].join('\n');

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in Gemini sustainability report response');
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    logger.error('Error generating AI sustainability report:', error);
    return {
      grade: 'B',
      score: 75,
      analysis: 'Could not generate custom report due to API limitations. Try adding more activities to improve the accuracy of your carbon analysis. Generally, minimizing personal car use and switching to energy-efficient products will help you stay within your target emissions.',
      actionPlan: [
        {
          week: 1,
          challengeName: 'Low-Carbon Commuting',
          description: 'Try walking, biking, or taking public transit for short trips instead of driving.',
          expectedSavingKg: 8.5
        },
        {
          week: 2,
          challengeName: 'Plant-Based Eating',
          description: 'Introduce two fully vegetarian or vegan days this week.',
          expectedSavingKg: 5.0
        },
        {
          week: 3,
          challengeName: 'Energy Efficiency Audit',
          description: 'Unplug devices when fully charged and turn off unused lights.',
          expectedSavingKg: 6.0
        },
        {
          week: 4,
          challengeName: 'Conscious Shopping',
          description: 'Avoid buying new clothes or electronics this week unless absolutely necessary.',
          expectedSavingKg: 10.0
        }
      ]
    };
  }
}

export interface RecipeAnalysis {
  recipeName: string;
  totalFootprintKg: number;
  ingredientsAnalysis: Array<{
    name: string;
    footprintKg: number;
    impact: 'high' | 'medium' | 'low';
  }>;
  plantBasedAlternative: string;
  alternativeFootprintKg: number;
  explanation: string;
}

export async function analyzeRecipe(recipeText: string): Promise<RecipeAnalysis> {
  try {
    const client = getClient();
    const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = [
      'You are an expert chef and carbon footprint analyst. Analyze the carbon footprint of the following recipe or list of ingredients:',
      recipeText,
      '',
      'Generate a JSON response containing:',
      '1. "recipeName": A friendly name for the recipe.',
      '2. "totalFootprintKg": The total estimated carbon footprint in kg CO2 for this recipe.',
      '3. "ingredientsAnalysis": An array of each key ingredient with: "name" (string), "footprintKg" (number), and "impact" (either "high", "medium", or "low").',
      '4. "plantBasedAlternative": A vegan or plant-based recipe alternative name that reduces carbon footprint.',
      '5. "alternativeFootprintKg": The estimated footprint in kg CO2 for the plant-based alternative.',
      '6. "explanation": A detailed explanation of why some ingredients have high footprints (e.g. beef, cheese) and the benefits of swapping them for lentils, beans, or vegetables.',
      '',
      'Return ONLY a valid JSON object matching this structure:',
      '{',
      '  "recipeName": "Classic Beef Lasagna",',
      '  "totalFootprintKg": 12.5,',
      '  "ingredientsAnalysis": [',
      '    { "name": "Ground Beef", "footprintKg": 9.2, "impact": "high" },',
      '    { "name": "Cheese", "footprintKg": 1.8, "impact": "high" },',
      '    { "name": "Pasta Sheets", "footprintKg": 0.5, "impact": "low" }',
      '  ],',
      '  "plantBasedAlternative": "Lentil & Vegetable Lasagna",',
      '  "alternativeFootprintKg": 2.1,',
      '  "explanation": "Replacing ground beef and heavy cheese with lentils, zucchini, and a light cashew sauce drastically reduces the carbon footprint by over 80% because beef and dairy are highly resource-intensive compared to plant legumes." ',
      '}'
    ].join('\n');

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in Gemini recipe analysis response');
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    logger.error('Error analyzing recipe carbon footprint:', error);
    return {
      recipeName: 'Analyzed Recipe',
      totalFootprintKg: 6.5,
      ingredientsAnalysis: [
        { name: 'Meat/Animal Protein', footprintKg: 5.0, impact: 'high' },
        { name: 'Dairy & Fats', footprintKg: 1.0, impact: 'medium' },
        { name: 'Grains & Vegetables', footprintKg: 0.5, impact: 'low' }
      ],
      plantBasedAlternative: 'Green Garden Harvest Medley',
      alternativeFootprintKg: 1.5,
      explanation: 'Could not contact Gemini AI for detailed analysis. Generally, replacing red meat and dairy with local grains, pulses, and vegetables will decrease your meal\'s carbon footprint by 60% to 90%.'
    };
  }
}

