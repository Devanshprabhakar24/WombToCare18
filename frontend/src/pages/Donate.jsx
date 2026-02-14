import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Donate = () => {
  const [programs, setPrograms] = useState([]);
  const [formData, setFormData] = useState({
    amount: '',
    programId: '',
    visibilityChoice: 'public',
    publicName: '',
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const response = await api.get('/programs');
      setPrograms(response.data.data);
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      // Create payment order
      const response = await api.post('/donations/create-order', formData);
      const { orderId, amount, currency, key } = response.data.data;

      // Check if using mock payments (if backend is in mock mode)
      if (!key) {
        // Mock payment mode - simulate successful payment
        console.log('🧪 MOCK: Simulating payment success');

        // Wait 1 second to simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Verify payment on backend
        try {
          await api.post('/donations/verify', {
            razorpay_order_id: orderId,
            razorpay_payment_id: `pay_${Date.now()}`,
            razorpay_signature: 'mock_signature'
          });
          alert('Payment successful! Thank you for your donation. (Mock Mode)');
          navigate(user?.role === 'admin' ? '/admin' : '/dashboard');
        } catch (error) {
          console.error('Payment verification failed:', error);
          alert('Payment verification failed. Please contact support.');
        }
        setLoading(false);
        return;
      }

      // Initialize Razorpay
      const options = {
        key: key,
        amount: amount,
        currency: currency,
        name: "Nonprofit Foundation",
        description: "Donation",
        order_id: orderId,
        handler: async function (response) {
          try {
            await api.post('/donations/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            alert('Payment successful! Thank you for your donation.');
            navigate(user?.role === 'admin' ? '/admin' : '/dashboard');
          } catch (error) {
            console.error('Payment verification failed:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: formData.visibilityChoice === 'public' ? formData.publicName : user.name,
          email: user.email,
          contact: user.phone || ''
        },
        theme: {
          color: "#2563EB"
        },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true
        }
      };

      try {
        const rzp1 = new window.Razorpay(options);
        rzp1.on('payment.failed', handlePaymentFailure);
        rzp1.open();
      } catch (rzpError) {
        console.error('Razorpay Init Error:', rzpError);
        alert('Failed to initialize payment gateway. Please try again.');
      }

      setLoading(false);

    } catch (error) {
      console.error('Error creating payment request:', error);
      alert('Failed to create payment request: ' + (error.response?.data?.error?.message || error.message));
      setLoading(false);
    }
  };

  // Helper to handle payment failure
  const handlePaymentFailure = (response) => {
    console.error('Payment Failed Response:', response);
    alert(`Payment Failed: ${response.error.description}`);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-8">Make a Donation</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Program
            </label>
            <select
              name="programId"
              value={formData.programId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Choose a program</option>
              {programs.map((program) => (
                <option key={program.programId} value={program.programId}>
                  {program.programName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (₹)
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visibility
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="visibilityChoice"
                  value="public"
                  checked={formData.visibilityChoice === 'public'}
                  onChange={handleChange}
                  className="mr-2"
                />
                Display my name on donor wall
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="visibilityChoice"
                  value="anonymous"
                  checked={formData.visibilityChoice === 'anonymous'}
                  onChange={handleChange}
                  className="mr-2"
                />
                Keep me anonymous
              </label>
            </div>
          </div>

          {formData.visibilityChoice === 'public' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Public Name
              </label>
              <input
                type="text"
                name="publicName"
                value={formData.publicName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Proceed to Payment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Donate;
