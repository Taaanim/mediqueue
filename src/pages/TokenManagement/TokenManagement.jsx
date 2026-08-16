import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { UserCheck, UserX, AlertCircle, Clock, Plus, Info, ShieldOff } from 'lucide-react';
import useAxiosSecure from '../../hooks/useAxiosSecure/useAxiosSecure';

const TokenManagement = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [infoToken, setInfoToken] = useState(null); // for info/edit modal
  const [editData, setEditData] = useState(null);
  const [newPatient, setNewPatient] = useState({
    patientName: '',
    patientPhone: '',
    age: '',
    gender: 'Male',
    doctorId: '',
    isEmergency: false,
    medicalNotes: ''
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

  const filteredTokens = selectedDoctor === 'all' 
    ? tokens 
    : tokens.filter(t => t.doctorId === selectedDoctor);

  const addPatientMutation = useMutation({
    mutationFn: async (payload) => {
      await axiosSecure.post('/queue-tokens', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['queueTokens']);
      toast.success('Offline patient added and token generated!', { position: 'top-right', autoClose: 3000, theme: 'colored' });
      setIsAddPatientOpen(false);
      setNewPatient({
        patientName: '', patientPhone: '', age: '', gender: 'Male', doctorId: '', isEmergency: false, medicalNotes: ''
      });
    }
  });

  const updateTokenMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      await axiosSecure.patch(`/queue-tokens/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['queueTokens']);
      toast.success('Patient details updated!', { position: 'top-right', autoClose: 2000, theme: 'colored' });
      setInfoToken(null);
      setEditData(null);
    }
  });

  const absentMutation = useMutation({
    mutationFn: async (id) => await axiosSecure.patch(`/queue-tokens/absent/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['queueTokens']);
      toast.warn('Patient marked as absent & moved to back of queue.', { position: 'top-right', autoClose: 2000, theme: 'colored' });
      setInfoToken(null);
      setEditData(null);
    }
  });

  const presentMutation = useMutation({
    mutationFn: async (id) => await axiosSecure.patch(`/queue-tokens/present/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['queueTokens']);
      toast.success('Patient marked as present.', { position: 'top-right', autoClose: 2000, theme: 'colored' });
      setInfoToken(null);
      setEditData(null);
    }
  });

  const emergencyMutation = useMutation({
    mutationFn: async (id) => await axiosSecure.patch(`/queue-tokens/emergency/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['queueTokens']);
      toast.error('Emergency Priority Activated!', { position: 'top-right', autoClose: 2000, theme: 'colored' });
      setInfoToken(null);
      setEditData(null);
    }
  });

  const handleAddPatientSubmit = (e) => {
    e.preventDefault();
    if (!newPatient.doctorId) {
      toast.error('Please select a doctor to generate a token.', { position: 'top-right', autoClose: 3000, theme: 'colored' });
      return;
    }
    addPatientMutation.mutate(newPatient);
  };

  const openInfoModal = (token) => {
    setInfoToken(token);
    setEditData({
      patientName: token.patientName,
      patientPhone: token.patientPhone,
      age: token.age,
      gender: token.gender,
      medicalNotes: token.medicalNotes || '',
      isEmergency: token.isEmergency,
      isPresent: token.isPresent
    });
  };

  const handleUpdatePatient = (e) => {
    e.preventDefault();
    updateTokenMutation.mutate({ id: infoToken._id, payload: editData });
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-gradient-to-br from-[#e5f2fa] to-[#a7d4f9] p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-between items-start">
        <div>
          <span className="bg-[#1e74d2] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Token Management
          </span>
          <h1 className="text-3xl font-extrabold poppins text-slate-800 mt-2">
            Live Queue Management
          </h1>
          <p className="text-slate-600 text-sm mt-1 inter">Manage patient presence, prioritize emergency appointments, and add offline users.</p>
        </div>
      </div>

      {/* ADD PATIENT BUTTON + FILTER (below header, like DoctorAndStaff) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="text-lg font-bold text-slate-800 poppins">Current Live Queue ({filteredTokens.length})</h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-600">Filter by Doctor:</label>
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1e74d2]"
              >
                <option value="all">All Doctors</option>
                {doctors.map(doc => (
                  <option key={doc._id} value={doc._id}>{doc.name} - {doc.specialty}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setIsAddPatientOpen(true)}
              className="px-4 py-2 bg-[#1e74d2] text-white font-bold text-xs rounded-xl shadow-md hover:bg-blue-700 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Patient
            </button>
          </div>
        </div>

        {/* QUEUE TABLE */}
        <div className="bg-white rounded-3xl shadow-md border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-100 text-slate-500 uppercase text-[11px] font-mono border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Token #</th>
                  <th className="py-3.5 px-4">Patient details</th>
                  <th className="py-3.5 px-4">Doctor</th>
                  <th className="py-3.5 px-4">Presence</th>
                  <th className="py-3.5 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTokens.map((token) => (
                  <tr key={token._id} className={`hover:bg-slate-50 transition-colors ${token.isEmergency ? 'bg-red-50' : ''}`}>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-800 bg-slate-200 px-2.5 py-1 rounded-lg">{token.tokenNumber}</span>
                      {token.isEmergency && <span className="ml-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Emergency</span>}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 block">{token.patientName} ({token.age} {token.gender})</span>
                      <span className="text-xs text-slate-400">{token.patientPhone}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[#1e74d2] block">{token.doctorName}</span>
                      <span className="text-xs text-slate-500">{token.specialty} • {token.roomNo}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {token.isPresent === false ? (
                         <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-500"><Clock className="w-3.5 h-3.5"/> Absent</span>
                      ) : token.isPresent === true ? (
                         <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700"><UserCheck className="w-3.5 h-3.5"/> Present</span>
                      ) : (
                         <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700"><Clock className="w-3.5 h-3.5"/> Waiting</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <button 
                        title="View Patient Info"
                        onClick={() => openInfoModal(token)}
                        className="p-2 bg-blue-100 text-[#1e74d2] rounded-xl hover:bg-blue-200 transition-colors cursor-pointer"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredTokens.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-500">No active tokens in the queue.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ADD PATIENT MODAL */}
      {isAddPatientOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-800 mb-4 poppins">Add Offline Patient</h3>
            <form onSubmit={handleAddPatientSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Doctor *</label>
                <select 
                  required
                  value={newPatient.doctorId}
                  onChange={(e) => setNewPatient({ ...newPatient, doctorId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#1e74d2]"
                >
                  <option value="" disabled>-- Select Doctor --</option>
                  {doctors.map(doc => (
                    <option key={doc._id} value={doc._id}>{doc.name} ({doc.specialty})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Patient Name *</label>
                <input type="text" required value={newPatient.patientName} onChange={(e) => setNewPatient({ ...newPatient, patientName: e.target.value })} placeholder="John Doe" className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#1e74d2]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone</label>
                  <input type="text" value={newPatient.patientPhone} onChange={(e) => setNewPatient({ ...newPatient, patientPhone: e.target.value })} placeholder="+8801..." className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#1e74d2]" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Age</label>
                  <input type="number" required value={newPatient.age} onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })} placeholder="30" className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#1e74d2]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gender</label>
                  <select value={newPatient.gender} onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })} className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#1e74d2]">
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 mt-4 bg-red-50 p-2 rounded-xl border border-red-100">
                  <input type="checkbox" id="emergencyCheckAdd" checked={newPatient.isEmergency} onChange={(e) => setNewPatient({ ...newPatient, isEmergency: e.target.checked })} className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500 cursor-pointer" />
                  <label htmlFor="emergencyCheckAdd" className="text-red-700 font-bold cursor-pointer">Emergency Case?</label>
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Medical Notes (Optional)</label>
                <textarea value={newPatient.medicalNotes} onChange={(e) => setNewPatient({ ...newPatient, medicalNotes: e.target.value })} placeholder="Reason for visit..." className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#1e74d2] h-16 resize-none"></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddPatientOpen(false)} className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#1e74d2] text-white font-bold rounded-xl shadow-md hover:bg-blue-700">Generate Token</button>
              </div>
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
              <div>
                <label className="block font-bold text-slate-700 mb-1">Doctor</label>
                <input type="text" disabled value={`${infoToken.doctorName} (${infoToken.specialty}) • ${infoToken.roomNo}`} className="w-full px-3 py-2 border rounded-xl bg-slate-50 text-slate-500 outline-none" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Patient Name *</label>
                <input type="text" required value={editData.patientName} onChange={(e) => setEditData({ ...editData, patientName: e.target.value })} className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#1e74d2]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone</label>
                  <input type="text" value={editData.patientPhone} onChange={(e) => setEditData({ ...editData, patientPhone: e.target.value })} className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#1e74d2]" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Age</label>
                  <input type="number" required value={editData.age} onChange={(e) => setEditData({ ...editData, age: e.target.value })} className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#1e74d2]" />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Gender</label>
                <select value={editData.gender} onChange={(e) => setEditData({ ...editData, gender: e.target.value })} className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#1e74d2]">
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Medical Notes</label>
                <textarea value={editData.medicalNotes} onChange={(e) => setEditData({ ...editData, medicalNotes: e.target.value })} className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#1e74d2] h-16 resize-none"></textarea>
              </div>

              {/* Quick action toggles */}
              <div className="pt-2 space-y-2">
                <p className="font-bold text-slate-700 text-xs uppercase tracking-wider">Quick Actions</p>
                <div className="flex flex-wrap gap-2">
                  {infoToken.isPresent !== true && (
                    <button type="button" onClick={() => presentMutation.mutate(infoToken._id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 font-bold rounded-xl hover:bg-green-200 transition-colors cursor-pointer">
                      <UserCheck className="w-3.5 h-3.5" /> Mark Present
                    </button>
                  )}
                  {infoToken.isPresent !== false && (
                    <button type="button" onClick={() => absentMutation.mutate(infoToken._id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-300 transition-colors cursor-pointer">
                      <UserX className="w-3.5 h-3.5" /> Mark Absent
                    </button>
                  )}
                  {!infoToken.isEmergency ? (
                    <button type="button" onClick={() => emergencyMutation.mutate(infoToken._id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-600 font-bold rounded-xl hover:bg-red-200 transition-colors cursor-pointer">
                      <AlertCircle className="w-3.5 h-3.5" /> Set Emergency
                    </button>
                  ) : (
                    <button type="button" onClick={() => updateTokenMutation.mutate({ id: infoToken._id, payload: { isEmergency: false } })}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 font-bold rounded-xl hover:bg-amber-200 transition-colors cursor-pointer">
                      <ShieldOff className="w-3.5 h-3.5" /> Undo Emergency
                    </button>
                  )}
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

export default TokenManagement;
