# 💊 Pharmasure

### Predictive Expiry Alerts for Zero-Risk Dispensing

Pharmasure is a healthcare-focused medication management system designed to help patients track their medicines, monitor expiry dates, manage medication information, and receive alerts for medicines approaching expiry.

The project combines a **React frontend** with a **Spring Boot backend**, **MySQL**, OCR/AI capabilities, and Gemini-powered assistance.

---

## 🚀 Features

* 👤 Patient registration and login
* 🔐 Role-based access for:

  * Patient
  * Caretaker
  * Pharmasure/Admin
* 💊 Medication management
* 📅 Medication expiry-date tracking
* 🔔 Expiry and patient alerts
* 📦 Inventory management
* 📊 Medication consumption tracking and analytics
* 🤖 Gemini-powered medication assistance
* 📷 OCR-based medication information extraction
* 📧 Email notifications
* 👨‍⚕️ Doctor and caretaker information management
* 📈 Patient dashboard and medication analytics

---

## 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │      React UI       │
                    │     Frontend        │
                    └──────────┬──────────┘
                               │
                          REST APIs
                               │
                    ┌──────────▼──────────┐
                    │    Spring Boot      │
                    │      Backend        │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
        ┌─────▼─────┐    ┌─────▼─────┐   ┌──────▼──────┐
        │   MySQL   │    │  Gemini   │   │ Gmail SMTP  │
        │ Database  │    │    API    │   │    Email     │
        └───────────┘    └───────────┘   └─────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

* React
* JavaScript
* React Router
* Axios
* Bootstrap
* Chart.js / Recharts
* Tesseract.js
* Google Gemini API

### Backend

* Java
* Spring Boot
* Spring Data JPA
* Hibernate
* REST APIs
* Maven

### Database

* MySQL 8

### AI / OCR

* Google Gemini
* Tesseract OCR

---

## 📁 Project Structure

```text
Pharmasure/
│
├── Blister/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/Blister/
│   │   │   │   ├── Controller/
│   │   │   │   ├── Entity/
│   │   │   │   ├── Repository/
│   │   │   │   ├── Service/
│   │   │   │   └── config/
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── application-example.properties
│   │   └── test/
│   ├── pom.xml
│   └── mvnw
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── Components/
│   │   ├── Assets/
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── .env.example
│
├── .gitignore
└── README.md
```

---

## ⚙️ Local Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd Pharmasure
```

### 2. Backend setup

Make sure the following are installed:

* Java 21
* Maven
* MySQL 8

Create the database:

```sql
CREATE DATABASE blister;
```

Create a local MySQL user if required:

```sql
CREATE USER 'pharmasure'@'localhost'
IDENTIFIED BY 'your_local_password';

GRANT ALL PRIVILEGES ON blister.*
TO 'pharmasure'@'localhost';

FLUSH PRIVILEGES;
```

### 3. Backend environment variables

Configure the following environment variables:

```text
DB_USERNAME
DB_PASSWORD
MAIL_USERNAME
MAIL_PASSWORD
GEMINI_API_KEY
```

Use:

```text
Blister/src/main/resources/application-example.properties
```

as the configuration reference.

Never commit real API keys, passwords, or email credentials.

### 4. Start the backend

From the `Blister` directory:

```bash
cd Blister
mvn spring-boot:run
```

The backend runs by default on:

```text
http://localhost:8080
```

---

## 🌐 Frontend Setup

From the project root:

```bash
cd frontend
npm install
```

Create a local `.env` file if the frontend requires Gemini configuration:

```env
REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here
```

Then start the frontend:

```bash
npm start
```

The frontend runs by default on:

```text
http://localhost:3000
```

---

## 🔑 API Overview

### Patient

```text
POST /register
POST /login
GET  /getById/{id}
PUT  /update/{id}
PUT  /setAlert/{id}
PUT  /clearAlert/{id}
```

### Medication

```text
POST   /medications/add/{patientId}
GET    /medications/get/patient/{patientId}
PUT    /medications/update/{mid}
DELETE /medications/delete/{mid}
```

### Inventory

```text
POST /inventory
GET  /inventory
PUT  /inventory/{id}
```

### Consumption

```text
GET /consumed/check/{email}
GET /consumed/bypatient/{p_id}
```

### Gemini Medication Assistant

```text
POST /api/gemini/medication/ask
```

---

## 🔐 Security Note

This project uses environment variables for sensitive configuration.

Do **not** commit:

```text
.env
.env.*
API keys
Database passwords
Email passwords
Access tokens
```

Use `.env.example` and `application-example.properties` as templates containing placeholders only.

---

## 🎯 Project Objective

The objective of Pharmasure is to provide a centralized medication-management platform that helps reduce medication-related risks by tracking medication information, expiry dates, consumption, and patient alerts.

---

## 🔮 Future Improvements

* JWT-based authentication
* Password hashing with BCrypt
* Dedicated caretaker accounts and authentication
* Improved role-based authorization
* Automated medication-expiry notification scheduler
* Secure backend-only Gemini integration
* Cloud deployment
* Docker-based deployment
* Automated testing and CI/CD
* Improved OCR accuracy
* Mobile application support

---

## 👨‍💻 Contributors

Developed as an academic/final-year project focused on healthcare technology, medication management, AI-assisted processing, and predictive expiry monitoring.

---

## 📄 License

This project is intended for educational and demonstration purposes.
