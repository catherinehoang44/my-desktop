const express = require('express');
const router = express.Router();

let transporter = null;

// Try to set up nodemailer if available
try {
  const nodemailer = require('nodemailer');
  
  // Create transporter (using Gmail - configure with environment variables)
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'catherinehoang44@gmail.com',
      pass: process.env.EMAIL_PASS || process.env.EMAIL_APP_PASSWORD // Use App Password for Gmail
    }
  });
} catch (error) {
  console.warn('Nodemailer not installed. Email functionality will be disabled.');
  console.warn('Run: npm install nodemailer');
}

// Email route
router.post('/send', async (req, res) => {
  try {
    if (!transporter) {
      return res.status(503).json({ error: 'Email service not configured. Please install nodemailer and configure email credentials.' });
    }

    const { name, message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const subject = name ? name : 'Kind Message (No Name)';

    const mailOptions = {
      from: process.env.EMAIL_USER || 'catherinehoang44@gmail.com',
      to: 'catherinehoang44@gmail.com',
      subject: subject,
      text: message,
      html: `<p>${message.replace(/\n/g, '<br>')}</p>`
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
});

module.exports = router;

