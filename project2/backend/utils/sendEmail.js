const nodemailer = require('nodemailer');

const sendEmail = async({ email, subject, message }) => {
  try {
    const userEmail = process.env.GMAIL_USER || process.env.EMAIL_USER;
    const userPass = process.env.GMAIL_PASS || process.env.EMAIL_PASS;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: userEmail,
        pass: userPass,
      },
    });

    const mailOptions = {
      from: `"ShopNest Support" <${userEmail}>`,
      to: email,
      subject: subject,
      html: message,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email successfully sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send email to ${email}: ${error.message}`);
  }
};

module.exports = sendEmail;