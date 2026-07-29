import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DollarSign, Hash, BarChart, MapPin } from 'lucide-react';
import useAuth from '../../hooks/useAuth/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure/useAxiosSecure';
import { TiUserOutline } from "react-icons/ti";

const StatCard = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/60 transition-transform transform hover:-translate-y-1">
        <div className="flex items-center justify-between text-slate-500">
            <p className="text-sm font-semibold uppercase tracking-wider">{title}</p>
            {icon}
        </div>
        <p className="text-4xl font-bold text-slate-800 mt-2">{value}</p>
    </div>
);


const Analytics = () => {
    const { user, loading: authLoading } = useAuth();
    const axiosSecure = useAxiosSecure();


    const { data: registrations = [], isLoading } = useQuery({
        queryKey: ['participantRegistrations', user?.email],
        enabled: !authLoading && !!user?.email,
        queryFn: async () => {
            const { data } = await axiosSecure.get(`/participants/email/${user.email}`);
            return data;
        },
    });
    console.log(registrations);
    


    const { summaryStats, chartData } = useMemo(() => {
        if (!registrations || registrations.length === 0) {
            return { summaryStats: {}, chartData: [] };
        }

        const paidRegistrations = registrations.filter(reg => reg.isPayment_confirmed === true);


        const totalSpent = paidRegistrations.reduce((acc, reg) => acc + parseFloat(reg.camp_fee || 0), 0);
        const campsAttended = paidRegistrations.length;


        const locationCounts = paidRegistrations.reduce((acc, reg) => {
            acc[reg.location] = (acc[reg.location] || 0) + 1;
            return acc;
        }, {});
        const favoriteLocation = Object.keys(locationCounts).reduce((a, b) => locationCounts[a] > locationCounts[b] ? a : b, 'N/A');

 
        const preparedChartData = paidRegistrations.map(reg => ({
            subject: reg.camp_name,
            fees: parseFloat(reg.camp_fee),
            popularity: reg.participantCount,
            fullMark: 150, 
        }));
        console.log(preparedChartData);
        

        return {
            summaryStats: {
                totalSpent: `$${totalSpent.toFixed(2)}`,
                campsAttended,
                favoriteLocation,
            },
            chartData: preparedChartData,
        };

    }, [registrations]);


    if (isLoading || authLoading) {
        return <div className="flex justify-center items-center h-screen"><span className="loading loading-spinner loading-lg text-[#1e74d2]"></span></div>;
    }

    if (registrations.length === 0) {
        return (
             <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-slate-700">No Analytics Yet</h2>
                <p className="text-slate-500 mt-2">Register for a camp and complete the payment to see your stats!</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <header>
                    <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Your Analytics Dashboard</h1>
                    <p className="mt-2 text-lg text-slate-500">A summary of your participation and spending.</p>
                </header>
                
                {/* --- Stats Grid --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard title="Total Spent" value={summaryStats.totalSpent} icon={<DollarSign className="w-6 h-6"/>} />
                    <StatCard title="Camps Attended" value={summaryStats.campsAttended} icon={<Hash className="w-6 h-6"/>} />
                    <StatCard title="Welcome Aboard" value={user.displayName} icon={<TiUserOutline  className="w-6 h-6"/>} />
                </div>

                {/* --- Chart Section --- */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/60">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">Camp Comparison</h3>
                    <p className="text-sm text-slate-500 mb-6">This chart compares the fees and popularity (total participants) of the camps you've attended.</p>
                    <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                                <PolarGrid stroke="#e0e0e0" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 'dataMax + 50']} stroke="#94a3b8"/>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                        backdropFilter: 'blur(4px)',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '0.75rem',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                                    }}
                                />
                                <Legend />
                                <Radar name="Camp Fee ($)" dataKey="fees" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                <Radar name="Popularity" dataKey="popularity" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;