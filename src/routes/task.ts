import { taskIdSchema } from "@src/controllers/schemas/task.js";
import * as taskCtrl from "@src/controllers/task.js";
import { jwtAuth } from "@src/middlewares/auth.js";
import { validateParams } from "@src/middlewares/validate.js";
import type { RequestHandler } from "express";
import { Router } from "express";

const router: Router = Router();

router.get(
	"/:id",
	jwtAuth,
	validateParams(taskIdSchema),
	taskCtrl.getTask as unknown as RequestHandler,
);

export default router;
