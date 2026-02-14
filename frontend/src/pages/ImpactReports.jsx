import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ImpactReports = () => {
  const [programs, setPrograms] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [programsRes, reportsRes] = await Promise.all([
        api.get('/transparency/programs'),
        api.get('/transparency/reports'),
      ]);
      setPrograms(programsRes.data.data);
      setReports(reportsRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Impact Reports</h1>
      <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
        Transparency is at the heart of everything we do. See how your donations are making an impact.
      </p>

      {/* Program Transparency */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Program Fund Utilization</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
            <div key={program.programId} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">{program.programName}</h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Funds Received:</span>
                  <span className="font-semibold">₹{program.fundsReceived.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Funds Utilized:</span>
                  <span className="font-semibold">₹{program.fundsUtilized.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className="bg-green-600 h-3 rounded-full"
                  style={{ width: `${program.utilizationRate}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 text-center">{program.utilizationRate}% Utilized</p>
            </div>
          ))}
        </div>
      </section>

      {/* Reports */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Detailed Reports</h2>
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.reportId} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-2">{report.programName}</h3>
              <p className="text-gray-600 text-sm mb-4">
                Last Updated: {new Date(report.lastUpdated).toLocaleDateString('en-IN')}
              </p>
              <a
                href={report.reportFileURL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:underline"
              >
                Download Report →
              </a>
            </div>
          ))}
        </div>

        {reports.length === 0 && (
          <p className="text-center text-gray-600">No reports available yet.</p>
        )}
      </section>
    </div>
  );
};

export default ImpactReports;
