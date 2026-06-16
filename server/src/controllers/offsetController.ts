import { Request, Response, NextFunction } from 'express';
import { prisma } from '../services/footprint';
import type { ApiResponse } from '../types';

export interface OffsetProject {
  id: string;
  name: string;
  description: string;
  location: string;
  costPerTonUSD: number;
  category: string;
  image: string;
}

export const OFFSET_PROJECTS: OffsetProject[] = [
  {
    id: 'amazon-reforestation',
    name: 'Amazon Rainforest Protection',
    description: 'Supports local community forest guards and preserves critical forest habitats from illegal logging in Brazil.',
    location: 'Amazonas, Brazil',
    costPerTonUSD: 15,
    category: 'Forestry',
    image: 'reforestation',
  },
  {
    id: 'india-wind',
    name: 'Wind Energy Infrastructure',
    description: 'Displaces grid-based fossil-fuel electricity by building wind turbines in coastal Tamil Nadu.',
    location: 'Tamil Nadu, India',
    costPerTonUSD: 10,
    category: 'Renewables',
    image: 'wind',
  },
  {
    id: 'kenya-cookstoves',
    name: 'Clean Cookstoves for Families',
    description: 'Reduces wood consumption and carbon emissions by providing high-efficiency biomass stoves to rural Kenyan communities.',
    location: 'Nyanza Province, Kenya',
    costPerTonUSD: 12,
    category: 'Community',
    image: 'cookstove',
  },
  {
    id: 'solar-park-sahara',
    name: 'North Africa Solar Initiative',
    description: 'Harnesses abundant Saharan solar energy to feed clean electricity into the regional grid network.',
    location: 'Ouarzazate, Morocco',
    costPerTonUSD: 18,
    category: 'Renewables',
    image: 'solar',
  }
];

/**
 * GET /api/offsets
 * Returns list of projects, user pledges, and aggregated offset stats.
 */
export const getOffsets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const pledges = await prisma.offsetPledge.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const totalOffset = pledges.reduce((sum, p) => sum + p.amount, 0);

    res.json({
      success: true,
      data: {
        projects: OFFSET_PROJECTS,
        pledges,
        totalOffset: Math.round(totalOffset * 100) / 100,
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/offsets
 * Creates a new offset pledge.
 */
export const createPledge = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { project, amount } = req.body;

    if (!project || typeof project !== 'string') {
      res.status(400).json({ success: false, error: 'Project identifier is required' });
      return;
    }

    if (typeof amount !== 'number' || amount <= 0) {
      res.status(400).json({ success: false, error: 'Offset amount must be a positive number' });
      return;
    }

    // Verify project exists
    const projectExists = OFFSET_PROJECTS.some(p => p.id === project || p.name === project);
    if (!projectExists) {
      res.status(400).json({ success: false, error: 'Invalid project selection' });
      return;
    }

    const pledge = await prisma.offsetPledge.create({
      data: {
        userId,
        project,
        amount,
      }
    });

    res.status(201).json({
      success: true,
      data: pledge
    });
  } catch (error) {
    next(error);
  }
};
