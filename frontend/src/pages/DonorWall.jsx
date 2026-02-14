// Donor wall
import React, { useState, useEffect } from 'react';
import api from '../services/api';

const DonorWall = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const response = await api.get('/donations/public');
      setDonations(response.data.data);
    } catch (error) {
      console.error('Error fetching donations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Donor Wall</h1>
      <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
        Thank you to all our generous donors who are making a difference!
      </p>

      <div className="max-w-4xl mx-auto space-y-4">
        {donations.map((donation, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">{donation.displayName}</h3>
              <p className="text-gray-600 text-sm">{donation.programName}</p>
              <p className="text-gray-500 text-xs">
                {new Date(donation.date).toLocaleDateString('en-IN')}
              </p>
            </div>
            <div className="text-2xl font-bold text-primary-600">
              ₹{donation.amount.toLocaleString('en-IN')}
            </div>
          </div>
        ))}
      </div>

      {donations.length === 0 && (
        <p className="text-center text-gray-600">No donations to display yet.</p>
      )}
    </div>
  );
};

export default DonorWall;
