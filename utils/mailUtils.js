const { gmailTransporter } = require("../config/nodemailer");

const sendMailUtility = async ({ email, subject, text, html }) => {
  if (!email) {
    console.log("----Email is required for sending mail");
    return [false, "Invalid Email"];
  }
  if (!text && !html) {
    console.log("----either text or html is required");
    return [false,"Invalid data for mail"];
  }
  console.log("-------", email);
  try {
    const info = await gmailTransporter.sendMail({
      
      from: '"CodeRank" <code@gmail.com>', // sender address
      to: email, // list of receivers
      subject: subject, //subject line
      text: text,
      html: html,
    });
    console.log("Message send: %s", info.messageId);
    return [true];
  } catch (err) {
    console.log("Message NOT send", email);
    if(err.message === 'No recipients defined'){
        return [false, "Invalid email! Please recheck your mail id"];
    }
    return [false,err.message];
  }
};
module.exports = { sendMailUtility };
