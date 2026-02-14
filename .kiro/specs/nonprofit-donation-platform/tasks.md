# Implementation Plan: Nonprofit Donation Platform

## Overview

This implementation plan breaks down the full-stack MERN nonprofit donation platform into discrete, incremental coding tasks. The approach follows a bottom-up strategy: starting with database models and core services, then building API endpoints, and finally implementing the frontend. Each task builds on previous work, ensuring no orphaned code. Testing tasks are marked as optional with "\*" to allow for faster MVP development while maintaining quality standards.

The implementation uses JavaScript for both frontend (React) and backend (Node.js/Express), with MongoDB for data persistence, Razorpay for payments, and deployment on Vercel (frontend) and Render (backend).

## Tasks

- [x] 1. Project setup and configuration
  - Initialize backend Node.js project with Express, Mongoose, and required dependencies
  - Initialize frontend React project with Vite, React Router, Axios, and Tailwind CSS
  - Configure environment variables for both projects (.env files)
  - Set up project structure with organized folders (models, routes, controllers, services, middleware)
  - Configure MongoDB Atlas connection string
  - Set up CORS configuration for backend
  - Create README with project overview and setup instructions
  - _Requirements: 14.4, 14.6_

- [ ] 2. Database models and schemas
  - [x] 2.1 Create User model with Mongoose schema
    - Define schema with fields: name, email, phone, passwordHash, role, createdAt, updatedAt
    - Add email unique index and validation
    - Add role enum validation (donor, admin)
    - _Requirements: 12.1_

  - [x] 2.2 Create Donation model with Mongoose schema
    - Define schema with fields: userId, amount, razorpayPaymentId, razorpayOrderId, transactionStatus, visibilityChoice, publicName, donorId, programId, createdAt, updatedAt
    - Add references to User and Program models
    - Add indexes on userId, programId, razorpayPaymentId
    - Add validation for amount (min: 1), transactionStatus enum, visibilityChoice enum
    - _Requirements: 12.2_

  - [x] 2.3 Create Program model with Mongoose schema
    - Define schema with fields: programName, description, fundsReceived, fundsUtilized, startDate, endDate, status, createdAt, updatedAt
    - Add programName unique index
    - Add status enum validation (active, completed, archived)
    - Add validation for fundsReceived and fundsUtilized (min: 0)
    - _Requirements: 12.3_

  - [x] 2.4 Create Certificate model with Mongoose schema
    - Define schema with fields: donationId, certificateType, certificateURL, issuedDate, createdAt
    - Add reference to Donation model
    - Add donationId unique index
    - Add certificateType enum validation (80G, 12A)
    - _Requirements: 12.4_

  - [x] 2.5 Create Report model with Mongoose schema
    - Define schema with fields: programId, fundsReceived, fundsUtilized, reportFileURL, lastUpdated, createdAt
    - Add reference to Program model
    - Add index on programId and lastUpdated
    - _Requirements: 12.5_

  - [ ]\* 2.6 Write property test for referential integrity
    - **Property 31: Referential integrity enforcement**
    - **Validates: Requirements 12.6**

