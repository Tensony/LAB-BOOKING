# LabBook — Lab Booking System
**ZUT Full-Stack Final Course Project**  
Stack: React.js · Express.js · PostgreSQL

---

## Project Structure

```
lab-booking/
├── backend/
│   ├── db/           # PostgreSQL connection & schema
│   ├── middleware/   # JWT authentication
│   ├── routes/       # auth, labs, bookings, users
│   ├── uploads/      # Uploaded files (auto-created)
│   ├── server.js
│   ├── seed.js       # Seeds tables + sample data
│   └── .env.example
└── frontend/
    └── src/
        ├── api/
        ├── components/
        ├── pages/
        └── store/
```

---

## Quick Start

### 1. PostgreSQL — create the database
```sql
CREATE DATABASE lab_booking;
```

### 2. Backend
```bash
cd backend
cp .env.example .env        # fill in your DB credentials
npm install
npm run seed                # creates tables + sample data
npm run dev                 # http://localhost:5000
```

**Seeded accounts:**
| Role    | Email               | Password   |
|---------|---------------------|------------|
| Admin   | admin@zut.ac.zm     | admin123   |
| Student | tenson@zut.ac.zm    | student123 |

### 3. Frontend
```bash
cd frontend
echo "VITE_API_URL=http://localhost:5000/api" > .env
npm install
npm run dev                 # http://localhost:5173
```

---

## Features

**Student:** Register, login, browse labs, book slots, view/cancel bookings, upload lab report, profile & password  
**Admin:** Dashboard stats, manage labs & slots (CRUD), approve/reject bookings, manage users, export CSV, view reports

**Optional:** Email students when bookings are approved/rejected (configure SMTP in `backend/.env`)

---

## Requirements Checklist

- [x] User Authentication (JWT + bcrypt)
- [x] CRUD Operations (labs, slots, bookings, users)
- [x] PostgreSQL Database Integration
- [x] Express.js API
- [x] File Upload (multer, max 5MB)
- [x] Responsive React.js Frontend (Tailwind CSS)

---

## Environment Variables

**backend/.env**
```
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/lab_booking
JWT_SECRET=change_this_secret
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**frontend/.env**
```
VITE_API_URL=http://localhost:5000/api
```

**Optional SMTP** (see commented vars in `backend/.env.example`) — when set, students receive email on approve/reject.
