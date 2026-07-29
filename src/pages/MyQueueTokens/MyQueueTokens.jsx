import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link as RouterLink } from 'react-router';
import { Ticket, Clock, ShieldAlert, ArrowRight, Activity, CheckCircle, XCircle } from 'lucide-react';
import useAxiosSecure from '../../hooks/useAxiosSecure/useAxiosSecure';
import useAuth from '../../hooks/useAuth/useAuth';

const MyQueueTokens = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();

  const { data: tokens = [], isLoading } = useQuery({
    queryKey: ['queueTokens'],
    queryFn: async () => {
      const res = await axiosSecure.get('/queue-tokens');
      return res.data;
    },
    refetchInterval: 3000
  });

  const myTokens = tokens.filter(t => t.patientEmail === user?.email || t.patientEmail === 'user');

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-gradient-to-br from-[#e5f2fa] to-[#a7d4f9] p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="bg-[#1e74d2] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Patient Portal
          </span>
          <h1 className="text-3xl font-extrabold poppins text-slate-800 mt-2">
            My Queue Tokens
          </h1>
          <p className="text-slate-600 text-sm mt-1 inter">Track your active OPD consultation queue position and history in real-time.</p>
        </div>

        <RouterLink 
          to="/Dashboard/BrowseDoctors" 
          className="px-5 py-2.5 bg-[#1e74d2] text-white font-bold text-xs rounded-xl shadow-md hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <Ticket className="w-4 h-4" /> Get New Queue Token
        </RouterLink>
      </div>

      {isLoading ? (
        <div className="bg-white p-12 rounded-3xl text-center shadow-sm">Loading your tokens...</div>
      ) : myTokens.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl text-center shadow-md border border-slate-200">
          <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No Queue Tokens Found</h3>
          <p className="text-slate-500 text-sm mt-1">You haven't generated any OPD queue tokens yet.</p>
          <RouterLink 
            to="/Dashboard/BrowseDoctors" 
            className="inline-block mt-4 px-5 py-2.5 bg-[#1e74d2] text-white font-bold text-xs rounded-xl shadow"
          >
            Browse Doctors & Get Token
          </RouterLink>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myTokens.map((tok) => (
            <div key={tok._id} className="bg-white rounded-3xl shadow-md border border-slate-200 overflow-hidden flex flex-col justify-between hover:shadow-xl transition-all">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest block">Token Ticket</span>
                    <h3 className="text-3xl font-black font-mono text-slate-800 mt-0.5">{tok.tokenNumber}</h3>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    tok.status === 'In Consultation' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' :
                    tok.status === 'Calling' ? 'bg-amber-100 text-amber-700 animate-pulse border border-amber-300' :
                    tok.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                    tok.status === 'Cancelled' ? 'bg-rose-100 text-rose-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {tok.status}
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Doctor:</span>
                    <span className="font-bold text-slate-800">{tok.doctorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Department / Room:</span>
                    <span className="font-semibold text-[#1e74d2]">{tok.specialty} • {tok.roomNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Patient:</span>
                    <span className="font-semibold text-slate-700">{tok.patientName}</span>
                  </div>
                </div>

                {tok.isEmergency && (
                  <div className="mt-3 bg-red-50 p-2 rounded-xl border border-red-200 text-red-700 text-xs font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" /> Emergency Priority Active
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                <span className="text-[11px] text-slate-400">
                  {new Date(tok.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>

                <RouterLink
                  to={`/TrackQueue/${tok._id}`}
                  className="px-4 py-2 bg-[#1e74d2] text-white font-bold text-xs rounded-xl shadow hover:bg-blue-700 flex items-center gap-1"
                >
                  <span>Live Queue Tracker</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </RouterLink>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyQueueTokens;