- [ ] 3. Authentication service and middleware
  - [x] 3.1 Implement AuthService class
    - Create register method with bcrypt password hashing
    - Create login method with JWT token generation
    - Create verifyToken method for JWT validation
    - Create hashPassword and comparePassword helper methods
    - Use bcrypt with appropriate salt rounds (10+)
    - _Requirements: 1.1, 1.2, 11.7_

  - [ ]\* 3.2 Write property tests for authentication
    - **Property 1: Password hashing on registration**
    - **Property 2: JWT token generation on valid login**
    - **Property 3: Authentication rejection for invalid credentials**
    - **Validates: Requirements 1.1, 1.2, 1.3, 11.7**

  - [x] 3.3 Create authentication middleware
    - Implement authenticateToken middleware to extract and verify JWT from Authorization header
    - Attach user data (userId, role) to request object
    - Return 401 Unauthorized for invalid/missing tokens
    - _Requirements: 1.4_

  - [x] 3.4 Create authorization middleware
    - Implement authorizeRole middleware factory function
    - Check user role against allowed roles
    - Return 403 Forbidden for unauthorized roles
    - _Requirements: 1.5, 1.6_

  - [ ]\* 3.5 Write property test for role-based access control
    - **Property 4: Role-based access control**
    - **Validates: Requirements 1.5, 1.6**

  - [x] 3.6 Implement rate limiting middleware for auth endpoints
    - Use express-rate-limit package
    - Configure rate limits for login and register endpoints
    - Return 429 Too Many Requests when limit exceeded
    - _Requirements: 11.8_

  - [ ]\* 3.7 Write property test for rate limiting
    - **Property 30: Rate limiting on authentication**
    - **Validates: Requirements 11.8**

- [ ] 4. Payment service with Razorpay integration
  - [x] 4.1 Implement PaymentService class
    - Install and configure Razorpay Node SDK
    - Create createOrder method to generate Razorpay payment orders
    - Create verifyWebhookSignature method using Razorpay secret
    - Create processPaymentSuccess method to handle verified payments
    - _Requirements: 2.1, 2.2_

  - [ ]\* 4.2 Write property tests for payment service
    - **Property 5: Razorpay order creation**
    - **Property 6: Webhook signature verification**
    - **Validates: Requirements 2.1, 2.2, 2.3**

- [ ] 5. Donation service
  - [x] 5.1 Implement DonationService class
    - Create createDonation method to record donations
    - Implement generateDonorId method for anonymous donations (use UUID or similar)
    - Create getDonationHistory method to retrieve user's donations with program and certificate info
    - Create getPublicDonations method for donor wall (filter by visibility consent)
    - _Requirements: 2.5, 2.7, 4.1, 4.2, 4.4_

  - [ ]\* 5.2 Write property tests for donation service
    - **Property 7: Donation record completeness**
    - **Property 8: Visibility choice handling**
    - **Property 9: Donor ID uniqueness**
    - **Property 24: Donor wall visibility filtering**
    - **Validates: Requirements 2.5, 2.7, 4.1, 4.2, 4.3, 4.4, 4.5**

- [ ] 6. Program service
  - [x] 6.1 Implement ProgramService class
    - Create createProgram method with validation
    - Create updateFundsReceived method (called when donation is linked)
    - Create updateFundsUtilized method (admin updates)
    - Create getTransparencyData method to calculate utilization rates
    - Create getAllProgramsWithFunds method for public dashboard
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]\* 6.2 Write property tests for program service
    - **Property 13: Program creation with required fields**
    - **Property 14: Fund tracking accuracy**
    - **Property 15: Program display completeness**
    - **Validates: Requirements 5.1, 5.2, 5.4, 5.5**

- [ ] 7. Certificate generation service
  - [x] 7.1 Implement CertificateService class
    - Install PDF generation library (PDFKit or similar)
    - Create generate80GCertificate method to create PDF with donor info
    - Store generated PDFs (local file system or cloud storage)
    - Create getCertificateByDonation method to retrieve certificate URLs
    - Include all required fields in certificate: donor name, amount, date, foundation details
    - _Requirements: 3.1, 3.2, 3.4_

  - [ ]\* 7.2 Write property tests for certificate service
    - **Property 10: Automatic certificate generation**
    - **Property 11: Certificate content completeness**
    - **Validates: Requirements 3.1, 3.2, 3.4**

- [ ] 8. Email service
  - [x] 8.1 Implement EmailService class
    - Install and configure Nodemailer
    - Create sendDonationConfirmation method with email template
    - Create sendWeeklyProgressReport method with program updates
    - Implement retry logic with exponential backoff for failed emails
    - Create email templates for confirmation and progress reports
    - _Requirements: 2.6, 7.1, 7.3, 7.4, 7.5_

  - [ ]\* 8.2 Write property tests for email service
    - **Property 19: Donation confirmation email trigger**
    - **Property 20: Progress report email content**
    - **Property 21: Email failure handling**
    - **Validates: Requirements 2.6, 7.1, 7.3, 7.4, 7.5**

