import * as userCtrl from "@src/controllers/user.js";
import { jwtAuth } from "@src/middlewares/auth.js";
import { type RequestHandler, Router } from "express";

const router: Router = Router();

// "me" routes should come before :id routes
router.get(
	["/users/me", "/me"],
	jwtAuth,
	userCtrl.getUser as unknown as RequestHandler,
);
// No ID param here as it uses the token's user ID

export default router;
