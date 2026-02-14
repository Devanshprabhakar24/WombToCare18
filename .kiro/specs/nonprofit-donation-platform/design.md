# Design Document: Nonprofit Donation Platform

## Overview

The nonprofit donation platform is a full-stack MERN application that provides a comprehensive solution for managing donations, ensuring financial transparency, and maintaining donor relationships. The system is architected as a decoupled frontend-backend application with the React frontend deployed on Vercel and the Node.js/Express backend deployed on Render, connected to MongoDB Atlas.

The platform serves three primary user groups:

1. **Public visitors** - Access information and make donations
2. **Authenticated donors** - View donation history and download certificates
3. **Administrators** - Manage programs, track fund utilization, and generate reports

Key architectural principles:

- **Separation of concerns**: Clear boundaries between presentation, business logic, and data layers
- **Security-first**: JWT authentication, input validation, webhook verification, and HTTPS enforcement
- **Transparency by design**: All fund movements are tracked and publicly reportable
- **Scalability**: Stateless backend design supporting horizontal scaling
- **Maintainability**: Modular code structure with clear interfaces

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌────────────────────────────────────────────────────┐    │
│  │  React SPA (Vercel)                                 │    │
│  │  - Public Pages (Home, About, Programs, Donate)    │    │
│  │  - Donor Dashboard (History, Certificates)         │    │
│  │  - Admin Dashboard (Manage Programs, Reports)      │    │
│  │  - React Router, Axios, Tailwind CSS               │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/REST API
                            │ JWT Authentication
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                       │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Express.js API Server (Render)                    │    │
│  │  ┌──────────────────────────────────────────┐     │    │
│  │  │  Authentication Middleware (JWT)          │     │    │
│  │  └──────────────────────────────────────────┘     │    │
│  │  ┌──────────────────────────────────────────┐     │    │
│  │  │  Route Controllers                        │     │    │
│  │  │  - Auth, Donations, Programs, Reports    │     │    │
│  │  └──────────────────────────────────────────┘     │    │
│  │  ┌──────────────────────────────────────────┐     │    │
│  │  │  Business Logic Services                  │     │    │
│  │  │  - Payment, Certificate, Email, Report   │     │    │
│  │  └──────────────────────────────────────────┘     │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Mongoose ODM
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       DATA LAYER                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │  MongoDB Atlas                                      │    │
│  │  - Users, Donations, Programs                      │    │
│  │  - Certificates, Reports                           │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Razorpay    │  │  Email       │  │  PDF         │     │
│  │  Payment API │  │  Service     │  │  Generator   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**

- React 18+ (UI framework)
- React Router v6 (client-side routing)
- Axios (HTTP client)
- Tailwind CSS (styling)
- Vite (build tool)

**Backend:**

- Node.js 18+ (runtime)
- Express.js 4+ (web framework)
- Mongoose 7+ (MongoDB ODM)
- jsonwebtoken (JWT authentication)
- bcrypt (password hashing)
- Razorpay Node SDK (payment integration)
- PDFKit or similar (certificate generation)
- Nodemailer (email service)

**Database:**

- MongoDB Atlas (cloud database)

**Deployment:**

- Vercel (frontend hosting)
- Render (backend hosting)

## Components and Interfaces

### Backend Components

#### 1. Authentication Service

**Responsibilities:**

- User registration with password hashing
- User login with JWT token generation
- Token validation and user identification
- Role-based access control

**Interface:**

```javascript
class AuthService {
  // Register new user
  async register(userData: {
    name: string,
    email: string,
    phone: string,
    password: string,
    role: 'donor' | 'admin'
  }): Promise<{ userId: string, token: string }>

  // Login user
  async login(credentials: {
    email: string,
    password: string
  }): Promise<{ userId: string, token: string, role: string }>

  // Verify JWT token
  async verifyToken(token: string): Promise<{ userId: string, role: string }>

  // Hash password
  async hashPassword(password: string): Promise<string>

  // Compare password with hash
  async comparePassword(password: string, hash: string): Promise<boolean>
}
```

#### 2. Payment Service

**Responsibilities:**

- Create Razorpay payment orders
- Verify webhook signatures
- Process payment confirmations
- Update donation records

