import express from "express";
import { login, logout, signup } from "../controllers/auth.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.get('/check-auth', protectRoute, (req, res) => {
    res.status(200).json({ message: 'User is authenticated', user: req.user });
});
export default router;
