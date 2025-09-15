# MERN Stack Backend (Node.js v16)

This is the **backend** for a MERN (MongoDB, Express, React, Node.js) stack application, built using **Node.js v16**. It provides RESTful API services, connects to a MongoDB database, and handles authentication, routing, and data processing.

---

## 🚀 Features

- Node.js v16 and Express.js
- MongoDB with Mongoose
- RESTful API structure
- JWT-based authentication
- Environment variable support using dotenv
- Developer-friendly with Nodemon for live reloading

---

## 🧰 Tech Stack

- **Node.js v16**
- **Express.js**
- **MongoDB**
- **Mongoose**
- **JWT**
- **dotenv**
- **Nodemon**

---

## 📁 Folder Structure

backend/
├── controllers/ # Business logic for each route
├── models/ # Mongoose schemas and models
├── routes/ # API routes
├── middleware/ # Middleware (auth, error handling, etc.)
├── config/ # DB connection and configuration
├── .env # Environment variables
├── server.js # App entry point
├── package.json # Project metadata and scripts

---

## 🔧 Prerequisites

- Node.js v16
- npm (Node Package Manager)
- MongoDB installed locally or a MongoDB Atlas account

---

## 📦 Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-username/your-backend-repo.git
cd your-backend-repo
```

Install dependencies

npm install

▶️ Running the Server
In Development Mode (with Nodemon):

npm run dev

| Method | Endpoint           | Description               |
| ------ | ------------------ | ------------------------- |
| POST   | /api/auth/register | Register a new user       |
| POST   | /api/auth/login    | Login and get JWT token   |
| GET    | /api/users         | Get list of users         |
| GET    | /api/profile       | Get authenticated profile |

📜 Scripts
npm run dev – Run the server with nodemon (development)

npm start – Run the server without nodemon (production)

🙋‍♂️ Author
Karthick K.R.
Feel free to reach out for any contributions or issues.

Let me know if you want to add **frontend instructions**, **MongoDB models**, or a **Postman collection** for testing!