**Interface:**

```javascript
class PaymentService {
  // Create Razorpay order
  async createOrder(orderData: {
    amount: number,
    currency: string,
    receipt: string
  }): Promise<{ orderId: string, amount: number, currency: string }>

  // Verify webhook signature
  verifyWebhookSignature(
    webhookBody: string,
    signature: string,
    secret: string
  ): boolean

  // Process payment success
  async processPaymentSuccess(paymentData: {
    razorpayPaymentId: string,
    razorpayOrderId: string,
    razorpaySignature: string,
    userId: string,
    amount: number,
    programId: string,
    visibilityChoice: 'public' | 'anonymous',
    publicName?: string
  }): Promise<{ donationId: string }>
}
```

#### 3. Certificate Service

**Responsibilities:**

- Generate 80G tax exemption certificates
- Store certificate files
- Retrieve certificate URLs

**Interface:**

```javascript
class CertificateService {
  // Generate 80G certificate PDF
  async generate80GCertificate(certificateData: {
    donationId: string,
    donorName: string,
    amount: number,
    date: Date,
    foundationDetails: object
  }): Promise<{ certificateURL: string }>

  // Get certificate by donation ID
  async getCertificateByDonation(donationId: string): Promise<{
    certificateType: string,
    certificateURL: string,
    issuedDate: Date
  }>
}
```

#### 4. Email Service

**Responsibilities:**

- Send donation confirmation emails
- Send weekly progress reports
- Handle email delivery failures with retry logic

**Interface:**

```javascript
class EmailService {
  // Send donation confirmation
  async sendDonationConfirmation(emailData: {
    recipientEmail: string,
    donorName: string,
    amount: number,
    programName: string,
    certificateURL: string
  }): Promise<{ success: boolean }>

  // Send weekly progress report
  async sendWeeklyProgressReport(emailData: {
    recipientEmail: string,
    donorName: string,
    programs: Array<{
      programName: string,
      fundsReceived: number,
      fundsUtilized: number,
      progress: string
    }>
  }): Promise<{ success: boolean }>

  // Retry failed email
  async retryFailedEmail(emailId: string): Promise<{ success: boolean }>
}
```

#### 5. Program Service

**Responsibilities:**

- Create and manage programs
- Track fund allocation
- Calculate fund utilization rates
- Generate transparency reports

**Interface:**

```javascript
class ProgramService {
  // Create new program
  async createProgram(programData: {
    programName: string,
    description: string,
    startDate: Date,
    endDate: Date,
    status: 'active' | 'completed' | 'archived'
  }): Promise<{ programId: string }>

  // Update funds received (called when donation is made)
  async updateFundsReceived(
    programId: string,
    amount: number
  ): Promise<{ fundsReceived: number }>

  // Update funds utilized
  async updateFundsUtilized(
    programId: string,
    amount: number
  ): Promise<{ fundsUtilized: number }>

  // Get program transparency data
  async getTransparencyData(programId: string): Promise<{
    programName: string,
    fundsReceived: number,
    fundsUtilized: number,
    utilizationRate: number
  }>

  // Get all programs with fund data
  async getAllProgramsWithFunds(): Promise<Array<{
    programId: string,
    programName: string,
    fundsReceived: number,
    fundsUtilized: number,
    status: string
  }>>
}
```

#### 6. Donation Service

**Responsibilities:**

- Record donations
- Generate donor IDs for anonymous donations
- Retrieve donation history
- Link donations to programs

**Interface:**

```javascript
class DonationService {
  // Create donation record
  async createDonation(donationData: {
    userId: string,
    amount: number,
    razorpayPaymentId: string,
    programId: string,
    visibilityChoice: 'public' | 'anonymous',
    publicName?: string
  }): Promise<{ donationId: string, donorId?: string }>

  // Generate unique donor ID
  generateDonorId(): string

  // Get donation history for user
  async getDonationHistory(userId: string): Promise<Array<{
    donationId: string,
    amount: number,
    programName: string,
    date: Date,
    certificateURL: string
  }>>

  // Get public donations for donor wall
  async getPublicDonations(): Promise<Array<{
    displayName: string,
    amount: number,
    programName: string,
    date: Date
  }>>
}
```

