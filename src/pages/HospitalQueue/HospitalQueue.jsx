import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router';
import { 
  Users, Clock, Stethoscope, AlertTriangle, CheckCircle, Search, 
  ChevronRight, Activity, Calendar, ShieldAlert, Sparkles, MapPin, ArrowRight 
} from 'lucide-react';
import { toast, Bounce } from 'react-toastify';
import useAxiosSecure from '../../hooks/useAxiosSecure/useAxiosSecure';
import useAuth from '../../hooks/useAuth/useAuth';

// SVG Icons matching AvailableCamps
const Icons = {
  Search: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>,
  Sort: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9M3 12h9m-9 4h6" /></svg>,
  Grid3: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  Grid2: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>,
  Calendar: () => <svg className="h-5 w-5 text-[#1e74d2] mr-3 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>,
  Location: () => <svg className="h-5 w-5 text-[#1e74d2] mr-3 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>,
  Participants: () => <svg className="h-5 w-5 mr-2 text-[#1e74d2]" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zm-1.5 5.5a3 3 0 00-3 0V12a2 2 0 00-2 2v1a2 2 0 002 2h6a2 2 0 002-2v-1a2 2 0 00-2-2v-.5a3 3 0 00-3 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zm-1.5 5.5a3 3 0 00-3 0V12a2 2 0 00-2 2v1a2 2 0 002 2h6a2 2 0 002-2v-1a2 2 0 00-2-2v-.5a3 3 0 00-3 0z" /></svg>,
  ArrowRight: () => <svg className="h-5 w-5 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>,
};

