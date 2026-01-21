import {
	patchTaskSchema,
	taskIdSchema,
	taskStateParamSchema,
} from "@src/controllers/schemas/task.js";
import * as taskCtrl from "@src/controllers/task.js";
import { jwtAuth } from "@src/middlewares/auth.js";
import { validate, validateParams } from "@src/middlewares/validate.js";
import type { RequestHandler } from "express";
import { Router } from "express";

const router: Router = Router();

router.get(
	"/:id",
	jwtAuth,
	validateParams(taskIdSchema),
	taskCtrl.getTask as unknown as RequestHandler,
);

router.post(
	"/:id/:state",
	jwtAuth,
	validateParams(taskIdSchema),
	validateParams(taskStateParamSchema),
	taskCtrl.setTaskStatus as unknown as RequestHandler,
);

router.patch(
	"/:id",
	jwtAuth,
	validateParams(taskIdSchema),
	validate(patchTaskSchema),
	taskCtrl.patchTask as unknown as RequestHandler,
);

router.delete(
	"/:id",
	jwtAuth,
	validateParams(taskIdSchema),
	taskCtrl.deleteTask as unknown as RequestHandler,
);

export default router;
