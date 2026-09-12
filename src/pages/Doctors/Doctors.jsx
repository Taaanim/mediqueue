import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { toast, Bounce } from 'react-toastify';
import useAxiosSecure from '../../hooks/useAxiosSecure/useAxiosSecure';
import useAuth from '../../hooks/useAuth/useAuth';

const Icons = {
  Search: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>,
  Filter: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9M3 12h9m-9 4h6" /></svg>,
  Stethoscope: () => <svg className="w-5 h-5 text-[#1e74d2]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Clock: () => <svg className="w-5 h-5 text-[#1e74d2]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Phone: () => <svg className="w-5 h-5 text-[#1e74d2]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
  Location: () => <svg className="w-5 h-5 text-[#1e74d2]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Award: () => <svg className="w-5 h-5 text-[#1e74d2]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  Close: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
};

const Doctors = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [detailDoctor, setDetailDoctor] = useState(null);
  const [tokenDoctor, setTokenDoctor] = useState(null);

  // Form State for Token Modal
  const [formData, setFormData] = useState({
    patientName: user?.displayName || '',
    patientPhone: '',
    age: '30',
    gender: 'Male',
    medicalNotes: '',
    isEmergency: false,
  });

  // 1. Fetch Doctors
  const { data: doctors = [], isLoading: doctorsLoading } = useQuery({
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

  // 3. Fetch Tokens
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
      toast.success(`Token generated successfully! Token #: ${data.token.tokenNumber}`, {
        position: 'top-right',
        autoClose: 5000,
        theme: 'colored',
        transition: Bounce
      });
      setTokenDoctor(null);
      setDetailDoctor(null);
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

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            doc.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            doc.roomNo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecialty = selectedSpecialty === 'All' || doc.specialty === selectedSpecialty;
      return matchesSearch && matchesSpecialty;
    });
  }, [doctors, searchTerm, selectedSpecialty]);

  return (
    <div className="bg-slate-50 min-h-screen pb-24 font-sans">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-[#e5f2fa] to-[#a7d4f9] py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="inline-block bg-[#1e74d2]/10 text-[#1e74d2] font-semibold px-4 py-1.5 rounded-full text-sm mb-4">
            Specialist OPD Directory
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 poppins">
            Meet Our Specialist Doctors
          </h1>
          <p className="text-slate-600 inter mt-4 text-lg max-w-2xl mx-auto">
            Browse our team of certified medical specialists. View detailed qualifications, consultation schedules, and book instant OPD queue tokens.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-7 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-1/2">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Icons.Search />
            </div>
            <input
              type="text"
              placeholder="Search by doctor name, department, room..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1e74d2] focus:border-[#1e74d2] transition-all inter text-slate-800"
            />
          </div>

          <div className="w-full md:w-72 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Icons.Filter />
            </div>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full appearance-none pl-11 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1e74d2] focus:border-[#1e74d2] transition-all inter text-slate-800 bg-white"
            >
              <option value="All">All Departments</option>
              {specialties.map((spec) => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        {doctorsLoading ? (
          <div className="flex justify-center items-center py-20">
            <span className="loading loading-spinner loading-lg text-[#1e74d2]"></span>
          </div>
        ) : filteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDoctors.map((doc) => {
              const waitingCount = getDoctorWaitingCount(doc._id);
              const estWaitMinutes = waitingCount * doc.avgConsultTimeMinutes;

              return (
                <div
                  key={doc._id}
                  className="bg-white rounded-2xl shadow-md border border-slate-200/80 overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="relative">
                    <img
                      src={doc.imageUrl}
                      alt={doc.name}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
                    
                    <span className={`absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full text-white shadow-md ${doc.isAvailable ? 'bg-[#1e74d2]' : 'bg-slate-500'}`}>
                      {doc.isAvailable ? 'Available Now' : 'On Break'}
                    </span>

                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <span className="bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full">
                        {doc.specialty}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 poppins truncate mb-2">{doc.name}</h3>
                      <p className="text-slate-500 text-sm inter line-clamp-2 mb-4">
                        {doc.bio || 'Senior medical consultant providing expert patient diagnosis and care.'}
                      </p>

                      <div className="space-y-2 text-sm text-slate-600 inter bg-slate-50 p-3 rounded-xl mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">OPD Room:</span>
                          <span className="font-semibold text-slate-700">{doc.roomNo}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Avg Consult Time:</span>
                          <span className="font-semibold text-slate-700">{doc.avgConsultTimeMinutes} mins / patient</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Live Waiting:</span>
                          <span className="font-bold text-[#1e74d2]">{waitingCount} Patients ({estWaitMinutes}m)</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center gap-3">
                      <button
                        onClick={() => setDetailDoctor(doc)}
                        className="flex-1 bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold py-2.5 px-4 rounded-xl transition-all text-sm text-center cursor-pointer"
                      >
                        View Profile
                      </button>

                      <button
                        onClick={() => handleOpenTokenModal(doc)}
                        disabled={!doc.isAvailable}
                        className="flex-1 bg-[#1e74d2] hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all text-sm text-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                      >
                        Get Token
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <h3 className="text-2xl font-bold text-slate-700 poppins">No Doctors Found</h3>
            <p className="text-slate-500 inter mt-2">Try adjusting your search query or department filter.</p>
          </div>
        )}
      </div>

      {/* DOCTOR DETAILS MODAL */}
      {detailDoctor && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-100">
            <div className="relative">
              <img
                src={detailDoctor.imageUrl}
                alt={detailDoctor.name}
                className="w-full h-64 object-cover rounded-t-3xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent"></div>
              
              <button
                onClick={() => setDetailDoctor(null)}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-md transition-all"
              >
                <Icons.Close />
              </button>

              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="bg-[#1e74d2] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {detailDoctor.specialty}
                </span>
                <h2 className="text-3xl font-extrabold poppins mt-2">{detailDoctor.name}</h2>
                <p className="text-slate-200 text-sm mt-1">{detailDoctor.degrees || 'MBBS, FCPS (Medicine), MD (Specialist)'}</p>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <h4 className="text-lg font-bold text-slate-800 poppins mb-2">About Doctor</h4>
                <p className="text-slate-600 inter leading-relaxed">
                  {detailDoctor.bio || `${detailDoctor.name} is a highly dedicated specialist in ${detailDoctor.specialty} with extensive clinical experience. Providing comprehensive patient consultation and personalized care at MediQueue Central Hospital.`}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
                  <Icons.Location />
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase">Consultation Chamber</p>
                    <p className="text-slate-800 font-bold text-sm mt-0.5">{detailDoctor.roomNo}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
                  <Icons.Clock />
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase">Avg Consult Time</p>
                    <p className="text-slate-800 font-bold text-sm mt-0.5">{detailDoctor.avgConsultTimeMinutes} Mins / Patient</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
                  <Icons.Phone />
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase">Direct Contact</p>
                    <p className="text-slate-800 font-bold text-sm mt-0.5">{detailDoctor.phone}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
                  <Icons.Award />
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase">Max Daily Patients</p>
                    <p className="text-slate-800 font-bold text-sm mt-0.5">{detailDoctor.maxTokensPerDay} Patients / Day</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold">Status</p>
                  <p className={`font-bold text-sm ${detailDoctor.isAvailable ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {detailDoctor.isAvailable ? 'Available for OPD Consult' : 'Currently On Break'}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setDetailDoctor(null)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-all"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      const doc = detailDoctor;
                      setDetailDoctor(null);
                      handleOpenTokenModal(doc);
                    }}
                    disabled={!detailDoctor.isAvailable}
                    className="px-6 py-2.5 bg-[#1e74d2] hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md disabled:opacity-50"
                  >
                    Get Token Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  id="emergency"
                  checked={formData.isEmergency}
                  onChange={(e) => setFormData({...formData, isEmergency: e.target.checked})}
                  className="w-4 h-4 text-red-600 focus:ring-red-500 border-slate-300 rounded"
                />
                <label htmlFor="emergency" className="text-sm font-semibold text-red-600">
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
    </div>
  );
};

export default Doctors;
