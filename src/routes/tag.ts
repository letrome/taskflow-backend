import { patchTagSchema, tagIdSchema } from "@src/controllers/schemas/tag.js";

import * as tagCtrl from "@src/controllers/tag.js";
import { jwtAuth } from "@src/middlewares/auth.js";
import { validate, validateParams } from "@src/middlewares/validate.js";
import { type RequestHandler, Router } from "express";

const router: Router = Router();

router.patch(
	"/:id",
	jwtAuth,
	validateParams(tagIdSchema),
	validate(patchTagSchema),
	tagCtrl.patchTag as unknown as RequestHandler,
);

router.delete(
	"/:id",
	jwtAuth,
	validateParams(tagIdSchema),
	tagCtrl.deleteTag as unknown as RequestHandler,
);

export default router;