- [ ] 9. Report service
  - [x] 9.1 Implement ReportService class
    - Create uploadReport method to store report file URLs
    - Create getAllReports method for public dashboard
    - Create getReportByProgram method to retrieve program-specific reports
    - Link reports to programs with fund data
    - _Requirements: 6.3, 6.4, 6.5_

  - [ ]\* 9.2 Write property tests for report service
    - **Property 17: Impact report storage and linking**
    - **Property 18: Public report accessibility**
    - **Validates: Requirements 6.3, 6.4, 6.5**

- [ ] 10. Input validation and security middleware
  - [x] 10.1 Create input validation middleware
    - Install express-validator or joi
    - Create validation schemas for all request types
    - Implement validateInput middleware factory
    - Sanitize inputs to prevent injection attacks
    - _Requirements: 11.3, 11.4, 13.6_

  - [ ]\* 10.2 Write property tests for input validation
    - **Property 28: Input validation and sanitization**
    - **Validates: Requirements 11.3, 11.4, 13.6**

  - [-] 10.3 Configure CORS middleware
    - Set allowed origins to authorized frontend domains
    - Configure credentials and headers
    - _Requirements: 11.6_

  - [ ]\* 10.4 Write property test for CORS enforcement
    - **Property 29: CORS enforcement**
    - **Validates: Requirements 11.6**

- [ ] 11. Error handling middleware
  - [x] 11.1 Create custom error classes
    - Define ValidationError, AuthenticationError, AuthorizationError, NotFoundError, PaymentError classes
    - Include statusCode and error code in each class
    - _Requirements: 13.2, 13.3_

  - [x] 11.2 Implement global error handler middleware
    - Log errors with context (path, method, userId, timestamp)
    - Return consistent error response format
    - Hide sensitive details in production
    - Map error types to appropriate HTTP status codes
    - _Requirements: 13.2, 13.3, 14.5_

  - [ ]\* 11.3 Write property tests for error handling
    - **Property 32: HTTP status code correctness**
    - **Property 33: Consistent error response format**
    - **Property 34: Critical operation logging**
    - **Validates: Requirements 13.2, 13.3, 14.5**

- [x] 12. Checkpoint - Backend core services complete
  - Ensure all services are implemented and can be imported
  - Verify database models are properly defined
  - Ensure all tests pass (if implemented)
  - Ask the user if questions arise

- [ ] 13. Authentication API endpoints
  - [x] 13.1 Create auth routes and controller
    - POST /api/auth/register - User registration endpoint
    - POST /api/auth/login - User login endpoint
    - GET /api/auth/me - Get current user info (authenticated)
    - Apply rate limiting to register and login
    - Apply input validation middleware
    - Return JWT token on successful registration/login
    - _Requirements: 1.1, 1.2, 1.3, 11.8, 13.1, 13.6_

  - [ ]\* 13.2 Write integration tests for auth endpoints
    - Test successful registration and login flows
    - Test invalid credentials rejection
    - Test rate limiting behavior
    - _Requirements: 1.1, 1.2, 1.3, 11.8_

- [ ] 14. Donation API endpoints
  - [x] 14.1 Create donation routes and controller
    - POST /api/donations/create-order - Create Razorpay payment order (authenticated)
    - POST /api/donations/webhook - Razorpay webhook handler (public, signature verified)
    - GET /api/donations/history - Get user's donation history (authenticated)
    - GET /api/donations/public - Get public donations for donor wall (public)
    - Apply authentication middleware to protected routes
    - Apply input validation middleware
    - Trigger certificate generation and email on successful payment
    - _Requirements: 2.1, 2.2, 2.4, 2.5, 2.6, 3.1, 4.4, 7.1, 13.1_

  - [ ]\* 14.2 Write integration tests for donation endpoints
    - Test order creation flow
    - Test webhook verification and processing
    - Test donation history retrieval
    - Test public donations filtering
    - _Requirements: 2.1, 2.2, 2.4, 2.5, 4.4_

