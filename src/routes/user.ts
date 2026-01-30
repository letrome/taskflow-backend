import {
	patchUserInformationSchema,
	updateEmailSchema,
	updatePasswordSchema,
	updateUserInformationSchema,
} from "@src/controllers/schemas/user.js";
import * as userCtrl from "@src/controllers/user.js";
import { jwtAuth } from "@src/middlewares/auth.js";
import { validate } from "@src/middlewares/validate.js";
import { type RequestHandler, Router } from "express";

const router: Router = Router();

router.get(
	["/users/me", "/me"],
	jwtAuth,
	userCtrl.getUser as unknown as RequestHandler,
);

router.put(
	"/users/me",
	jwtAuth,
	validate(updateUserInformationSchema),
	userCtrl.updateUserInformation as unknown as RequestHandler,
);

router.patch(
	"/users/me",
	jwtAuth,
	validate(patchUserInformationSchema),
	userCtrl.patchUserInformation as unknown as RequestHandler,
);

router.put(
	"/users/me/email",
	jwtAuth,
	validate(updateEmailSchema),
	userCtrl.updateEmail as unknown as RequestHandler,
);

router.put(
	"/users/me/password",
	jwtAuth,
	validate(updatePasswordSchema),
	userCtrl.updatePassword as unknown as RequestHandler,
);

router.delete(
	"/users/me",
	jwtAuth,
	userCtrl.deleteUser as unknown as RequestHandler,
);

router.post(
	"/users/me/consent",
	jwtAuth,
	userCtrl.addConsent as unknown as RequestHandler,
);

router.delete(
	"/users/me/consent",
	jwtAuth,
	userCtrl.removeConsent as unknown as RequestHandler,
);

export default router;
