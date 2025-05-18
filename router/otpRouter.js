const express = require("express");
const { createOTP } = require("../dbController/otpController");

const OtpRouter = express.Router();


OtpRouter.post("/", createOTP);


module.exports = { OtpRouter };