import {Router} from "express";
import { createFolkloreMaterial } from "../controller/folkloreMaterial.controller.js";
const router = Router();


router.post('/', createFolkloreMaterial );






export default router;