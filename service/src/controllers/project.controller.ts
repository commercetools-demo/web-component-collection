import { Request, Response } from "express";
import { getProjectSettings } from "../services/project";

export const getProjectSettingsController = async (req: Request, res: Response) => {
    try {
      const projectSettings = await getProjectSettings();
      res.status(200).json(projectSettings);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };