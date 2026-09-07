import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar 
} from 'recharts';
import { DollarSign, Hash, Stethoscope, Ticket, Calendar, ArrowRight, Activity, Sparkles, User } from 'lucide-react';
import useAuth from '../../hooks/useAuth/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure/useAxiosSecure';
import { mockDb } from '../../mockData/mockDb';

const StatCard = ({ title, value, subtext, icon, color = 'blue' }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 transition-all hover:shadow-md hover:-translate-y-0.5">
        <div className="flex items-center justify-between text-slate-500">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</p>
            <div className="bg-blue-50 p-2.5 rounded-xl text-[#1e74d2]">
              {icon}
            </div>
        </div>
        <p className="text-3xl font-black text-slate-800 mt-2 poppins">{value}</p>
        {subtext && <p className="text-xs text-slate-400 mt-1 font-medium">{subtext}</p>}
    </div>
);

const DashboardStats = () => {
    const { user, loading: authLoading } = useAuth();
    const axiosSecure = useAxiosSecure();

    // 1. Fetch Participant Registrations
    const { data: registrations = [], isLoading: regLoading } = useQuery({
        queryKey: ['participantRegistrations', user?.email],
        enabled: !authLoading && !!user?.email,
        queryFn: async () => {
            return mockDb.registeredCamps.filter(c => c.participant_email === user?.email || c.participant_email === 'user');
        },
    });

    // 2. Fetch OPD Queue Tokens
    const { data: tokens = [] } = useQuery({
        queryKey: ['queueTokens'],
        queryFn: async () => {
            return mockDb.queueTokens;
        }
    });

    const myTokens = tokens.filter(t => t.patientEmail === user?.email || t.patientEmail === 'user');

    const summaryStats = useMemo(() => {
        const totalTokens = myTokens.length;
        const emergencyTokens = myTokens.filter(t => t.isEmergency).length;
        const activeTokensCount = myTokens.filter(t => t.status === 'Waiting' || t.status === 'Calling' || t.status === 'In Consultation').length;
        const completedTokensCount = myTokens.filter(t => t.status === 'Completed').length;

        return {
            totalTokens,
            emergencyTokens,
            activeTokensCount,
            completedTokensCount,
        };
    }, [registrations, myTokens]);

    // Chart Data
    const chartData = [
        { month: 'Jun', opdTokens: 1 },
        { month: 'Jul', opdTokens: 2 },
        { month: 'Aug', opdTokens: 3 },
        { month: 'Sep', opdTokens: 1 },
    ];

    if (regLoading || authLoading) {
        return <div className="flex justify-center items-center h-64"><span className="loading loading-spinner loading-lg text-[#1e74d2]"></span></div>;
    }

    return (
        <div className="bg-slate-50 min-h-screen space-y-8 pb-16">
            {/* --- WELCOME HERO BANNER (SOFT MEDICAMP LIGHT GRADIENT) --- */}
            <div className="bg-gradient-to-br from-[#e5f2fa] to-[#a7d4f9] p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <span className="inline-flex items-center gap-1.5 bg-white/80 text-[#1e74d2] px-3.5 py-1 rounded-full text-xs font-bold shadow-xs mb-3">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Patient Workspace Overview
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 poppins">
                      Welcome Back, {user?.displayName || 'Standard User'}
                    </h1>
                    <p className="mt-2 text-sm text-slate-600 inter max-w-xl">
                      Manage your OPD doctor queue tokens, track live consultation positions, and review your camp participation history.
                    </p>
                </div>

                {/* DIRECT OPD DOCTOR ACCESS BUTTON */}
                <Link
                    to="/user/dashboard/BrowseDoctors"
                    className="px-6 py-3.5 bg-[#1e74d2] text-white font-bold text-sm rounded-2xl shadow-md hover:bg-[#185dab] transition-all flex items-center gap-2 cursor-pointer shrink-0"
                >
                    <Stethoscope className="w-5 h-5" />
                    <span>Browse OPD Doctors & Get Token</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
            </div>

            {/* --- STATS GRID --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  title="Total Tokens" 
                  value={summaryStats.totalTokens} 
                  subtext="All your queue tokens" 
                  icon={<Ticket className="w-5 h-5"/>} 
                />
                <StatCard 
                  title="Active Queue Tokens" 
                  value={`${summaryStats.activeTokensCount} Tokens`} 
                  subtext="Live OPD waiting line" 
                  icon={<Activity className="w-5 h-5"/>} 
                />
                <StatCard 
                  title="Emergency Tokens" 
                  value={summaryStats.emergencyTokens} 
                  subtext="High priority visits" 
                  icon={<Sparkles className="w-5 h-5"/>} 
                />
                <StatCard 
                  title="OPD Consultations" 
                  value={summaryStats.completedTokensCount} 
                  subtext="Doctor sessions completed" 
                  icon={<Stethoscope className="w-5 h-5"/>} 
                />
            </div>

            {/* --- QUICK ACTION BANNER FOR OPD QUEUE --- */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-50 p-4 rounded-2xl text-[#1e74d2]">
                        <Ticket className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg poppins">My Active Queue Tokens</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Track your live position in line or view estimated wait times for your doctor appointment.</p>
                    </div>
                </div>

                <Link
                    to="/user/dashboard/MyQueueTokens"
                    className="px-5 py-2.5 bg-blue-50 text-[#1e74d2] font-bold text-xs rounded-xl hover:bg-blue-100 transition-all flex items-center gap-1.5 whitespace-nowrap"
                >
                    <span>View My Queue Tokens</span>
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            {/* --- VISUAL CHART --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
                    <h3 className="text-xl font-bold text-slate-800 mb-2 poppins">Activity & OPD Trends</h3>
                    <p className="text-xs text-slate-500 mb-6">Monthly overview of your OPD consultation tokens.</p>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1e74d2" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#1e74d2" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                                <YAxis stroke="#94a3b8" allowDecimals={false} fontSize={12} />
                                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', borderColor: '#e2e8f0' }} />
                                <Area type="monotone" dataKey="opdTokens" name="OPD Tokens" stroke="#1e74d2" fillOpacity={1} fill="url(#colorTokens)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* --- RECENT QUEUE TOKENS SIDE LIST --- */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-4 poppins">Recent Queue Tokens</h3>
                        {myTokens.length === 0 ? (
                            <p className="text-xs text-slate-400 py-6 text-center">No active queue tokens.</p>
                        ) : (
                            <div className="space-y-3">
                                {myTokens.slice(0, 3).map((tok) => (
                                    <div key={tok._id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between items-center">
                                        <div>
                                            <span className="font-mono font-bold text-slate-800 text-sm block">{tok.tokenNumber}</span>
                                            <span className="text-xs text-slate-500 block">{tok.doctorName}</span>
                                        </div>
                                        <span className="text-[11px] font-bold text-[#1e74d2] bg-blue-50 px-2.5 py-1 rounded-full">
                                            {tok.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <Link
                        to="/user/dashboard/BrowseDoctors"
                        className="mt-6 w-full text-center py-3 bg-[#1e74d2] text-white font-bold text-xs rounded-xl shadow hover:bg-[#185dab] transition-all block"
                    >
                        + Book New Doctor Token
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default DashboardStats;