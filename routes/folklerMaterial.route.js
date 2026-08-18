import {Router} from "express";
import { createFolkloreMaterial } from "../controller/folklerMaterial.controller.js";
const router = Router();


router.post('/', createFolkloreMaterial );






export default router;