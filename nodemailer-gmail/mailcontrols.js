const nodemailer = require("nodemailer");


exports.sendEmail = async (email,subject,content) => {
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: "redditverfiy@gmail.com",
          pass: "ukri nhej uyvv jijm", //TODO replace this
        },
      });
      const mailOptions = {
        from: "redditverfiy@gmail.com",
        to: email,
        subject: subject,
        text: content,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email: ", error);
        } else {
          console.log("Email sent: ", info.response);
        }
      });
};