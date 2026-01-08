import express from 'express';
import * as adminCtrl from '../controllers/admin.js';

const router: express.Router = express.Router();

router.get('/health', adminCtrl.getHealth);
router.get('/version', adminCtrl.getVersion);

export default router;