- [ ] 15. Program API endpoints
  - [x] 15.1 Create program routes and controller
    - POST /api/programs - Create program (admin only)
    - GET /api/programs - Get all programs (public)
    - GET /api/programs/:id - Get program by ID (public)
    - PUT /api/programs/:id - Update program (admin only)
    - PUT /api/programs/:id/funds - Update funds utilized (admin only)
    - DELETE /api/programs/:id - Archive program (admin only)
    - Apply authentication and authorization middleware
    - Apply input validation middleware
    - _Requirements: 5.1, 5.3, 5.5, 10.3, 13.1_

  - [ ]\* 15.2 Write integration tests for program endpoints
    - Test program CRUD operations
    - Test admin-only access restrictions
    - Test fund updates
    - _Requirements: 5.1, 5.3, 10.3_

- [ ] 16. Report API endpoints
  - [x] 16.1 Create report routes and controller
    - POST /api/reports - Upload impact report (admin only)
    - GET /api/reports - Get all reports (public)
    - GET /api/reports/program/:programId - Get reports by program (public)
    - Apply authentication and authorization middleware for admin routes
    - Apply input validation middleware
    - _Requirements: 6.3, 6.5, 13.1_

  - [ ]\* 16.2 Write integration tests for report endpoints
    - Test report upload and retrieval
    - Test admin-only access restrictions
    - _Requirements: 6.3, 6.5_

- [ ] 17. User and admin dashboard API endpoints
  - [x] 17.1 Create user dashboard routes and controller
    - GET /api/users/profile - Get user profile (authenticated)
    - PUT /api/users/profile - Update user profile (authenticated)
    - GET /api/users/dashboard - Get donor dashboard data (authenticated, donor only)
    - Apply authentication middleware
    - Apply input validation middleware
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 13.1_

  - [x] 17.2 Create admin dashboard routes and controller
    - GET /api/admin/dashboard - Get admin dashboard analytics (admin only)
    - GET /api/admin/donations - Get all donations (admin only)
    - GET /api/admin/donors - Get all donors (admin only)
    - Apply authentication and authorization middleware
    - Calculate analytics: total donations, active programs, utilization rates
    - _Requirements: 10.1, 10.2, 10.6, 13.1_

  - [ ]\* 17.3 Write property tests for dashboard data
    - **Property 22: Donor dashboard completeness**
    - **Property 23: Program progress visibility**
    - **Property 25: Admin donation visibility**
    - **Property 27: Analytics calculation accuracy**
    - **Validates: Requirements 9.1, 9.2, 9.4, 10.2, 10.6**

- [ ] 18. Transparency API endpoints
  - [x] 18.1 Create transparency routes and controller
    - GET /api/transparency/programs - Get all programs with fund data (public)
    - GET /api/transparency/reports - Get transparency reports (public)
    - Calculate and return fund utilization rates
    - _Requirements: 6.1, 6.2, 13.1_

  - [ ]\* 18.2 Write property test for transparency reporting
    - **Property 16: Transparency report completeness**
    - **Validates: Requirements 6.1**

- [ ] 19. Certificate API endpoints
  - [x] 19.1 Create certificate routes and controller
    - GET /api/certificates/donation/:donationId - Get certificate by donation (authenticated, owner or admin)
    - Verify user owns the donation or is admin
    - Return certificate URL for download
    - _Requirements: 3.3, 13.1_

  - [ ]\* 19.2 Write property test for certificate availability
    - **Property 12: Certificate availability in donation history**
    - **Validates: Requirements 3.3, 9.2**

