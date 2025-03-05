import { Request, Response } from 'express';

export const getGoogleMapApiKey = async (req: Request, res: Response) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  res.send(apiKey);
};
