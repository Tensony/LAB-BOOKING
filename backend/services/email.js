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

const sendNewBookingAdminEmail = async ({ adminEmails, studentName, studentEmail, labName, date, startTime, endTime, purpose }) => {
  if (!transporter || !adminEmails?.length) return;

  const recipients = adminEmails.join(', ');
  const subject = `New lab booking request — ${labName}`;
  const body = `A new booking requires your review.

Student: ${studentName} (${studentEmail})
Lab: ${labName}
Date: ${date}
Time: ${startTime} – ${endTime}
Purpose: ${purpose || 'Not specified'}

Log in to LabBook to approve or reject this request.

— LabBook`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'LabBook <noreply@zut.ac.zm>',
    to: recipients,
    subject,
    text: body,
  });
};

const getAdminEmails = async (pool) => {
  if (process.env.ADMIN_EMAIL) {
    return [process.env.ADMIN_EMAIL];
  }
  const result = await pool.query("SELECT email FROM users WHERE role = 'admin'");
  return result.rows.map((r) => r.email);
};

module.exports = { sendBookingStatusEmail, sendNewBookingAdminEmail, getAdminEmails };
