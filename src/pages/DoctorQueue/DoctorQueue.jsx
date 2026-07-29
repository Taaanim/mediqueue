import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  User, Clock, CheckCircle2, Play, SkipForward, AlertCircle, 
  History, Power, ShieldAlert, Sparkles, Coffee 
} from 'lucide-react';
import { toast, Bounce } from 'react-toastify';
import useAxiosSecure from '../../hooks/useAxiosSecure/useAxiosSecure';
import useAuth from '../../hooks/useAuth/useAuth';

const DoctorQueue = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('liveQueue');

  // 1. Fetch Doctors
  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const res = await axiosSecure.get('/doctors');
      return res.data;
    }
  });

  // Identify current logged-in doctor
  const currentDoctor = doctors.find(d => d.email === user?.email || d.email === 'doctor') || doctors[0];

  // 2. Fetch Queue Tokens
  const { data: tokens = [], isLoading } = useQuery({
    queryKey: ['queueTokens'],
    queryFn: async () => {
      const res = await axiosSecure.get('/queue-tokens');
      return res.data;
    },
    refetchInterval: 2000 // Real-time poll every 2 sec
  });

  // Filter tokens for this doctor
  const docTokens = tokens.filter(t => t.doctorId === currentDoctor?._id);
  const liveWaitingTokens = docTokens.filter(t => t.status === 'Waiting' || t.status === 'Calling' || t.status === 'In Consultation');
  const completedTokens = docTokens.filter(t => t.status === 'Completed' || t.status === 'Skipped' || t.status === 'Cancelled');

  const currentlyServing = docTokens.find(t => t.status === 'In Consultation' || t.status === 'Calling');

  // Status Update Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ tokenId, status }) => {
      await axiosSecure.patch(`/queue-tokens/${tokenId}`, { status });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['queueTokens']);
      toast.success(`Token status updated to: ${variables.status}`, {
        position: 'top-right',
        autoClose: 3000,
        theme: 'colored',
        transition: Bounce
      });
    }
  });

  // Doctor Break / Availability Mutation
  const toggleAvailabilityMutation = useMutation({
    mutationFn: async (isAvailable) => {
      await axiosSecure.patch(`/doctors/${currentDoctor._id}`, { isAvailable });
    },
    onSuccess: (_, isAvailable) => {
      queryClient.invalidateQueries(['doctors']);
      toast.info(`Doctor status changed to: ${isAvailable ? 'AVAILABLE' : 'ON BREAK'}`, {
        position: 'top-right',
        autoClose: 3000,
        theme: 'colored',
        transition: Bounce
      });
    }
  });

  // Emergency Priority Toggle
  const toggleEmergencyMutation = useMutation({
    mutationFn: async ({ tokenId, isEmergency }) => {
      await axiosSecure.patch(`/queue-tokens/${tokenId}`, { isEmergency });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['queueTokens']);
    }
  });

  const handleCallNext = () => {
    const nextWaiting = docTokens
      .filter(t => t.status === 'Waiting')
      .sort((a, b) => (b.isEmergency ? 1 : 0) - (a.isEmergency ? 1 : 0))[0];

    if (!nextWaiting) {
      return toast.info('No waiting patients in queue!');
    }

    if (currentlyServing) {
      axiosSecure.patch(`/queue-tokens/${currentlyServing._id}`, { status: 'Completed' });
    }

    updateStatusMutation.mutate({ tokenId: nextWaiting._id, status: 'Calling' });
  };

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="bg-gradient-to-br from-[#e5f2fa] to-[#a7d4f9] p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="bg-[#1e74d2] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Doctor Workspace
            </span>
            <span className="text-xs font-bold text-slate-600 font-mono">{currentDoctor?.roomNo}</span>
          </div>
          <h1 className="text-3xl font-extrabold poppins text-slate-800 mt-2">
            Welcome, {currentDoctor?.name}
          </h1>
          <p className="text-slate-600 text-sm mt-1">{currentDoctor?.specialty} OPD • Real-time Queue Manager</p>
        </div>

        {/* BREAK TOGGLE & QUICK NEXT */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => toggleAvailabilityMutation.mutate(!currentDoctor?.isAvailable)}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
              currentDoctor?.isAvailable 
                ? 'bg-[#1e74d2] text-white hover:bg-blue-700' 
                : 'bg-slate-600 text-white hover:bg-slate-700'
            }`}
          >
            <Coffee className="w-4 h-4" />
            <span>{currentDoctor?.isAvailable ? 'Mode: ACTIVE' : 'Mode: ON BREAK'}</span>
          </button>

          <button
            onClick={handleCallNext}
            disabled={!currentDoctor?.isAvailable}
            className="px-6 py-2.5 bg-[#1e74d2] text-white font-bold text-sm rounded-2xl shadow-md hover:bg-blue-700 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Call Next Patient</span>
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <span className="text-xs font-bold text-slate-400 block">Total Waiting</span>
          <span className="text-3xl font-black text-slate-800 mt-1 block poppins">
            {docTokens.filter(t => t.status === 'Waiting').length}
          </span>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <span className="text-xs font-bold text-slate-400 block">Emergency Priority</span>
          <span className="text-3xl font-black text-blue-600 mt-1 block poppins">
            {docTokens.filter(t => t.status === 'Waiting' && t.isEmergency).length}
          </span>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <span className="text-xs font-bold text-slate-400 block">Completed Today</span>
          <span className="text-3xl font-black text-[#1e74d2] mt-1 block poppins">
            {docTokens.filter(t => t.status === 'Completed').length}
          </span>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <span className="text-xs font-bold text-slate-400 block">Avg Consultation</span>
          <span className="text-3xl font-black text-[#1e74d2] mt-1 block poppins">
            {currentDoctor?.avgConsultTimeMinutes} mins
          </span>
        </div>
      </div>

      {/* TABS HEADER */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('liveQueue')}
          className={`px-5 py-2.5 font-bold text-sm rounded-xl transition-all ${
            activeTab === 'liveQueue' 
              ? 'bg-[#1e74d2] text-white shadow-md' 
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Live Queue Workspace ({liveWaitingTokens.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-5 py-2.5 font-bold text-sm rounded-xl transition-all ${
            activeTab === 'history' 
              ? 'bg-[#1e74d2] text-white shadow-md' 
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Consultation History ({completedTokens.length})
        </button>
      </div>

      {/* LIVE QUEUE CONTENT */}
      {activeTab === 'liveQueue' && (
        <div className="space-y-6">
          {/* NOW CALLING / SERVING BANNER */}
          {currentlyServing && (
            <div className="bg-gradient-to-r from-blue-600 to-[#1e74d2] text-white p-6 rounded-3xl shadow-lg border border-blue-400">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {currentlyServing.status === 'Calling' ? 'NOW CALLING' : 'IN CONSULTATION'}
                  </span>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-4xl font-black font-mono tracking-wider">{currentlyServing.tokenNumber}</span>
                    <span className="text-2xl font-bold">{currentlyServing.patientName}</span>
                  </div>
                  <p className="text-xs text-blue-100 mt-1">
                    Phone: {currentlyServing.patientPhone} • {currentlyServing.age} yrs • {currentlyServing.gender}
                  </p>
                  {currentlyServing.medicalNotes && (
                    <p className="text-xs italic bg-black/15 p-2 rounded-lg mt-2 max-w-xl">
                      "{currentlyServing.medicalNotes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {currentlyServing.status === 'Calling' && (
                    <button
                      onClick={() => updateStatusMutation.mutate({ tokenId: currentlyServing._id, status: 'In Consultation' })}
                      className="px-5 py-2.5 bg-white text-[#1e74d2] font-bold text-xs rounded-xl shadow hover:bg-blue-50 cursor-pointer"
                    >
                      Start Consultation
                    </button>
                  )}
                  <button
                    onClick={() => updateStatusMutation.mutate({ tokenId: currentlyServing._id, status: 'Completed' })}
                    className="px-5 py-2.5 bg-sky-500 text-white font-bold text-xs rounded-xl shadow hover:bg-sky-600 cursor-pointer"
                  >
                    Mark Completed
                  </button>
                  <button
                    onClick={() => updateStatusMutation.mutate({ tokenId: currentlyServing._id, status: 'Skipped' })}
                    className="px-4 py-2.5 bg-slate-900/30 text-white font-semibold text-xs rounded-xl hover:bg-slate-900/50 cursor-pointer"
                  >
                    Skip
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* QUEUE CARDS LIST */}
          <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 poppins">Patients Waiting in Line</h3>

            {liveWaitingTokens.filter(t => t._id !== currentlyServing?._id).length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="w-12 h-12 text-[#1e74d2] mx-auto mb-2" />
                <h4 className="text-base font-bold text-slate-700">Queue is Clear!</h4>
                <p className="text-xs text-slate-400 mt-1">There are no waiting patients right now.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {liveWaitingTokens
                  .filter(t => t._id !== currentlyServing?._id)
                  .sort((a, b) => (b.isEmergency ? 1 : 0) - (a.isEmergency ? 1 : 0))
                  .map((token, index) => (
                    <div 
                      key={token._id} 
                      className={`p-4 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all ${
                        token.isEmergency 
                          ? 'bg-blue-50/80 border-blue-200 shadow-xs' 
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center font-mono">
                          #{index + 1}
                        </span>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-slate-800 text-base">{token.tokenNumber}</span>
                            {token.isEmergency && (
                              <span className="bg-[#1e74d2] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <ShieldAlert className="w-3 h-3" /> EMERGENCY
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-bold text-slate-700">{token.patientName}</p>
                          <p className="text-xs text-slate-500">
                            {token.patientPhone} • {token.age} yrs • {token.gender}
                          </p>
                          {token.medicalNotes && (
                            <p className="text-xs text-slate-600 italic mt-1">Notes: {token.medicalNotes}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Emergency Toggle */}
                        <button
                          onClick={() => toggleEmergencyMutation.mutate({ tokenId: token._id, isEmergency: !token.isEmergency })}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            token.isEmergency 
                              ? 'bg-[#1e74d2] text-white border-[#1e74d2]' 
                              : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {token.isEmergency ? 'Emergency Active' : '+ Make Emergency'}
                        </button>

                        <button
                          onClick={() => updateStatusMutation.mutate({ tokenId: token._id, status: 'Calling' })}
                          className="px-4 py-1.5 bg-[#1e74d2] text-white font-bold text-xs rounded-xl shadow hover:bg-blue-700 cursor-pointer"
                        >
                          Call Patient
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* HISTORY CONTENT */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 poppins">Completed & Skipped Appointments</h3>

          {completedTokens.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No completed sessions recorded yet today.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-mono border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Token #</th>
                    <th className="py-3 px-4">Patient</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {completedTokens.map((tok) => (
                    <tr key={tok._id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{tok.tokenNumber}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">{tok.patientName}</td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">{tok.patientPhone}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          tok.status === 'Completed' ? 'bg-blue-100 text-[#1e74d2]' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {tok.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 truncate max-w-xs">{tok.medicalNotes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DoctorQueue;
