import * as authCtrl from "@src/controllers/auth.js";
import { loginSchema, registerSchema } from "@src/controllers/schemas/auth.js";
import { validate } from "@src/middlewares/validate.js";
import express from "express";

const router: express.Router = express.Router();

router.post("/login", validate(loginSchema), authCtrl.login);
router.post("/register", validate(registerSchema), authCtrl.register);

export default router;
