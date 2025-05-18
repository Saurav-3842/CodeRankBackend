const { OTP } = require("../models/otpSchema");
const { SignUpList } = require("../models/signUpSchema");
const bcrypt = require("bcrypt");

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        status: "fail",
        message: "Email, OTP, and new password are required",
      });
    }

    const user = await SignUpList.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    const validOtpEntry = await OTP.findOne({
      email,
      createdAt: { $gte: Date.now() - 10 * 60 * 1000 }, // OTP is valid for 10 minutes
    });

    if (!validOtpEntry) {
      return res.status(400).json({
        status: "fail",
        message: "OTP expired or not found. Please request a new one.",
      });
    }

    const isMatch = await bcrypt.compare(String(otp), validOtpEntry.otp);
    if (!isMatch) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid OTP",
      });
    }
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await SignUpList.updateOne({ email }, { password: hashedPassword });

    // Optional: Remove OTP after successful use
    // await OTP.deleteMany({ email });

    res.status(200).json({
      status: "success",
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error("Reset Password Error:", err.message);
    res.status(500).json({
      status: "fail",
      message: "Internal server error",
    });
  }
};

module.exports = { resetPassword };
