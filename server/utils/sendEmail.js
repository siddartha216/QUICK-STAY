import nodemailer from "nodemailer";

const sendEmail = async (to, subject, text) => {
  try {

    // 🔍 DEBUG (remove later)
    console.log("SMTP_USER:", process.env.SMTP_USER);
    console.log("SMTP_PASSWORD:", process.env.SMTP_PASSWORD);

    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      throw new Error("SMTP credentials missing in .env");
    }

    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to,
      subject,
      text,
    });

    console.log("✅ Email sent:", info.messageId);

  } catch (error) {
    console.log("❌ Email error:", error.message);
  }
};

export default sendEmail;