#### 7. Report Service

**Responsibilities:**

- Upload and store impact reports
- Link reports to programs
- Retrieve reports for public dashboard

**Interface:**

```javascript
class ReportService {
  // Upload impact report
  async uploadReport(reportData: {
    programId: string,
    reportFileURL: string,
    fundsReceived: number,
    fundsUtilized: number
  }): Promise<{ reportId: string }>

  // Get all public reports
  async getAllReports(): Promise<Array<{
    reportId: string,
    programName: string,
    fundsReceived: number,
    fundsUtilized: number,
    reportFileURL: string,
    lastUpdated: Date
  }>>

  // Get report by program
  async getReportByProgram(programId: string): Promise<{
    reportFileURL: string,
    fundsReceived: number,
    fundsUtilized: number,
    lastUpdated: Date
  }>
}
```

### Frontend Components

#### 1. Public Pages

**Home Page:**

- Hero section with mission statement
- Featured programs carousel
- Recent impact statistics
- Call-to-action for donations

**About Us Page:**

- Foundation history
- Team members
- Mission and vision
- Contact information

**Programs Page:**

- List of all active programs
- Program descriptions
- Fund allocation progress bars
- Donation links per program

**Blog/Press Page:**

- News articles
- Press releases
- Media coverage

**Donation Page:**

- Razorpay payment integration
- Program selection dropdown
- Amount input
- Visibility choice (public name or anonymous)
- Payment confirmation flow

**Donor Wall:**

- List of public donations
- Donor names or donor IDs
- Donation amounts
- Programs supported

**Impact Reports Dashboard:**

- Transparency data visualization
- Downloadable reports
- Fund utilization charts

#### 2. Donor Dashboard

**Components:**

- Donation history table
- Certificate download buttons
- Program progress updates
- Total contribution summary
- Profile management

#### 3. Admin Dashboard

**Components:**

- Donor management table
- Donation records with filters
- Program CRUD interface
- Fund utilization update forms
- Impact report upload
- Analytics dashboard

### Middleware Components

#### 1. Authentication Middleware

```javascript
function authenticateToken(req, res, next) {
  // Extract token from Authorization header
  // Verify token using JWT
  // Attach user data to request object
  // Call next() or return 401 Unauthorized
}
```

#### 2. Authorization Middleware

```javascript
function authorizeRole(allowedRoles) {
  return function (req, res, next) {
    // Check if user role is in allowedRoles
    // Call next() or return 403 Forbidden
  };
}
```

#### 3. Input Validation Middleware

```javascript
function validateInput(schema) {
  return function (req, res, next) {
    // Validate request body against schema
    // Sanitize inputs
    // Call next() or return 400 Bad Request
  };
}
```

#### 4. Error Handling Middleware

```javascript
function errorHandler(err, req, res, next) {
  // Log error
  // Return appropriate error response
  // Hide sensitive error details in production
}
```

## Data Models

### User Model

```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique, lowercase),
  phone: String (required),
  passwordHash: String (required),
  role: String (enum: ['donor', 'admin'], default: 'donor'),
  createdAt: Date (default: Date.now),
  updatedAt: Date
}

// Indexes
email: unique index
```

### Donation Model

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', required),
  amount: Number (required, min: 1),
  razorpayPaymentId: String (required, unique),
  razorpayOrderId: String (required),
  transactionStatus: String (enum: ['pending', 'completed', 'failed'], default: 'pending'),
  visibilityChoice: String (enum: ['public', 'anonymous'], required),
  publicName: String (conditional: required if visibilityChoice is 'public'),
  donorId: String (conditional: required if visibilityChoice is 'anonymous'),
  programId: ObjectId (ref: 'Program', required),
  createdAt: Date (default: Date.now),
  updatedAt: Date
}

// Indexes
userId: index
programId: index
razorpayPaymentId: unique index
createdAt: index (for sorting)
```

### Program Model

```javascript
{
  _id: ObjectId,
  programName: String (required, unique),
  description: String (required),
  fundsReceived: Number (default: 0, min: 0),
  fundsUtilized: Number (default: 0, min: 0),
  startDate: Date (required),
  endDate: Date,
  status: String (enum: ['active', 'completed', 'archived'], default: 'active'),
  createdAt: Date (default: Date.now),
  updatedAt: Date
}

