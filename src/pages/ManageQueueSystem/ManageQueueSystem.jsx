import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, Stethoscope, Settings, FileText, Printer, CheckCircle, 
  Trash2, Edit, Save, Clock, ShieldCheck, Users, Activity 
} from 'lucide-react';
import { toast, Bounce } from 'react-toastify';
import useAxiosSecure from '../../hooks/useAxiosSecure/useAxiosSecure';

const ManageQueueSystem = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('doctors');
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [isSpecialtyModalOpen, setIsSpecialtyModalOpen] = useState(false);

  // New Doctor Form
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    specialty: 'Ophthalmology',
    roomNo: '',
    phone: '',
    maxTokensPerDay: 40,
    avgConsultTimeMinutes: 15,
    bio: ''
  });

  // New Specialty Input
  const [newSpecialty, setNewSpecialty] = useState('');

  // 1. Fetch Doctors
  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const res = await axiosSecure.get('/doctors');
      return res.data;
    }
  });

  // 2. Fetch Specialties
  const { data: specialties = [] } = useQuery({
    queryKey: ['specialties'],
    queryFn: async () => {
      const res = await axiosSecure.get('/specialties');
      return res.data;
    }
  });

  // 3. Fetch Queue Tokens
  const { data: tokens = [] } = useQuery({
    queryKey: ['queueTokens'],
    queryFn: async () => {
      const res = await axiosSecure.get('/queue-tokens');
      return res.data;
    }
  });

  // 4. Fetch Queue Settings
  const { data: settings = {} } = useQuery({
    queryKey: ['queueSettings'],
    queryFn: async () => {
      const res = await axiosSecure.get('/queue-settings');
      return res.data;
    }
  });

  // Add Doctor Mutation
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

  // Add Specialty Mutation
  const addSpecialtyMutation = useMutation({
    mutationFn: async (name) => {
      await axiosSecure.post('/specialties', { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['specialties']);
      toast.success('Specialty added!', { position: 'top-right', autoClose: 3000, theme: 'colored' });
      setIsSpecialtyModalOpen(false);
      setNewSpecialty('');
    }
  });

  // Update Settings Mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (payload) => {
      await axiosSecure.patch('/queue-settings', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['queueSettings']);
      toast.success('Queue parameters updated!', { position: 'top-right', autoClose: 3000, theme: 'colored' });
    }
  });

  const handlePrintPDFReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-gradient-to-br from-[#e5f2fa] to-[#a7d4f9] p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <span className="bg-[#1e74d2] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Admin Portal
          </span>
          <h1 className="text-3xl font-extrabold poppins text-slate-800 mt-2">
            Smart Queue System Administration
          </h1>
          <p className="text-slate-600 text-sm mt-1 inter">Configure doctors, departments, token generation parameters & PDF statistics reports.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrintPDFReport}
            className="px-5 py-2.5 bg-[#1e74d2] text-white font-bold text-xs rounded-xl shadow-md hover:bg-blue-700 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Generate Patient Stats (PDF)</span>
          </button>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2 print:hidden">
        <button
          onClick={() => setActiveTab('doctors')}
          className={`px-5 py-2.5 font-bold text-sm rounded-xl transition-all ${
            activeTab === 'doctors' ? 'bg-[#1e74d2] text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Doctors & Staff ({doctors.length})
        </button>
        <button
          onClick={() => setActiveTab('specialties')}
          className={`px-5 py-2.5 font-bold text-sm rounded-xl transition-all ${
            activeTab === 'specialties' ? 'bg-[#1e74d2] text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Specialties ({specialties.length})
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`px-5 py-2.5 font-bold text-sm rounded-xl transition-all ${
            activeTab === 'config' ? 'bg-[#1e74d2] text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Token Generation Config
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={`px-5 py-2.5 font-bold text-sm rounded-xl transition-all ${
            activeTab === 'report' ? 'bg-[#1e74d2] text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Patient Statistics Report
        </button>
      </div>

      {/* DOCTORS TAB */}
      {activeTab === 'doctors' && (
        <div className="space-y-4 print:hidden">
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SPECIALTIES TAB */}
      {activeTab === 'specialties' && (
        <div className="space-y-4 print:hidden">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800 poppins">Medical Specialties & Departments</h3>
            <button
              onClick={() => setIsSpecialtyModalOpen(true)}
              className="px-4 py-2 bg-[#1e74d2] text-white font-bold text-xs rounded-xl shadow-md hover:bg-blue-700 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Specialty
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {specialties.map((spec) => {
              const docCount = doctors.filter(d => d.specialty === spec).length;
              return (
                <div key={spec} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-800 text-base">{spec}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{docCount} Doctor(s) assigned</p>
                  </div>
                  <div className="bg-blue-50 p-2.5 rounded-xl text-[#1e74d2]">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TOKEN GENERATION CONFIG TAB */}
      {activeTab === 'config' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-md border border-slate-200 space-y-6 max-w-2xl print:hidden">
          <h3 className="text-lg font-bold text-slate-800 poppins">Token Generation & Queue Settings</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hospital Name</label>
              <input
                type="text"
                defaultValue={settings.hospitalName || 'MediCamp Central Hospital'}
                onBlur={(e) => updateSettingsMutation.mutate({ hospitalName: e.target.value })}
                className="w-full px-4 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e74d2] outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Max Daily Tokens Per Doctor</label>
                <input
                  type="number"
                  defaultValue={settings.maxTokensPerDoctor || 40}
                  onBlur={(e) => updateSettingsMutation.mutate({ maxTokensPerDoctor: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e74d2] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Default Slot Duration (Mins)</label>
                <input
                  type="number"
                  defaultValue={settings.avgConsultationTimeMinutes || 15}
                  onBlur={(e) => updateSettingsMutation.mutate({ avgConsultationTimeMinutes: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e74d2] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Auto-Cancel Inactive Tokens Timer (Minutes)</label>
              <input
                type="number"
                defaultValue={settings.autoCancelInactiveMinutes || 30}
                onBlur={(e) => updateSettingsMutation.mutate({ autoCancelInactiveMinutes: parseInt(e.target.value) })}
                className="w-full px-4 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e74d2] outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">Tokens that miss their calling window by this duration will automatically set to Cancelled.</p>
            </div>
          </div>
        </div>
      )}

      {/* PATIENT STATISTICS REPORT */}
      {(activeTab === 'report' || true) && (
        <div className={`bg-white p-8 rounded-3xl shadow-md border border-slate-200 space-y-6 ${activeTab !== 'report' ? 'hidden print:block' : 'block'}`}>
          <div className="border-b border-slate-200 pb-4 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 poppins">MediCamp OPD Queue Statistics Report</h2>
              <p className="text-xs text-slate-500 mt-1">Daily Summary & Patient Flow Statistics • Date: {new Date().toLocaleDateString()}</p>
            </div>
            <Printer className="w-6 h-6 text-slate-400 print:hidden cursor-pointer" onClick={handlePrintPDFReport} />
          </div>

          <div className="grid grid-cols-4 gap-4 text-center py-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <span className="text-xs text-slate-500 block font-medium">Total Tokens Issued</span>
              <span className="text-2xl font-bold text-slate-800 font-mono">{tokens.length}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block font-medium">Patients Completed</span>
              <span className="text-2xl font-bold text-[#1e74d2] font-mono">{tokens.filter(t => t.status === 'Completed').length}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block font-medium">Currently Waiting</span>
              <span className="text-2xl font-bold text-amber-600 font-mono">{tokens.filter(t => t.status === 'Waiting').length}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block font-medium">Emergency Cases</span>
              <span className="text-2xl font-bold text-blue-600 font-mono">{tokens.filter(t => t.isEmergency).length}</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-800">Detailed Patient Log</h3>
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
                  <tr key={t._id}>
                    <td className="py-2 px-3 font-mono font-bold">{t.tokenNumber}</td>
                    <td className="py-2 px-3">{t.patientName} ({t.age} y/o)</td>
                    <td className="py-2 px-3">{t.doctorName}</td>
                    <td className="py-2 px-3">{t.specialty}</td>
                    <td className="py-2 px-3 font-semibold text-[#1e74d2]">{t.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD DOCTOR MODAL */}
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
                <input
                  type="text"
                  required
                  value={newDoctor.name}
                  onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                  placeholder="Dr. John Doe"
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#1e74d2]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Specialty *</label>
                <select
                  value={newDoctor.specialty}
                  onChange={(e) => setNewDoctor({ ...newDoctor, specialty: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-[#1e74d2]"
                >
                  {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Room # *</label>
                  <input
                    type="text"
                    required
                    value={newDoctor.roomNo}
                    onChange={(e) => setNewDoctor({ ...newDoctor, roomNo: e.target.value })}
                    placeholder="Room 105"
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#1e74d2]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={newDoctor.phone}
                    onChange={(e) => setNewDoctor({ ...newDoctor, phone: e.target.value })}
                    placeholder="+8801700..."
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#1e74d2]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Daily Tokens</label>
                  <input
                    type="number"
                    value={newDoctor.maxTokensPerDay}
                    onChange={(e) => setNewDoctor({ ...newDoctor, maxTokensPerDay: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#1e74d2]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Avg Consult Time (Mins)</label>
                  <input
                    type="number"
                    value={newDoctor.avgConsultTimeMinutes}
                    onChange={(e) => setNewDoctor({ ...newDoctor, avgConsultTimeMinutes: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#1e74d2]"
                  />
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

      {/* ADD SPECIALTY MODAL */}
      {isSpecialtyModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-3 poppins">Add Specialty</h3>
            <input
              type="text"
              value={newSpecialty}
              onChange={(e) => setNewSpecialty(e.target.value)}
              placeholder="e.g. Dermatology"
              className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#1e74d2]"
            />
            <div className="pt-4 flex justify-end gap-2 text-xs">
              <button type="button" onClick={() => setIsSpecialtyModalOpen(false)} className="px-3 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
              <button type="button" onClick={() => addSpecialtyMutation.mutate(newSpecialty)} className="px-4 py-2 bg-[#1e74d2] text-white font-bold rounded-xl shadow-md hover:bg-blue-700">Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageQueueSystem;
