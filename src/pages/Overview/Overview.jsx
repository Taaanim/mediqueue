import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { PlusCircle, Clock, CheckCircle, ShieldAlert, Users, Info, UserCheck, UserX, ShieldOff } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import useAuth from '../../hooks/useAuth/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure/useAxiosSecure';
import DashboardStats from '../DashboardStats/DashboardStats';
import { mockDb } from '../../mockData/mockDb';

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

  // Build Area Chart Data 
  // We'll mock a small timeline by hour based on current state to make a good looking area chart
  const areaChartData = useMemo(() => {
    if (tokens.length === 0) return [];

    // Distribute the tokens across a few artificial "hours" today to make the area chart look good
    const data = [
      { time: '09:00', Waiting: 0, Completed: 0, 'In Consult': 0, Emergency: 0 },
      { time: '11:00', Waiting: 0, Completed: 1, 'In Consult': 0, Emergency: 0 }, // Demo completed value
      { time: '13:00', Waiting: 0, Completed: 2, 'In Consult': 0, Emergency: 0 }, // Demo completed value
      { time: '15:00', Waiting: 0, Completed: 2, 'In Consult': 0, Emergency: 0 },
      { time: '17:00', Waiting: 0, Completed: 3, 'In Consult': 0, Emergency: 0 },
    ];

    tokens.forEach((t, i) => {
      const bucket = i % data.length;
      if (t.isEmergency) data[bucket].Emergency++;
      else if (t.status === 'Completed') data[bucket].Completed++;
      else if (t.status === 'In Consultation') data[bucket]['In Consult']++;
      else data[bucket].Waiting++;
    });

    // Make it cumulative so the area chart goes up and down smoothly
    let cumW = 0, cumC = 0, cumI = 0, cumE = 0;
    return data.map(d => {
      cumW += d.Waiting; cumC += d.Completed; cumI += d['In Consult']; cumE += d.Emergency;
      return { time: d.time, Waiting: cumW, Completed: cumC, 'In Consult': cumI, Emergency: cumE };
    });
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
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Good morning, {userData.name || user?.displayName || 'Admin'}!</h1>
        <p className="text-slate-500 mt-1">Here's a summary of your live queue activities.</p>
      </div>

      {/* Stats Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200/80 flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-full"><Users className="w-6 h-6 text-[#1e74d2]" /></div>
          <div><p className="text-sm font-semibold text-slate-500">Total Tokens</p><p className="text-3xl font-bold text-slate-800">{totalTokens}</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200/80 flex items-center gap-4">
          <div className="bg-green-50 p-3 rounded-full"><CheckCircle className="w-6 h-6 text-green-600" /></div>
          <div><p className="text-sm font-semibold text-slate-500">Completed</p><p className="text-3xl font-bold text-slate-800">{completedCount}</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200/80 flex items-center gap-4">
          <div className="bg-amber-50 p-3 rounded-full"><Clock className="w-6 h-6 text-amber-600" /></div>
          <div><p className="text-sm font-semibold text-slate-500">Waiting</p><p className="text-3xl font-bold text-slate-800">{waitingCount}</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200/80 flex items-center gap-4">
          <div className="bg-red-50 p-3 rounded-full"><ShieldAlert className="w-6 h-6 text-red-600" /></div>
          <div><p className="text-sm font-semibold text-slate-500">Emergency</p><p className="text-3xl font-bold text-slate-800">{emergencyCount}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-md border border-slate-200/80">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Patient Flow Overview</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWait" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} /><stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} /></linearGradient>
                  <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.4} /><stop offset="95%" stopColor="#10b981" stopOpacity={0.0} /></linearGradient>
                  <linearGradient id="colorEmg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} /></linearGradient>
                  <linearGradient id="colorCon" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1e74d2" stopOpacity={0.4} /><stop offset="95%" stopColor="#1e74d2" stopOpacity={0.0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem' }} />
                <Legend verticalAlign="top" height={36} />
                <Area type="monotone" dataKey="Waiting" stroke="#f59e0b" fillOpacity={1} fill="url(#colorWait)" strokeWidth={2} />
                <Area type="monotone" dataKey="Completed" stroke="#10b981" fillOpacity={1} fill="url(#colorComp)" strokeWidth={2} />
                <Area type="monotone" dataKey="In Consult" stroke="#1e74d2" fillOpacity={1} fill="url(#colorCon)" strokeWidth={2} />
                <Area type="monotone" dataKey="Emergency" stroke="#ef4444" fillOpacity={1} fill="url(#colorEmg)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200/80">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map(activity => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${activity.type === 'New Registration' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                <div><p className="text-sm text-slate-700">{activity.text}</p><p className="text-xs text-slate-400">{activity.time}</p></div>
              </div>
            ))}
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