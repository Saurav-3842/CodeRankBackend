// const { SignUpList } = require("../model/signUp");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SignUpList } = require("../models/signUpSchema");
const loginUser = async (req, res) => {
  try {
    const { email, password: userPassword } = req.body;
    if (!email || !userPassword) {
      res.status(400).json({
        status: "fail",
        message: "Email, password are required !",
      });
      return;
    }

    const userDetails = await SignUpList.findOne({ email }).select(
      "fullname email password _id"
    );

    if (!userDetails) {
      res.status(400).json({
        status: "fail",
        message: "email not registered!",
      });
      return;
    }
    console.log(userDetails._id);
    const { password: dbPassword, fullname, _id } = userDetails || {};
    const isPasswordCorrect = await bcrypt.compare(userPassword, dbPassword);
    // console.log("🟡 : dbOtp:", dbOtp);
    // console.log("🟡 : userOtp:", userOtp);
    // console.log("🟡 : isOTPCorrect:", isPasswordCorrect);
    if (!isPasswordCorrect) {
      res.status(401).json({
        status: "fail",
        message: "Invalid Email or Password",
      });
      return;
    }

    const token = jwt.sign(
      {
        email: userDetails.email,
        fullname: userDetails.fullname,
        _id: userDetails._id,
      },
      process.env.jwt_secret_key,
      { expiresIn: "10m" } // 10 minutes
    );

    // Set cookie
    res.cookie("token", token, {
      sameSite: "None",
      secure: true,
      httpOnly: true,
      maxAge: 900000, // 15 minutes
    });

    res.status(200).json({
      status: "success",
      message: "User LoggedIn",
      data: {
        user: {
            _id: userDetails._id,
            email: userDetails.email,
            fullname: userDetails.fullname
          },
      },
    });
  } catch (err) {
    res.status(500);
    res.json({
      status: "fail",
      message: "Internal Server Error!",
    });
    console.log(err.message);
  }
};

const logoutUser = async (req, res) => {
  try {
    // Clear the JWT cookie
    res.clearCookie("token", {
      sameSite: "None",
      secure: true,
      httpOnly: true,
    });

    res.status(200).json({
      status: "success",
      message: "Logged out successfully.",
    });
  } catch (err) {
    console.error("Error during logout:", err);
    res.status(500).json({
      status: "fail",
      message: "Internal Server Error!",
    });
  }
};

module.exports = { loginUser, logoutUser };
