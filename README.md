# Form Validation Demo

A full-stack form with real-time client-side validation and matching server-side validation, including secure file uploads.

## Features

- 7 form fields: full name, email, job title, department, birth date, bio, profile image
- Real-time client-side validation with field-specific error messages
- Server-side validation that mirrors the client rules (never trust the frontend alone)
- Secure file upload handling via Multer (type + size checks)
- Loading state on submit, success/error toasts, auto-clearing form

## Tech Stack

- **Frontend:** React
- **Backend:** Node.js, Express
- **File uploads:** Multer
- **Cross-origin requests:** CORS

## Project Structure

```
form-validation-project/
├── server.js          # Express backend + validation logic
├── package.json        # Backend dependencies
└── uploads/            # Saved profile images (auto-created on first run)

form-validation-app/
└── src/
    └── App.js           # React form (from FormApp.jsx)
```

## Prerequisites

- Node.js v14 or higher ([download](https://nodejs.org/))
- npm (comes with Node.js)

## Setup

### 1. Backend

```bash
cd form-validation-project
npm install
npm start
```

You should see:
```
🚀 Server running at http://localhost:5000
📁 Uploads directory: /path/to/uploads
```

### 2. Frontend

In a separate terminal:

```bash
npx create-react-app form-validation-app
cd form-validation-app
cp /path/to/FormApp.jsx src/App.js
npm start
```

This opens the form at `http://localhost:3000`.

> Both servers need to be running at the same time — backend on port 5000, frontend on port 3000.

## Validation Rules

| Field | Rules |
|---|---|
| Full Name | Required, 2–50 characters, letters and spaces only |
| Email | Required, valid email format, max 100 characters |
| Job Title | Required, max 50 characters |
| Department | Required, one of: engineering, product, design, marketing, operations |
| Birth Date | Required, must be 18+ years old |
| Bio | Required, 10–500 characters |
| Profile Image | Required, JPEG/PNG/WebP only, max 5MB |

## Testing

### Via the UI
Fill out the form at `http://localhost:3000` with valid or invalid data and observe the toast and inline error messages.

### Via curl (tests server-side validation directly)

```bash
curl -X POST http://localhost:5000/api/submit-form \
  -F "fullName=Emma Rodriguez" \
  -F "email=emma@techcompany.com" \
  -F "jobTitle=Senior Product Manager" \
  -F "department=product" \
  -F "birthDate=1992-07-20" \
  -F "bio=I'm passionate about building products that solve real user problems." \
  -F "profileImage=@/path/to/image.jpg"
```

More example requests (including validation failure cases) are in `TEST_EXAMPLES.md`.

## Viewing Submitted Data

There's currently no database — submitted text data is validated, logged, and returned in the response, but not persisted. To check a submission:

- **Backend terminal:** logs each submission (`✅ Form submitted by ...`)
- **Browser DevTools → Network tab:** inspect the JSON response of the `submit-form` request
- **Uploaded image:** saved to `form-validation-project/uploads/`

## API

### `GET /api/health`
Health check. Returns `{ "status": "Server is running" }`.

### `POST /api/submit-form`
Accepts `multipart/form-data` with the fields listed above plus `profileImage`.

**Success (200):**
```json
{
  "success": true,
  "message": "Form submitted successfully",
  "data": {
    "fullName": "...",
    "email": "...",
    "jobTitle": "...",
    "department": "...",
    "birthDate": "...",
    "imageFileName": "profile-1234567890-image.jpg"
  }
}
```

**Validation error (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "fieldName": "Error message"
  }
}
```

## Troubleshooting

**Port 5000 already in use**
```bash
lsof -ti:5000 | xargs kill -9
```

**CORS errors**
Confirm the backend is running on `http://localhost:5000` and the frontend on `http://localhost:3000`. Restart both if needed.

**Image upload fails**
- Confirm the file is under 5MB
- Confirm the format is JPEG, PNG, or WebP
- Confirm the `uploads/` directory exists and is writable

**Form won't submit**
Open DevTools → Network tab, submit the form, and check the response status and body for the `submit-form` request.

## Possible Improvements

- Persist submissions to a database (SQLite/MongoDB/Postgres) instead of discarding them
- Rate limiting to prevent spam submissions
- CSRF protection
- Input sanitization (e.g. DOMPurify) against XSS
- HTTPS in production
- Duplicate email checks against stored records
