import * as userCtrl from "@src/controllers/user.js";
import { jwtAuth } from "@src/middlewares/auth.js";
import express from "express";

const router: express.Router = express.Router();

router.get(["/users/me", "/me"], jwtAuth, userCtrl.getUser);

export default router;