// Indexes
programName: unique index
status: index
```

### Certificate Model

```javascript
{
  _id: ObjectId,
  donationId: ObjectId (ref: 'Donation', required, unique),
  certificateType: String (enum: ['80G', '12A'], default: '80G'),
  certificateURL: String (required),
  issuedDate: Date (default: Date.now),
  createdAt: Date (default: Date.now)
}

// Indexes
donationId: unique index
```

### Report Model

```javascript
{
  _id: ObjectId,
  programId: ObjectId (ref: 'Program', required),
  fundsReceived: Number (required, min: 0),
  fundsUtilized: Number (required, min: 0),
  reportFileURL: String (required),
  lastUpdated: Date (default: Date.now),
  createdAt: Date (default: Date.now)
}

// Indexes
programId: index
lastUpdated: index
```

### Data Relationships

```
User (1) ──────< (N) Donation
Program (1) ────< (N) Donation
Donation (1) ───< (1) Certificate
Program (1) ────< (N) Report
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Authentication and Authorization Properties

**Property 1: Password hashing on registration**
_For any_ valid user registration data (name, email, phone, password), when the registration function is called, the stored password should be a bcrypt hash and not the plaintext password.
**Validates: Requirements 1.1, 11.7**

**Property 2: JWT token generation on valid login**
_For any_ registered user with valid credentials, when the login function is called, the system should return a valid JWT token that can be verified and contains the user's ID and role.
**Validates: Requirements 1.2, 1.4**

**Property 3: Authentication rejection for invalid credentials**
_For any_ login attempt with invalid credentials (wrong password or non-existent email), the system should reject the attempt and return an authentication error without generating a token.
**Validates: Requirements 1.3**

**Property 4: Role-based access control**
_For any_ authenticated user, when accessing an endpoint, the system should grant access if and only if the user's role is authorized for that endpoint (admin for admin endpoints, donor for donor endpoints).
**Validates: Requirements 1.5, 1.6**

### Payment and Donation Properties

**Property 5: Razorpay order creation**
_For any_ valid donation initiation request, the system should create a Razorpay payment order and return order details including orderId, amount, and currency.
**Validates: Requirements 2.1**

**Property 6: Webhook signature verification**
_For any_ incoming Razorpay webhook, the system should verify the webhook signature before processing, and reject webhooks with invalid signatures while logging the security event.
**Validates: Requirements 2.2, 2.3**

**Property 7: Donation record completeness**
_For any_ completed donation, the stored donation record should contain all required fields: userId, amount, razorpayPaymentId, programId, transactionStatus, visibilityChoice, and timestamp.
**Validates: Requirements 2.4, 2.5**

**Property 8: Visibility choice handling**
_For any_ donation, if the donor chooses public visibility, the system should store their publicName; if they choose anonymous visibility, the system should generate and store a unique Donor_ID.
**Validates: Requirements 2.7, 4.1, 4.2, 4.3**

**Property 9: Donor ID uniqueness**
_For any_ set of anonymous donations, all generated Donor_ID values should be unique across the entire system.
**Validates: Requirements 4.5**

### Certificate Generation Properties

**Property 10: Automatic certificate generation**
_For any_ successfully completed donation, the system should automatically generate an 80G_Certificate PDF, store the certificate URL, and link it to the donation record.
**Validates: Requirements 3.1, 3.2**

**Property 11: Certificate content completeness**
_For any_ generated certificate, the PDF should contain all required information: donor name, donation amount, donation date, and foundation details.
**Validates: Requirements 3.4**

**Property 12: Certificate availability in donation history**
_For any_ donor's donation history request, each donation entry should include a downloadable certificate link.
**Validates: Requirements 3.3, 9.2**

### Program and Fund Management Properties

**Property 13: Program creation with required fields**
_For any_ program creation request, the stored program should contain all required fields: programName, description, startDate, endDate, status, and initialized fund amounts (fundsReceived: 0, fundsUtilized: 0).
**Validates: Requirements 5.1**

