import {Router} from "express";
import { createMawwal } from "../controller/mawwal.controller.js";
const router = Router();

router.post('/', createMawwal);

export default router;