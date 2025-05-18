const { OTP } = require("../models/otpSchema");
const { SignUpList } = require("../models/signUpSchema");
const { sendMailUtility } = require("../utils/mailUtils");
const bcrypt = require("bcrypt");

const createOTP = async (req, res) => {
  try {
    const { body } = req;
    const { email, isResend = false, isForgotPassword = false } = body;
    console.log(email);
    if (!email) {
      res.status(400).json({ status: "fail", message: "Email is required" });
      return;
    }

    const existingUser = await SignUpList.findOne({ email });

    // 🟢 Signup flow: user should not exist
    if (!isForgotPassword && !isResend) {
      if (existingUser) {
        return res.status(409).json({
          status: "fail",
          message: "Email already exists! Please login",
        });
      }
    }

    // 🔴 Forgot password: user must exist
    if (isForgotPassword) {
      if (!existingUser) {
        return res.status(404).json({
          status: "fail",
          message: "User not found with this email",
        });
      }
    }

    // Check if OTP already sent recently (last 10 minutes)
    const recentOTP = await OTP.findOne({
      email,
      createdAt: { $gte: Date.now() - 10 * 60 * 1000 },
    });

    if (!isResend && recentOTP) {
      return res.status(403).json({
        status: "fail",
        message: "OTP already sent. Try 'Resend OTP'.",
      });
    }

    const OTPValue = Math.floor(Math.random() * 8999 + 1000);
    console.log("Generated OTP:", OTPValue);
    const [isMailSent, errorMessage] = await sendMailUtility({
      email: email,
      subject: "OTP for verification @ CodeRank",
      text: `Your OTP is ${OTPValue}`,
      html: `<html>
          <head>
          <style>
              h2{background-color: yellow; color: green;}
          </style></head>
          <body>
              <h2>Your Otp is ${OTPValue}</h2>
          </body>
          </html>`,
    });

    if (!isMailSent) {
      res.status(500).json({
        status: "fail",
        message: "Internal Server error",
      });
      return;
    }

    // hashing
    const salt = await bcrypt.genSalt(10);
    const hashedOTP = await bcrypt.hash("" + OTPValue, salt);

    await OTP.create({
      otp: hashedOTP,
      email,
    });
    res.status(201).json({
      status: "success",
      message: "OTP Sent",
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: "Internal Server Error!",
    });
    console.log(err.message);
  }
};

module.exports = { createOTP };