- [x] 20. Checkpoint - Backend API complete
  - Ensure all API endpoints are implemented and tested
  - Verify authentication and authorization work correctly
  - Test payment webhook flow end-to-end
  - Ensure all tests pass (if implemented)
  - Ask the user if questions arise

- [ ] 21. Frontend project setup and routing
  - [x] 21.1 Configure React Router
    - Set up routes for all pages: Home, About, Programs, Blog, Donate, Donor Wall, Impact Reports, Login, Register, Donor Dashboard, Admin Dashboard
    - Create route protection for authenticated routes
    - Create admin route protection
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 15.2_

  - [x] 21.2 Configure Axios with interceptors
    - Set base URL from environment variables
    - Add request interceptor to attach JWT token
    - Add response interceptor for error handling
    - Implement automatic token refresh or redirect to login on 401
    - _Requirements: 13.2, 13.3, 15.5_

  - [x] 21.3 Configure Tailwind CSS
    - Set up Tailwind configuration
    - Create custom color scheme for nonprofit branding
    - Configure responsive breakpoints
    - _Requirements: 15.1, 15.3_

- [ ] 22. Authentication UI components
  - [x] 22.1 Create Login page component
    - Email and password input fields
    - Form validation with error messages
    - Submit button with loading state
    - Link to register page
    - Call /api/auth/login endpoint
    - Store JWT token in localStorage
    - Redirect to dashboard on success
    - _Requirements: 1.2, 15.4, 15.5, 15.6_

  - [x] 22.2 Create Register page component
    - Name, email, phone, password input fields
    - Form validation with error messages
    - Submit button with loading state
    - Link to login page
    - Call /api/auth/register endpoint
    - Store JWT token in localStorage
    - Redirect to dashboard on success
    - _Requirements: 1.1, 15.4, 15.5, 15.6_

  - [ ]\* 22.3 Write property tests for form validation
    - **Property 35: Form validation with error messages**
    - **Validates: Requirements 15.6**

- [ ] 23. Public pages components
  - [x] 23.1 Create Home page component
    - Hero section with mission statement
    - Featured programs section
    - Impact statistics section
    - Call-to-action for donations
    - Responsive layout
    - _Requirements: 8.1, 15.1_

  - [x] 23.2 Create About Us page component
    - Foundation history section
    - Team members section
    - Mission and vision section
    - Contact information
    - Responsive layout
    - _Requirements: 8.2, 15.1_

  - [x] 23.3 Create Programs page component
    - Fetch programs from /api/programs
    - Display program cards with descriptions
    - Show fund allocation progress bars
    - Link to donation page with program pre-selected
    - Responsive grid layout
    - _Requirements: 8.3, 15.1_

  - [ ]\* 23.4 Write property test for program display
    - **Property 15: Program display completeness**
    - **Validates: Requirements 5.5, 8.3**

  - [x] 23.5 Create Blog/Press page component
    - Display news articles and press releases
    - Responsive layout
    - _Requirements: 8.4, 15.1_

- [ ] 24. Donation page and Razorpay integration
  - [x] 24.1 Create Donation page component
    - Program selection dropdown (fetch from /api/programs)
    - Amount input field with validation
    - Visibility choice radio buttons (public name or anonymous)
    - Public name input (conditional on visibility choice)
    - Razorpay payment button
    - Call /api/donations/create-order to get Razorpay order
    - Integrate Razorpay checkout UI
    - Handle payment success and failure callbacks
    - Show confirmation message with certificate download link
    - _Requirements: 2.1, 2.7, 8.5, 15.4, 15.6_

  - [ ]\* 24.2 Write integration test for donation flow
    - Test order creation and payment initiation
    - Test visibility choice handling
    - _Requirements: 2.1, 2.7_

