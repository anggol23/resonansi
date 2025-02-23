import express from "express";
import { signup, signin, google, getMe } from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/google", google);
router.get("/me", verifyToken, getMe); 

export default router;
