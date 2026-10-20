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
* 🛡️ **Zero-Risk Predictive Expiry & Runout Engine** (computes daily dosage vs. days supply, flags courses that overrun batch expiry dates before consumption)
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

## 👥 Demo Login Credentials

Pharmasure automatically detects your role based on the email address entered at login (`/login`):

| Role | Email | Password | Landing Page & Capabilities |
| :--- | :--- | :--- | :--- |
| **👤 Patient** | `harshithp914@gmail.com` | `student123` | **`/userDashboard`** — Medication schedules, dosage logs, adherence badges, and expiry tracking |
| **🤝 Caretaker** | `harshithp9141@gmail.com` | `student123` | **`/userDashboard`** — Associated patient monitoring with automated missed dosage & expiry alert popups |
| **💊 Pharmacist / Admin** | `pharmacist@pharmasure.com` | `admin123` | **`/pharmaDashBoard`** — Inventory stock management, predictive expiry distribution charts, and PDF reports |

> [!NOTE]
> There is no manual dropdown to select roles on the login page. Simply enter the corresponding demo email and password, and the backend will route you to the appropriate dashboard.

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

### Inventory & Dispensing

```text
POST /inventory
GET  /inventory
PUT  /inventory/{id}
```

### Consumption & Quick-Dose Logging

```text
POST /consumed/add/{mid}           # ⚡ 1-Tap dose logging: decrements stock & increments consumed count
GET  /consumed/check/{email}
GET  /consumed/bypatient/{p_id}
```

### Gemini Medication Assistant

```text
POST /api/gemini/medication/ask
```

---

## 🚀 Advanced Enterprise & Modern Tech Features

Pharmasure now incorporates enterprise-grade clinical safety and zero-risk dispensing architectures:

### 1. 🤖 Multimodal AI OCR Engine (`ocrScanner.js`)
* **Primary Engine:** Google Gemini (`gemini-3.8-flash`) via `@google/genai` analyzes blister packaging directly, identifying medication brand, strength, and embossed expiry stamps.
* **On-Device Fallback:** Integrated `tesseract.js` for offline OCR.
* **Regulatory Expiry Alignment:** Automatically translates pharmaceutical month-only blister text (e.g., `EXP. JUL. 29`) to the legally recognized last day of that month (`2029-07-31`).

### 2. 🛡️ Predictive Zero-Risk Expiry Calculator (`predictiveRiskCalculator.js`)
* **Predictive Runout Modeling:** Evaluates daily dosing patterns (`timing.length`) against current stock (`tabletQty`) to calculate the exact projected runout date (`runoutDate = today + daysSupply`).
* **Zero-Risk Inversion Detection:** Flags prescriptions where `runoutDate > expiryDate` (i.e., patient will be consuming expired medicine mid-course) with a red hazard alert, buffer countdown, and corrective guidance.
* **Global Alert Banner:** Real-time alert on the Patient Dashboard alerting patients when course completion overruns batch validity.

### 3. 🔬 AI Clinical Regimen & Drug-Drug Interaction (DDI) Checker (`clinicalSafetyChecker.js`)
* Analyzes the patient's full active medication list against Google Gemini 3.8 Flash (with rule-based clinical fallback).
* Delivers a **Safety Score (0–100)**, identifies adverse drug-drug interactions, food/dietary warnings (e.g. grapefruit, dairy), and clinical precautions.

### 4. 📄 Doctor's Clinical Summary PDF Generator (`clinicalReportGenerator.js`)
* One-click export for clinical appointments.
* Compiles patient vitals, adherence rate, prescribed regimens, daily intake schedules, and predictive expiry buffers into a professional medical document.

### 5. ⚡ 1-Tap Quick-Dose Intake FAB (`QuickDoseFAB.jsx`)
* Floating Action Button enabling patients to log doses in 1 tap.
* Immediately executes `POST /consumed/add/{mid}`, decrements remaining pill count in the database, and syncs live with the adherence charts.

