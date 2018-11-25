import { Request, Response } from 'express';
import { logger } from '../logger';

export const postError = (req: Request, res: Response) => {
  logger.error(req.body.error);

  return res.json({ status: 'success', data: null });
};
