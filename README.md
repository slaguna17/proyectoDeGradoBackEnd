# 🛒 POS/ERP Backend System

This is the backend for a **POS/ERP simplified system** for small grocery stores, built with **Node.js**, **Express**, and **PostgreSQL**. It includes database management, RESTful APIs, and machine learning for sales and stock forecasting.

---

## 📋 **Project Features**

- CRUD operations for managing products, sales, and inventory.
- Database setup and migrations using **Knex.js**.
- RESTful APIs for frontend and mobile app consumption.
- Machine Learning integration for sales and stock predictions.
- Secure, scalable, and modular backend structure.

---

## 🛠️ **Tech Stack**

- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **ORM/Query Builder**: Knex.js
- **Environment Variables**: dotenv
- **Development Tools**: Nodemon, ESLint
- **Version Control**: Git and GitHub

---

## 🚀 **Getting Started**

### Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org) (v14+)
- [PostgreSQL](https://www.postgresql.org) (v12+)
- [Git](https://git-scm.com)

---

### 1️⃣ **Clone the Repository**

```bash
git clone https://github.com/slaguna17/proyectoDeGradoBackEnd
cd proyectoDeGradoBackEnd
```
### 2️⃣ **Install Dependencies**
```bash
npm i --save express bcrypt pg jwt knex
```
### 3️⃣  **Environment Variables Setup**
Create a .env file in the root directory and add your environment variables:

```bash
PORT=5000
DB_HOST=127.0.0.1
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database
```
Add .env to your .gitignore file to prevent sensitive information from being uploaded to GitHub.

### 4️⃣  **Database Setup**

Run Migrations
```bash
npx knex migrate:latest
```

Seed the Database (Optional)
To populate the database with initial data:

```bash
npx knex seed:run
```

### 5️⃣ **Run the Application**
 
Start the development server:

```bash
npm run dev
```
The server will run on:
```plaintext
http://localhost:5000
```

## 📂 **Project Structure**
 
```plaintext
backend-project/
├── src/
│   ├── config/            # Configuration files (DB setup, dotenv)
│   ├── controllers/       # Handles incoming requests
│   ├── models/            # Database models or queries
│   ├── routes/            # API endpoints
│   ├── middleware/        # Custom middleware (auth, error handling)
│   ├── services/          # Business logic layer
│   ├── utils/             # Utility functions
│   ├── migrations/        # Knex migration files
│   ├── seeds/             # Knex seed files
│   ├── app.js             # Express app setup
│   └── server.js          # Server entry point
├── .env                   # Environment variables
├── knexfile.js            # Knex configuration
├── package.json           # Dependencies and scripts
└── README.md              # Project documentation
```
## 🧪 **API Documentation**
 
**Example Endpoints**

| Method | Endpoints        | Description           |
| :----  | :--------------  | :--------------       |
| GET	 | /api/users	    | Retrieve all users    |
| POST	 | /api/users	    | Create a new user     |
| GET	 | /api/products	| Retrieve all products |
| POST	 | /api/products	| Add a new product     |

## 🔧 **Scripts**

| Script            | Command                   | Description |
| :---------------- | :------                   | :---- |
| Start Server      | npm start                 | Run server in production mode |
| Dev Server        | npm run dev               | Run server with nodemon |
| Run Migrations    | npx knex migrate:latest   | Apply database migrations |
| Seed Database     | npx knex seed:run         | Populate database with seed data |

## ✨ **Acknowledgments**
 


 
Thanks to all contributors and the tools that made this project possible:

- Node.js
- Express
- PostgreSQL
- Knex.js
📧 Contact
For questions or collaboration, reach out to:

Sergio Laguna
- Email: slaguna17@gmail.com
- LinkedIn: www.linkedin.com/in/sergio-laguna