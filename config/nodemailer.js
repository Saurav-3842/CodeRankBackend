const nodemailer = require("nodemailer");

const gmailTransporter = nodemailer.createTransport({
    service: "gmail",
    host:"smtp.gmail.com",
    // port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
        user: "saurav152014@gmail.com",
        pass: "botltgxhohlvhqlk",   
    },
});

module.exports = { gmailTransporter };