import danceModel from "../models/dance.model.js";

export const createDance = async (req, res, next) => {
  try {
    const {
      folkloreMaterial, // Hidden input
      danceName,
      occasion,
      mediumType,
      descriptionText,
      presentationStyle,
      performersCount,
      performers, // Expected to be array of objects from dynamic form
      tools, // Expected to be array of objects
      costumeWomenName,
      costumeWomenDesc,
      costumeMenName,
      costumeMenDesc,
      accompanimentType,
      songName,
    } = req.body;

    // Helper function to get a single file path by fieldname
    const getFile = (fieldname) => {
      if (!req.files) return undefined;
      const file = req.files.find(f => f.fieldname === fieldname);
      return file ? `/uploads/media/${file.filename}` : undefined;
    };

    // Helper function to get multiple file paths by fieldname
    const getFiles = (fieldname) => {
      if (!req.files) return [];
      return req.files.filter(f => f.fieldname === fieldname).map(f => `/uploads/media/${f.filename}`);
    };

    // Filter and enrich tools with media
    const cleanTools = Array.isArray(tools) ? tools.map((t, index) => {
      if (!t.name && !t.description) return null;
      return {
        ...t,
        image: getFile(`tools_${index}_image`),
        video: getFile(`tools_${index}_video`)
      };
    }).filter(Boolean) : [];

    // Filter performers
    const cleanPerformers = Array.isArray(performers) ? performers.filter(p => p.age || p.education || p.occupation || p.gender).map(p => {
      if (p.gender === "") delete p.gender;
      if (p.education === "") delete p.education;
      if (p.experience && p.experience.source === "") delete p.experience.source;
      return p;
    }) : [];

    const newDance = await danceModel.create({
      folkloreMaterial,
      danceName,
      occasion: occasion || undefined,
      mediumType: mediumType || undefined,
      description: {
        text: descriptionText || undefined,
        videoUrl: getFile("descriptionVideo"),
        images: getFiles("descriptionImages")
      },
      presentationStyle: presentationStyle || undefined,
      performersCount: performersCount ? Number(performersCount) : undefined,
      performers: cleanPerformers,
      tools: cleanTools,
      costumes: {
        women: {
          name: costumeWomenName || undefined,
          description: costumeWomenDesc || undefined,
          image: getFile("costumeWomenImage")
        },
        men: {
          name: costumeMenName || undefined,
          description: costumeMenDesc || undefined,
          image: getFile("costumeMenImage")
        },
      },
      music: {
        accompanimentType: accompanimentType || undefined,
        audioUrl: getFile("audioFile"),
        songName: songName || undefined,
        lyricsFileUrl: getFile("lyricsFileUrl")
      }
    });

    return res.redirect("/?success=true");
  } catch (error) {
    next(error);
  }
};
