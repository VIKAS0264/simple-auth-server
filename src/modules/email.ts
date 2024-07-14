import nodemailer from "nodemailer"; // Import the Nodemailer library

// Create a transporter object
const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 587,
  secure: false, // use SSL
  auth: {
    user: "4908c978f4cb07",
    pass: "323f768dfd3235",
  },
});

// Send the email
export const sendEmail = async (mailOptions: {
  from: String;
  to: String;
  subject: String;
  text: String;
}) => {
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(info);
  } catch (e) {
    console.log(e);
  }
};
