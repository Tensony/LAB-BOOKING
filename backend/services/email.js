const nodemailer = require('nodemailer');

let transporter = null;

if (process.env.SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const sendBookingStatusEmail = async ({ to, studentName, labName, date, startTime, endTime, status }) => {
  if (!transporter || !to) return;

  const subject =
    status === 'approved'
      ? `Lab booking approved — ${labName}`
      : status === 'rejected'
        ? `Lab booking declined — ${labName}`
        : `Lab booking update — ${labName}`;

  const body =
    status === 'approved'
      ? `Hi ${studentName},\n\nYour booking for ${labName} on ${date} (${startTime}–${endTime}) has been approved.\n\n— LabBook`
      : status === 'rejected'
        ? `Hi ${studentName},\n\nYour booking for ${labName} on ${date} (${startTime}–${endTime}) was not approved. Contact the lab admin if you have questions.\n\n— LabBook`
        : `Hi ${studentName},\n\nYour booking for ${labName} is now marked as ${status}.\n\n— LabBook`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'LabBook <noreply@zut.ac.zm>',
    to,
    subject,
    text: body,
  });
};

module.exports = { sendBookingStatusEmail };
