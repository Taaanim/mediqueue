import React, { useState } from 'react';
import { useParams, Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, Users, ShieldAlert, CheckCircle2, ArrowLeft, RefreshCw, AlertCircle, XCircle } from 'lucide-react';
import { toast, Bounce } from 'react-toastify';
import useAxiosSecure from '../../hooks/useAxiosSecure/useAxiosSecure';

const QueueTracker = () => {
  const { id } = useParams();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [searchId, setSearchId] = useState('');

  // 1. Fetch Tokens
  const { data: tokens = [], isLoading } = useQuery({
    queryKey: ['queueTokens'],
    queryFn: async () => {
      const res = await axiosSecure.get('/queue-tokens');
      return res.data;
    },
    refetchInterval: 3000 // Real-time poll every 3 sec
  });

  // 2. Fetch Doctors
  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const res = await axiosSecure.get('/doctors');
      return res.data;
    }
  });

  const activeToken = tokens.find(t => t._id === id || t.tokenNumber.toLowerCase() === (id || '').toLowerCase());
  const doctor = activeToken ? doctors.find(d => d._id === activeToken.doctorId) : null;

  // Calculate People Ahead & Est Wait
  let peopleAhead = 0;
  let estimatedWaitMinutes = 0;

  if (activeToken && activeToken.status === 'Waiting') {
    const docWaitingTokens = tokens.filter(t => t.doctorId === activeToken.doctorId && t.status === 'Waiting');
    const myIndex = docWaitingTokens.findIndex(t => t._id === activeToken._id);
    peopleAhead = myIndex >= 0 ? myIndex : 0;
    const avgTime = doctor?.avgConsultTimeMinutes || 15;
    estimatedWaitMinutes = (peopleAhead + 1) * avgTime;
  }

  // Cancel Token Mutation
  const cancelTokenMutation = useMutation({
    mutationFn: async (tokenId) => {
      await axiosSecure.patch(`/queue-tokens/${tokenId}`, { status: 'Cancelled' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['queueTokens']);
      toast.info('Queue token has been cancelled.', {
        position: 'top-right',
        autoClose: 3000,
        theme: 'colored',
        transition: Bounce
      });
    }
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchId) return;
    window.location.href = `/TrackQueue/${searchId.trim()}`;
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-24 pt-8">
      <div className="w-11/12 2xl:w-7/12 mx-auto">
        {/* Back Link & Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <Link to="/HospitalQueue" className="inline-flex items-center gap-2 text-sm font-semibold text-[#1e74d2] hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Hospital OPD
          </Link>

          {/* Quick Search for Token */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Enter Token ID or # (e.g. OPH-002)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="px-3.5 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e74d2] outline-none bg-white"
            />
            <button type="submit" className="px-3.5 py-1.5 bg-[#1e74d2] text-white text-xs font-bold rounded-xl hover:bg-blue-700 shadow-sm cursor-pointer">
              Track
            </button>
          </form>
        </div>

        {isLoading ? (
          <div className="bg-white p-12 rounded-3xl text-center shadow-sm">
            <RefreshCw className="w-8 h-8 text-[#1e74d2] animate-spin mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-500">Fetching live queue status...</p>
          </div>
        ) : !activeToken ? (
          <div className="bg-white p-12 rounded-3xl text-center shadow-md border border-slate-200">
            <AlertCircle className="w-14 h-14 text-amber-500 mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-slate-800 poppins">Token Not Found</h2>
            <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto inter">
              We couldn't find a queue token matching ID "<span className="font-mono font-bold text-slate-700">{id}</span>". Please check your token number and try again.
            </p>
            <Link to="/HospitalQueue" className="inline-block mt-6 px-6 py-2.5 bg-[#1e74d2] text-white font-bold text-sm rounded-xl hover:bg-blue-700 shadow-md">
              Book New Token
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* MAIN STATUS CARD (SOFT MEDICAMP LIGHT GRADIENT HEADER) */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
              {/* Header Bar */}
              <div className="bg-gradient-to-br from-[#e5f2fa] to-[#a7d4f9] p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-widest font-mono text-[#1e74d2] font-bold">Queue Token Ticket</span>
                    {activeToken.isEmergency && (
                      <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                        <ShieldAlert className="w-3 h-3" /> EMERGENCY PRIORITY
                      </span>
                    )}
                  </div>
                  <h1 className="text-4xl font-black font-mono tracking-wider text-slate-800 mt-1">
                    {activeToken.tokenNumber}
                  </h1>
                </div>

                <div className="text-left sm:text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    activeToken.status === 'In Consultation' ? 'bg-blue-100 text-[#1e74d2] border border-blue-300' :
                    activeToken.status === 'Calling' ? 'bg-amber-100 text-amber-700 border border-amber-300 animate-pulse' :
                    activeToken.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                    activeToken.status === 'Cancelled' ? 'bg-rose-100 text-rose-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    Status: {activeToken.status}
                  </span>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Generated: {new Date(activeToken.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* LIVE STATS GRID */}
              <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 border-b border-slate-200">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                  <div className="bg-blue-50 p-3 rounded-xl text-[#1e74d2]">
                    <Users className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium block">Patients Ahead of You</span>
                    <span className="text-2xl font-bold text-slate-800 poppins">
                      {activeToken.status === 'Waiting' ? `${peopleAhead} Patients` : '0 Patients'}
                    </span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                  <div className="bg-amber-50 p-3 rounded-xl text-amber-600">
                    <Clock className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium block">Estimated Wait Time</span>
                    <span className="text-2xl font-bold text-slate-800 poppins">
                      {activeToken.status === 'Waiting' ? `~${estimatedWaitMinutes} Mins` : 'Serving Now!'}
                    </span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                  <div className="bg-blue-50 p-3 rounded-xl text-[#1e74d2]">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium block">Assigned Doctor</span>
                    <span className="text-sm font-bold text-slate-800 truncate block poppins">{activeToken.doctorName}</span>
                    <span className="text-xs text-slate-500 font-mono">{activeToken.roomNo}</span>
                  </div>
                </div>
              </div>

              {/* TIMELINE TRACKER */}
              <div className="p-6 sm:p-8">
                <h3 className="text-base font-bold text-slate-800 mb-6 poppins">Live Consultation Progress</h3>
                
                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-0">
                  {/* Progress Line */}
                  <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0"></div>

                  {[
                    { label: 'Token Issued', desc: 'Added to queue', done: true },
                    { label: 'Waiting in Line', desc: `${peopleAhead} people ahead`, done: activeToken.status !== 'Cancelled' },
                    { label: 'Calling Patient', desc: 'Proceed to room', done: activeToken.status === 'Calling' || activeToken.status === 'In Consultation' || activeToken.status === 'Completed' },
                    { label: 'In Consultation', desc: 'Doctor session', done: activeToken.status === 'In Consultation' || activeToken.status === 'Completed' },
                    { label: 'Completed', desc: 'Consultation finished', done: activeToken.status === 'Completed' }
                  ].map((step, idx) => (
                    <div key={idx} className="relative z-10 flex md:flex-col items-center gap-4 md:gap-2 text-left md:text-center w-full md:w-1/5">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-all ${
                        step.done 
                          ? 'bg-[#1e74d2] text-white ring-4 ring-blue-100' 
                          : 'bg-slate-200 text-slate-400'
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${step.done ? 'text-slate-800' : 'text-slate-400'}`}>{step.label}</p>
                        <p className="text-[11px] text-slate-500">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* PATIENT DETAILS SUMMARY */}
                <div className="mt-10 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <h4 className="text-sm font-bold text-slate-800 mb-3 poppins">Patient Summary</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block">Patient Name</span>
                      <span className="font-semibold text-slate-700">{activeToken.patientName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Contact Phone</span>
                      <span className="font-semibold text-slate-700">{activeToken.patientPhone}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Age / Gender</span>
                      <span className="font-semibold text-slate-700">{activeToken.age} yrs • {activeToken.gender}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Specialty Department</span>
                      <span className="font-semibold text-[#1e74d2]">{activeToken.specialty}</span>
                    </div>
                  </div>
                  {activeToken.medicalNotes && (
                    <div className="mt-3 pt-3 border-t border-slate-200 text-xs">
                      <span className="text-slate-400 block">Symptoms / Medical Notes:</span>
                      <p className="text-slate-700 italic mt-0.5">{activeToken.medicalNotes}</p>
                    </div>
                  )}
                </div>

                {/* ACTIONS */}
                {activeToken.status === 'Waiting' && (
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => cancelTokenMutation.mutate(activeToken._id)}
                      disabled={cancelTokenMutation.isPending}
                      className="px-5 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" /> Cancel Token
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QueueTracker;