**Property 14: Fund tracking accuracy**
_For any_ program, after linking donations and updating utilization, the difference between fundsReceived and fundsUtilized should equal the sum of all linked donation amounts minus the sum of all utilization updates.
**Validates: Requirements 5.2, 5.4**

**Property 15: Program display completeness**
_For any_ program information display (public pages, dashboards, reports), the system should show both fundsReceived and fundsUtilized amounts.
**Validates: Requirements 5.5, 6.2**

### Transparency and Reporting Properties

**Property 16: Transparency report completeness**
_For any_ generated transparency report, the report should include total fundsReceived and total fundsUtilized for each program.
**Validates: Requirements 6.1**

**Property 17: Impact report storage and linking**
_For any_ uploaded impact report, the system should store the reportFileURL, link it to the specified program, and record the lastUpdated timestamp.
**Validates: Requirements 6.3, 6.4**

**Property 18: Public report accessibility**
_For any_ user viewing the impact reports dashboard, the system should display all published reports with download links.
**Validates: Requirements 6.5**

### Email Communication Properties

**Property 19: Donation confirmation email trigger**
_For any_ completed donation, the system should trigger an immediate confirmation email to the donor's email address.
**Validates: Requirements 2.6, 7.1**

**Property 20: Progress report email content**
_For any_ progress report email sent to a donor, the email should include updates on all programs the donor has contributed to and fund utilization statistics for those programs.
**Validates: Requirements 7.3, 7.4**

**Property 21: Email failure handling**
_For any_ failed email delivery attempt, the system should log the failure and implement retry logic according to the retry policy.
**Validates: Requirements 7.5**

### Dashboard and Display Properties

**Property 22: Donor dashboard completeness**
_For any_ logged-in donor viewing their dashboard, the system should display their complete donation history with dates, amounts, program names, certificate download links, and total contribution amount.
**Validates: Requirements 9.1, 9.2, 9.4**

**Property 23: Program progress visibility**
_For any_ donor dashboard, the system should display progress updates only for programs the donor has supported with donations.
**Validates: Requirements 9.3**

**Property 24: Donor wall visibility filtering**
_For any_ donor wall display, the system should only show donations where donors have explicitly consented to visibility (either with publicName or Donor_ID).
**Validates: Requirements 4.4, 8.6**

**Property 25: Admin donation visibility**
_For any_ admin viewing donation records, the system should display all donations with complete details regardless of visibility choice.
**Validates: Requirements 10.2**

**Property 26: Admin fund management**
_For any_ admin updating fund utilization for a program, the system should validate the input and save the updated fundsUtilized amount.
**Validates: Requirements 10.5**

**Property 27: Analytics calculation accuracy**
_For any_ admin analytics dashboard, the displayed total donations should equal the sum of all completed donation amounts, and fund utilization rates should equal (fundsUtilized / fundsReceived) \* 100 for each program.
**Validates: Requirements 10.6**

### Security Properties

**Property 28: Input validation and sanitization**
_For any_ user input received by the system, the input should be validated against expected formats and sanitized before storage to prevent injection attacks.
**Validates: Requirements 11.3, 11.4, 13.6**

**Property 29: CORS enforcement**
_For any_ incoming HTTP request, if the origin is not in the authorized frontend domains list, the system should reject the request with a CORS error.
**Validates: Requirements 11.6**

**Property 30: Rate limiting on authentication**
_For any_ authentication endpoint (login, register), after exceeding the rate limit threshold from a single IP address, the system should reject subsequent requests with a rate limit error.
**Validates: Requirements 11.8**

### Data Integrity Properties

**Property 31: Referential integrity enforcement**
_For any_ document creation or update that references another document (e.g., donation referencing userId or programId), the system should reject the operation if the referenced document does not exist.
**Validates: Requirements 12.6**

### API Properties

**Property 32: HTTP status code correctness**
_For any_ API request, the response should return the appropriate HTTP status code: 200/201 for success, 400 for bad request, 401 for unauthorized, 403 for forbidden, 404 for not found, 500 for server error.
**Validates: Requirements 13.2**

