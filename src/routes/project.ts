import * as projectCtrl from "@src/controllers/project.js";
import {
	addProjectMemberSchema,
	createOrUpdateProjectSchema,
	memberIdSchema,
	patchProjectSchema,
	projectIdSchema,
} from "@src/controllers/schemas/project.js";

import { createTagSchema } from "@src/controllers/schemas/tag.js";
import { createTaskSchema } from "@src/controllers/schemas/task.js";
import { jwtAuth } from "@src/middlewares/auth.js";
import { validate, validateParams } from "@src/middlewares/validate.js";
import { type RequestHandler, Router } from "express";

const router: Router = Router();

router.get(
	"/:id",
	jwtAuth,
	validateParams(projectIdSchema),
	projectCtrl.getProject as unknown as RequestHandler,
);
router.get("/", jwtAuth, projectCtrl.getProjects as unknown as RequestHandler);
router.post(
	"/",
	jwtAuth,
	validate(createOrUpdateProjectSchema),
	projectCtrl.createProject as unknown as RequestHandler,
);
router.put(
	"/:id",
	jwtAuth,
	validateParams(projectIdSchema),
	validate(createOrUpdateProjectSchema),
	projectCtrl.updateProject as unknown as RequestHandler,
);
router.patch(
	"/:id",
	jwtAuth,
	validateParams(projectIdSchema),
	validate(patchProjectSchema),
	projectCtrl.patchProject as unknown as RequestHandler,
);
router.delete(
	"/:id",
	jwtAuth,
	validateParams(projectIdSchema),
	projectCtrl.deleteProject as unknown as RequestHandler,
);
router.post(
	"/:id/members",
	jwtAuth,
	validateParams(projectIdSchema),
	validate(addProjectMemberSchema),
	projectCtrl.addProjectMember as unknown as RequestHandler,
);
router.delete(
	"/:id/members/:memberId",
	jwtAuth,
	validateParams(projectIdSchema),
	validateParams(memberIdSchema),
	projectCtrl.removeProjectMember as unknown as RequestHandler,
);

router.post(
	"/:id/tags",
	jwtAuth,
	validateParams(projectIdSchema),
	validate(createTagSchema),
	projectCtrl.createProjectTag as unknown as RequestHandler,
);

router.get(
	"/:id/tags",
	jwtAuth,
	validateParams(projectIdSchema),
	projectCtrl.getProjectTags as unknown as RequestHandler,
);

router.post(
	"/:id/tasks",
	jwtAuth,
	validateParams(projectIdSchema),
	validate(createTaskSchema),
	projectCtrl.createProjectTask as unknown as RequestHandler,
);

export default router;
