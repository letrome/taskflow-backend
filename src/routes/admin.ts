import * as adminCtrl from "@src/controllers/admin.js";
import {
	createUserSchema,
	userIdSchema,
} from "@src/controllers/schemas/user.js";
import { basicAuth } from "@src/middlewares/auth.js";
import { validate, validateParams } from "@src/middlewares/validate.js";
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
router.get(
	"/admin/users/:id",
	basicAuth,
	validateParams(userIdSchema),
	adminCtrl.getUser,
);

export default router;
