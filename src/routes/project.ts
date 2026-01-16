import * as projectCtrl from "@src/controllers/project.js";
import { createProjectSchema } from "@src/controllers/schemas/project.js";
import { jwtAuth } from "@src/middlewares/auth.js";
import { validate } from "@src/middlewares/validate.js";
import express from "express";

const router: express.Router = express.Router();

router.get(["/:id"], jwtAuth, projectCtrl.getProject);
router.get(["/"], jwtAuth, projectCtrl.getProjects);
router.post(
	["/"],
	jwtAuth,
	validate(createProjectSchema),
	projectCtrl.createProject,
);

export default router;
