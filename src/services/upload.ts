import { Request, Response } from 'express';

export const postUpload = (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ status: 'error', message: 'File is missing in upload' });
  }

  return res.json({ status: 'success', data: req.file['location'] });
};
