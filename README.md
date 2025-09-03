# Collaborative Candidate Notes (MVP)

A React (Vite + TS) client with an Express + Socket.IO server enabling real-time collaborative notes on candidates with @tag notifications.

## Tech
- Client: React 19 + Vite, Tailwind v4, React Router
- Server: Express, Socket.IO, TypeScript
- Storage: MongoDB via Mongoose (was in-memory for MVP)

## Run locally (Windows PowerShell)
Run this once per terminal window to allow npm scripts:

```
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
```

Server
```
cd server
npm install
# create a .env file with:
# MONGO_URI=mongodb://127.0.0.1:27017/collab-notes
# PORT=4000
npm run dev
```

Client
```
cd ..
npm install
npm run dev
```
Open `http://localhost:5173`.

## Demo flow
1. Login with a name/email/password (auto-signup on first login).
2. Create a candidate on the dashboard.
3. Open the candidate’s notes. In another browser, login as a second user and open the same candidate.
4. Send a message using `@OtherUserName` (no spaces). The tagged user gets a toast and a dashboard notification entry.
5. Click a notification to open notes and highlight the specific message.

## Security (MVP)
- Sanitized user inputs (names, emails, messages) server-side via `sanitize-html`.
- Route protection on the client (localStorage-based). For production, use real auth (JWT or provider) and a DB.

## Features Implemented

### Core Functionality ✅
- **Authentication**: Sign up/login with email validation
- **Dashboard**: Candidate management with real-time updates
- **Real-time Chat**: Socket.IO powered messaging
- **@Tagging System**: Mention users with notifications
- **Notifications**: Toast alerts and dashboard notifications

### User Experience ✅
- **ShadCN UI**: Professional component library with consistent design
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Loading States**: Spinner animations for better UX
- **Chat UI**: Left/right message alignment like modern chat apps
- **Real-time Updates**: Live notifications and message sync
- **Error Handling**: User-friendly error messages
- **Intuitive Interactions**: Smooth transitions and hover effects

### Security ✅
- **Input Sanitization**: XSS prevention with sanitize-html
- **Route Protection**: Authentication guards
- **CORS Configuration**: Secure cross-origin requests
- **Data Validation**: Server-side input validation

### Code Quality ✅
- **TypeScript**: Full type safety
- **Modular Architecture**: Separated concerns
- **Reusable Components**: Toast, RequireAuth, etc.
- **Clean Code**: Well-structured and documented

## Technical Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, Socket.IO, TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.IO for live messaging and notifications

## Documentation

- [Technical Documentation](./TECHNICAL.md) - Detailed technical specs
- [Architecture Overview](./ARCHITECTURE.md) - System design and data flow

## If I had more time
- JWT-based authentication with refresh tokens
- Rich mentions with user search and autocomplete
- Email/push notifications for @tags
- Message read receipts and typing indicators
- File upload support for attachments
- Comprehensive test suite (unit + integration)
- CI/CD pipeline with automated testing
- Performance monitoring and analytics
