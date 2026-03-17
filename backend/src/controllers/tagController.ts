import { Request, Response } from 'express';
import { TagService } from '../services/tagService';

export const searchTags = async (req: Request, res: Response) => {
  try {
    const data = await TagService.search(req.query.search as string || '');
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTag = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: 'name required' });
    const tag = await TagService.create(name.trim());
    res.status(201).json({ success: true, data: tag });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const setProductTags = async (req: Request, res: Response) => {
  try {
    const { tagIds } = req.body;
    const data = await TagService.setProductTags(Number(req.params.id), tagIds || []);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
