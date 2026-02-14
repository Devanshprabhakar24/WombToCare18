# Quick Start Guide

## Local Development Setup

### Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB)
- Razorpay test account
- Gmail account with app password

### 1. Clone and Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Backend

Create `backend/.env` file:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-secret-key-min-32-characters
JWT_EXPIRES_IN=7d
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:5173
FOUNDATION_NAME=Nonprofit Foundation
FOUNDATION_ADDRESS=123 Foundation Street
FOUNDATION_REGISTRATION_NUMBER=12A/80G-123456
```

### 3. Configure Frontend

Create `frontend/.env` file:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=your-razorpay-key-id
```

### 4. Start Development Servers

Terminal 1 - Backend:

```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:

```bash
cd frontend
npm run dev
```

### 5. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

### 6. Create Admin User

Use Postman or curl:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "phone": "1234567890",
    "password": "admin123",
    "role": "admin"
  }'
```

### 7. Test the Application

1. Register as a donor at http://localhost:5173/register
2. Login and navigate to donation page
3. Select a program and make a test donation
4. Use Razorpay test card: 4111 1111 1111 1111
5. Check your donor dashboard for donation history
6. Login as admin to view admin dashboard

## Project Structure

```
nonprofit-donation-platform/
├── backend/
│   ├── config/          # Database configuration
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── controllers/     # Route controllers
│   ├── services/        # Business logic
│   ├── middleware/      # Auth, validation, errors
│   ├── certificates/    # Generated certificates
│   ├── server.js        # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context
│   │   ├── services/    # API services
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
├── README.md
├── DEPLOYMENT.md
└── QUICKSTART.md
```

## Available Scripts

### Backend

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Frontend

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## API Endpoints

### Authentication

- POST `/api/auth/register` - Register user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user

### Donations

- POST `/api/donations/create-order` - Create payment order
- POST `/api/donations/webhook` - Razorpay webhook
- GET `/api/donations/history` - Get donation history
- GET `/api/donations/public` - Get public donations

### Programs

- GET `/api/programs` - Get all programs
- GET `/api/programs/:id` - Get program by ID
- POST `/api/programs` - Create program (admin)
- PUT `/api/programs/:id` - Update program (admin)
- PUT `/api/programs/:id/funds` - Update funds (admin)

### Transparency

- GET `/api/transparency/programs` - Get transparency data
- GET `/api/transparency/reports` - Get all reports

### Admin

- GET `/api/admin/dashboard` - Get admin analytics
- GET `/api/admin/donations` - Get all donations
- GET `/api/admin/donors` - Get all donors

## Testing

### Test Razorpay Payment

Use these test card details:

- Card Number: 4111 1111 1111 1111
- CVV: 123
- Expiry: Any future date
- Name: Test User

### Test Email

Emails will be sent to the registered user's email address. Check your inbox for:

- Donation confirmation emails
- Weekly progress reports (scheduled)

## Troubleshooting

### Backend won't start

- Check MongoDB connection string
- Verify all environment variables are set
- Ensure port 5000 is not in use

### Frontend won't start

- Check that backend is running
- Verify VITE_API_BASE_URL is correct
- Ensure port 5173 is not in use

### Payments failing

- Verify Razorpay keys are correct
- Check that you're using test mode keys for development
- Ensure Razorpay script is loaded in index.html

### Emails not sending

- Verify Gmail app password is correct
- Check that 2FA is enabled on Google account
- Ensure EMAIL_HOST and EMAIL_PORT are correct

## Next Steps

1. Customize the foundation details in environment variables
2. Add your own programs via admin dashboard
3. Customize the frontend styling and branding
4. Set up MongoDB Atlas for production
5. Deploy to Vercel and Render (see DEPLOYMENT.md)

## Support

For detailed deployment instructions, see DEPLOYMENT.md
For project overview and features, see README.md
