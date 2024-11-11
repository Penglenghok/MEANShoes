const express = require("express");
const router = express.Router();
const shoeRouter = require("./../components/shoe/shoe-route")
const userRouter = require("./../components/user/user-route")
const authRouter = require("./../components/auth/auth-route")


router.use("/shoes", shoeRouter)
router.use("/users", userRouter)
router.use("/auth", authRouter)

module.exports = router;
