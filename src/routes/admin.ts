import * as adminCtrl from "@src/controllers/admin.js";
import { createUserSchema } from "@src/controllers/schemas/user.js";
import { basicAuth } from "@src/middlewares/auth.js";
import { validate } from "@src/middlewares/validate.js";
import express from "express";

const router: express.Router = express.Router();

router.get("/health", basicAuth, adminCtrl.getHealth);
router.get("/version", basicAuth, adminCtrl.getVersion);
router.get("/metrics", basicAuth, adminCtrl.getMetrics);
router.post(
	"/admin/users",
	basicAuth,
	validate(createUserSchema),
	adminCtrl.createUser,
);
router.get("/admin/users/:id", basicAuth, adminCtrl.getUser);

export default router;
