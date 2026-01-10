import express from "express";
import * as adminCtrl from "../controllers/admin.js";
import basicAuth from "../middlewares/auth.js";

const router: express.Router = express.Router();

router.get("/health", basicAuth, adminCtrl.getHealth);
router.get("/version", basicAuth, adminCtrl.getVersion);
router.get("/metrics", basicAuth, adminCtrl.getMetrics);

export default router;
