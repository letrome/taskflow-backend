import { patchTagSchema } from "@src/controllers/schemas/tag.js";
import * as tagCtrl from "@src/controllers/tag.js";

import { jwtAuth } from "@src/middlewares/auth.js";
import { validate } from "@src/middlewares/validate.js";
import express from "express";

const router: express.Router = express.Router();

router.patch("/:id", jwtAuth, validate(patchTagSchema), tagCtrl.patchTag);
router.delete("/:id", jwtAuth, tagCtrl.deleteTag);

export default router;
