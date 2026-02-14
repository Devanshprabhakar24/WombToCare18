
// Programs page
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchPrograms();
  }, []); // On mount

  // Fetch programs
  const fetchPrograms = async () => {
    try {
      const response = await api.get('/programs');
      setPrograms(response.data.data);
    } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Page title */}
      <h1 className="text-4xl font-bold text-center mb-12">Our Programs</h1>

      {/* Program cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {programs.map((program) => {
          const received = program.fundsReceived || 0;
          const target = program.targetAmount || 0;
          const remaining = Math.max(target - received, 0);

          return (
            <div key={program.programId || program._id} className="bg-white rounded-lg shadow-md p-6">
              {/* Program name */}
              <h3 className="text-xl font-semibold mb-3">{program.programName}</h3>
              <p className="text-gray-600 mb-4">{program.description}</p>

              {/* Fund details */}
              <div className="mb-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Target:</span>
                  <span className="font-semibold">₹{target.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Received:</span>
                  <span className="font-semibold text-green-600">₹{received.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Remaining:</span>
                  <span className="font-semibold text-orange-600">₹{remaining.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Donate button */}
              {user?.role !== 'admin' && (
                <Link
                  to="/donate"
                  state={{ programId: program.programId || program._id }}
                  className="block text-center bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700"
                >
                  Donate to this Program
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* No programs */}
      {programs.length === 0 && (
        <p className="text-center text-gray-600">No programs available at the moment.</p>
      )}
    </div>
  );
};

export default Programs;
