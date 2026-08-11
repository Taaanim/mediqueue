import React, { useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { PlusCircle, Clock, CheckCircle, ShieldAlert, Users } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import useAuth from '../../hooks/useAuth/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure/useAxiosSecure';
import DashboardStats from '../DashboardStats/DashboardStats';

const COLORS = ['#1e74d2', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

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
  const [newPatient, setNewPatient] = useState({
    patientName: '', patientPhone: '', age: '', gender: 'Male', doctorId: '', isEmergency: false, medicalNotes: ''
  });

  const { data: userData, isPending, isError } = useQuery({
    queryKey: ['userRole', user?.email],
    enabled: !!user?.email,
    queryFn: async () => {
      const res = await axiosSecure.get(`/users/${user.email}`);
      return res.data[0]; 
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

  if (isPending) return <div className="h-screen flex justify-center items-center">Loading...</div>;
  if (isError || !userData?.role) return <div className="h-screen flex justify-center items-center text-red-500">Failed to load data.</div>;

  if (userData.role !== 'admin') return <DashboardStats />;

  const totalTokens = tokens.length;
  const completedCount = tokens.filter(t => t.status === 'Completed').length;
  const waitingCount = tokens.filter(t => t.status === 'Waiting').length;
  const emergencyCount = tokens.filter(t => t.isEmergency).length;

  const statusData = [
    { name: 'Waiting', value: waitingCount },
    { name: 'Completed', value: completedCount },
    { name: 'In Consult', value: tokens.filter(t => t.status === 'In Consultation').length },
    { name: 'Calling', value: tokens.filter(t => t.status === 'Calling').length },
    { name: 'Emergency', value: emergencyCount },
  ].filter(d => d.value > 0);

  const filteredTokens = selectedDoctor === 'none' ? [] : tokens.filter(t => t.doctorId === selectedDoctor);

  const handleAddPatientSubmit = (e) => {
    e.preventDefault();
    if (!newPatient.doctorId) {
      toast.error('Select doctor.', { theme: 'colored' }); return;
    }
    addPatientMutation.mutate(newPatient);
  };

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
          <h3 className="text-xl font-bold text-slate-800 mb-4">Token Status Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={4} dataKey="value" label={({name, percent}) => `${name} (${(percent*100).toFixed(0)}%)`}>
                  {statusData.map((_, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{borderRadius:'12px', border:'1px solid #e2e8f0'}} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
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
            <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200/80 flex flex-col justify-center">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-slate-800">Select Doctor</label>
                <button onClick={() => {setIsDoctorSelectOpen(false); setSelectedDoctor('none');}} className="text-xs text-slate-500 hover:text-slate-800">Cancel</button>
              </div>
              <select value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)} className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#1e74d2] text-sm">
                <option value="none">-- Select Doctor --</option>
                {doctors.map(doc => <option key={doc._id} value={doc._id}>{doc.name} - {doc.specialty}</option>)}
              </select>
            </div>
          )}
        </div>
      </div>

      {selectedDoctor !== 'none' && (
        <div className="bg-white rounded-3xl shadow-md border border-slate-200 overflow-hidden mt-6">
          <div className="p-5 border-b border-slate-200 bg-slate-50"><h3 className="text-lg font-bold text-slate-800 poppins">Doctor's Queue ({filteredTokens.length})</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-100 text-slate-500 uppercase text-[11px] font-mono border-b border-slate-200">
                <tr><th className="py-3 px-4">Token #</th><th className="py-3 px-4">Patient</th><th className="py-3 px-4">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTokens.map(t => (
                  <tr key={t._id} className={t.isEmergency ? 'bg-red-50' : 'hover:bg-slate-50'}>
                    <td className="py-3 px-4 font-mono font-bold">{t.tokenNumber} {t.isEmergency && <span className="ml-2 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full uppercase">EMG</span>}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{t.patientName}</td>
                    <td className="py-3 px-4 font-semibold text-[#1e74d2]">{t.status}</td>
                  </tr>
                ))}
                {filteredTokens.length === 0 && <tr><td colSpan="3" className="py-6 text-center text-slate-500">No active tokens for this doctor.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isAddPatientOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-800 mb-4 poppins">Add Offline Patient</h3>
            <form onSubmit={handleAddPatientSubmit} className="space-y-3 text-xs">
              <div><label className="block font-bold mb-1">Select Doctor *</label><select required value={newPatient.doctorId} onChange={e => setNewPatient({...newPatient, doctorId: e.target.value})} className="w-full px-3 py-2 border rounded-xl"><option value="" disabled>-- Select Doctor --</option>{doctors.map(d => <option key={d._id} value={d._id}>{d.name} ({d.specialty})</option>)}</select></div>
              <div><label className="block font-bold mb-1">Patient Name *</label><input type="text" required value={newPatient.patientName} onChange={e => setNewPatient({...newPatient, patientName: e.target.value})} className="w-full px-3 py-2 border rounded-xl" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block font-bold mb-1">Phone</label><input type="text" value={newPatient.patientPhone} onChange={e => setNewPatient({...newPatient, patientPhone: e.target.value})} className="w-full px-3 py-2 border rounded-xl" /></div>
                <div><label className="block font-bold mb-1">Age</label><input type="number" required value={newPatient.age} onChange={e => setNewPatient({...newPatient, age: e.target.value})} className="w-full px-3 py-2 border rounded-xl" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3 items-center">
                <div><label className="block font-bold mb-1">Gender</label><select value={newPatient.gender} onChange={e => setNewPatient({...newPatient, gender: e.target.value})} className="w-full px-3 py-2 border rounded-xl"><option>Male</option><option>Female</option><option>Other</option></select></div>
                <div className="flex items-center gap-2 mt-4 bg-red-50 p-2 rounded-xl border border-red-100"><input type="checkbox" id="emgChk" checked={newPatient.isEmergency} onChange={e => setNewPatient({...newPatient, isEmergency: e.target.checked})} className="w-4 h-4 rounded"/><label htmlFor="emgChk" className="text-red-700 font-bold">Emergency?</label></div>
              </div>
              <div><label className="block font-bold mb-1">Notes</label><textarea value={newPatient.medicalNotes} onChange={e => setNewPatient({...newPatient, medicalNotes: e.target.value})} className="w-full px-3 py-2 border rounded-xl h-16 resize-none"></textarea></div>
              <div className="pt-4 flex justify-end gap-2"><button type="button" onClick={() => setIsAddPatientOpen(false)} className="px-4 py-2 text-slate-600 bg-slate-100 rounded-xl">Cancel</button><button type="submit" className="px-5 py-2 bg-[#1e74d2] text-white font-bold rounded-xl">Generate Token</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Overview;