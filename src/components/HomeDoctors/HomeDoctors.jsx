import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router';
import { toast, Bounce } from 'react-toastify';
import useAxiosSecure from '../../hooks/useAxiosSecure/useAxiosSecure';
import useAuth from '../../hooks/useAuth/useAuth';

const Icons = {
  Close: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
  ArrowRight: () => <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
};

const HomeDoctors = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [tokenDoctor, setTokenDoctor] = useState(null);
  const [formData, setFormData] = useState({
    patientName: user?.displayName || '',
    patientPhone: '',
    age: '30',
    gender: 'Male',
    medicalNotes: '',
    isEmergency: false,
  });

  // Fetch Doctors
  const { data: doctors = [], isLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const res = await axiosSecure.get('/doctors');
      return res.data;
    }
  });

  // Fetch Queue Tokens
  const { data: tokens = [] } = useQuery({
    queryKey: ['queueTokens'],
    queryFn: async () => {
      const res = await axiosSecure.get('/queue-tokens');
      return res.data;
    },
    refetchInterval: 3000
  });

  // Create Token Mutation
  const createTokenMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axiosSecure.post('/queue-tokens', payload);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['queueTokens']);
      toast.success(`Token generated! Token #: ${data.token.tokenNumber}`, {
        position: 'top-right',
        autoClose: 5000,
        theme: 'colored',
        transition: Bounce
      });
      setTokenDoctor(null);
      navigate(`/TrackQueue/${data.token._id}`);
    },
    onError: () => {
      toast.error('Failed to generate queue token. Please try again.');
    }
  });

  const handleOpenTokenModal = (doc) => {
    setTokenDoctor(doc);
    setFormData(prev => ({
      ...prev,
      patientName: user?.displayName || prev.patientName || 'Standard User'
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!tokenDoctor) return;
    if (!formData.patientName || !formData.patientPhone) {
      return toast.warning('Please provide patient name and contact phone number.');
    }
    createTokenMutation.mutate({
      doctorId: tokenDoctor._id,
      patientName: formData.patientName,
      patientPhone: formData.patientPhone,
      patientEmail: user?.email || 'user',
      age: parseInt(formData.age) || 30,
      gender: formData.gender,
      medicalNotes: formData.medicalNotes,
      isEmergency: formData.isEmergency,
    });
  };

  const getDoctorWaitingCount = (doctorId) => {
    return tokens.filter(t => t.doctorId === doctorId && t.status === 'Waiting').length;
  };

  const topDoctors = doctors.slice(0, 3);

  return (
    <section className="bg-slate-50 py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-[#1e74d2] font-extrabold text-sm uppercase tracking-wider">Instant OPD Appointments</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 poppins mt-2">
              Featured Specialist Doctors
            </h2>
            <p className="text-slate-600 inter mt-2 text-base max-w-xl">
              Book a consultation token directly from home and track your live queue position in real time.
            </p>
          </div>
          <Link
            to="/Doctors"
            className="mt-4 md:mt-0 text-[#1e74d2] font-bold text-sm hover:underline flex items-center shrink-0"
          >
            View All Doctors <Icons.ArrowRight />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <span className="loading loading-spinner loading-lg text-[#1e74d2]"></span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {topDoctors.map((doc) => {
              const waitingCount = getDoctorWaitingCount(doc._id);
              const estWait = waitingCount * doc.avgConsultTimeMinutes;

              return (
                <div
                  key={doc._id}
                  className="bg-white rounded-2xl shadow-md border border-slate-200/80 overflow-hidden flex flex-col hover:shadow-xl transition-all group"
                >
                  <div className="relative">
                    <img
                      src={doc.imageUrl}
                      alt={doc.name}
                      className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className={`absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full text-white shadow-md ${doc.isAvailable ? 'bg-[#1e74d2]' : 'bg-slate-500'}`}>
                      {doc.isAvailable ? 'Available' : 'On Break'}
                    </span>
                    <div className="absolute bottom-3 left-3">
                      <span className="bg-white/90 backdrop-blur-md text-[#1e74d2] text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                        {doc.specialty}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 poppins truncate mb-1">{doc.name}</h3>
                      <p className="text-xs text-slate-500 font-medium mb-4">{doc.roomNo} • {doc.phone}</p>

                      <div className="bg-slate-50 p-3 rounded-xl mb-4 text-xs text-slate-600 space-y-1">
                        <div className="flex justify-between">
                          <span>Live Queue:</span>
                          <span className="font-bold text-[#1e74d2]">{waitingCount} Waiting ({estWait}m)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Consult Time:</span>
                          <span className="font-semibold text-slate-700">{doc.avgConsultTimeMinutes} mins / patient</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Link
                        to="/Doctors"
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-3 rounded-xl text-xs text-center transition-all"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={() => handleOpenTokenModal(doc)}
                        disabled={!doc.isAvailable}
                        className="flex-1 bg-[#1e74d2] hover:bg-blue-700 text-white font-semibold py-2.5 px-3 rounded-xl text-xs text-center transition-all shadow-md disabled:opacity-50"
                      >
                        Get Token
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* TOKEN MODAL */}
      {tokenDoctor && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800 poppins">Get OPD Queue Token</h3>
                <p className="text-slate-500 text-xs mt-0.5">Consulting with <span className="font-semibold text-[#1e74d2]">{tokenDoctor.name}</span></p>
              </div>
              <button onClick={() => setTokenDoctor(null)} className="text-slate-400 hover:text-slate-600">
                <Icons.Close />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Patient Name</label>
                <input
                  type="text"
                  required
                  value={formData.patientName}
                  onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1e74d2] focus:border-[#1e74d2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Contact Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="+880 1700-000000"
                    value={formData.patientPhone}
                    onChange={(e) => setFormData({...formData, patientPhone: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1e74d2] focus:border-[#1e74d2]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Patient Age</label>
                  <input
                    type="number"
                    required
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1e74d2] focus:border-[#1e74d2]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1e74d2] focus:border-[#1e74d2]"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Brief Symptoms / Notes</label>
                <textarea
                  rows="2"
                  placeholder="Describe your health issue..."
                  value={formData.medicalNotes}
                  onChange={(e) => setFormData({...formData, medicalNotes: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1e74d2] focus:border-[#1e74d2]"
                ></textarea>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="home-emergency"
                  checked={formData.isEmergency}
                  onChange={(e) => setFormData({...formData, isEmergency: e.target.checked})}
                  className="w-4 h-4 text-red-600 focus:ring-red-500 border-slate-300 rounded"
                />
                <label htmlFor="home-emergency" className="text-sm font-semibold text-red-600">
                  Mark as Emergency Patient
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setTokenDoctor(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createTokenMutation.isPending}
                  className="flex-1 py-3 bg-[#1e74d2] hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-md disabled:opacity-50"
                >
                  {createTokenMutation.isPending ? 'Generating...' : 'Confirm & Get Token'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default HomeDoctors;
