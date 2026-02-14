import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const DonorDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dashRes, profileRes] = await Promise.all([
        api.get('/users/dashboard'),
        api.get('/users/profile'),
      ]);
      setDashboardData(dashRes.data.data);
      setProfile(profileRes.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const donations = dashboardData?.donations || [];
  const totalContribution = dashboardData?.totalContribution || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">
            Welcome, {profile?.name?.split(' ')[0] || 'Donor'}! 👋
          </h1>
          <p className="text-primary-100 text-sm mt-1">
            Total Contributed: <span className="font-bold text-white">₹{totalContribution.toLocaleString('en-IN')}</span>
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Donate Button */}
        <Link
          to="/donate"
          className="block bg-primary-600 text-white text-center py-3 rounded-xl font-medium hover:bg-primary-700 text-lg"
        >
          💰 Donate Now
        </Link>

        {/* My Donations */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">My Donations</h2>

          {donations.length === 0 ? (
            <p className="text-gray-400 text-center py-6">No donations yet.</p>
          ) : (
            <div className="space-y-3">
              {donations.map(donation => (
                <div key={donation.donationId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{donation.programName}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(donation.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{donation.amount.toLocaleString('en-IN')}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${donation.transactionStatus === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                      }`}>
                      {donation.transactionStatus}
                    </span>
                    {donation.transactionStatus === 'completed' && donation.certificateURL && (
                      <a
                        href={`${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}${donation.certificateURL}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-xs text-primary-600 hover:underline mt-1"
                      >
                        📄 Download PDF
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-3">My Profile</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Name:</span>
              <span className="font-medium">{profile?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email:</span>
              <span className="font-medium">{profile?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Phone:</span>
              <span className="font-medium">{profile?.phone || 'Not provided'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;
