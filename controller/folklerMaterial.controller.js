import folkloreMaterialModel from "../models/folkloreMaterial.model.js";
import narratorModel from "../models/narrator.model.js";
import missionModel from "../models/mission.model.js";
import collectorModel from "../models/collector.model.js";

export const createFolkloreMaterial = async (req, res, next) => {
  try {
    const {
      narrator,
      mission,
      collector,
      fieldMaterialType,
      subjectData,
      collectionData,
      dataSource,
    } = req.body;

    // 1. Find or Create Narrator
    let narratorExists = await narratorModel.findOne({
      name: narrator.name,
      age: narrator.age,
    });

    if (!narratorExists) {
      narratorExists = await narratorModel.create(narrator);
    }

    // 2. Find or Create Mission
    let missionExists = await missionModel.findOne({
      missionNumber: mission.missionNumber,
    });

    if (!missionExists) {
      missionExists = await missionModel.create(mission);
    }

    // 3. Find or Create Collector
    let collectorExists = await collectorModel.findOne({
      name: collector.name,
    });

    if (!collectorExists) {
      collectorExists = await collectorModel.create(collector);
    }

    // 4. Create Folklore Material
    const folkloreMaterial = await folkloreMaterialModel.create({
      narrator: narratorExists._id,
      mission: missionExists._id,
      collector: collectorExists._id,
      fieldMaterialType,
      subjectData,
      collectionData,
      dataSource,
    });

    // 5. Response
    return res.status(201).json({
      status: "success",
      message: "Folklore material created successfully",
      folkloreMaterial: folkloreMaterial._id,
    });
  } catch (error) {
    next(error);
  }
};