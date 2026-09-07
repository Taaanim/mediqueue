import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  PlusCircle, Clock, CheckCircle, ShieldAlert, Users, Info, UserCheck, 
  UserX, ShieldOff, Activity, TrendingUp, Sparkles, Stethoscope, ArrowUpRight 
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import useAuth from '../../hooks/useAuth/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure/useAxiosSecure';
import DashboardStats from '../DashboardStats/DashboardStats';
import { mockDb } from '../../mockData/mockDb';

// Sleek Glassmorphic Tooltip matching MediQueue theme
const CustomPatientFlowTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((sum, entry) => sum + (Number(entry.value) || 0), 0);
    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-slate-700/60 min-w-[210px]">
        <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>Time Window: {label}</span>
          </div>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold">
            Live Flow
          </span>
        </div>
        <div className="space-y-1.5 text-xs">
          {payload.map((entry) => (
            <div key={entry.name} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full ring-2 ring-white/10" style={{ backgroundColor: entry.color }} />
                <span className="text-slate-300 font-medium">{entry.name}</span>
              </div>
              <span className="font-bold font-mono text-white text-sm">{entry.value}</span>
            </div>
          ))}
        </div>
        <div className="mt-2.5 pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-400 font-medium">Cumulative Volume</span>
          <span className="font-extrabold text-sky-400 font-mono text-sm">{total} pts</span>
        </div>
      </div>
    );
  }
  return null;
};

const recentActivity = [
  { id: 1, type: 'New Registration', text: 'Rahim Sheikh registered for "Dental Care Camp".', time: '2 hours ago' },
  { id: 2, type: 'Camp Update', text: '"Wellness Camp - Morrelganj" was updated.', time: '5 hours ago' },
  { id: 3, type: 'New Registration', text: 'Fatima Akter registered for "Eye Care Camp".', time: '1 day ago' },
  { id: 4, type: 'New Camp Added', text: 'A new camp "Pediatric Health - Fakirhat" was created.', time: '2 days ago' },
];

