import React, { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Link } from 'react-router'; // Corrected import
import { PlusCircle, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import useAuth from '../../hooks/useAuth/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure/useAxiosSecure';
import Analytics from '../Analytics/Analytics';

// NOTE: This hardcoded data should be fetched from an API in a real application.
const recentActivity = [
  { id: 1, type: 'New Registration', text: 'Rahim Sheikh registered for "Dental Care Camp".', time: '2 hours ago' },
  { id: 2, type: 'Camp Update', text: '"Wellness Camp - Morrelganj" was updated.', time: '5 hours ago' },
  { id: 3, type: 'New Registration', text: 'Fatima Akter registered for "Eye Care Camp".', time: '1 day ago' },
  { id: 4, type: 'New Camp Added', text: 'A new camp "Pediatric Health - Fakirhat" was created.', time: '2 days ago' },
];

const Overview = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();

  const { data: userData, isPending, isError } = useQuery({
    queryKey: ['userRole', user?.email],
    enabled: !!user?.email,
    queryFn: async () => {
      const res = await axiosSecure.get(`/users/${user.email}`);
      return res.data[0]; 
    }
  });

  const { data: allCamps = [], isLoading: campsLoading, isError: campsError } = useQuery({
    queryKey: ['allCamps'],
    queryFn: async () => {
      const res = await axiosSecure.get('/camps');
      return res.data;
    }
  });

  // --- 1. Process live data from allCamps to create dynamic chart data ---
  const processedChartData = useMemo(() => {
    if (!allCamps || allCamps.length === 0) return [];

    // Aggregate participants by month (e.g., "2025-08")
    const monthlyData = allCamps.reduce((acc, camp) => {
        const dateStr = camp.date || camp.dateTime || '';
        if (!dateStr) return acc;
        
        const parts = dateStr.split('T')[0].split('-');
        let yyyy, mm;
        if (parts[0].length === 4) {
            yyyy = parts[0];
            mm = parts[1];
        } else {
            yyyy = parts[2];
            mm = parts[1];
        }

        const monthKey = `${yyyy}-${mm}`;
        const participants = camp.participantCount || 0;
        
        acc[monthKey] = (acc[monthKey] || 0) + participants;
        return acc;
    }, {});

    // Transform the aggregated data into the format Recharts expects
    return Object.entries(monthlyData)
        .map(([key, value]) => {
            const date = new Date(key + '-01'); // Use the first day of the month for formatting
            return {
                month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
                participants: value,
                // Add a sortable date object
                sortDate: date, 
            };
        })
        // Sort the data chronologically
        .sort((a, b) => a.sortDate - b.sortDate);

  }, [allCamps]);

  if (isPending || campsLoading) {
    return (
      <div className="h-screen flex justify-center items-center text-lg font-medium text-gray-600">
        Loading overview...
      </div>
    );
  }

  if (isError || !userData?.role || campsError) {
    return (
      <div className="h-screen flex justify-center items-center text-red-500">
        Failed to load overview data.
      </div>
    );
  }

  const role = userData.role;

  // --- 2. Calculate stats dynamically ---
  const totalCamps = allCamps.length;
  const totalParticipants = allCamps.reduce((sum, camp) => sum + (camp.participantCount || 0), 0);
  const upcomingCamps = allCamps.filter(camp => {
    const dateStr = camp.date || camp.dateTime || '';
    if (!dateStr) return false;
    const parts = dateStr.split('T')[0].split('-');
    let campDate;
    if (parts[0].length === 4) {
        campDate = new Date(`${parts[0]}-${parts[1]}-${parts[2]}`);
    } else {
        campDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }
    return campDate > new Date();
  }).length;
  const avgParticipants = totalCamps ? Math.round(totalParticipants / totalCamps) : 0;

  return (
    <div>
      {role === 'admin' ? (
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Good morning, {userData.name || user?.displayName || 'Admin'}!</h1>
            <p className="text-slate-500 mt-1">Here's a summary of your organization's activities.</p>
          </div>

          {/* --- 3. Display dynamic stats --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200/80">
                  <p className="text-sm font-semibold text-slate-500">Total Camps</p>
                  <p className="text-4xl font-bold text-slate-800 mt-2">{totalCamps}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200/80">
                  <p className="text-sm font-semibold text-slate-500">Total Participants</p>
                  <p className="text-4xl font-bold text-slate-800 mt-2">{totalParticipants}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200/80">
                  <p className="text-sm font-semibold text-slate-500">Upcoming Camps</p>
                  <p className="text-4xl font-bold text-slate-800 mt-2">{upcomingCamps}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200/80">
                  <p className="text-sm font-semibold text-slate-500">Avg. Participants</p>
                  <p className="text-4xl font-bold text-slate-800 mt-2">{avgParticipants}</p>
              </div>
          </div>

          {/* --- 4. Chart now uses dynamic data --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-md border border-slate-200/80">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Participant Trends by Month</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={processedChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorParticipants" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1e74d2" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#1e74d2" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem' }} />
                    <Legend verticalAlign="top" height={36}/>
                    <Area type="monotone" dataKey="participants" name="Total Participants" stroke="#1e74d2" fillOpacity={1} fill="url(#colorParticipants)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200/80">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.map(activity => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${activity.type === 'New Registration' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                    <div>
                      <p className="text-sm text-slate-700">{activity.text}</p>
                      <p className="text-xs text-slate-400">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions Section */}
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Link to="/dashboard/AddACamp" className="group bg-white p-6 rounded-2xl shadow-md border border-slate-200/80 flex items-center justify-between transition-all hover:border-[#1e74d2] hover:shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="bg-[#e5f2fa] p-3 rounded-full">
                            <PlusCircle className="w-6 h-6 text-[#1e74d2]" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-800">Add a New Camp</p>
                            <p className="text-sm text-slate-500">Create and publish a new medical camp.</p>
                        </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-[#1e74d2] transition-colors" />
                </Link>
                <Link to="/Dashboard/ManageRegisteredCamps" className="group bg-white p-6 rounded-2xl shadow-md border border-slate-200/80 flex items-center justify-between transition-all hover:border-[#1e74d2] hover:shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="bg-[#e5f2fa] p-3 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1e74d2]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-bold text-slate-800">View All Registrations</p>
                            <p className="text-sm text-slate-500">Manage participants for all camps.</p>
                        </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-[#1e74d2] transition-colors" />
                </Link>
            </div>
          </div>
        </div>
      ) : (
        <Analytics />
      )}
    </div>
  );
};

export default Overview;