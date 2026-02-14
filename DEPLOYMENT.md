# Deployment Guide

## Prerequisites

Before deploying, ensure you have:

- MongoDB Atlas account with a cluster created
- Razorpay account (test or live mode)
- Email service credentials (Gmail with app password recommended)
- Vercel account (for frontend)
- Render account (for backend)

## Step 1: MongoDB Atlas Setup

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create a database user:
   - Go to Database Access
   - Add New Database User
   - Choose password authentication
   - Save username and password
4. Configure network access:
   - Go to Network Access
   - Add IP Address
   - For development: Add your current IP
   - For production: Add `0.0.0.0/0` (allow from anywhere) or Render's IPs
5. Get connection string:
   - Go to Database → Connect
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

## Step 2: Razorpay Setup

1. Go to https://razorpay.com
2. Sign up and verify your account
3. For testing, use Test Mode
4. Get API keys:
   - Go to Settings → API Keys
   - Generate Test/Live Keys
   - Copy Key ID and Key Secret
5. Configure webhook (after backend deployment):
   - Go to Settings → Webhooks
   - Add webhook URL: `https://your-backend-url.onrender.com/api/donations/webhook`
   - Select events: `payment.captured`
   - Save webhook secret

## Step 3: Email Configuration (Gmail)

1. Enable 2-Factor Authentication on your Google account
2. Generate App Password:
   - Go to Google Account → Security
   - 2-Step Verification → App passwords
   - Select app: Mail, Select device: Other
   - Generate and copy the 16-character password
3. Use these credentials:
   - EMAIL_HOST: smtp.gmail.com
   - EMAIL_PORT: 587
   - EMAIL_USER: your-email@gmail.com
   - EMAIL_PASS: your-16-char-app-password

## Step 4: Backend Deployment (Render)

1. Push your code to GitHub
2. Go to https://render.com and sign in
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - Name: nonprofit-backend (or your choice)
   - Root Directory: `backend`
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
6. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=your-mongodb-atlas-connection-string
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars
   JWT_EXPIRES_IN=7d
   RAZORPAY_KEY_ID=your-razorpay-key-id
   RAZORPAY_KEY_SECRET=your-razorpay-key-secret
   RAZORPAY_WEBHOOK_SECRET=your-razorpay-webhook-secret
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   FRONTEND_URL=https://your-frontend-url.vercel.app
   FOUNDATION_NAME=Your Foundation Name
   FOUNDATION_ADDRESS=Your Foundation Address
   FOUNDATION_REGISTRATION_NUMBER=12A/80G Registration Number
   ```
7. Click "Create Web Service"
8. Wait for deployment to complete
9. Copy the deployed URL (e.g., `https://nonprofit-backend.onrender.com`)

## Step 5: Frontend Deployment (Vercel)

1. Go to https://vercel.com and sign in
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add Environment Variables:
   ```
   VITE_API_BASE_URL=https://your-backend-url.onrender.com/api
   VITE_RAZORPAY_KEY_ID=your-razorpay-key-id
   ```
6. Click "Deploy"
7. Wait for deployment to complete
8. Copy the deployed URL (e.g., `https://nonprofit-foundation.vercel.app`)

## Step 6: Update CORS and Webhook

1. Update backend CORS:
   - Go to Render dashboard
   - Update `FRONTEND_URL` environment variable with your Vercel URL
   - Redeploy if necessary

2. Update Razorpay webhook:
   - Go to Razorpay Dashboard → Settings → Webhooks
   - Update webhook URL with your Render backend URL
   - URL format: `https://your-backend.onrender.com/api/donations/webhook`

## Step 7: Create Admin User

Since there's no admin registration UI, create an admin user manually:

1. Use a tool like Postman or curl
2. Send POST request to: `https://your-backend-url.onrender.com/api/auth/register`
3. Body:
   ```json
   {
     "name": "Admin Name",
     "email": "admin@example.com",
     "phone": "1234567890",
     "password": "securepassword",
     "role": "admin"
   }
   ```
4. Save the returned token and user details

## Step 8: Test the Application

1. Visit your frontend URL
2. Test user registration and login
3. Test donation flow (use Razorpay test cards)
4. Verify email delivery
5. Check certificate generation
6. Test admin dashboard
7. Verify transparency reports

### Razorpay Test Cards

For testing payments:

- Card Number: 4111 1111 1111 1111
- CVV: Any 3 digits
- Expiry: Any future date
- Name: Any name

## Troubleshooting

### Backend Issues

1. **Database connection fails**:
   - Verify MongoDB connection string
   - Check network access settings in MongoDB Atlas
   - Ensure password is URL-encoded

2. **CORS errors**:
   - Verify FRONTEND_URL environment variable
   - Check that frontend URL matches exactly (no trailing slash)

3. **Email not sending**:
   - Verify Gmail app password
   - Check EMAIL_HOST and EMAIL_PORT
   - Ensure 2FA is enabled on Google account

### Frontend Issues

1. **API calls failing**:
   - Verify VITE_API_BASE_URL is correct
   - Check browser console for errors
   - Ensure backend is running

2. **Razorpay not loading**:
   - Verify VITE_RAZORPAY_KEY_ID is correct
   - Check that Razorpay script is loaded in index.html

## Monitoring

1. **Backend Logs**:
   - Go to Render dashboard
   - Click on your service
   - View "Logs" tab

2. **Frontend Logs**:
   - Go to Vercel dashboard
   - Click on your project
   - View "Deployments" → Click deployment → "Functions" tab

## Scaling

### Backend Scaling (Render)

- Free tier: Limited resources
- Upgrade to paid plan for:
  - More CPU/RAM
  - No sleep on inactivity
  - Custom domains

### Database Scaling (MongoDB Atlas)

- Free tier: 512MB storage
- Upgrade for:
  - More storage
  - Better performance
  - Automated backups

## Security Checklist

- [ ] All environment variables are set
- [ ] JWT_SECRET is strong (32+ characters)
- [ ] MongoDB network access is configured
- [ ] HTTPS is enforced
- [ ] Razorpay webhook signature verification is enabled
- [ ] Email credentials are secure
- [ ] CORS is properly configured
- [ ] Rate limiting is active

## Maintenance

### Regular Tasks

1. Monitor error logs weekly
2. Check database storage usage
3. Review donation transactions
4. Update dependencies monthly
5. Backup database regularly (MongoDB Atlas auto-backup)

### Updates

1. Test updates in development first
2. Deploy backend updates first
3. Then deploy frontend updates
4. Monitor for errors after deployment

## Support

For issues:

1. Check logs in Render/Vercel dashboards
2. Verify all environment variables
3. Test API endpoints with Postman
4. Check MongoDB Atlas connection
5. Review Razorpay dashboard for payment issues