**Property 33: Consistent error response format**
_For any_ API error response, the response body should follow a consistent format containing at minimum: error message, error code, and timestamp.
**Validates: Requirements 13.3, 15.5**

### Operational Properties

**Property 34: Critical operation logging**
_For any_ critical operation (donation completion, certificate generation, fund updates, authentication failures), the system should create a log entry with timestamp, operation type, and relevant details.
**Validates: Requirements 14.5**

**Property 35: Form validation with error messages**
_For any_ form submission with invalid data, the system should display clear, field-specific error messages indicating what needs to be corrected.
**Validates: Requirements 15.6**

**Property 36: Asynchronous operation indicators**
_For any_ asynchronous operation (API calls, file uploads), the UI should display a loading indicator while the operation is in progress.
**Validates: Requirements 15.4**

## Error Handling

### Error Categories

**1. Authentication Errors**

- Invalid credentials (401 Unauthorized)
- Expired JWT token (401 Unauthorized)
- Missing authentication token (401 Unauthorized)
- Insufficient permissions (403 Forbidden)

**2. Validation Errors**

- Missing required fields (400 Bad Request)
- Invalid data format (400 Bad Request)
- Data constraint violations (400 Bad Request)
- Duplicate unique fields (409 Conflict)

**3. Payment Errors**

- Razorpay order creation failure (502 Bad Gateway)
- Invalid webhook signature (401 Unauthorized)
- Payment processing failure (400 Bad Request)
- Duplicate payment ID (409 Conflict)

**4. Resource Errors**

- Resource not found (404 Not Found)
- Referenced resource doesn't exist (400 Bad Request)
- Resource already exists (409 Conflict)

**5. External Service Errors**

- Email service failure (503 Service Unavailable)
- PDF generation failure (500 Internal Server Error)
- Database connection failure (503 Service Unavailable)
- Razorpay API failure (502 Bad Gateway)

**6. System Errors**

- Unexpected server errors (500 Internal Server Error)
- Database query errors (500 Internal Server Error)
- File system errors (500 Internal Server Error)

### Error Handling Strategy

**Backend Error Handling:**

```javascript
// Global error handler middleware
function errorHandler(err, req, res, next) {
  // Log error with context
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    timestamp: new Date(),
  });

  // Determine error type and status code
  const statusCode = err.statusCode || 500;
  const errorResponse = {
    error: {
      message: err.message || "Internal server error",
      code: err.code || "INTERNAL_ERROR",
      timestamp: new Date().toISOString(),
    },
  };

  // Don't expose internal error details in production
  if (process.env.NODE_ENV === "production" && statusCode === 500) {
    errorResponse.error.message = "An unexpected error occurred";
  }

  res.status(statusCode).json(errorResponse);
}

// Custom error classes
class ValidationError extends Error {
  constructor(message, fields) {
    super(message);
    this.statusCode = 400;
    this.code = "VALIDATION_ERROR";
    this.fields = fields;
  }
}

class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 401;
    this.code = "AUTHENTICATION_ERROR";
  }
}

class AuthorizationError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 403;
    this.code = "AUTHORIZATION_ERROR";
  }
}

class NotFoundError extends Error {
  constructor(resource) {
    super(`${resource} not found`);
    this.statusCode = 404;
    this.code = "NOT_FOUND";
  }
}

class PaymentError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
    this.code = "PAYMENT_ERROR";
  }
}
```

**Frontend Error Handling:**

```javascript
// Axios interceptor for error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Clear token and redirect to login
          localStorage.removeItem("token");
          window.location.href = "/login";
          break;
        case 403:
          // Show unauthorized message
          showNotification(
            "You do not have permission to perform this action",
            "error",
          );
          break;
        case 404:
          showNotification("Resource not found", "error");
          break;
        case 500:
          showNotification("Server error. Please try again later", "error");
          break;
        default:
          showNotification(data.error?.message || "An error occurred", "error");
      }
    } else if (error.request) {
      // Request made but no response
      showNotification("Network error. Please check your connection", "error");
    } else {
      // Error in request setup
      showNotification("An unexpected error occurred", "error");
    }

    return Promise.reject(error);
  },
);
```

