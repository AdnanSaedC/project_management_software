import { Router } from "express";
import {healthCheck} from "../controller/healthcheck.controller.js"

const router = Router()
router.route("/").get(healthCheck)
//after slash for get method return healthcheck function

export default router;
