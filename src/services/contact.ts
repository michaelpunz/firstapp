import nodemailer from 'nodemailer';
import { Request, Response, NextFunction } from 'express';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.CONTACT_EMAIL,
    pass: process.env.CONTACT_EMAIL_PWD
  }
});

/**
 * POST /contact
 * Send a contact form via Nodemailer.
 */
export let postContact = (req: Request, res: Response, next: NextFunction) => {
  req.assert('name', 'The name is required').notEmpty();
  req.assert('email', 'The email address is not valid').isEmail();
  req.assert('message', 'The message is required').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).json({ status: 'error', message: 'Invalid request', data: errors });
  }

  const mailOptions = {
    to: process.env.CONTACT_EMAIL,
    from: `${req.body.name} <${req.body.email}>`,
    subject: 'Contact Form',
    text: req.body.message
  };

  return transporter
    .sendMail(mailOptions)
    .then(() => {
      return res.json({ status: 'success', data: null });
    })
    .catch(next);
};
