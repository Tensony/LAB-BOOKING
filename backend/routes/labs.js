const router = require('express').Router();
const { pool } = require('../db');
const { authenticate, adminOnly } = require('../middleware/auth');

// Get all labs
router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM labs ORDER BY name');
  res.json(result.rows);
});

// Get single lab with slots
router.get('/:id', async (req, res) => {
  const lab = await pool.query('SELECT * FROM labs WHERE id=$1', [req.params.id]);
  if (!lab.rows.length) return res.status(404).json({ error: 'Lab not found' });

  const slots = await pool.query(`
    SELECT s.*, 
      (SELECT COUNT(*) FROM bookings b WHERE b.slot_id = s.id AND b.status != 'rejected') as booked_count
    FROM slots s WHERE s.lab_id=$1 AND s.date >= CURRENT_DATE ORDER BY s.date, s.start_time
  `, [req.params.id]);

  res.json({ ...lab.rows[0], slots: slots.rows });
});

// Create lab (admin only)
router.post('/', authenticate, adminOnly, async (req, res) => {
  const { name, location, capacity, description, image_url } = req.body;
  const result = await pool.query(
    'INSERT INTO labs (name, location, capacity, description, image_url) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [name, location, capacity, description, image_url]
  );
  res.status(201).json(result.rows[0]);
});

// Update lab (admin only)
router.put('/:id', authenticate, adminOnly, async (req, res) => {
  const { name, location, capacity, description, image_url } = req.body;
  const result = await pool.query(
    'UPDATE labs SET name=$1, location=$2, capacity=$3, description=$4, image_url=$5 WHERE id=$6 RETURNING *',
    [name, location, capacity, description, image_url, req.params.id]
  );
  res.json(result.rows[0]);
});

// Delete lab (admin only)
router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  await pool.query('DELETE FROM labs WHERE id=$1', [req.params.id]);
  res.json({ message: 'Lab deleted' });
});

// Add slot to lab (admin only)
router.post('/:id/slots', authenticate, adminOnly, async (req, res) => {
  const { date, start_time, end_time, max_bookings } = req.body;
  const result = await pool.query(
    'INSERT INTO slots (lab_id, date, start_time, end_time, max_bookings) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [req.params.id, date, start_time, end_time, max_bookings || 1]
  );
  res.status(201).json(result.rows[0]);
});

// Delete slot (admin only)
router.delete('/slots/:slotId', authenticate, adminOnly, async (req, res) => {
  await pool.query('DELETE FROM slots WHERE id=$1', [req.params.slotId]);
  res.json({ message: 'Slot deleted' });
});

module.exports = router;