**Retry Logic for External Services:**

```javascript
// Email retry with exponential backoff
async function sendEmailWithRetry(emailData, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await emailService.send(emailData);
      return { success: true };
    } catch (error) {
      logger.error(`Email send attempt ${attempt} failed:`, error);

      if (attempt === maxRetries) {
        // Log final failure
        await logEmailFailure(emailData, error);
        return { success: false, error };
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt - 1) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
```

## Testing Strategy

### Dual Testing Approach

The system requires both unit testing and property-based testing to ensure comprehensive coverage:

**Unit Tests:**

- Specific examples demonstrating correct behavior
- Edge cases (empty inputs, boundary values, special characters)
- Error conditions and exception handling
- Integration points between components
- Mock external services (Razorpay, email, PDF generation)

**Property-Based Tests:**

- Universal properties that hold for all inputs
- Randomized input generation for comprehensive coverage
- Minimum 100 iterations per property test
- Each test references its design document property

### Testing Framework Selection

**Backend Testing:**

- **Test Framework**: Jest or Mocha
- **Property-Based Testing**: fast-check (JavaScript property-based testing library)
- **Mocking**: Sinon.js or Jest mocks
- **API Testing**: Supertest
- **Database**: MongoDB Memory Server for isolated tests

**Frontend Testing:**

- **Test Framework**: Jest + React Testing Library
- **Property-Based Testing**: fast-check
- **Component Testing**: React Testing Library
- **E2E Testing**: Playwright or Cypress (optional)

### Property Test Configuration

Each property-based test must:

1. Run minimum 100 iterations
2. Include a comment tag referencing the design property
3. Use appropriate generators for input data
4. Verify the property holds for all generated inputs

**Example Property Test Structure:**

```javascript
// Feature: nonprofit-donation-platform, Property 1: Password hashing on registration
describe("Property 1: Password hashing on registration", () => {
  it("should hash passwords for all valid registration data", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }),
          email: fc.emailAddress(),
          phone: fc.string({ minLength: 10, maxLength: 15 }),
          password: fc.string({ minLength: 8, maxLength: 50 }),
        }),
        async (userData) => {
          const result = await authService.register(userData);
          const storedUser = await User.findById(result.userId);

          // Password should be hashed, not plaintext
          expect(storedUser.passwordHash).not.toBe(userData.password);
          // Should be a valid bcrypt hash
          expect(storedUser.passwordHash).toMatch(/^\$2[aby]\$\d{2}\$/);
          // Should be able to verify the password
          const isValid = await bcrypt.compare(
            userData.password,
            storedUser.passwordHash,
          );
          expect(isValid).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });
});
```

### Test Coverage Goals

**Backend:**

- Unit test coverage: 80%+ for business logic
- Property test coverage: All 36 correctness properties
- Integration test coverage: All API endpoints
- Error handling: All error paths tested

**Frontend:**

- Component test coverage: 70%+ for UI components
- Property test coverage: UI-related properties (form validation, display logic)
- Integration test coverage: Critical user flows (donation, login, dashboard)

### Testing Priorities

**High Priority (Must Test):**

1. Authentication and authorization (Properties 1-4)
2. Payment processing and webhook verification (Properties 5-7)
3. Donation recording and fund tracking (Properties 7-9, 13-15)
4. Certificate generation (Properties 10-12)
5. Security properties (Properties 28-30)
6. Data integrity (Property 31)

**Medium Priority (Should Test):**

1. Email communication (Properties 19-21)
2. Dashboard displays (Properties 22-27)
3. Transparency reporting (Properties 16-18)
4. API consistency (Properties 32-33)

**Lower Priority (Nice to Test):**

1. UI/UX properties (Properties 35-36)
2. Logging (Property 34)

### Continuous Integration

**CI Pipeline:**

1. Run linting (ESLint)
2. Run unit tests
3. Run property-based tests
4. Check test coverage thresholds
5. Run integration tests
6. Build frontend and backend
7. Deploy to staging (on main branch)

**Pre-deployment Checklist:**

- All tests passing
- No security vulnerabilities in dependencies
- Environment variables configured
- Database migrations applied
- API documentation updated