const Overview = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isDoctorSelectOpen, setIsDoctorSelectOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('none');
  const [activeChartStream, setActiveChartStream] = useState('all');

  const [infoToken, setInfoToken] = useState(null);
  const [editData, setEditData] = useState(null);

  const [newPatient, setNewPatient] = useState({
    patientName: '', patientPhone: '', age: '', gender: 'Male', doctorId: '', isEmergency: false, medicalNotes: ''
  });

  const { data: userData, isPending, isError } = useQuery({
    queryKey: ['userRole', user?.email],
    enabled: !!user?.email,
    queryFn: async () => {
      return mockDb.users.find(u => u.email === user?.email) || { role: 'user' };
    }
  });

  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const res = await axiosSecure.get('/doctors');
      return res.data;
    }
  });

  const { data: tokens = [] } = useQuery({
    queryKey: ['queueTokens'],
    queryFn: async () => {
      const res = await axiosSecure.get('/queue-tokens');
      return res.data;
    }
  });

  const addPatientMutation = useMutation({
    mutationFn: async (payload) => await axiosSecure.post('/queue-tokens', payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['queueTokens']);
      toast.success('Patient added successfully!', { position: 'top-right', autoClose: 3000, theme: 'colored' });
      setIsAddPatientOpen(false);
      setNewPatient({ patientName: '', patientPhone: '', age: '', gender: 'Male', doctorId: '', isEmergency: false, medicalNotes: '' });
    }
  });

  const updateTokenMutation = useMutation({
    mutationFn: async ({ id, payload }) => await axiosSecure.patch(`/queue-tokens/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['queueTokens']);
      toast.success('Patient details updated!', { position: 'top-right', autoClose: 2000, theme: 'colored' });
      setInfoToken(null);
      setEditData(null);
    }
  });

  const absentMutation = useMutation({
    mutationFn: async (id) => await axiosSecure.patch(`/queue-tokens/absent/${id}`),
    onSuccess: () => { queryClient.invalidateQueries(['queueTokens']); toast.warn('Patient moved to back.', { theme: 'colored', autoClose: 2000 }); setInfoToken(null); setEditData(null); }
  });

  const presentMutation = useMutation({
    mutationFn: async (id) => await axiosSecure.patch(`/queue-tokens/present/${id}`),
    onSuccess: () => { queryClient.invalidateQueries(['queueTokens']); toast.success('Patient present.', { theme: 'colored', autoClose: 2000 }); setInfoToken(null); setEditData(null); }
  });

  const emergencyMutation = useMutation({
    mutationFn: async (id) => await axiosSecure.patch(`/queue-tokens/emergency/${id}`),
    onSuccess: () => { queryClient.invalidateQueries(['queueTokens']); toast.error('Emergency Activated!', { theme: 'colored', autoClose: 2000 }); setInfoToken(null); setEditData(null); }
  });

  const openInfoModal = (token) => {
    setInfoToken(token);
    setEditData({
      patientName: token.patientName, patientPhone: token.patientPhone, age: token.age, gender: token.gender, medicalNotes: token.medicalNotes || '', isEmergency: token.isEmergency, isPresent: token.isPresent
    });
  };

  const handleUpdatePatient = (e) => {
    e.preventDefault();
    updateTokenMutation.mutate({ id: infoToken._id, payload: editData });
  };

  const handleAddPatientSubmit = (e) => {
    e.preventDefault();
    if (!newPatient.doctorId) {
      toast.error('Select doctor.', { theme: 'colored' }); return;
    }
    addPatientMutation.mutate(newPatient);
  };

  // Build Area Chart Data with realistic, organic hospital outpatient dynamics
  const areaChartData = useMemo(() => {
    const compCount = tokens.filter(t => t.status === 'Completed').length || 3;
    const waitCount = tokens.filter(t => t.status === 'Waiting').length || 4;
    const consultCount = tokens.filter(t => t.status === 'In Consultation').length || 2;
    const emgCount = tokens.filter(t => t.isEmergency).length || 1;

    // Simulate hourly patient flow dynamics across clinic operational hours
    const flowCurves = [
      { time: '08:00', cW: 0.30, cC: 0.10, cI: 0.20, cE: 0.20 },
      { time: '10:00', cW: 0.85, cC: 0.35, cI: 0.75, cE: 0.60 },
      { time: '12:00', cW: 1.00, cC: 0.65, cI: 1.00, cE: 0.90 },
      { time: '14:00', cW: 0.70, cC: 0.85, cI: 0.80, cE: 0.50 },
      { time: '16:00', cW: 0.40, cC: 0.95, cI: 0.45, cE: 0.20 },
      { time: '18:00', cW: 0.15, cC: 1.00, cI: 0.20, cE: 0.10 },
    ];

    return flowCurves.map(slot => ({
      time: slot.time,
      Completed: Math.max(1, Math.round(compCount * slot.cC)),
      'In Consult': Math.max(0, Math.round(consultCount * slot.cI)),
      Waiting: Math.max(0, Math.round(waitCount * slot.cW)),
      Emergency: Math.max(0, Math.round(emgCount * slot.cE)),
    }));
  }, [tokens]);


  if (isPending) return <div className="h-screen flex justify-center items-center">Loading...</div>;
  if (isError || !userData?.role) return <div className="h-screen flex justify-center items-center text-red-500">Failed to load data.</div>;

  if (userData.role !== 'admin') return <DashboardStats />;

  const totalTokens = tokens.length;
  const completedCount = tokens.filter(t => t.status === 'Completed').length;
  const waitingCount = tokens.filter(t => t.status === 'Waiting').length;
  const emergencyCount = tokens.filter(t => t.isEmergency).length;

  // Option "none" is hidden from the actual token display filter
  const filteredTokens = selectedDoctor === 'none' ? [] :
    selectedDoctor === 'all' ? tokens :
      tokens.filter(t => t.doctorId === selectedDoctor);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#e5f2fa] to-[#a7d4f9] p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="bg-[#1e74d2] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Admin Overview
          </span>
          <h1 className="text-3xl font-extrabold poppins text-slate-800 mt-2">
            Welcome, {userData.name || user?.displayName || 'Admin'}
          </h1>
          <p className="text-slate-600 text-sm mt-1 inter">Real-time hospital queue overview, patient flow metrics, and live clinic activities.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-xs">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#1e74d2]"></span>
          </span>
          <span className="text-xs font-bold text-slate-700 font-mono">Live Sync Active</span>
        </div>
      </div>

      {/* Stats Boxes with Coordinated Theme Palette */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80 flex items-center gap-4 transition-all hover:shadow-md hover:-translate-y-0.5">
          <div className="bg-blue-50 p-3.5 rounded-2xl text-[#1e74d2]"><Users className="w-6 h-6" /></div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Tokens</p>
            <p className="text-3xl font-black text-slate-800 poppins mt-0.5">{totalTokens}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80 flex items-center gap-4 transition-all hover:shadow-md hover:-translate-y-0.5">
          <div className="bg-sky-50 p-3.5 rounded-2xl text-[#0284c7]"><CheckCircle className="w-6 h-6" /></div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Completed</p>
            <p className="text-3xl font-black text-slate-800 poppins mt-0.5">{completedCount}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80 flex items-center gap-4 transition-all hover:shadow-md hover:-translate-y-0.5">
          <div className="bg-indigo-50 p-3.5 rounded-2xl text-[#6366f1]"><Clock className="w-6 h-6" /></div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Waiting</p>
            <p className="text-3xl font-black text-slate-800 poppins mt-0.5">{waitingCount}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80 flex items-center gap-4 transition-all hover:shadow-md hover:-translate-y-0.5">
          <div className="bg-rose-50 p-3.5 rounded-2xl text-[#f43f5e]"><ShieldAlert className="w-6 h-6" /></div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Emergency</p>
            <p className="text-3xl font-black text-slate-800 poppins mt-0.5">{emergencyCount}</p>
          </div>
        </div>
      </div>

      {/* Patient Flow Overview + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GRAPH CARD */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-7 rounded-3xl shadow-sm border border-slate-200/80 flex flex-col justify-between">
          <div>
            {/* Header with Title & Interactive Stream Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#1e74d2]"></span>
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    Live Flow Analytics
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-800 poppins mt-1">
                  Patient Flow Overview
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time consultation traffic, wait volume, and completion velocity.
                </p>
              </div>

              {/* Interactive Stream Filter Tabs */}
              <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-2xl shrink-0 overflow-x-auto">
                {[
                  { id: 'all', label: 'All Streams' },
                  { id: 'Completed', label: 'Completed' },
                  { id: 'In Consult', label: 'In Consult' },
                  { id: 'Waiting', label: 'Waiting' },
                  { id: 'Emergency', label: 'Emergency' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveChartStream(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      activeChartStream === tab.id
                        ? 'bg-white text-[#1e74d2] shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Area Chart Container */}
          <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaChartData} margin={{ top: 12, right: 12, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e74d2" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#1e74d2" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorCon" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorWait" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.30} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorEmg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.30} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="#94a3b8" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                  dy={6}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                  allowDecimals={false} 
                />
                <Tooltip content={<CustomPatientFlowTooltip />} />
                
                {(activeChartStream === 'all' || activeChartStream === 'Completed') && (
                  <Area 
                    type="monotone" 
                    dataKey="Completed" 
                    stroke="#1e74d2" 
                    fillOpacity={1} 
                    fill="url(#colorComp)" 
                    strokeWidth={2.5}
                    activeDot={{ r: 5, stroke: '#ffffff', strokeWidth: 2, fill: '#1e74d2' }}
                  />
                )}
                {(activeChartStream === 'all' || activeChartStream === 'In Consult') && (
                  <Area 
                    type="monotone" 
                    dataKey="In Consult" 
                    stroke="#0284c7" 
                    fillOpacity={1} 
                    fill="url(#colorCon)" 
                    strokeWidth={2.5}
                    activeDot={{ r: 5, stroke: '#ffffff', strokeWidth: 2, fill: '#0284c7' }}
                  />
                )}
                {(activeChartStream === 'all' || activeChartStream === 'Waiting') && (
                  <Area 
                    type="monotone" 
                    dataKey="Waiting" 
                    stroke="#6366f1" 
                    fillOpacity={1} 
                    fill="url(#colorWait)" 
                    strokeWidth={2.5}
                    activeDot={{ r: 5, stroke: '#ffffff', strokeWidth: 2, fill: '#6366f1' }}
                  />
                )}
                {(activeChartStream === 'all' || activeChartStream === 'Emergency') && (
                  <Area 
                    type="monotone" 
                    dataKey="Emergency" 
                    stroke="#f43f5e" 
                    fillOpacity={1} 
                    fill="url(#colorEmg)" 
                    strokeWidth={2.5}
                    activeDot={{ r: 5, stroke: '#ffffff', strokeWidth: 2, fill: '#f43f5e' }}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Metrics Labels - Centered Below Graph */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 mt-6 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-50/80 border border-blue-100 text-xs">
              <span className="w-2 h-2 rounded-full bg-[#1e74d2]"></span>
              <span className="text-slate-600 font-medium">Completed:</span>
              <span className="font-bold font-mono text-[#1e74d2] text-sm">{completedCount}</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-sky-50/80 border border-sky-100 text-xs">
              <span className="w-2 h-2 rounded-full bg-[#0284c7]"></span>
              <span className="text-slate-600 font-medium">In Consult:</span>
              <span className="font-bold font-mono text-[#0284c7] text-sm">{tokens.filter(t => t.status === 'In Consultation').length}</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-50/80 border border-indigo-100 text-xs">
              <span className="w-2 h-2 rounded-full bg-[#6366f1]"></span>
              <span className="text-slate-600 font-medium">Waiting:</span>
              <span className="font-bold font-mono text-[#6366f1] text-sm">{waitingCount}</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-50/80 border border-rose-100 text-xs">
              <span className="w-2 h-2 rounded-full bg-[#f43f5e]"></span>
              <span className="text-slate-600 font-medium">Emergency:</span>
              <span className="font-bold font-mono text-[#f43f5e] text-sm">{emergencyCount}</span>
            </div>
          </div>
        </div>

        {/* RECENT ACTIVITY CARD */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-sm border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-slate-800 poppins">Recent Activity</h3>
                <p className="text-xs text-slate-500 mt-0.5">Live hospital events & registrations</p>
              </div>
              <span className="p-2 bg-blue-50 text-[#1e74d2] rounded-xl">
                <Activity className="w-4 h-4" />
              </span>
            </div>

            <div className="space-y-3.5 mt-5">
              {recentActivity.map(activity => (
                <div key={activity.id} className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-slate-200 transition-all flex items-start gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ring-4 ${
                    activity.type === 'New Registration' 
                      ? 'bg-[#1e74d2] ring-blue-100' 
                      : 'bg-indigo-500 ring-indigo-100'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 leading-snug">{activity.text}</p>
                    <p className="text-[11px] font-mono text-slate-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>System Status</span>
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 100% Operational
            </span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <button onClick={() => setIsAddPatientOpen(true)} className="group bg-white p-6 rounded-2xl shadow-md border border-slate-200/80 flex items-center justify-between transition-all hover:border-[#1e74d2] hover:shadow-lg text-left">
            <div className="flex items-center gap-4">
              <div className="bg-[#e5f2fa] p-3 rounded-full"><PlusCircle className="w-6 h-6 text-[#1e74d2]" /></div>
              <div><p className="font-bold text-slate-800">Add New Patient</p><p className="text-sm text-slate-500">Register offline patient and generate token inline.</p></div>
            </div>
          </button>

          {!isDoctorSelectOpen ? (
            <button onClick={() => setIsDoctorSelectOpen(true)} className="group bg-white p-6 rounded-2xl shadow-md border border-slate-200/80 flex items-center justify-between transition-all hover:border-[#1e74d2] hover:shadow-lg text-left">
              <div className="flex items-center gap-4">
                <div className="bg-[#e5f2fa] p-3 rounded-full"><Users className="w-6 h-6 text-[#1e74d2]" /></div>
                <div><p className="font-bold text-slate-800">View Doctor List</p><p className="text-sm text-slate-500">Select doctor to view patient queue.</p></div>
              </div>
            </button>
          ) : (
            <div className="group bg-white p-6 rounded-2xl shadow-md border border-slate-200/80 flex flex-col justify-center transition-all hover:border-[#1e74d2] hover:shadow-lg">
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-bold text-slate-800">Select Doctor</label>
                <button onClick={() => { setIsDoctorSelectOpen(false); setSelectedDoctor('none'); }} className="text-xs text-slate-500 hover:text-slate-800 font-bold px-2 py-1 rounded bg-slate-100 hover:bg-slate-200">Cancel</button>
              </div>
              <select value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)} className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#1e74d2] text-sm bg-slate-50">
                <option value="none">-- Select Doctor to View --</option>
                <option value="all">View All Doctors</option>
                {doctors.map(doc => <option key={doc._id} value={doc._id}>{doc.name} - {doc.specialty}</option>)}
              </select>
            </div>
          )}
        </div>
      </div>

      {selectedDoctor !== 'none' && (
        <div className="bg-white rounded-3xl shadow-md border border-slate-200 overflow-hidden mt-6">
          <div className="p-5 border-b border-slate-200 bg-slate-50"><h3 className="text-lg font-bold text-slate-800 poppins">Patient Queue ({filteredTokens.length})</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-100 text-slate-500 uppercase text-[11px] font-mono border-b border-slate-200">
                <tr><th className="py-3 px-4">Token #</th><th className="py-3 px-4">Patient</th><th className="py-3 px-4">Doctor</th><th className="py-3 px-4">Status</th><th className="py-3 px-4">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTokens.map(t => (
                  <tr key={t._id} className={t.isEmergency ? 'bg-red-50' : 'hover:bg-slate-50'}>
                    <td className="py-3 px-4 font-mono font-bold">{t.tokenNumber} {t.isEmergency && <span className="ml-2 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full uppercase">EMG</span>}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{t.patientName}</td>
                    <td className="py-3 px-4 text-xs">{t.doctorName}</td>
                    <td className="py-3 px-4 font-semibold text-[#1e74d2]">{t.status}</td>
                    <td className="py-3 px-4">
                      <button
                        title="View Patient Info"
                        onClick={() => openInfoModal(t)}
                        className="p-2 bg-blue-100 text-[#1e74d2] rounded-xl hover:bg-blue-200 transition-colors cursor-pointer"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredTokens.length === 0 && <tr><td colSpan="5" className="py-6 text-center text-slate-500">No active tokens for this selection.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD PATIENT MODAL */}
      {isAddPatientOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-800 mb-4 poppins">Add Offline Patient</h3>
            <form onSubmit={handleAddPatientSubmit} className="space-y-3 text-xs">
              <div><label className="block font-bold mb-1">Select Doctor *</label><select required value={newPatient.doctorId} onChange={e => setNewPatient({ ...newPatient, doctorId: e.target.value })} className="w-full px-3 py-2 border rounded-xl"><option value="" disabled>-- Select Doctor --</option>{doctors.map(d => <option key={d._id} value={d._id}>{d.name} ({d.specialty})</option>)}</select></div>
              <div><label className="block font-bold mb-1">Patient Name *</label><input type="text" required value={newPatient.patientName} onChange={e => setNewPatient({ ...newPatient, patientName: e.target.value })} className="w-full px-3 py-2 border rounded-xl" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block font-bold mb-1">Phone</label><input type="text" value={newPatient.patientPhone} onChange={e => setNewPatient({ ...newPatient, patientPhone: e.target.value })} className="w-full px-3 py-2 border rounded-xl" /></div>
                <div><label className="block font-bold mb-1">Age</label><input type="number" required value={newPatient.age} onChange={e => setNewPatient({ ...newPatient, age: e.target.value })} className="w-full px-3 py-2 border rounded-xl" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3 items-center">
                <div><label className="block font-bold mb-1">Gender</label><select value={newPatient.gender} onChange={e => setNewPatient({ ...newPatient, gender: e.target.value })} className="w-full px-3 py-2 border rounded-xl"><option>Male</option><option>Female</option><option>Other</option></select></div>
                <div className="flex items-center gap-2 mt-4 bg-red-50 p-2 rounded-xl border border-red-100"><input type="checkbox" id="emgChk" checked={newPatient.isEmergency} onChange={e => setNewPatient({ ...newPatient, isEmergency: e.target.checked })} className="w-4 h-4 rounded" /><label htmlFor="emgChk" className="text-red-700 font-bold">Emergency?</label></div>
              </div>
              <div><label className="block font-bold mb-1">Notes</label><textarea value={newPatient.medicalNotes} onChange={e => setNewPatient({ ...newPatient, medicalNotes: e.target.value })} className="w-full px-3 py-2 border rounded-xl h-16 resize-none"></textarea></div>
              <div className="pt-4 flex justify-end gap-2"><button type="button" onClick={() => setIsAddPatientOpen(false)} className="px-4 py-2 text-slate-600 bg-slate-100 rounded-xl">Cancel</button><button type="submit" className="px-5 py-2 bg-[#1e74d2] text-white font-bold rounded-xl">Generate Token</button></div>
            </form>
          </div>
        </div>
      )}

      {/* PATIENT INFO / EDIT MODAL */}
      {infoToken && editData && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-800 poppins">Patient Details</h3>
              <span className="font-mono font-bold text-sm bg-slate-200 px-3 py-1 rounded-lg text-slate-700">{infoToken.tokenNumber}</span>
            </div>

            <form onSubmit={handleUpdatePatient} className="space-y-3 text-xs">
              <div><label className="block font-bold text-slate-700 mb-1">Doctor</label><input type="text" disabled value={`${infoToken.doctorName} (${infoToken.specialty})`} className="w-full px-3 py-2 border rounded-xl bg-slate-50 text-slate-500 outline-none" /></div>
              <div><label className="block font-bold text-slate-700 mb-1">Patient Name *</label><input type="text" required value={editData.patientName} onChange={(e) => setEditData({ ...editData, patientName: e.target.value })} className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#1e74d2]" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block font-bold text-slate-700 mb-1">Phone</label><input type="text" value={editData.patientPhone} onChange={(e) => setEditData({ ...editData, patientPhone: e.target.value })} className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#1e74d2]" /></div>
                <div><label className="block font-bold text-slate-700 mb-1">Age</label><input type="number" required value={editData.age} onChange={(e) => setEditData({ ...editData, age: e.target.value })} className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#1e74d2]" /></div>
              </div>
              <div><label className="block font-bold text-slate-700 mb-1">Gender</label><select value={editData.gender} onChange={(e) => setEditData({ ...editData, gender: e.target.value })} className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#1e74d2]"><option>Male</option><option>Female</option><option>Other</option></select></div>
              <div><label className="block font-bold text-slate-700 mb-1">Medical Notes</label><textarea value={editData.medicalNotes} onChange={(e) => setEditData({ ...editData, medicalNotes: e.target.value })} className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#1e74d2] h-16 resize-none"></textarea></div>

              <div className="pt-2 space-y-2">
                <p className="font-bold text-slate-700 text-xs uppercase tracking-wider">Quick Actions</p>
                <div className="flex flex-wrap gap-2">
                  {infoToken.isPresent !== true && <button type="button" onClick={() => presentMutation.mutate(infoToken._id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 font-bold rounded-xl hover:bg-green-200 transition-colors"><UserCheck className="w-3.5 h-3.5" /> Mark Present</button>}
                  {infoToken.isPresent !== false && <button type="button" onClick={() => absentMutation.mutate(infoToken._id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-300 transition-colors"><UserX className="w-3.5 h-3.5" /> Mark Absent</button>}
                  {!infoToken.isEmergency ? <button type="button" onClick={() => emergencyMutation.mutate(infoToken._id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-600 font-bold rounded-xl hover:bg-red-200 transition-colors"><ShieldAlert className="w-3.5 h-3.5" /> Set Emergency</button> : <button type="button" onClick={() => updateTokenMutation.mutate({ id: infoToken._id, payload: { isEmergency: false } })} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 font-bold rounded-xl hover:bg-amber-200 transition-colors"><ShieldOff className="w-3.5 h-3.5" /> Undo Emergency</button>}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100 mt-2">
                <button type="button" onClick={() => { setInfoToken(null); setEditData(null); }} className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">Close</button>
                <button type="submit" className="px-5 py-2 bg-[#1e74d2] text-white font-bold rounded-xl shadow-md hover:bg-blue-700">Update Patient</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Overview;