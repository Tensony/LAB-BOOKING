require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool, initDB } = require('./db');

const seed = async () => {
  await initDB();

  // Create admin user
  const adminHash = await bcrypt.hash('admin123', 10);
  await pool.query(`
    INSERT INTO users (name, email, password_hash, role)
    VALUES ('Admin User', 'admin@zut.ac.zm', $1, 'admin')
    ON CONFLICT (email) DO NOTHING
  `, [adminHash]);

  const studentHash = await bcrypt.hash('student123', 10);
  await pool.query(`
    INSERT INTO users (name, email, password_hash, role)
    VALUES ('Tenson Mulenga', 'tenson@zut.ac.zm', $1, 'student')
    ON CONFLICT (email) DO NOTHING
  `, [studentHash]);

  // Sample labs
  const labs = [
    { name: 'Computer Lab A', location: 'Block C, Room 101', capacity: 30, description: 'General purpose computer lab with 30 workstations, each running Windows 11 and Ubuntu dual-boot.', image_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80' },
    { name: 'Computer Lab B', location: 'Block C, Room 102', capacity: 25, description: 'Networking lab equipped with Cisco routers, switches, and patch panels for practical networking sessions.', image_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80' },
    { name: 'Software Engineering Lab', location: 'Block D, Room 204', capacity: 20, description: 'Dedicated lab for software development projects with high-performance machines and collaborative whiteboards.', image_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80' },
    { name: 'Data Science Lab', location: 'Block D, Room 205', capacity: 15, description: 'Equipped with GPU workstations for machine learning, data analysis, and AI model training.', image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80' },
  ];

  for (const lab of labs) {
    const res = await pool.query(
      `INSERT INTO labs (name, location, capacity, description, image_url) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [lab.name, lab.location, lab.capacity, lab.description, lab.image_url]
    );
    const labId = res.rows[0].id;

    // Add slots for next 7 days
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      if (date.getDay() === 0 || date.getDay() === 6) continue; // skip weekends

      const dateStr = date.toISOString().split('T')[0];
      const timeSlots = [
        { start: '08:00', end: '10:00' },
        { start: '10:00', end: '12:00' },
        { start: '14:00', end: '16:00' },
        { start: '16:00', end: '18:00' },
      ];
      for (const slot of timeSlots) {
        await pool.query(
          'INSERT INTO slots (lab_id, date, start_time, end_time, max_bookings) VALUES ($1,$2,$3,$4,$5)',
          [labId, dateStr, slot.start, slot.end, 1]
        );
      }
    }
  }

  console.log('✅ Seed complete!');
  console.log('📧 Admin:   admin@zut.ac.zm / admin123');
  console.log('📧 Student: tenson@zut.ac.zm / student123');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
