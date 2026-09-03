import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Info, FileText, Users, Activity } from 'lucide-react';
import { toast, Bounce } from 'react-toastify';
import useAxiosSecure from '../../hooks/useAxiosSecure/useAxiosSecure';
import { mockDb } from '../../mockData/mockDb';

const DoctorAndStaff = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [infoModalDoctor, setInfoModalDoctor] = useState(null);
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    specialty: 'Ophthalmology',
    roomNo: '',
    phone: '',
    maxTokensPerDay: 40,
    avgConsultTimeMinutes: 15,
    bio: ''
  });

  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const res = await axiosSecure.get('/doctors');
      return res.data;
    }
  });

  const { data: specialties = [] } = useQuery({
    queryKey: ['specialties'],
    queryFn: async () => {
      const res = await axiosSecure.get('/specialties');
      return res.data;
    }
  });

  const { data: allHistory = [] } = useQuery({
    queryKey: ['allConsultationHistoryDoctorAndStaff'],
    queryFn: async () => {
      return mockDb.consultationHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
  });

  const doctorHistory = infoModalDoctor 
    ? allHistory.filter(h => h.doctorName === infoModalDoctor.name) 
    : [];

  const addDoctorMutation = useMutation({
    mutationFn: async (payload) => {
      await axiosSecure.post('/doctors', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['doctors']);
      toast.success('Doctor added successfully!', {
        position: 'top-right',
        autoClose: 3000,
        theme: 'colored',
        transition: Bounce
      });
      setIsAddDoctorOpen(false);
      setNewDoctor({
        name: '',
        specialty: 'Ophthalmology',
        roomNo: '',
        phone: '',
        maxTokensPerDay: 40,
        avgConsultTimeMinutes: 15,
        bio: ''
      });
    }
  });

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-[#e5f2fa] to-[#a7d4f9] p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="bg-[#1e74d2] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Doctor & Staff
          </span>
          <h1 className="text-3xl font-extrabold poppins text-slate-800 mt-2">
            Manage Doctors & Staff
          </h1>
          <p className="text-slate-600 text-sm mt-1 inter">Configure hospital doctors and their assigned rooms.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800 poppins">Hospital Doctors List</h3>
          <button
            onClick={() => setIsAddDoctorOpen(true)}
            className="px-4 py-2 bg-[#1e74d2] text-white font-bold text-xs rounded-xl shadow-md hover:bg-blue-700 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add New Doctor
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-md border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-mono border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Doctor</th>
                <th className="py-3.5 px-4">Specialty</th>
                <th className="py-3.5 px-4">Room #</th>
                <th className="py-3.5 px-4">Max Tokens/Day</th>
                <th className="py-3.5 px-4">Avg Consult Time</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {doctors.map((doc) => (
                <tr key={doc._id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img src={doc.imageUrl} alt={doc.name} className="w-9 h-9 rounded-xl object-cover" />
                      <div>
                        <span className="font-bold text-slate-800 block">{doc.name}</span>
                        <span className="text-xs text-slate-400">{doc.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-semibold text-[#1e74d2]">{doc.specialty}</td>
                  <td className="py-3.5 px-4 text-xs font-mono font-bold">{doc.roomNo}</td>
                  <td className="py-3.5 px-4 text-xs font-bold text-slate-700">{doc.maxTokensPerDay} Tokens</td>
                  <td className="py-3.5 px-4 text-xs text-slate-500">{doc.avgConsultTimeMinutes} mins</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      doc.isAvailable ? 'bg-blue-100 text-[#1e74d2]' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {doc.isAvailable ? 'Active' : 'On Break'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => setInfoModalDoctor(doc)}
                      className="p-1.5 bg-blue-50 text-[#1e74d2] rounded-lg hover:bg-blue-100 transition-colors"
                      title="View Stats"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAddDoctorOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-4 poppins">Add New Doctor</h3>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                addDoctorMutation.mutate(newDoctor);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Doctor Name *</label>
                <input type="text" required value={newDoctor.name} onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })} placeholder="Dr. John Doe" className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#1e74d2]" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Specialty *</label>
                <select value={newDoctor.specialty} onChange={(e) => setNewDoctor({ ...newDoctor, specialty: e.target.value })} className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-[#1e74d2]">
                  {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Room # *</label>
                  <input type="text" required value={newDoctor.roomNo} onChange={(e) => setNewDoctor({ ...newDoctor, roomNo: e.target.value })} placeholder="Room 105" className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#1e74d2]" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone</label>
                  <input type="text" value={newDoctor.phone} onChange={(e) => setNewDoctor({ ...newDoctor, phone: e.target.value })} placeholder="+8801700..." className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#1e74d2]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Daily Tokens</label>
                  <input type="number" value={newDoctor.maxTokensPerDay} onChange={(e) => setNewDoctor({ ...newDoctor, maxTokensPerDay: parseInt(e.target.value) })} className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#1e74d2]" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Avg Consult Time (Mins)</label>
                  <input type="number" value={newDoctor.avgConsultTimeMinutes} onChange={(e) => setNewDoctor({ ...newDoctor, avgConsultTimeMinutes: parseInt(e.target.value) })} className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#1e74d2]" />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddDoctorOpen(false)} className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#1e74d2] text-white font-bold rounded-xl shadow-md hover:bg-blue-700">Save Doctor</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INFO MODAL */}
      {infoModalDoctor && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-4">
                <img src={infoModalDoctor.imageUrl} alt={infoModalDoctor.name} className="w-14 h-14 rounded-2xl object-cover shadow-sm" />
                <div>
                  <h3 className="text-xl font-bold text-slate-800 poppins">{infoModalDoctor.name}</h3>
                  <p className="text-sm text-[#1e74d2] font-semibold">{infoModalDoctor.specialty}</p>
                </div>
              </div>
              <button onClick={() => setInfoModalDoctor(null)} className="text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full cursor-pointer">✕</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-center gap-4">
                <div className="bg-white p-2 rounded-xl"><Users className="w-6 h-6 text-[#1e74d2]" /></div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Patients Seen</p>
                  <p className="text-2xl font-black text-slate-800">{doctorHistory.length}</p>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-2xl border border-green-100 flex items-center gap-4">
                <div className="bg-white p-2 rounded-xl"><Activity className="w-6 h-6 text-green-600" /></div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Consult Time</p>
                  <p className="text-2xl font-black text-slate-800">{infoModalDoctor.avgConsultTimeMinutes}m</p>
                </div>
              </div>
            </div>

            <h4 className="text-sm font-bold text-slate-800 poppins mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" /> Recent Consultation History
            </h4>
            
            {doctorHistory.length === 0 ? (
              <p className="text-center py-6 text-slate-500 text-sm bg-slate-50 rounded-2xl border border-slate-100">No past history found for this doctor.</p>
            ) : (
              <div className="space-y-3">
                {doctorHistory.slice(0, 5).map(h => (
                  <div key={h._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{h.patientName || h.patientEmail || 'Patient'}</p>
                      <p className="text-xs text-slate-500">{new Date(h.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right max-w-xs">
                       <p className="text-xs font-semibold text-slate-700 truncate">{h.diagnosis}</p>
                       <p className="text-[10px] text-slate-400 truncate mt-0.5">{h.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAndStaff;
