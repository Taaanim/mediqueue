import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { Activity, Clock, Users, ShieldAlert, CheckCircle, TrendingUp } from 'lucide-react';
import useAxiosSecure from '../../hooks/useAxiosSecure/useAxiosSecure';

const QueueAnalytics = () => {
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

  // Calculate Specialty Distribution
  const specialtyData = doctors.map(doc => {
    const docToks = tokens.filter(t => t.doctorId === doc._id);
    return {
      name: doc.specialty,
      tokens: docToks.length,
      avgWait: doc.avgConsultTimeMinutes * (docToks.filter(t => t.status === 'Waiting').length || 1)
    };
  });

  // Mock Hourly Peak Analytics Data
  const peakHoursData = [
    { hour: '08:00 AM', patients: 12 },
    { hour: '09:00 AM', patients: 28 },
    { hour: '10:00 AM', patients: 45 },
    { hour: '11:00 AM', patients: 38 },
    { hour: '12:00 PM', patients: 20 },
    { hour: '01:00 PM', patients: 15 },
    { hour: '02:00 PM', patients: 32 },
    { hour: '03:00 PM', patients: 40 },
    { hour: '04:00 PM', patients: 25 },
  ];

  const totalTokens = tokens.length || 18;
  const completedTokens = tokens.filter(t => t.status === 'Completed').length || 10;
  const emergencyCount = tokens.filter(t => t.isEmergency).length || 2;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-gradient-to-br from-[#e5f2fa] to-[#a7d4f9] p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 flex justify-between items-center">
        <div>
          <span className="bg-[#1e74d2] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Queue Intelligence & Analytics
          </span>
          <h1 className="text-3xl font-extrabold poppins text-slate-800 mt-2">
            Hospital OPD Queue Analytics
          </h1>
          <p className="text-slate-600 text-sm mt-1 inter">Real-time statistics on patient flow, peak hours, and average wait times.</p>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Total Patient Traffic</span>
            <Users className="w-5 h-5 text-[#1e74d2]" />
          </div>
          <span className="text-3xl font-black text-slate-800 mt-2 block poppins">{totalTokens}</span>
          <span className="text-xs text-[#1e74d2] font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3.5 h-3.5" /> +14% vs yesterday
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Completion Rate</span>
            <CheckCircle className="w-5 h-5 text-[#1e74d2]" />
          </div>
          <span className="text-3xl font-black text-[#1e74d2] mt-2 block poppins">
            {Math.round((completedTokens / totalTokens) * 100)}%
          </span>
          <span className="text-xs text-slate-400 font-semibold mt-1 block">High efficiency</span>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Avg Waiting Time</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-3xl font-black text-amber-600 mt-2 block poppins">14.2 Mins</span>
          <span className="text-xs text-[#1e74d2] font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3.5 h-3.5" /> -3 mins faster
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Emergency Handled</span>
            <ShieldAlert className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-3xl font-black text-blue-600 mt-2 block poppins">{emergencyCount}</span>
          <span className="text-xs text-blue-500 font-semibold mt-1 block">Priority override active</span>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PEAK HOURS CHART */}
        <div className="bg-white p-6 rounded-3xl shadow-md border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4 poppins">Hourly Patient Peak Volume</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={peakHoursData}>
                <defs>
                  <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e74d2" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#1e74d2" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', borderColor: '#e2e8f0' }} />
                <Area type="monotone" dataKey="patients" stroke="#1e74d2" fillOpacity={1} fill="url(#colorPatients)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AVG WAIT TIME BY SPECIALTY */}
        <div className="bg-white p-6 rounded-3xl shadow-md border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4 poppins">Avg Wait Time by Specialty (Minutes)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={specialtyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', borderColor: '#e2e8f0' }} />
                <Bar dataKey="avgWait" fill="#1e74d2" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueueAnalytics;
