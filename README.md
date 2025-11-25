# 🛠️ Maloof’s Dashboard — Admin Panel

This repository contains the **Admin Dashboard** for Maloof’s Restaurant — a powerful control center where restaurant staff can manage reservations, approve bookings, monitor customers, and control menu visibility.

> **Note:**  
Some email notifications may not be received depending on mailbox spam filters or missing custom domain verification.  
Design previews on Vercel may look slightly incomplete without an attached paid domain.

---

## 🚀 Features

### 🧾 **1. Reservation Management**
Admins can:
- View **all customer reservations**
- Sort reservations by date
- Filter by status (pending, confirmed)
- Approve reservations in one click

### 📤 **2. Email Automation**
When an admin approves a reservation:
- System automatically sends an approval email  
- Email includes:
  - Customer name  
  - Reservation date  
  - Reservation time  

### 🔐 **3. Secure Admin Login**
- Google OAuth
- Email/Password login  
- Role-based access (Director vs Employee accounts)

### 📊 **4. Dashboard Insights**
Admin can see:
- Total Reservations
- Recent Activity
- Pending Approvals
- Live database statistics

### 🗄️ **5. MongoDB Integration**
Dashboard fetches:
- Customer reservations
- User accounts
- Real-time database updates

### 🚦 **6. API Endpoints for Admin Control**
Includes routes:
- `/api/dashboard-data`
- `/api/reservations`
- `/api/approve/[id]` (approve reservation)
- `/api/auth` (NextAuth)
- `/api/menu` (if extended later)

### 🎨 **7. UI/UX**
Built using:
- **Next.js 15 App Router**
- **Shadcn UI**  
- **Tailwind CSS**  
- Responsive panels, modals, cards, and tables

### 🧩 **8. Optimized Email System**
- Uses Nodemailer + SMTP provider  
- All emails triggered via server-only routes  
- Error handling + logging included

---

## 🏗️ How It Was Built

### ⚙️ Tech Stack
- **Next.js 15**
- **TypeScript**
- **Shadcn UI**
- **MongoDB + Mongoose**
- **NextAuth.js**
- **Nodemailer**

### 🔌 Architecture
- Separate DB connection for dashboard & customer side  
- Mongoose factory pattern  
- Dynamic route: `/api/approve/[id]`  
- API validation through TypeScript  
- Admin-only pages protected using server-side session checks

---

## 🧪 API Workflow Example
### Approve Reservation
1. Admin clicks **Approve**
2. Request sent to `/api/approve/[id]`
3. System:
   - Updates reservation status  
   - Sends approval email  
   - Returns success response  

---

## ⚠️ Important Notes
- Emails may go to spam: search **`in:spam`** in Gmail  
- Email services may not fully work without buying and verifying a custom domain  
- Production visuals may differ slightly on Vercel because of domain restrictions

---

## 🧑‍💻 Author
Created by **Mighty Maon**  
Focused on reliable backend systems, clean UI, and solving real-world restaurant workflow challenges.

