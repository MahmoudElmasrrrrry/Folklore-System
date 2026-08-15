import {Router} from "express";
import { createMawwal } from "../controller/mawwal.controller.js";
const router = Router();

router.get('/');

router.post('/', createMawwal);






export default router;