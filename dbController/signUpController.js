const bcrypt = require("bcrypt");
const { OTP } = require("../models/otpSchema");
const { SignUpList } = require("../models/signUpSchema");
const fetchUnifiedProfile = require("../utils/fetchUnifiedProfile");
const jwt = require("jsonwebtoken");
const registerUser = async (req, res) => {
    try {
      const {
        email,
        fullname,
        college,
        password,
        otp: userOtp,
        github,
        leetcode,
        codeforces,
      } = req.body;
  
      // Validate required fields
      if (!email || !password || !userOtp || !fullname) {
        return res.status(400).json({
          status: "fail",
          message: "Name, email, password and OTP are required!",
        });
      }
  
      // Verify OTP
      const result = await OTP.findOne({
        email,
        createdAt: { $gte: Date.now() - 10 * 60 * 1000 },
      }).sort("-createdAt");
  
      if (!result || !result.otp) {
        return res.status(401).json({
          status: "fail",
          message: "OTP is expired! Please Resend",
        });
      }
  
      const isOTPCorrect = await bcrypt.compare(userOtp, result.otp);
      if (!isOTPCorrect) {
        return res.status(401).json({
          status: "fail",
          message: "Invalid Email or OTP",
        });
      }
  
      // Hash password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // Create user
      const newUser = await SignUpList.create({
        fullname,
        email,
        college,
        password: hashedPassword,
      });
  
      // Fetch profiles (consider doing this in background)
      await fetchUnifiedProfile({ github, leetcode, codeforces, email });
  
      // Create token with user data
      const token = jwt.sign(
        {
          email: newUser.email,
          fullname: newUser.fullname,
          _id: newUser._id
        },
        process.env.jwt_secret_key,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
      );
  
      // Set cookie
      res.cookie("token", token, {
        sameSite: "None",
        secure: true,
        httpOnly: true,
        maxAge: parseInt(process.env.COOKIE_EXPIRES_IN_MS || "3600000", 10)
      });
  
      // Return success response
      return res.status(201).json({
        status: "success",
        message: "User created",
        data: {
          user: {
            _id: newUser._id,
            email: newUser.email,
            fullname: newUser.fullname,
            college: newUser.college
          },
        }
      });
  
    } catch (err) {
      console.error("Registration error:", err.message);
      return res.status(500).json({
        status: "fail",
        message: "Internal Server Error!",
      });
    }
  };
module.exports = { registerUser };
