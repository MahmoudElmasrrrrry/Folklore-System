import { Router } from "express";
import mawwalModel from "../models/FolkloreMaterial.model.js";
import narratorModel from "../models/narrator.model.js";
import missionModel from "../models/mission.model.js";
import AppError from "../utils/appError.js";

export const createMawwal = async (req, res, next) => {
  try {
    const {
      fieldMaterialData,
      narrator,
      collectionData,
      subjectData,
      mission,
      fieldMaterialType,
      dataSource,
    } = req.body;

    const narratorExists = await narratorModel.findOne({
      name: narrator.name,
      age: narrator.age,
    });

    let narratorId;

    if (narratorExists) {
      narratorId = narratorExists._id;
    } else {
      const newNarrator = await narratorModel.create({
        name: narrator.name,
        age: narrator.age,
        status: narrator.status,
        occupation: narrator.occupation,
        additionalInfo: narrator.additionalInfo,
      });

      narratorId = newNarrator._id;
    }
    
    if( !mission || !mission.missionNumber) {
      throw new AppError("Mission data is required", 400);
    }
    const missionExists = await missionModel.findOne({
      missionNumber: mission.missionNumber,
    });

    
    if (!missionExists) {
      throw new AppError("Mission not found", 404);
    }

    const missionId = missionExists._id;

    const newMawwal = await mawwalModel.create({
      fieldMaterialData,
      narrator: narratorId,
      collectionData,
      subjectData,
      mission: missionId,
      fieldMaterialType,
      dataSource,
    });
    
    return res.status(201).json({
      message: "Mawwal created successfully",
      data: newMawwal,
    });
  } catch (error) {
    next(error);
  }
};
