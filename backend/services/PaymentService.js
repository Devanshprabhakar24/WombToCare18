// Payment service
import Razorpay from 'razorpay';
import crypto from 'crypto';

class PaymentService {
    constructor() {
        this.razorpay = null;
    }

    _getRazorpayInstance() {
        if (this.razorpay) return this.razorpay;

        // Mock mode
        const useMockMode = process.env.NODE_ENV === 'development' &&
            process.env.USE_MOCK_PAYMENTS === 'true';

        if (useMockMode) {
            console.log('🧪 Using MOCK payment mode for development (no real payments)');
            return null; // Handle mock mode logic in caller
        }

        if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
            this.razorpay = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID,
                key_secret: process.env.RAZORPAY_KEY_SECRET,
            });
            console.log('✅ Razorpay initialized');
            return this.razorpay;
        } else {
            console.warn('⚠️  Razorpay credentials not configured.');
            return null;
        }
    }

    // Create order
    async createOrder(orderData) {
        const { amount, userId } = orderData;
        const razorpay = this._getRazorpayInstance();

        // Mock mode
        if (!razorpay && (process.env.NODE_ENV === 'development' && process.env.USE_MOCK_PAYMENTS === 'true')) {
            const orderId = `order_${Date.now()}_${userId}`;
            console.log('🧪 MOCK: Creating Razorpay order', { orderId, amount });
            return {
                id: orderId,
                amount: amount * 100,
                currency: 'INR',
            };
        }

        if (!razorpay) {
            throw new Error('Razorpay not configured');
        }

        try {
            const options = {
                amount: amount * 100, // amount in paise
                currency: 'INR',
                receipt: `rcpt_${Date.now()}`,
                payment_capture: 1, // Auto capture
            };

            console.log('Creating Razorpay order with options:', options);
            const order = await razorpay.orders.create(options);
            console.log('Razorpay order created:', order.id);
            return order;
        } catch (error) {
            console.error('Razorpay order creation error:', error);
            throw new Error('Failed to create payment order: ' + (error.error?.description || error.message || JSON.stringify(error)));
        }
    }

    // Verify signature
    verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
        // Mock mode check
        if (process.env.NODE_ENV === 'development' && process.env.USE_MOCK_PAYMENTS === 'true') {
            return true;
        }

        try {
            // Check keys
            if (!process.env.RAZORPAY_KEY_SECRET) {
                console.error('Razorpay secret missing for verification');
                return false;
            }

            const text = `${razorpayOrderId}|${razorpayPaymentId}`;
            const expectedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                .update(text)
                .digest('hex');

            return expectedSignature === razorpaySignature;
        } catch (error) {
            console.error('Signature verification error:', error);
            return false;
        }
    }
}

export default new PaymentService();