- [ ] 25. Donor Wall and Impact Reports pages
  - [x] 25.1 Create Donor Wall page component
    - Fetch public donations from /api/donations/public
    - Display donor names or donor IDs
    - Show donation amounts and programs
    - Sort by date (most recent first)
    - Responsive layout
    - _Requirements: 4.4, 8.6, 15.1_

  - [x] 25.2 Create Impact Reports dashboard page component
    - Fetch transparency data from /api/transparency/programs
    - Display fund allocation charts (use Chart.js or similar)
    - Show funds received vs utilized for each program
    - Fetch reports from /api/transparency/reports
    - Display report download links
    - Show last updated timestamps
    - Responsive layout
    - _Requirements: 6.1, 6.2, 6.4, 6.5, 8.7, 15.1_

- [ ] 26. Donor Dashboard
  - [x] 26.1 Create Donor Dashboard page component
    - Fetch dashboard data from /api/users/dashboard
    - Display donation history table with dates, amounts, programs
    - Add certificate download buttons for each donation
    - Show program progress updates for supported programs
    - Display total contribution amount
    - Add profile edit section
    - Responsive layout
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 15.1, 15.4_

  - [ ]\* 26.2 Write property tests for donor dashboard
    - **Property 22: Donor dashboard completeness**
    - **Property 23: Program progress visibility**
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.4**

- [ ] 27. Admin Dashboard
  - [x] 27.1 Create Admin Dashboard page component
    - Fetch admin analytics from /api/admin/dashboard
    - Display total donations, active programs, utilization rates
    - Show charts for fund allocation
    - Responsive layout
    - _Requirements: 10.1, 10.6, 15.1_

  - [x] 27.2 Create Donor Management component
    - Fetch all donors from /api/admin/donors
    - Display donors table with search and filter
    - Show donor details and donation history
    - _Requirements: 10.1, 10.2_

  - [x] 27.3 Create Donation Management component
    - Fetch all donations from /api/admin/donations
    - Display donations table with filters (date, program, status)
    - Show full donation details including visibility choices
    - _Requirements: 10.2_

  - [ ]\* 27.4 Write property test for admin donation visibility
    - **Property 25: Admin donation visibility**
    - **Validates: Requirements 10.2**

  - [x] 27.5 Create Program Management component
    - Display all programs with CRUD controls
    - Add form to create new program
    - Edit form to update program details
    - Archive button for programs
    - Fund utilization update form
    - _Requirements: 10.3, 10.5_

  - [ ]\* 27.6 Write property test for fund management
    - **Property 26: Admin fund management**
    - **Validates: Requirements 10.5**

  - [x] 27.7 Create Report Management component
    - Upload form for impact reports
    - Link report to program dropdown
    - Display uploaded reports with edit/delete options
    - _Requirements: 10.4_

- [ ] 28. Shared UI components
  - [ ] 28.1 Create reusable components
    - Button component with loading states
    - Input component with validation display
    - Card component for consistent styling
    - Modal component for dialogs
    - Notification/Toast component for success/error messages
    - Loading spinner component
    - _Requirements: 15.4, 15.5_

  - [ ]\* 28.2 Write property test for loading indicators
    - **Property 36: Asynchronous operation indicators**
    - **Validates: Requirements 15.4**

  - [x] 28.3 Create navigation components
    - Header with navigation links
    - Footer with contact info and links
    - Mobile responsive menu
    - User menu with logout option (when authenticated)
    - _Requirements: 15.1_

- [ ] 29. SEO optimization
  - [ ] 29.1 Add SEO meta tags
    - Configure React Helmet or similar
    - Add meta tags for title, description, keywords
    - Add Open Graph tags for social sharing
    - Add canonical URLs
    - Use semantic HTML elements
    - _Requirements: 15.7_

- [x] 30. Checkpoint - Frontend complete
  - Ensure all pages are implemented and navigable
  - Verify authentication flows work correctly
  - Test donation flow end-to-end
  - Verify responsive design on different screen sizes
  - Ensure all tests pass (if implemented)
  - Ask the user if questions arise