const HospitalQueue = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('available');
  const [layout, setLayout] = useState('grid-cols-1 md:grid-cols-2 lg:grid-cols-3');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);

  // Token Form State
  const [formData, setFormData] = useState({
    patientName: user?.displayName || '',
    patientPhone: '',
    age: '',
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

  // 3. Fetch All Queue Tokens
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
      setIsTokenModalOpen(false);
      navigate(`/TrackQueue/${data.token._id}`);
    },
    onError: () => {
      toast.error('Failed to generate queue token. Please try again.');
    }
  });

  const handleOpenTokenModal = (doc) => {
    setSelectedDoctor(doc);
    setFormData(prev => ({
      ...prev,
      patientName: user?.displayName || prev.patientName || 'Standard User'
    }));
    setIsTokenModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!selectedDoctor) return;

    if (!formData.patientName || !formData.patientPhone) {
      return toast.warning('Please provide patient name and contact phone number.');
    }

    createTokenMutation.mutate({
      doctorId: selectedDoctor._id,
      patientName: formData.patientName,
      patientPhone: formData.patientPhone,
      patientEmail: user?.email || 'user',
      age: parseInt(formData.age) || 30,
      gender: formData.gender,
      medicalNotes: formData.medicalNotes,
      isEmergency: formData.isEmergency,
    });
  };

  // Helper to get active token
  const getDoctorActiveToken = (doctorId) => {
    const docTokens = tokens.filter(t => t.doctorId === doctorId && (t.status === 'Calling' || t.status === 'In Consultation'));
    return docTokens[0] || null;
  };

  // Helper to count waiting tokens
  const getDoctorWaitingCount = (doctorId) => {
    return tokens.filter(t => t.doctorId === doctorId && t.status === 'Waiting').length;
  };

  // Filtered and Sorted Doctors
  const filteredAndSortedDoctors = useMemo(() => {
    return doctors
      .filter((doc) => {
        const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              doc.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              doc.roomNo.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSpecialty = selectedSpecialty === 'All' || doc.specialty === selectedSpecialty;
        return matchesSearch && matchesSpecialty;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "alphabetical":
            return a.name.localeCompare(b.name);
          case "available":
            return (b.isAvailable ? 1 : 0) - (a.isAvailable ? 1 : 0);
          default:
            return 0;
        }
      });
  }, [doctors, searchTerm, selectedSpecialty, sortBy]);

  return (
    <div className="bg-slate-50 min-h-screen pb-32">
      {/* --- Hero Section --- */}
      <div className="bg-gradient-to-br from-[#e5f2fa] to-[#a7d4f9] text-center py-20 px-4">
        <h1 className="poppins text-5xl font-extrabold poppins text-gray-700">Smart Hospital OPD Queue</h1>
        <p className="inter text-lg text-slate-600 mt-4 max-w-2xl mx-auto">
          Select an on-duty specialist to generate your live OPD consultation token and track your queue position in real time.
        </p>
      </div>

      {/* --- LIVE TICKER / DISPLAY BOARD --- */}
      <div className="w-11/12 2xl:w-9/12 mx-auto -mt-8 z-10 relative mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#1e74d2]"></span>
              </span>
              <h2 className="text-lg font-bold text-slate-800 poppins">
                Live Consultation Display Board
              </h2>
            </div>
            <span className="text-xs font-semibold text-[#1e74d2] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Live Auto-Refresh
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {doctors.map(doc => {
              const activeTok = getDoctorActiveToken(doc._id);
              return (
                <div key={doc._id} className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
                  <div className="flex justify-between items-start mb-1.5">
                    <div>
                      <p className="font-bold text-slate-800 text-sm truncate">{doc.name}</p>
                      <p className="text-xs text-slate-500">{doc.specialty} • {doc.roomNo}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${doc.isAvailable ? 'bg-blue-100 text-[#1e74d2]' : 'bg-slate-200 text-slate-600'}`}>
                      {doc.isAvailable ? 'ACTIVE' : 'BREAK'}
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg text-center mt-2 border border-slate-200">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Now Serving</p>
                    {activeTok ? (
                      <div className="mt-1">
                        <span className="text-xl font-black text-[#1e74d2] font-mono">{activeTok.tokenNumber}</span>
                        <p className="text-xs font-medium text-slate-700 truncate">{activeTok.patientName}</p>
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-slate-400 block py-1">No Active Token</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* --- Controls Bar --- */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md shadow-sm py-4 px-4 md:px-8 mb-8">
        <div className="w-11/12 2xl:w-9/12 mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative w-full md:w-1/3">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Icons.Search />
              </div>
              <input
                type="text"
                placeholder="Search by doctor name, specialty, room..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e74d2] focus:border-[#1e74d2] transition-all inter text-sm"
              />
            </div>

            <div className="flex flex-col sm:flex-row w-full md:w-auto items-center gap-4">
              {/* Specialty Select */}
              <div className="relative w-full sm:w-auto">
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full pl-4 pr-8 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e74d2] focus:border-[#1e74d2] transition-all inter text-sm bg-white"
                >
                  <option value="All">All Specialties</option>
                  {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Sort Dropdown */}
              <div className="relative w-full sm:w-auto">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Icons.Sort />
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full appearance-none pl-10 pr-8 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e74d2] focus:border-[#1e74d2] transition-all inter text-sm bg-white"
                  >
                    <option value="available">Availability Status</option>
                    <option value="alphabetical">Alphabetical (A-Z)</option>
                  </select>
              </div>
              
              {/* Layout Toggle */}
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                  <button onClick={() => setLayout("grid-cols-1 md:grid-cols-2 lg:grid-cols-3")} className={`p-1.5 rounded-md transition-colors ${layout.includes('3') ? 'bg-[#1e74d2] text-white' : 'text-slate-500 hover:bg-slate-200'}`}><Icons.Grid3 /></button>
                  <button onClick={() => setLayout("grid-cols-1 md:grid-cols-2")} className={`p-1.5 rounded-md transition-colors ${layout.includes('2') && !layout.includes('3') ? 'bg-[#1e74d2] text-white' : 'text-slate-500 hover:bg-slate-200'}`}><Icons.Grid2 /></button>
              </div>
            </div>
        </div>
      </div>
      
      {/* --- Doctors Grid (Exact AvailableCamps Card UI Component Structure) --- */}
      <div className="w-11/12 2xl:w-9/12 mx-auto py-4 px-4 md:px-8">
        {doctorsLoading ? (
          <div className="flex justify-center items-center h-64"><span className="loading loading-spinner loading-lg text-[#1e74d2]"></span></div>
        ) : filteredAndSortedDoctors.length > 0 ? (
          <div className={`grid ${layout} gap-8`}>
            {filteredAndSortedDoctors.map((doc) => {
              const activeTok = getDoctorActiveToken(doc._id);
              const waitingCount = getDoctorWaitingCount(doc._id);
              const estWaitMinutes = waitingCount * doc.avgConsultTimeMinutes;

              return (
                <div
                  key={doc._id}
                  className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1.5 group border border-slate-200 flex flex-col"
                >
                  <div className="relative">
                    <img
                      src={doc.imageUrl}
                      alt={doc.name}
                      className="w-full h-56 object-cover"
                    />
                    <div className={`absolute top-4 right-4 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg ${doc.isAvailable ? 'bg-[#1e74d2]' : 'bg-slate-600'}`}>
                      {doc.isAvailable ? 'Available' : 'On Break'}
                    </div>
                  </div>

                  <div className="p-6 flex-grow">
                    <h3
                      className="text-xl poppins font-bold text-slate-800 mb-3 truncate"
                      title={doc.name}
                    >
                      {doc.name}
                    </h3>

                    <div className="space-y-3 text-slate-600 inter">
                      <div className="flex items-center">
                        <Icons.Calendar />
                        <span className="font-semibold text-[#1e74d2]">{doc.specialty}</span>
                      </div>
                      <div className="flex items-center">
                        <Icons.Location />
                        <span>{doc.roomNo} • {doc.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-4 border-t border-slate-100 mt-4 flex justify-between items-center">
                    <div className="flex flex-col text-sm text-slate-500 font-medium">
                      <p>Queue Status</p>                    
                      <span className="flex items-center font-bold text-slate-700">
                        <Icons.Participants />{waitingCount} Waiting ({estWaitMinutes} mins)
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenTokenModal(doc)}
                      disabled={!doc.isAvailable}
                      className="bg-[#1e74d2] text-white font-semibold px-5 py-2.5 rounded-lg transition-all duration-300 ease-in-out hover:bg-[#185dab] focus:outline-none focus:ring-2 focus:ring-[#1e74d2] focus:ring-offset-2 flex items-center group-hover:pl-4 group-hover:pr-6 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Get Token
                      <Icons.ArrowRight />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold poppins text-slate-700">No Doctors Found</h2>
            <p className="text-slate-500 inter mt-2">Try adjusting your search criteria.</p>
          </div>
        )}
      </div>

      {/* --- TOKEN GENERATION MODAL --- */}
      {isTokenModalOpen && selectedDoctor && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in duration-200 border border-slate-100">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-slate-800 poppins">Generate OPD Queue Token</h3>
                <p className="text-xs text-slate-500 mt-0.5">Booking token for <span className="font-bold text-[#1e74d2]">{selectedDoctor.name}</span> ({selectedDoctor.specialty})</p>
              </div>
              <button 
                onClick={() => setIsTokenModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Patient Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  placeholder="e.g. Abdullah Khan"
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e74d2] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.patientPhone}
                    onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
                    placeholder="+880 1700-000000"
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e74d2] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="30"
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e74d2] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e74d2] outline-none bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Medical Details / Symptoms (Optional)</label>
                <textarea
                  rows={2}
                  value={formData.medicalNotes}
                  onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                  placeholder="Briefly describe symptoms or purpose of visit..."
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e74d2] outline-none"
                />
              </div>

              {/* EMERGENCY PRIORITY OVERRIDE CHECKBOX */}
              <div className="bg-blue-50 p-3.5 rounded-lg border border-blue-200 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="emergency"
                  checked={formData.isEmergency}
                  onChange={(e) => setFormData({ ...formData, isEmergency: e.target.checked })}
                  className="mt-1 h-4 w-4 text-[#1e74d2] rounded focus:ring-[#1e74d2] cursor-pointer"
                />
                <label htmlFor="emergency" className="text-xs text-blue-900 cursor-pointer font-medium">
                  <span className="font-bold flex items-center gap-1 text-[#1e74d2]">
                    <ShieldAlert className="w-3.5 h-3.5" /> Emergency Priority Token
                  </span>
                  Check this box if the patient requires immediate urgent medical attention. Emergency tokens skip regular queue order.
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsTokenModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createTokenMutation.isPending}
                  className="px-6 py-2.5 bg-[#1e74d2] text-white rounded-lg text-sm font-semibold shadow-md hover:bg-[#185dab] transition-all flex items-center gap-2 cursor-pointer"
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

export default HospitalQueue;
