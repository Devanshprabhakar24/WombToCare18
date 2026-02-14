// Donation logic
import PaymentService from '../services/PaymentService.js';
import DonationService from '../services/DonationService.js';
import CertificateService from '../services/CertificateService.js';
import EmailService from '../services/EmailService.js';
import User from '../models/User.js';
import Donation from '../models/Donation.js';
import Program from '../models/Program.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Create order
export const createOrder = asyncHandler(async (req, res) => {
    const { amount, programId, visibilityChoice, publicName } = req.body;

    // Get user details
    const user = await User.findById(req.user.userId);
    if (!user) {
        return res.status(404).json({
            error: {
                message: 'User not found',
                code: 'USER_NOT_FOUND',
            },
        });
    }

    const order = await PaymentService.createOrder({
        amount,
        userId: req.user.userId,
    });

    // Create pending donation record
    await Donation.create({
        userId: req.user.userId,
        amount,
        razorpayOrderId: order.id,
        programId,
        transactionStatus: 'pending',
        visibilityChoice,
        publicName: visibilityChoice === 'public' ? publicName : null,
        donorId: visibilityChoice === 'anonymous' ? `DONOR${Date.now()}` : null,
    });

    // Determine if we're in mock mode
    const isMockMode = process.env.NODE_ENV === 'development' && process.env.USE_MOCK_PAYMENTS === 'true';

    res.status(201).json({
        success: true,
        data: {
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: isMockMode ? null : process.env.RAZORPAY_KEY_ID
        },
        message: 'Payment order created successfully',
    });
});

// Verify payment
export const verifyPayment = asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify payment signature
    const isValid = PaymentService.verifyPaymentSignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    );

    if (!isValid) {
        return res.status(400).json({
            success: false,
            message: 'Payment verification failed: Invalid signature',
        });
    }

    // Get the pending donation record by order ID
    const donation = await Donation.findOne({
        razorpayOrderId: razorpay_order_id
    }).populate('programId userId');

    if (!donation) {
        return res.status(404).json({
            success: false,
            message: 'Donation record not found',
        });
    }

    // Check if already processed (Idempotency)
    if (donation.transactionStatus === 'completed') {
        return res.status(200).json({
            success: true,
            data: {
                donationId: donation._id.toString(),
                message: 'Payment already processed successfully',
            },
        });
    }

    // Update donation status to completed
    donation.transactionStatus = 'completed';
    donation.razorpayPaymentId = razorpay_payment_id;
    await donation.save();

    // Update program funds
    const program = await Program.findById(donation.programId);
    if (program) {
        program.fundsReceived += donation.amount;
        await program.save();
    }

    // Generate certificates (async) — both 80G and 12A
    const certData = {
        donationId: donation._id.toString(),
        userId: donation.userId,
        amount: donation.amount,
        programId: donation.programId,
    };
    CertificateService.generate80GCertificate(certData).catch(error => {
        console.error('80G Certificate generation error:', error);
    });
    CertificateService.generate12ACertificate(certData).catch(error => {
        console.error('12A Certificate generation error:', error);
    });

    // Send confirmation email (async)
    EmailService.sendDonationConfirmation({
        userId: donation.userId,
        amount: donation.amount,
        programId: donation.programId,
        donationId: donation._id.toString(),
    }).catch(error => {
        console.error('Email sending error:', error);
    });

    res.status(200).json({
        success: true,
        data: {
            donationId: donation._id.toString(),
            message: 'Payment verified and processed successfully',
        },
    });
});

// User history
export const getDonationHistory = asyncHandler(async (req, res) => {
    const donations = await DonationService.getDonationHistory(req.user.userId);

    res.status(200).json({
        success: true,
        data: donations,
        count: donations.length,
    });
});

// Public donations
export const getPublicDonations = asyncHandler(async (req, res) => {
    const donations = await DonationService.getPublicDonations();

    res.status(200).json({
        success: true,
        data: donations,
        count: donations.length,
    });
});
