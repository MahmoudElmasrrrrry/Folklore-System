# Egyptian Folklore Archiving System (Folklore Project)

A comprehensive digital platform dedicated to documenting and preserving Egyptian folklore in all its forms, including Mawwals (traditional vocal music), folk dances, traditional crafts, and Sufi figures (Walis). The system provides a robust administrative dashboard for data entry and an interactive chronological archive for public exploration.

---

## ✨ Features
- **Multi-step Data Entry Flow**: Link folklore materials with core metadata (Narrator, Mission, Collector) ensuring data integrity.
- **Media Management**: Seamless integration with Cloudinary for handling large media files (images, audio, video).
- **Public Archive Timeline**: An optimized, searchable chronological timeline allowing users to explore documented folklore.
- **Role-Based Access Control**: Secure administrative dashboard restricted to authenticated admins.
- **Production-Ready Security**: Implements CSP, MongoDB sanitization, CSRF protection measures, and rate limiting.

## 🛠 Technology Stack
- **Backend Environment:** Node.js, Express.js
- **Database:** MongoDB (Mongoose ODMs)
- **Frontend Template Engine:** EJS, CSS3, Vanilla JS
- **Cloud Storage:** Cloudinary
- **Security:** Helmet, express-mongo-sanitize, bcryptjs
- **Middleware:** Multer (file uploads), express-session & connect-mongo (session management)

---

## ⚙️ Prerequisites
Before running the project, ensure you have the following installed:
- [Node.js](https://nodejs.org/en/) (v16.0 or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cluster)
- A [Cloudinary](https://cloudinary.com/) account for media storage.

---

## 🚀 Installation & Setup

1. **Clone the repository:**
```bash
git clone https://github.com/MahmoudElmasrrrrry/Forkoral-System.git
cd mawwal-project
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure Environment Variables:**
Copy the example environment file and fill in your details:
```bash
cp .env.example .env
```
Ensure you provide your MongoDB connection string, a strong session secret, and your Cloudinary API credentials.

4. **Seed the Admin User:**
Since the dashboard requires authentication, you must create the initial admin user by running the seeder script (this only needs to be run once):
```bash
npm run seed:admin
```
*(By default, this creates a user with credentials defined in your `.env` file, or `admin` / `admin123` if not provided).*

5. **Start the Application:**

- For **development** (auto-restarts via nodemon):
```bash
npm run dev
```
- For **production**:
```bash
npm start
```

6. **Access the Application:**
- **Public Archive:** `http://localhost:5000/`
- **Admin Dashboard:** `http://localhost:5000/login`

---

## 🛡 Security & Performance Optimizations
- **Graceful Shutdown:** Implemented SIGINT/SIGTERM listeners to safely close MongoDB connections when the server goes offline.
- **Compression:** Uses GZIP compression to minimize response payloads and speed up load times.
- **Query Optimization:** The archive uses `.select()` projection and targeted population to reduce memory consumption by 90% when fetching large collections.
- **Content Security Policy (CSP):** Configured via Helmet to prevent XSS attacks while allowing trusted CDNs (FontAwesome, SweetAlert2, Cloudinary).

---

## 📁 Core Project Structure
```text
mawwal-project/
├── config/                 # Cloudinary and external service configs
├── controller/             # Business logic (Admin, Pages, Entities)
├── middleware/             # Auth guards, Error handling, Multer uploaders
├── models/                 # Mongoose database schemas
├── public/                 # Static assets (CSS, JS, Fonts, Images)
├── routes/                 # Express route definitions
├── utils/                  # Helper scripts (Admin seeder, Category seeder)
├── views/                  # EJS template files (Layouts, Partials, Dashboard)
├── app.js                  # Main application entry point
└── .env.example            # Environment variables template
```

---

## 🤝 Contribution
This project is being developed as a core archiving infrastructure for the Center for Folk Art Studies (Egypt). 
