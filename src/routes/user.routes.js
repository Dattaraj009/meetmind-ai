import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { registerUser,loginUser, logoutUser} from "../controllers/user.controller.js";
import {authMiddleware} from "../middleware/auth.middleware.js"

const router = Router()
router.route('/register').post(upload.field([
    {
        name:"avatar",
        maxCount:1
    },
]),registerUser);

router.route('/login').post(loginUser)

router.route('/logout').post(authMiddleware, logoutUser)

export default router;