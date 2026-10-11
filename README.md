# Medikiosk 🏥
### Smart, Accessible and Multilingual OPD Assistance Platform

Medikiosk is a digital healthcare assistance platform designed to simplify the Outpatient Department (OPD) registration and patient information collection process in public hospitals. It aims to reduce paperwork, improve accessibility, and help healthcare professionals review patient information more efficiently.

## 🚀 Key Features

- **Patient Registration:** Digital collection of patient information for OPD visits.
- **Multilingual Assistance:** Designed to make the registration process more accessible to users from different language backgrounds.
- **Voice-Friendly Interaction:** Supports the goal of making patient intake easier for users who may have difficulty typing.
- **Patient History:** Provides a digital workflow for recording and reviewing patient information.
- **Prescription Assistance:** Designed to support the use of existing prescriptions as part of patient history collection.
- **Preliminary Triage:** Helps identify potential warning signs that may require additional medical attention.
- **Doctor Review:** Enables healthcare professionals to review submitted patient cases.
- **Authentication and Access Control:** Uses Firebase Authentication for user authentication and Firestore security rules for data access control.
- **Responsive Interface:** Provides a user interface designed for convenient access across supported screen sizes.

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| React | User interface development |
| TypeScript | Type-safe application development |
| Vite | Development server and build tooling |
| Firebase Authentication | User authentication |
| Cloud Firestore | Cloud-based data storage |
| CSS | Styling and responsive layouts |

## 📁 Project Structure

```text
Medikiosk/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── lib/
│   ├── pages/
│   ├── types/
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
├── .env.example
├── .gitignore
├── firestore.rules
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
└── vite.config.ts
```

## ⚙️ Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/LuciFer-1309/Medikiosk.git
cd Medikiosk
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Check `.env.example` for the environment variables required by the project.

Create a local `.env` file and configure the required Firebase settings according to the variable names used in the project.

**Important:** Never commit private keys, service account credentials, passwords, or other sensitive secrets to GitHub.

### 4. Start the Development Server

```bash
npm run dev
```

Open the local URL displayed in your terminal to access the application.

### 5. Build for Production

```bash
npm run build
```

To check the production build locally, run:

```bash
npm run preview
```

## 🔐 Security Considerations

- Firebase Authentication should be configured appropriately for the intended users.
- Firestore security rules should enforce authentication and authorization requirements.
- Sensitive patient information should only be accessible to authorized users.
- Environment variables and credentials must not be committed to the repository.
- Patient data should be handled with appropriate consent, privacy safeguards, and applicable healthcare data protection requirements.

## 🎯 Project Objective

Medikiosk aims to improve the efficiency and accessibility of public hospital OPD workflows by digitizing patient intake and helping healthcare professionals review structured patient information.

The platform is intended to support healthcare workflows. Preliminary triage information is not a medical diagnosis, and final clinical decisions must remain with qualified healthcare professionals.

## 👥 Project Information

- **Project Name:** Medikiosk
- **Category:** Digital Healthcare / HealthTech
- **Repository:** https://github.com/LuciFer-1309/Medikiosk

---

*Medikiosk — Making healthcare intake simpler, smarter, and more accessible.*
