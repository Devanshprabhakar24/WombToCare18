# Nonprofit Donation Platform

A full-stack MERN (MongoDB, Express, React, Node.js) web application for a Section-8 nonprofit foundation. The platform provides secure donation processing through Razorpay, automated transparency reporting, certificate generation, and donor communication workflows.

## Features

- **Public Pages**: Home, About Us, Programs, Blog/Press, Donor Wall, Impact Reports
- **Donation Processing**: Secure Razorpay integration with webhook verification
- **Certificate Generation**: Automated 80G/12A tax exemption certificates
- **Transparency Dashboard**: Track funds received vs utilized across programs
- **Email Automation**: Donation confirmations and weekly progress reports
- **User Dashboards**: Separate interfaces for donors and administrators
- **Security**: JWT authentication, bcrypt password hashing, input validation, CORS

## Tech Stack

### Frontend

- React 18+
- React Router v6
- Axios
- Tailwind CSS
- Vite
- Chart.js

### Backend

- Node.js 18+
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Razorpay SDK
- PDFKit for certificate generation
- Nodemailer for emails

### Deployment

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

## Project Structure

```
nonprofit-donation-platform/
├── backend/
│   ├── config/          # Database and configuration
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── controllers/     # Route controllers
│   ├── services/        # Business logic
│   ├── middleware/      # Authentication, validation, error handling
│   ├── utils/           # Helper functions
│   ├── .env.example     # Environment variables template
│   ├── server.js        # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context
│   │   ├── services/    # API services
│   │   ├── App.jsx      # Main app component
│   │   └── main.jsx     # Entry point
│   ├── .env.example     # Environment variables template
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

## Local Development Setup

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account
- Razorpay account (test mode)
- Email service credentials (Gmail with app password)

### Backend Setup

1. Navigate to backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file from `.env.example`:

```bash
cp .env.example .env
```

4. Update `.env` with your credentials:
   - MongoDB Atlas connection string
   - JWT secret key
   - Razorpay API keys
   - Email service credentials
   - Frontend URL

5. Start development server:

```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file from `.env.example`:

```bash
cp .env.example .env
```

4. Update `.env` with:
   - Backend API URL
   - Razorpay public key

5. Start development server:

```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## MongoDB Atlas Setup

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free tier available)
3. Configure network access:
   - Add your IP address
   - For production: Add Render's IP or use 0.0.0.0/0 (less secure)
4. Create a database user with read/write permissions
5. Get connection string and add to backend `.env`

## Razorpay Setup

1. Create account at https://razorpay.com
2. Use test mode for development
3. Get API Key ID and Secret from Dashboard
4. Add webhook URL in Razorpay dashboard:
   - Development: Use ngrok or similar for local testing
   - Production: `https://your-backend.onrender.com/api/donations/webhook`
5. Add keys to backend `.env` and frontend `.env`

## Email Configuration

### Using Gmail:

1. Enable 2-factor authentication on your Google account
2. Generate an app-specific password
3. Add credentials to backend `.env`:
   - EMAIL_HOST=smtp.gmail.com
   - EMAIL_PORT=587
   - EMAIL_USER=your-email@gmail.com
   - EMAIL_PASS=your-app-password

## Deployment

### Frontend Deployment (Vercel)

1. Push code to GitHub
2. Create Vercel account and import repository
3. Configure build settings:
   - Framework: Vite
   - Root directory: `frontend`
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add environment variables:
   - VITE_API_BASE_URL (your Render backend URL)
   - VITE_RAZORPAY_KEY_ID
5. Deploy

### Backend Deployment (Render)

1. Create Render account
2. Create new Web Service
3. Connect GitHub repository
4. Configure:
   - Root directory: `backend`
   - Build command: `npm install`
   - Start command: `npm start`
5. Add environment variables (all from `.env.example`)
6. Deploy
7. Note the deployed URL for frontend configuration

### Post-Deployment

1. Update Razorpay webhook URL with production backend URL
2. Update CORS settings in backend to allow production frontend URL
3. Test complete donation flow in production
4. Monitor logs for errors

## API Documentation

API endpoints are organized as follows:

- `/api/auth` - Authentication (register, login)
- `/api/donations` - Donation management
- `/api/programs` - Program CRUD operations
- `/api/reports` - Impact reports
- `/api/users` - User profile and dashboard
- `/api/admin` - Admin dashboard and management
- `/api/transparency` - Public transparency data
- `/api/certificates` - Certificate downloads

Detailed API documentation available in `/backend/docs/api.md` (to be created)

## Testing

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
cd frontend
npm test
```

## Security Considerations

- All passwords are hashed using bcrypt
- JWT tokens for authentication
- Razorpay webhook signature verification
- Input validation and sanitization
- CORS configured for specific origins
- Rate limiting on authentication endpoints
- HTTPS enforced in production
- Environment variables for sensitive data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.
