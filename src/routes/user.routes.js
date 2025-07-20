import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";

const router = Router()
router.route('/register').post(upload.field([
    {
        name:"avatar",
        maxCount:1
    },
]),registerUser);

export default router;