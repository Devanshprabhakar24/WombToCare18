// Donation service
import { v4 as uuidv4 } from 'uuid';
import Donation from '../models/Donation.js';
import Program from '../models/Program.js';
import Certificate from '../models/Certificate.js';
import User from '../models/User.js';

class DonationService {
    // Create donation
    async createDonation(donationData) {
        const {
            userId,
            amount,
            razorpayPaymentId,
            razorpayOrderId,
            programId,
            visibilityChoice,
            publicName,
        } = donationData;

        // Gen donorId
        const donorId = visibilityChoice === 'anonymous' ? this.generateDonorId() : null;

        // Create record
        const donation = await Donation.create({
            userId,
            amount,
            razorpayPaymentId,
            razorpayOrderId,
            transactionStatus: 'completed',
            visibilityChoice,
            publicName: visibilityChoice === 'public' ? publicName : null,
            donorId,
            programId,
        });

        return {
            donationId: donation._id.toString(),
            donorId,
        };
    }

    // Gen donorId
    generateDonorId() {
        // Short unique ID
        const uuid = uuidv4();
        return `DONOR-${uuid.substring(0, 8).toUpperCase()}`;
    }

    // User history
    async getDonationHistory(userId) {
        const donations = await Donation.find({ userId })
            .populate('programId', 'programName description')
            .sort({ createdAt: -1 })
            .lean();

        // Get certs
        const donationsWithCertificates = await Promise.all(
            donations.map(async (donation) => {
                const certificate = await Certificate.findOne({ donationId: donation._id });

                return {
                    donationId: donation._id.toString(),
                    amount: donation.amount,
                    programName: donation.programId?.programName || 'Unknown Program',
                    programDescription: donation.programId?.description || '',
                    date: donation.createdAt,
                    transactionStatus: donation.transactionStatus,
                    certificateURL: certificate?.certificateURL || null,
                    razorpayPaymentId: donation.razorpayPaymentId,
                };
            })
        );

        return donationsWithCertificates;
    }

    // Public donations
    async getPublicDonations() {
        const donations = await Donation.find({
            transactionStatus: 'completed',
        })
            .populate('programId', 'programName')
            .populate('userId', 'name')
            .sort({ createdAt: -1 })
            .limit(100) // Limit to recent 100 donations
            .lean();

        return donations.map((donation) => ({
            displayName:
                donation.visibilityChoice === 'public'
                    ? donation.publicName
                    : donation.donorId,
            amount: donation.amount,
            programName: donation.programId?.programName || 'Unknown Program',
            date: donation.createdAt,
        }));
    }

    // Get by ID
    async getDonationById(donationId) {
        const donation = await Donation.findById(donationId)
            .populate('programId', 'programName description')
            .populate('userId', 'name email')
            .lean();

        if (!donation) {
            throw new Error('Donation not found');
        }

        return donation;
    }

    // Get by orderId
    async getDonationByOrderId(orderId) {
        const donation = await Donation.findOne({ razorpayOrderId: orderId })
            .populate('programId', 'programName description')
            .populate('userId', 'name email');

        return donation;
    }

    /**
     * Get donation by order ID
     * @param {string} orderId - Razorpay/Cashfree order ID
     * @returns {Promise<Object>} - Donation details
     */
    async getDonationByOrderId(orderId) {
        const donation = await Donation.findOne({ razorpayOrderId: orderId })
            .populate('programId', 'programName description')
            .populate('userId', 'name email');

        return donation;
    }


    // All donations
    async getAllDonations(filters = {}) {
        const query = {};

        if (filters.programId) {
            query.programId = filters.programId;
        }

        if (filters.status) {
            query.transactionStatus = filters.status;
        }

        if (filters.startDate || filters.endDate) {
            query.createdAt = {};
            if (filters.startDate) {
                query.createdAt.$gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                query.createdAt.$lte = new Date(filters.endDate);
            }
        }

        const donations = await Donation.find(query)
            .populate('programId', 'programName')
            .populate('userId', 'name email phone')
            .sort({ createdAt: -1 })
            .lean();

        return donations;
    }

    // Donation stats
    async getDonationStats() {
        const totalDonations = await Donation.countDocuments({
            transactionStatus: 'completed',
        });

        const totalAmount = await Donation.aggregate([
            { $match: { transactionStatus: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);

        const recentDonations = await Donation.find({
            transactionStatus: 'completed',
        })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('programId', 'programName')
            .populate('userId', 'name')
            .lean();

        return {
            totalDonations,
            totalAmount: totalAmount[0]?.total || 0,
            recentDonations,
        };
    }
}

export default new DonationService();
