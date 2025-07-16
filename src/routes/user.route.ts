import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { 
    filterUser, 
    getCurrentUser, 
    logoutUser, 
    signInUser, 
    signUpUser, 
    updateUser 
} from "../controllers/user.controller";

const router = Router();

router.route("/signup").post(signUpUser);
router.route("/signin").post(signInUser);
router.route("/logout").post(logoutUser);

router.use(verifyJWT);
router.route("/update").put(updateUser);
router.route("/bulk").get(filterUser);
router.route("/me").get(getCurrentUser);

export default router;