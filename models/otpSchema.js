const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
    {
        otp: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        }
    },
    {
        timestamps: true
    }    
);

const OTP = mongoose.model('otps',otpSchema);
module.exports = {OTP};