// Home page
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Home = () => {
  const [featuredPrograms, setFeaturedPrograms] = useState([]);
  const [publicDonors, setPublicDonors] = useState([]);
  const [stats, setStats] = useState({ programs: 0, fundsRaised: 0, donors: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [programsRes, donorsRes] = await Promise.all([
        api.get('/programs'),
        api.get('/donations/public'),
      ]);
      if (programsRes.data?.data) {
        setFeaturedPrograms(programsRes.data.data.slice(0, 3));
        // Compute real stats from programs
        const allPrograms = programsRes.data.data;
        const totalReceived = allPrograms.reduce((sum, p) => sum + (p.fundsReceived || 0), 0);
        setStats({
          programs: allPrograms.length,
          fundsRaised: totalReceived,
        });
      }
      if (donorsRes.data?.data) {
        const allDonations = donorsRes.data.data;
        // Get unique donor display names (use donor ID for anonymous donors)
        const names = [...new Set(
          allDonations.map(d => d.displayName || d.donorId || 'Anonymous')
        )];
        setPublicDonors(names);
        // Update donor count in stats
        setStats(prev => ({ ...prev, donors: allDonations.length }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Making a Difference Together
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join us in creating positive change through transparent and accountable giving.
            Every donation makes a real impact.
          </p>
          <Link
            to="/donate"
            className="bg-white text-primary-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 inline-block"
          >
            Donate Now
          </Link>

          {/* Scrolling Donor Names Marquee */}
          <div className="mt-10">
            <p className="text-primary-200 text-sm mb-3 uppercase tracking-wider">
              Our Heroes
            </p>
            {publicDonors.length > 0 ? (
              <div className="overflow-hidden max-w-4xl mx-auto" style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
                <div
                  className="flex gap-4 whitespace-nowrap"
                  style={{
                    animation: 'marquee 20s linear infinite',
                    width: 'max-content',
                  }}
                >
                  {/* Duplicate the list for seamless looping */}
                  {[...publicDonors, ...publicDonors].map((name, i) => (
                    <span
                      key={i}
                      className="inline-block bg-white/15 backdrop-blur-sm text-white px-5 py-2 rounded-full text-sm border border-white/20"
                    >
                      ⭐ {name}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-primary-200 text-sm">
                Donate today and choose to display your name here! 🌟
              </p>
            )}
          </div>

          {/* Marquee CSS */}
          <style>{`
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}</style>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">{stats.donors}</div>
              <div className="text-gray-600">Donations</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">₹{stats.fundsRaised.toLocaleString('en-IN')}</div>
              <div className="text-gray-600">Funds Raised</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">{stats.programs}</div>
              <div className="text-gray-600">Active Programs</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Programs */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Programs</h2>

          {loading ? (
            <div className="text-center py-8">Loading programs...</div>
          ) : featuredPrograms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredPrograms.map((program) => (
                <div key={program.programId || program._id} className="bg-white rounded-lg shadow-md p-6 flex flex-col h-full">
                  <h3 className="text-xl font-semibold mb-3">{program.programName}</h3>
                  <p className="text-gray-600 mb-4 flex-grow">
                    {program.description ? (program.description.length > 100 ? `${program.description.substring(0, 100)}...` : program.description) : 'Making a difference in the community.'}
                  </p>
                  <Link to="/programs" className="text-primary-600 hover:underline mt-auto">
                    Learn More →
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <p>No programs currently available.</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/programs" className="btn btn-outline-primary px-6 py-2 rounded-lg border border-primary-600 text-primary-600 hover:bg-primary-50">
              View All Programs
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Make an Impact?</h2>
          <p className="text-xl mb-8">Your contribution can change lives</p>
          <Link
            to="/donate"
            className="bg-white text-primary-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 inline-block"
          >
            Start Donating
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