- [ ] 31. Environment configuration and deployment preparation
  - [x] 31.1 Configure backend environment variables
    - Create .env.example file with all required variables
    - Document: MONGODB_URI, JWT_SECRET, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, FRONTEND_URL, PORT
    - Add environment validation on startup
    - _Requirements: 11.5, 14.4_

  - [x] 31.2 Configure frontend environment variables
    - Create .env.example file with required variables
    - Document: VITE_API_BASE_URL, VITE_RAZORPAY_KEY_ID
    - _Requirements: 14.4_

  - [x] 31.3 Configure HTTPS enforcement
    - Add helmet middleware for security headers
    - Configure HTTPS redirect in production
    - _Requirements: 11.1_

  - [x] 31.4 Update README with deployment instructions
    - Add MongoDB Atlas setup instructions
    - Add Razorpay account setup instructions
    - Add Vercel deployment steps for frontend
    - Add Render deployment steps for backend
    - Add environment variable configuration guide
    - Add local development setup instructions
    - _Requirements: 14.6_

- [ ] 32. API documentation
  - [x] 32.1 Create API documentation
    - Document all endpoints with request/response examples
    - Include authentication requirements
    - Document error responses
    - Use Swagger/OpenAPI or Postman collection
    - _Requirements: 13.4_

- [ ] 33. Testing and quality assurance
  - [ ]\* 33.1 Run all property-based tests
    - Execute all property tests with 100+ iterations
    - Verify all 36 correctness properties pass
    - Fix any failing properties

  - [ ]\* 33.2 Run all unit and integration tests
    - Execute full test suite
    - Verify test coverage meets thresholds (80% backend, 70% frontend)
    - Fix any failing tests

  - [x] 33.3 Manual testing checklist
    - Test complete user registration and login flow
    - Test donation flow with Razorpay (use test mode)
    - Verify certificate generation and download
    - Test email sending (use test email service)
    - Verify donor wall displays correct data
    - Test admin dashboard and all CRUD operations
    - Verify transparency reports display correctly
    - Test on multiple browsers (Chrome, Firefox, Safari)
    - Test responsive design on mobile devices

- [ ] 34. Deployment
  - [ ] 34.1 Deploy backend to Render
    - Create Render account and new web service
    - Connect GitHub repository
    - Configure environment variables
    - Set build command and start command
    - Deploy and verify health endpoint
    - _Requirements: 14.2_

  - [ ] 34.2 Deploy frontend to Vercel
    - Create Vercel account and new project
    - Connect GitHub repository
    - Configure environment variables (API URL pointing to Render backend)
    - Set build command and output directory
    - Deploy and verify site loads
    - _Requirements: 14.1_

  - [ ] 34.3 Configure MongoDB Atlas
    - Create MongoDB Atlas account and cluster
    - Configure network access (allow Render IP or 0.0.0.0/0)
    - Create database user
    - Get connection string and add to Render environment variables
    - _Requirements: 14.3_

  - [ ] 34.4 Configure Razorpay webhook
    - Add Render backend URL to Razorpay webhook settings
    - Set webhook URL to https://your-backend.onrender.com/api/donations/webhook
    - Verify webhook signature validation works in production
    - _Requirements: 2.2_

  - [ ] 34.5 Final production verification
    - Test complete donation flow in production
    - Verify emails are sent correctly
    - Verify certificates are generated and accessible
    - Check all public pages load correctly
    - Verify admin dashboard functions properly
    - Monitor logs for any errors

- [x] 35. Final checkpoint - Production ready
  - All features deployed and functional
  - All critical flows tested in production
  - Documentation complete
  - Ask the user if any issues or questions arise

## Notes

- Tasks marked with `*` are optional property-based and unit tests that can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation and allow for user feedback
- Property tests validate universal correctness properties across randomized inputs
- The implementation follows a bottom-up approach: models → services → API → frontend
- All code should include proper error handling and input validation
- Use environment variables for all sensitive configuration
- Follow JavaScript best practices and ESLint rules
- Ensure responsive design for all UI components
