const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { pool } = require('../db');
const { authenticate, adminOnly } = require('../middleware/auth');
const { sendBookingStatusEmail, sendNewBookingAdminEmail, getAdminEmails } = require('../services/email');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg'];
    cb(null, allowed.includes(path.extname(file.originalname).toLowerCase()));
  },
});

// Student: create booking (transaction + row lock prevents double-booking)
router.post('/', authenticate, async (req, res) => {
  const { slot_id, purpose } = req.body;
  if (!slot_id) return res.status(400).json({ error: 'Slot is required' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const slot = await client.query('SELECT * FROM slots WHERE id=$1 FOR UPDATE', [slot_id]);
    if (!slot.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Slot not found' });
    }

    const duplicate = await client.query(
      "SELECT id FROM bookings WHERE user_id=$1 AND slot_id=$2 AND status != 'rejected'",
      [req.user.id, slot_id]
    );
    if (duplicate.rows.length) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'You already booked this slot' });
    }

    const booked = await client.query(
      "SELECT COUNT(*) FROM bookings WHERE slot_id=$1 AND status != 'rejected'",
      [slot_id]
    );
    if (parseInt(booked.rows[0].count, 10) >= slot.rows[0].max_bookings) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Slot is fully booked' });
    }

    const result = await client.query(
      'INSERT INTO bookings (user_id, slot_id, purpose) VALUES ($1,$2,$3) RETURNING *',
      [req.user.id, slot_id, purpose]
    );

    await client.query('COMMIT');

    const booking = result.rows[0];

    const details = await pool.query(`
      SELECT u.name as student_name, u.email as student_email,
             l.name as lab_name, s.date, s.start_time, s.end_time
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN slots s ON b.slot_id = s.id
      JOIN labs l ON s.lab_id = l.id
      WHERE b.id = $1
    `, [booking.id]);

    const row = details.rows[0];
    if (row) {
      const dateStr = new Date(row.date).toISOString().split('T')[0];
      getAdminEmails(pool)
        .then((emails) =>
          sendNewBookingAdminEmail({
            adminEmails: emails,
            studentName: row.student_name,
            studentEmail: row.student_email,
            labName: row.lab_name,
            date: dateStr,
            startTime: String(row.start_time).slice(0, 5),
            endTime: String(row.end_time).slice(0, 5),
            purpose,
          })
        )
        .catch((err) => console.error('Admin notification failed:', err.message));
    }

    res.status(201).json(booking);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// Student: get own bookings
router.get('/my', authenticate, async (req, res) => {
  const result = await pool.query(`
    SELECT b.*, l.name as lab_name, l.location, s.date, s.start_time, s.end_time
    FROM bookings b
    JOIN slots s ON b.slot_id = s.id
    JOIN labs l ON s.lab_id = l.id
    WHERE b.user_id = $1
    ORDER BY s.date DESC, s.start_time DESC
  `, [req.user.id]);
  res.json(result.rows);
});

// Student: cancel own booking
router.delete('/:id', authenticate, async (req, res) => {
  const result = await pool.query(
    'DELETE FROM bookings WHERE id=$1 AND user_id=$2 RETURNING id',
    [req.params.id, req.user.id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Booking not found' });
  res.json({ message: 'Booking cancelled' });
});

// Student: upload file to booking
router.post('/:id/upload', authenticate, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const result = await pool.query(
    'UPDATE bookings SET file_path=$1 WHERE id=$2 AND user_id=$3 RETURNING *',
    [req.file.filename, req.params.id, req.user.id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Booking not found' });
  res.json(result.rows[0]);
});

// Admin: get all bookings
router.get('/admin/all', authenticate, adminOnly, async (req, res) => {
  const result = await pool.query(`
    SELECT b.*, u.name as student_name, u.email as student_email,
           l.name as lab_name, s.date, s.start_time, s.end_time
    FROM bookings b
    JOIN users u ON b.user_id = u.id
    JOIN slots s ON b.slot_id = s.id
    JOIN labs l ON s.lab_id = l.id
    ORDER BY b.created_at DESC
  `);
  res.json(result.rows);
});

// Admin: update booking status
router.put('/:id/status', authenticate, adminOnly, async (req, res) => {
  const { status } = req.body;
  if (!['approved', 'rejected', 'pending'].includes(status))
    return res.status(400).json({ error: 'Invalid status' });

  const result = await pool.query(
    'UPDATE bookings SET status=$1 WHERE id=$2 RETURNING *',
    [status, req.params.id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Booking not found' });

  if (status === 'approved' || status === 'rejected') {
    const details = await pool.query(`
      SELECT u.email, u.name as student_name, l.name as lab_name, s.date, s.start_time, s.end_time
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN slots s ON b.slot_id = s.id
      JOIN labs l ON s.lab_id = l.id
      WHERE b.id = $1
    `, [req.params.id]);

    const row = details.rows[0];
    if (row) {
      const dateStr = new Date(row.date).toISOString().split('T')[0];
      sendBookingStatusEmail({
        to: row.email,
        studentName: row.student_name,
        labName: row.lab_name,
        date: dateStr,
        startTime: String(row.start_time).slice(0, 5),
        endTime: String(row.end_time).slice(0, 5),
        status,
      }).catch((err) => console.error('Email notification failed:', err.message));
    }
  }

  res.json(result.rows[0]);
});

// Admin: dashboard stats
router.get('/admin/stats', authenticate, adminOnly, async (req, res) => {
  const [total, pending, approved, rejected, labs, users] = await Promise.all([
    pool.query('SELECT COUNT(*) FROM bookings'),
    pool.query("SELECT COUNT(*) FROM bookings WHERE status='pending'"),
    pool.query("SELECT COUNT(*) FROM bookings WHERE status='approved'"),
    pool.query("SELECT COUNT(*) FROM bookings WHERE status='rejected'"),
    pool.query('SELECT COUNT(*) FROM labs'),
    pool.query("SELECT COUNT(*) FROM users WHERE role='student'"),
  ]);
  res.json({
    total: parseInt(total.rows[0].count),
    pending: parseInt(pending.rows[0].count),
    approved: parseInt(approved.rows[0].count),
    rejected: parseInt(rejected.rows[0].count),
    labs: parseInt(labs.rows[0].count),
    students: parseInt(users.rows[0].count),
  });
});

module.exports = router;
