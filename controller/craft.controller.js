import Craft from "../models/craft.model.js";

// Helper function to extract array from request body safely
const parseArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return Object.values(data);
};

export const createCraft = async (req, res, next) => {
  try {
    const {
      folkloreMaterial,
      craftName,
      workplace,
      workHoursPerDay,
      craftsmenType, // Can be array or string if single selected
      craftsmenCount,
      craftsmen,
      rawMaterials,
      tools,
      workSteps,
      products
    } = req.body;

    // Helper functions for files
    const getFile = (fieldname) => {
      if (!req.files) return undefined;
      const file = req.files.find(f => f.fieldname === fieldname);
      return file ? file.path : undefined;
    };

    // Clean Arrays
    let parsedCraftsmen = parseArray(craftsmen);
    let cleanCraftsmen = parsedCraftsmen.map(p => {
      if (p.education === "") delete p.education;
      if (p.experience && p.experience.source === "") delete p.experience.source;
      return p;
    });

    let parsedRawMaterials = parseArray(rawMaterials);
    let cleanRawMaterials = parsedRawMaterials.map((rm, index) => {
      if (rm.source === "") delete rm.source;
      rm.image = getFile(`rawMaterials_${index}_image`);
      return rm;
    });

    let parsedTools = parseArray(tools);
    let cleanTools = parsedTools.map((t, index) => {
      t.usageImage = getFile(`tools_${index}_usageImage`);
      t.usageVideo = getFile(`tools_${index}_usageVideo`);
      return t;
    });

    let parsedWorkSteps = parseArray(workSteps);
    let cleanWorkSteps = parsedWorkSteps.map((ws, index) => {
      if (ws.mediaType === "") delete ws.mediaType;
      ws.mediaUrl = getFile(`workSteps_${index}_mediaUrl`);
      return ws;
    });

    let parsedProducts = parseArray(products);
    let cleanProducts = parsedProducts.map((prod, index) => {
      prod.image = getFile(`products_${index}_image`);
      return prod;
    });

    // Ensure craftsmenType is an array
    let parsedCraftsmenType = [];
    if (craftsmenType) {
      parsedCraftsmenType = Array.isArray(craftsmenType) ? craftsmenType : [craftsmenType];
    }

    const newCraft = new Craft({
      folkloreMaterial,
      craftName,
      workplace: workplace || undefined,
      workHoursPerDay: workHoursPerDay ? Number(workHoursPerDay) : undefined,
      craftsmenType: parsedCraftsmenType,
      craftsmenCount: craftsmenCount ? Number(craftsmenCount) : undefined,
      craftsmen: cleanCraftsmen,
      rawMaterials: cleanRawMaterials,
      tools: cleanTools,
      workSteps: cleanWorkSteps,
      products: cleanProducts,
    });

    await newCraft.save();

    req.session.flashSuccess = "تمت إضافة الحرفة الشعبية بنجاح!";
    return res.redirect("/");
  } catch (error) {
    next(error);
  }
};
