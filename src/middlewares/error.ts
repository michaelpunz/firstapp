import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger';

export function errorHandler(error, req: Request, res: Response, next: NextFunction) {
  logger.error(error);

  return res.status(400).json({ status: 'error', message: error.message });
}
