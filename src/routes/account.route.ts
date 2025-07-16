import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { transferMoney, viewBalance } from "../controllers/account.controller";

const router = Router();

router.use(verifyJWT);
router.route("/balance").get(viewBalance);
router.route("/transfer").post(transferMoney);

export default router;