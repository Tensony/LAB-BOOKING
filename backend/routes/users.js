const router = require('express').Router();
const { pool } = require('../db');
const { authenticate, adminOnly } = require('../middleware/auth');

// Admin: get all users
router.get('/', authenticate, adminOnly, async (req, res) => {
  const result = await pool.query(
    'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
  );
  res.json(result.rows);
});

// Admin: delete user
router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  await pool.query('DELETE FROM users WHERE id=$1 AND role != $2', [req.params.id, 'admin']);
  res.json({ message: 'User deleted' });
});

module.exports = router;
