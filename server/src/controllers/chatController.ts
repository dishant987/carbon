import { Request, Response, NextFunction } from 'express';
import { prisma } from '../services/footprint';
import { invalidateDashboardCache } from '../services/cache';
import { getClient } from '../services/gemini';
import { ApiResponse } from '../types';
import { chatMessageSchema } from '../utils/validation';
import { ValidationError } from '../utils/errors';
import logger from '../utils/logger';

interface GeminiContentPart {
  text: string;
}

interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiContentPart[];
}

interface ChatActivity {
  type?: string;
  desc?: string;
  co2_kg?: number;
}

export const getChatHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const messages = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const chronologicalMessages = messages.reverse();

    const response: ApiResponse<typeof chronologicalMessages> = {
      success: true,
      data: chronologicalMessages,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const parsed = chatMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors.map((e) => e.message).join(', '));
    }

    const { message, history } = parsed.data;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const client = getClient();
    const systemPrompt = `You are EcoBot, a friendly carbon footprint assistant.
When user describes activities, extract them and calculate CO2.
At the end of response always return a JSON block:
<activities>
[{"type":"transport","desc":"Drove 25km","co2_kg":4.1}]
</activities>
Be conversational, encouraging, use line breaks. No markdown headers.`;

    const model = client.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt,
    });

    const contents: GeminiContent[] = [];
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        if (msg.content && msg.role) {
          contents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
          });
        }
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const abortController = new AbortController();
    req.on('close', () => abortController.abort());

    let fullBotResponse = '';

    try {
      const result = await model.generateContentStream({ contents }, { signal: abortController.signal });

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          fullBotResponse += text;
          res.write(`data: ${JSON.stringify({ chunk: text })}\n\n`);
        }
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (streamError) {
      const isAbort = streamError instanceof Error && streamError.name === 'AbortError';

      if (!isAbort) {
        logger.error({ err: streamError }, 'Error during streaming');
      }

      if (!res.writableEnded) {
        if (isAbort) {
          res.write(`data: ${JSON.stringify({ cancelled: true })}\n\n`);
        } else {
          let errorMessage = 'Stream interrupted';
          if (streamError instanceof Error) {
            errorMessage = streamError.message;
          } else if (typeof streamError === 'string') {
            errorMessage = streamError;
          } else {
            errorMessage = JSON.stringify(streamError);
          }
          res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
        }
        res.end();
      }
      return;
    }

    (async () => {
      try {
        await prisma.chatMessage.create({
          data: {
            userId,
            role: 'user',
            content: message,
          },
        });

        await prisma.chatMessage.create({
          data: {
            userId,
            role: 'bot',
            content: fullBotResponse,
          },
        });

        const match = fullBotResponse.match(/<activities>([\s\S]*?)<\/activities>/);
        if (match) {
          try {
            const jsonStr = match[1].trim();
            const activities: ChatActivity[] = JSON.parse(jsonStr);
            if (Array.isArray(activities)) {
              for (const act of activities) {
                if (act && typeof act.co2_kg === 'number') {
                  let activityType = 'shopping';
                  const typeLower = (act.type || '').toLowerCase();
                  if (['transport', 'food', 'energy', 'shopping'].includes(typeLower)) {
                    activityType = typeLower;
                  }

                  await prisma.activity.create({
                    data: {
                      userId,
                      type: activityType,
                      category: act.desc || 'Logged via Chat',
                      amount: 1,
                      unit: 'event',
                      footprint: act.co2_kg,
                      date: new Date(),
                    },
                  });
                }
              }
            }
          } catch (jsonErr) {
            logger.error({ err: jsonErr }, 'Failed to parse activities JSON from Gemini response');
          }
        }

        if (match) {
          await invalidateDashboardCache(userId);
        }
      } catch (dbErr) {
        logger.error({ err: dbErr }, 'Error saving chat message or activities to DB');
      }
    })().catch((err) => logger.error({ err }, 'Unhandled error in chat background task'));
  } catch (error) {
    next(error);
  }
};

export const clearChatHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    await prisma.chatMessage.deleteMany({
      where: { userId },
    });
    const response: ApiResponse<null> = {
      success: true,
      data: null,
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
};
