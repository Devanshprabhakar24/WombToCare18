import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [donations, setDonations] = useState([]);
  const [donors, setDonors] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showProgramForm, setShowProgramForm] = useState(false);
  const [programForm, setProgramForm] = useState({
    programName: '',
    description: '',
    targetAmount: '',
    startDate: '',
    endDate: '',
  });

  // Scheduler state
  const [schedulerStatus, setSchedulerStatus] = useState(null);
  const [schedulerLoading, setSchedulerLoading] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    dayOfWeek: 0,
    hour: 9,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, donationsRes, donorsRes, programsRes, schedulerRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/donations'),
        api.get('/admin/donors'),
        api.get('/programs'),
        api.get('/admin/scheduler/status'),
      ]);
      setStats(statsRes.data.data);
      setDonations(donationsRes.data.data || []);
      setDonors(donorsRes.data.data || []);
      setPrograms(programsRes.data.data || []);
      const schedData = schedulerRes.data.data;
      setSchedulerStatus(schedData);
      if (schedData?.scheduleConfig) {
        setScheduleForm(schedData.scheduleConfig);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProgramFormChange = (e) => {
    setProgramForm({ ...programForm, [e.target.name]: e.target.value });
  };

  const handleCreateProgram = async (e) => {
    e.preventDefault();
    try {
      await api.post('/programs', programForm);
      alert('Program created successfully!');
      setShowProgramForm(false);
      setProgramForm({ programName: '', description: '', targetAmount: '', startDate: '', endDate: '' });
      fetchData();
    } catch (error) {
      alert('Failed: ' + (error.response?.data?.error?.message || error.message));
    }
  };

  // Scheduler functions
  const fetchSchedulerStatus = async () => {
    try {
      const res = await api.get('/admin/scheduler/status');
      setSchedulerStatus(res.data.data);
    } catch (error) {
      console.error('Error fetching scheduler status:', error);
    }
  };

  const handleScheduleFormChange = (e) => {
    const { name, value } = e.target;
    setScheduleForm(prev => ({
      ...prev,
      [name]: parseInt(value, 10),
    }));
  };

  const handleUpdateSchedule = async (e) => {
    e.preventDefault();
    setSchedulerLoading(true);
    try {
      await api.put('/admin/scheduler/config', { ...scheduleForm, type: 'weekly' });
      alert('Schedule updated successfully!');
      fetchSchedulerStatus();
    } catch (error) {
      alert('Failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setSchedulerLoading(false);
    }
  };

  const handleToggleScheduler = async () => {
    setSchedulerLoading(true);
    try {
      const endpoint = schedulerStatus?.enabled ? '/admin/scheduler/disable' : '/admin/scheduler/enable';
      await api.post(endpoint);
      fetchSchedulerStatus();
    } catch (error) {
      alert('Failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setSchedulerLoading(false);
    }
  };

  const handleTriggerEmails = async () => {
    if (!confirm('Send progress report emails to all donors now?')) return;
    setSchedulerLoading(true);
    try {
      const res = await api.post('/admin/scheduler/trigger');
      const data = res.data.data;
      alert(`Emails sent: ${data.sentCount}, Failed: ${data.failedCount}`);
      fetchSchedulerStatus();
    } catch (error) {
      alert('Failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setSchedulerLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  const completedDonations = donations.filter(d => d.transactionStatus === 'completed');
  const pendingDonations = donations.filter(d => d.transactionStatus === 'pending');
  const totalFundsRaised = completedDonations.reduce((sum, d) => sum + d.amount, 0);

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'donations', label: '💰 All Donations' },
    { id: 'donors', label: '👥 Donors' },
    { id: 'programs', label: '📋 Programs' },
    { id: 'scheduler', label: '📧 Email Scheduler' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Admin Panel</h1>
              <p className="text-gray-400 text-sm">Welcome, {user?.name || 'Admin'}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">₹{totalFundsRaised.toLocaleString('en-IN')}</p>
              <p className="text-gray-400 text-xs">Total Funds Raised</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">

        {/* ==================== OVERVIEW TAB ==================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-primary-500">
                <p className="text-gray-500 text-xs mb-1">Total Donations</p>
                <p className="text-2xl font-bold">{stats?.totalDonations || donations.length}</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-500">
                <p className="text-gray-500 text-xs mb-1">Total Funds Raised</p>
                <p className="text-2xl font-bold">₹{(stats?.totalAmount || totalFundsRaised).toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500">
                <p className="text-gray-500 text-xs mb-1">Total Donors</p>
                <p className="text-2xl font-bold">{donors.length}</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-purple-500">
                <p className="text-gray-500 text-xs mb-1">Active Programs</p>
                <p className="text-2xl font-bold">{stats?.activePrograms || programs.length}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Donations */}
              <div className="bg-white rounded-xl shadow-md p-5">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Recent Donations</h2>
                  <button onClick={() => setActiveTab('donations')} className="text-primary-600 text-sm hover:underline">
                    View All →
                  </button>
                </div>
                {donations.length === 0 ? (
                  <p className="text-gray-400 text-center py-6">No donations yet</p>
                ) : (
                  <div className="space-y-3">
                    {donations.slice(0, 5).map(d => (
                      <div key={d._id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div>
                          <p className="font-medium text-sm">{d.userId?.name || 'Anonymous'}</p>
                          <p className="text-xs text-gray-500">{d.programId?.programName || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">₹{d.amount.toLocaleString('en-IN')}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${d.transactionStatus === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                            {d.transactionStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Programs Summary */}
              <div className="bg-white rounded-xl shadow-md p-5">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Programs</h2>
                  <button onClick={() => setActiveTab('programs')} className="text-primary-600 text-sm hover:underline">
                    Manage →
                  </button>
                </div>
                {programs.length === 0 ? (
                  <p className="text-gray-400 text-center py-6">No programs yet</p>
                ) : (
                  <div className="space-y-3">
                    {programs.slice(0, 5).map(p => {
                      const received = p.fundsReceived || 0;
                      const target = p.targetAmount || 0;
                      const remaining = Math.max(target - received, 0);
                      return (
                        <div key={p.programId || p._id} className="p-3 border rounded-lg">
                          <p className="font-medium text-sm mb-2">{p.programName}</p>
                          <div className="text-xs space-y-1">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Target:</span>
                              <span className="font-medium">₹{target.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Received:</span>
                              <span className="font-medium text-green-600">₹{received.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Remaining:</span>
                              <span className="font-medium text-orange-600">₹{remaining.toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{completedDonations.length}</p>
                <p className="text-xs text-green-700">Completed</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-yellow-600">{pendingDonations.length}</p>
                <p className="text-xs text-yellow-700">Pending</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{programs.length}</p>
                <p className="text-xs text-blue-700">Total Programs</p>
              </div>
            </div>
          </div>
        )}

        {/* ==================== DONATIONS TAB ==================== */}
        {activeTab === 'donations' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">All Donations ({donations.length})</h2>
            {donations.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No donations yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-3 font-medium text-gray-600">Date</th>
                      <th className="text-left py-3 px-3 font-medium text-gray-600">Donor</th>
                      <th className="text-left py-3 px-3 font-medium text-gray-600">Email</th>
                      <th className="text-left py-3 px-3 font-medium text-gray-600">Program</th>
                      <th className="text-left py-3 px-3 font-medium text-gray-600">Amount</th>
                      <th className="text-left py-3 px-3 font-medium text-gray-600">Status</th>
                      <th className="text-left py-3 px-3 font-medium text-gray-600">Payment ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.map(d => (
                      <tr key={d._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-3">
                          {new Date(d.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="py-3 px-3 font-medium">{d.userId?.name || 'N/A'}</td>
                        <td className="py-3 px-3 text-gray-500">{d.userId?.email || 'N/A'}</td>
                        <td className="py-3 px-3">{d.programId?.programName || 'N/A'}</td>
                        <td className="py-3 px-3 font-semibold">₹{d.amount.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${d.transactionStatus === 'completed' ? 'bg-green-100 text-green-700'
                            : d.transactionStatus === 'failed' ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                            }`}>
                            {d.transactionStatus}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-gray-400 font-mono text-xs">{d.razorpayPaymentId || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ==================== DONORS TAB ==================== */}
        {activeTab === 'donors' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">All Donors ({donors.length})</h2>
            {donors.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No donors registered yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-3 font-medium text-gray-600">#</th>
                      <th className="text-left py-3 px-3 font-medium text-gray-600">Name</th>
                      <th className="text-left py-3 px-3 font-medium text-gray-600">Email</th>
                      <th className="text-left py-3 px-3 font-medium text-gray-600">Phone</th>
                      <th className="text-left py-3 px-3 font-medium text-gray-600">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donors.map((donor, i) => (
                      <tr key={donor._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-3 text-gray-400">{i + 1}</td>
                        <td className="py-3 px-3 font-medium">{donor.name}</td>
                        <td className="py-3 px-3 text-gray-500">{donor.email}</td>
                        <td className="py-3 px-3">{donor.phone || '—'}</td>
                        <td className="py-3 px-3 text-gray-500">
                          {new Date(donor.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ==================== PROGRAMS TAB ==================== */}
        {activeTab === 'programs' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Programs ({programs.length})</h2>
              <button
                onClick={() => setShowProgramForm(!showProgramForm)}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 text-sm"
              >
                {showProgramForm ? '✕ Cancel' : '+ Create Program'}
              </button>
            </div>

            {/* Create Program Form */}
            {showProgramForm && (
              <form onSubmit={handleCreateProgram} className="bg-white rounded-xl shadow-md p-6">
                <h3 className="font-semibold mb-4">New Program</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Program Name</label>
                    <input type="text" name="programName" value={programForm.programName} onChange={handleProgramFormChange} required className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Target Amount (₹)</label>
                    <input type="number" name="targetAmount" value={programForm.targetAmount} onChange={handleProgramFormChange} required min="0" className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <input type="date" name="startDate" value={programForm.startDate} onChange={handleProgramFormChange} required className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <input type="date" name="endDate" value={programForm.endDate} onChange={handleProgramFormChange} required className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea name="description" value={programForm.description} onChange={handleProgramFormChange} required rows="3" className="w-full px-3 py-2 border rounded-lg"></textarea>
                  </div>
                </div>
                <button type="submit" className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                  Create Program
                </button>
              </form>
            )}

            {/* Programs List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {programs.map(p => {
                const received = p.fundsReceived || 0;
                const target = p.targetAmount || 0;
                const left = Math.max(target - received, 0);

                return (
                  <div key={p.programId || p._id} className="bg-white rounded-xl shadow-md p-5">
                    <h3 className="font-semibold text-lg mb-1">{p.programName}</h3>
                    <p className="text-gray-500 text-sm mb-3">{p.description}</p>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Target:</span>
                        <span className="font-medium">₹{target.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Received:</span>
                        <span className="font-medium text-green-600">₹{received.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Remaining:</span>
                        <span className="font-medium text-orange-600">₹{left.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================== SCHEDULER TAB ==================== */}
        {activeTab === 'scheduler' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Email Scheduler</h2>

            <div className="bg-white rounded-xl shadow-md p-6">
              {/* Enable/Disable */}
              <div className="flex items-center justify-between mb-6 pb-6 border-b">
                <div className="flex items-center gap-3">
                  <span className={`inline-block w-3 h-3 rounded-full ${schedulerStatus?.enabled ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className={`font-medium ${schedulerStatus?.enabled ? 'text-green-600' : 'text-red-600'}`}>
                    {schedulerStatus?.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <button
                  onClick={handleToggleScheduler}
                  disabled={schedulerLoading}
                  className={`px-6 py-2 rounded-lg font-medium text-white ${schedulerStatus?.enabled
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                  } disabled:opacity-50`}
                >
                  {schedulerLoading ? '...' : schedulerStatus?.enabled ? 'Disable' : 'Enable'}
                </button>
              </div>

              {/* Schedule Time */}
              <div className="flex items-center justify-between mb-6 pb-6 border-b">
                <span className="font-medium">Schedule Time</span>
                <form onSubmit={handleUpdateSchedule} className="flex items-center gap-3">
                  <select
                    name="dayOfWeek"
                    value={scheduleForm.dayOfWeek}
                    onChange={handleScheduleFormChange}
                    className="px-3 py-2 border rounded-lg"
                  >
                    <option value={0}>Sunday</option>
                    <option value={1}>Monday</option>
                    <option value={2}>Tuesday</option>
                    <option value={3}>Wednesday</option>
                    <option value={4}>Thursday</option>
                    <option value={5}>Friday</option>
                    <option value={6}>Saturday</option>
                  </select>
                  <select
                    name="hour"
                    value={scheduleForm.hour}
                    onChange={handleScheduleFormChange}
                    className="px-3 py-2 border rounded-lg"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    disabled={schedulerLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Save
                  </button>
                </form>
              </div>

              {/* Send Now */}
              <div className="flex items-center justify-between">
                <span className="font-medium">Send Now</span>
                <button
                  onClick={handleTriggerEmails}
                  disabled={schedulerLoading}
                  className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50"
                >
                  {schedulerLoading ? '...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
