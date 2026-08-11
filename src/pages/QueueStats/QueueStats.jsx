import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Printer, Users, CheckCircle, Clock, ShieldAlert, Activity, Stethoscope } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import useAxiosSecure from '../../hooks/useAxiosSecure/useAxiosSecure';

const COLORS = ['#1e74d2', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

const QueueStats = () => {
  const axiosSecure = useAxiosSecure();

  const { data: tokens = [] } = useQuery({
    queryKey: ['queueTokens'],
    queryFn: async () => {
      const res = await axiosSecure.get('/queue-tokens');
      return res.data;
    }
  });

  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const res = await axiosSecure.get('/doctors');
      return res.data;
    }
  });

  const handlePrintPDFReport = () => {
    window.print();
  };

  // Computed stats
  const totalTokens = tokens.length;
  const completedCount = tokens.filter(t => t.status === 'Completed').length;
  const waitingCount = tokens.filter(t => t.status === 'Waiting').length;
  const emergencyCount = tokens.filter(t => t.isEmergency).length;
  const inConsultCount = tokens.filter(t => t.status === 'In Consultation').length;
  const callingCount = tokens.filter(t => t.status === 'Calling').length;

  // Chart data: tokens per doctor
  const tokensPerDoctor = doctors.map(doc => ({
    name: doc.name.replace('Dr. ', ''),
    tokens: tokens.filter(t => t.doctorId === doc._id).length
  }));

  // Chart data: status distribution for pie chart
  const statusData = [
    { name: 'Waiting', value: waitingCount },
    { name: 'In Consultation', value: inConsultCount },
    { name: 'Calling', value: callingCount },
    { name: 'Completed', value: completedCount },
    { name: 'Emergency', value: emergencyCount },
  ].filter(d => d.value > 0);

  // Chart data: tokens per specialty
  const specialtyMap = {};
  tokens.forEach(t => {
    specialtyMap[t.specialty] = (specialtyMap[t.specialty] || 0) + 1;
  });
  const specialtyData = Object.entries(specialtyMap).map(([name, value]) => ({ name, value }));

  const statCards = [
    { label: 'Total Tokens', value: totalTokens, icon: Users, color: 'text-slate-800', bg: 'bg-slate-100' },
    { label: 'Completed', value: completedCount, icon: CheckCircle, color: 'text-[#1e74d2]', bg: 'bg-blue-50' },
    { label: 'Currently Waiting', value: waitingCount, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'In Consultation', value: inConsultCount, icon: Activity, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Calling', value: callingCount, icon: Stethoscope, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Emergency', value: emergencyCount, icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-gradient-to-br from-[#e5f2fa] to-[#a7d4f9] p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="bg-[#1e74d2] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Statistics
          </span>
          <h1 className="text-3xl font-extrabold poppins text-slate-800 mt-2">
            Patient Statistics Report
          </h1>
          <p className="text-slate-600 text-sm mt-1 inter">Daily Summary & Patient Flow Statistics • Date: {new Date().toLocaleDateString()}</p>
        </div>
        <button
          onClick={handlePrintPDFReport}
          className="px-5 py-2.5 bg-[#1e74d2] text-white font-bold text-xs rounded-xl shadow-md hover:bg-blue-700 transition-all flex items-center gap-2 cursor-pointer print:hidden"
        >
          <Printer className="w-4 h-4" />
          <span>Generate PDF</span>
        </button>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center text-center">
            <div className={`${card.bg} p-2.5 rounded-xl mb-2`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <span className={`text-2xl font-bold font-mono ${card.color}`}>{card.value}</span>
            <span className="text-[11px] text-slate-500 font-medium mt-0.5">{card.label}</span>
          </div>
        ))}
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tokens per Doctor Bar Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="text-base font-bold text-slate-800 poppins mb-4">Tokens Per Doctor</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={tokensPerDoctor} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Bar dataKey="tokens" fill="#1e74d2" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="text-base font-bold text-slate-800 poppins mb-4">Token Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%" cy="50%"
                innerRadius={55} outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Specialty Distribution */}
      {specialtyData.length > 0 && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="text-base font-bold text-slate-800 poppins mb-4">Tokens Per Specialty</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={specialtyData} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#64748b' }} width={80} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Bar dataKey="value" fill="#10b981" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* DETAILED PATIENT LOG TABLE */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-md border border-slate-200 space-y-4">
        <h3 className="text-base font-bold text-slate-800 poppins">Detailed Patient Log</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 border border-slate-200 rounded-xl">
            <thead className="bg-slate-100 font-mono text-slate-700 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Token #</th>
                <th className="py-2.5 px-3">Patient Name</th>
                <th className="py-2.5 px-3">Doctor</th>
                <th className="py-2.5 px-3">Specialty</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tokens.map(t => (
                <tr key={t._id} className={t.isEmergency ? 'bg-red-50' : 'hover:bg-slate-50'}>
                  <td className="py-2 px-3 font-mono font-bold">
                    {t.tokenNumber}
                    {t.isEmergency && <span className="ml-1 text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded-full">EMG</span>}
                  </td>
                  <td className="py-2 px-3">{t.patientName} ({t.age} y/o)</td>
                  <td className="py-2 px-3">{t.doctorName}</td>
                  <td className="py-2 px-3">{t.specialty}</td>
                  <td className="py-2 px-3">
                    <span className={`font-semibold ${
                      t.status === 'Completed' ? 'text-green-600' :
                      t.status === 'In Consultation' ? 'text-[#1e74d2]' :
                      t.status === 'Calling' ? 'text-purple-600' :
                      'text-amber-600'
                    }`}>{t.status}</span>
                  </td>
                </tr>
              ))}
              {tokens.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-4 text-center text-slate-500">No active tokens generated today.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QueueStats;
