# DischargePal

DischargePal is a patient recovery planning web application designed to help users organise important recovery tasks after leaving hospital.

The application provides a simple step-by-step experience where users can record medications, complete daily recovery check-ins, manage follow-up appointments, and review their recovery information.

> **Important:** DischargePal is a recovery organisation tool and does not provide medical advice or diagnosis. Users should contact a healthcare professional or emergency service for urgent medical concerns.

## Key Features

- Simple patient sign-in
- Personalised recovery dashboard
- Medication management
- Daily recovery check-in
- Follow-up appointment management
- Recovery progress tracking
- Review and confirmation screen
- Saved recovery information
- Clear step-by-step navigation
- Responsive and accessible interface

## User Journey

The application guides the user through seven stages:

1. Sign in
2. Today
3. Medication
4. Check-in
5. Appointments
6. Review
7. Done

The dashboard allows users to return to previously completed sections to view, add, or update their recovery information.

## Technology Stack

### Frontend
- React
- TypeScript
- Vite
- CSS

### Backend
- Python
- FastAPI
- Uvicorn

### Development
- Visual Studio Code
- Git
- GitHub
- Cline-assisted development

## Application Structure

```text
DischargePal/
├── backend/
│   └── main.py
├── public/
├── src/
│   ├── assets/
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
├── .gitignore
├── package.json
├── README.md
└── vite.config.ts