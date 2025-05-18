const express = require("express");
const { registerUser } = require("../dbController/signUpController");
const { logoutUser, loginUser } = require("../dbController/loginController");
const { resetPassword } = require("../dbController/resetPasswordController");
// const { loginUser, logoutUser } = require("../dbController/loginController");

const AuthRouter = express.Router();

AuthRouter.post("/signup", registerUser);
AuthRouter.post("/login", loginUser);
AuthRouter.post("/logout",logoutUser);
AuthRouter.patch("/reset-password",resetPassword);
module.exports = { AuthRouter };