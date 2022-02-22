import { config } from "dotenv";
import { createTransport } from "nodemailer";

config();

const transporter = createTransport({
  port: 465,
  host: "smtp.gmail.com",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  secure: true,
});

export const sendMail = ({ to, subject, html }) => {
  const mailInfo = {
    from: "Fidia " + "<" + process.env.EMAIL_USER + ">",
    to: to,
    subject: subject,
    html: html,
  };
  transporter.sendMail(mailInfo, (error, info) => {
    if (error) {
      return "Email could not be sent. Please try again.";
    }
    return "Email sent successfully.";
  });
};

export default sendMail;