### 6. 🔊 Web Speech API Voice Assistant (`voiceAssistant.js`)
* Hands-free audio readouts for elderly or visually impaired patients.
* Pronounces medication schedules, dosage timings, remaining counts, and vocalizes zero-risk hazard warnings.

### 7. 💊 Pharmacist FEFO Engine & Smart Dispense Assistant (`Inventory.js`)
* **FEFO Sorting:** Prioritizes batches strictly by earliest expiration date first (First-Expired, First-Out).
* **Smart Dispense Assistant:** Pharmacist inputs prescribed course duration (e.g. 30 days) and daily intake. The system verifies if the earliest batch will expire before the patient finishes their course. If violated, it prevents dispensing and recommends a safer batch.
* **GS1 2D DataMatrix / QR Codes:** Dynamic QR code generation adhering to pharma serialization standards `(01)GTIN(17)EXP(10)BATCH`.

### 8. 📦 Enterprise Distributor Return & Credit-Note Manager (`Analytics.js`)
* Automatically identifies batches in the standard 30–90 days pre-expiry recall window.
* Generates an official B2B **Distributor Return Claim & Credit-Note PDF** with GSTIN, claim IDs, unit costs, total refund value, and pharmacist sign-off seals to eliminate dead-stock financial loss.

### 9. 📱 Enterprise Responsive CSS Design System (`responsive.css`)
* Custom responsive styles engineered across mobile devices (<576px), tablets (576px–991px), and enterprise pharmacy widescreen monitors (>=1400px).

### 10. 📋 AI Handwritten Doctor Prescription Scanner (`prescriptionScanner.js` & `PrescriptionScannerModal.jsx`)
* **Multimodal Handwriting Deciphering:** Leverages Google Gemini multimodal vision to extract cursive handwriting from doctors' paper slips.
* **Clinical Notation Normalization:** Translates shorthand dosage instructions (`1-0-1`, `OD`, `BD`, `TDS`, `PRN`) into standardized schedules.
* **1-Tap Regimen Import:** Directly bulk-adds deciphered medications, doctors, and quantities into the patient's schedule.

### 11. 🔗 Blockchain Batch Provenance & DSCSA Anti-Tampering Layer (`MedicineBatchLedger.sol` & `BlockchainAuditModal.jsx`)
* **Solidity Smart Contract (`MedicineBatchLedger.sol`):** Immutable smart contract ledger for pharmaceutical serialization and track-and-trace.
* **Anti-Tampering Expiry Verification:** Detects counterfeit or illicitly relabeled expiration dates by cryptographically verifying the physical expiry against the initial genesis mint block.
* **On-Chain Explorer & Web3 Broadcast:** Built-in Polygonscan transaction viewer with decoded event logs, plus live transaction broadcasting on Polygon PoS (Amoy Testnet) via MetaMask.

### 12. 🌐 Multi-Language Regional Accessibility (`LanguageContext.js` & `translationService.js`)
* Complete multi-lingual support spanning **English** (default), **Kannada (ಕನ್ನಡ)**, **Hindi (हिन्दी)**, **Tamil (தமிழ்)**, and **Telugu (తెలుగు)**.
* Dynamic phrase caching with automatic speech synthesis dialect alignment for elderly care and inclusive healthcare.

### 13. 📲 WhatsApp & SMS Clinical Alert Dispatcher (`notificationService.js` & `WhatsAppAlertModal.jsx`)
* **1-Tap Direct WhatsApp Dispatch:** Opens WhatsApp Web / App with pre-filled clinical notifications for Missed Doses, Zero-Risk Expiry Conflict Warnings, Low-Stock Refills, and Full Daily Regimen Schedules.
* **Native SMS Mobile Gateway:** Supports direct SMS composition and Cloud Gateway delivery simulation with unique Message SIDs.
* **Live Chat Bubble Preview:** Interactive chat preview matching WhatsApp UI with timestamps and double-check read receipts.

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
