import React from 'react'; 
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { toast, Bounce, ToastContainer } from 'react-toastify';
import { useQuery } from '@tanstack/react-query'; 
import { GoHome, GoSignOut } from 'react-icons/go';
import { MdOutlineDashboard, MdOutlinePerson, MdOutlineAddLocation, MdOutlineSettings } from 'react-icons/md';
import { BsCheck2Square } from 'react-icons/bs';
import { mockDb } from '../mockData/mockDb';
import useAxiosSecure from '../hooks/useAxiosSecure/useAxiosSecure';
import useAuth from '../hooks/useAuth/useAuth';

const Dashboard = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const location = useLocation();

    const { data: userData, isLoading: isRoleLoading, refetch } = useQuery({
        queryKey: ['userRole', user?.email],
        queryFn: async () => {
            if (!user?.email) return null;
            const res = await axiosSecure.get(`/users/${user.email}`);
            return res.data[0];
        },
        enabled: !!user?.email,
    });

    const handleSwitchRole = (roleKey) => {
        const found = mockDb.users.find(u => u.role === roleKey) || { email: roleKey, role: roleKey, name: `${roleKey.toUpperCase()} Demo` };
        localStorage.setItem('user', JSON.stringify(found));
        toast.info(`Switched prototype view to: ${roleKey.toUpperCase()}`, {
            position: 'top-right', autoClose: 2000, theme: 'light', transition: Bounce,
        });
        window.location.reload();
    };

    const handleSignOut = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.success('Sign Out Successful!', {
            position: 'top-right', autoClose: 3000, theme: 'light', transition: Bounce,
        });
        window.location.href = '/';
    };

    const adminSidebarLinks = (
        <>
            <Link className='flex items-center gap-2 mb-3.5 w-fit hover:text-[#1e74d2] font-medium' to="/Dashboard"><MdOutlineDashboard size={20} /> Overview</Link>
            <Link className='flex items-center gap-2 mb-3.5 w-fit hover:text-[#1e74d2] font-medium' to="/Dashboard/OrganizerProfile"><MdOutlinePerson size={20} />Organizer Profile</Link>
            
            <div className="pt-2 pb-1 border-t border-slate-300/60 my-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Smart Hospital OPD
            </div>
            <Link className='flex items-center gap-2 mb-3.5 w-fit hover:text-[#1e74d2] font-medium' to="/Dashboard/ManageQueueSystem"><MdOutlineSettings size={20} />Queue Management</Link>
            <Link className='flex items-center gap-2 mb-3.5 w-fit hover:text-[#1e74d2] font-medium' to="/Dashboard/QueueAnalytics"><BsCheck2Square size={20} />Queue Analytics</Link>
            
            <div className="pt-2 pb-1 border-t border-slate-300/60 my-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Camp Management
            </div>
            <Link className='flex items-center gap-2 mb-3.5 w-fit hover:text-[#1e74d2] font-medium' to="/Dashboard/AddACamp"><MdOutlineAddLocation size={20} />Add a Camp</Link>
            <Link className='flex items-center gap-2 mb-3.5 w-fit hover:text-[#1e74d2] font-medium' to="/Dashboard/ManageCamps"><MdOutlineSettings size={20} />Manage Camps</Link>
            <Link className='flex items-center gap-2 mb-3.5 w-fit hover:text-[#1e74d2] font-medium' to="/Dashboard/ManageRegisteredCamps"><BsCheck2Square size={20} />Manage Registrations</Link>
        </>
    );

    const doctorSidebarLinks = (
        <>
            <Link className='flex items-center gap-2 mb-3.5 w-fit hover:text-[#1e74d2] font-medium' to="/Dashboard/DoctorQueue"><MdOutlineDashboard size={20} />Live Patient Queue</Link>
            <Link className='flex items-center gap-2 mb-3.5 w-fit hover:text-[#1e74d2] font-medium' to="/Dashboard/QueueAnalytics"><BsCheck2Square size={20} />Queue Analytics</Link>
            <Link className='flex items-center gap-2 mb-3.5 w-fit hover:text-[#1e74d2] font-medium' to="/Dashboard/OrganizerProfile"><MdOutlinePerson size={20} />Doctor Profile</Link>
        </>
    );

    const userSidebarLinks = (
        <>
            <Link className='flex items-center gap-2 mb-3.5 w-fit hover:text-[#1e74d2] font-medium' to="/Dashboard/MyQueueTokens"><BsCheck2Square size={20} />My OPD Queue Tokens</Link>
            <Link className='flex items-center gap-2 mb-3.5 w-fit hover:text-[#1e74d2] font-medium' to="/Dashboard/BrowseDoctors"><MdOutlineAddLocation size={20} />Browse OPD Doctors</Link>
            
            <div className="pt-2 pb-1 border-t border-slate-300/60 my-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Participant Account
            </div>
            <Link className='flex items-center gap-2 mb-3.5 w-fit hover:text-[#1e74d2] font-medium' to="/Dashboard"><MdOutlineDashboard size={20} /> Analytics</Link>
            <Link className='flex items-center gap-2 mb-3.5 w-fit hover:text-[#1e74d2] font-medium' to="/Dashboard/OrganizerProfile"><MdOutlinePerson size={20} />Participant Profile</Link>
            <Link className='flex items-center gap-2 mb-3.5 w-fit hover:text-[#1e74d2] font-medium' to="/Dashboard/RegisteredCamps"><MdOutlineAddLocation size={20} />Registered Camps</Link>
            <Link className='flex items-center gap-2 mb-3.5 w-fit hover:text-[#1e74d2] font-medium' to="/Dashboard/PaymentHistory"><MdOutlineSettings size={20} />Payment History</Link>
        </>
    );

    const SidebarSkeleton = () => (
        <div className="flex flex-col gap-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="h-8 bg-slate-300 rounded-lg animate-pulse"></div>
            ))}
        </div>
    );

    const activeRole = userData?.role?.toLowerCase() || 'admin';

    // Intelligently infer navigation view from current URL if opened via direct link
    const path = location.pathname;
    const isDoctorPath = path.includes('/DoctorQueue');
    const isAdminPath = path.includes('/ManageQueueSystem') || path.includes('/AddACamp') || path.includes('/ManageCamps') || path.includes('/ManageRegisteredCamps');
    const isUserPath = path.includes('/MyQueueTokens') || path.includes('/RegisteredCamps') || path.includes('/PaymentHistory') || path.includes('/BrowseDoctors');

    const renderNav = () => {
      if (isRoleLoading) return <SidebarSkeleton />;
      if (isDoctorPath || activeRole === 'doctor') return doctorSidebarLinks;
      if (isAdminPath || activeRole === 'admin') return adminSidebarLinks;
      if (isUserPath || activeRole === 'user') return userSidebarLinks;
      return adminSidebarLinks;
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            <ToastContainer />
            {/* --- DESKTOP SIDEBAR --- */}
            <aside className="w-72 bg-gradient-to-br from-[#e5f2fa] to-[#a7d4f9] sticky top-0 h-screen hidden lg:flex flex-col p-6">
                <Link to='/' className="flex items-center gap-3 mb-6">
                    <div className="bg-[#1e74d2] p-2 rounded-lg">
                        <img className='w-12' src="https://res.cloudinary.com/dv6p7mprd/image/upload/v1752010021/ChatGPT_Image_Jul_8__2025__03_05_06_AM-removebg-preview_nbdpj2.png" alt="" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-slate-800 poppins">MediCamp</h1>
                      <span className="text-[10px] font-bold text-[#1e74d2] bg-white/80 px-2 py-0.5 rounded-full uppercase">
                        {isDoctorPath ? 'DOCTOR VIEW' : isAdminPath ? 'ADMIN VIEW' : isUserPath ? 'USER VIEW' : `${activeRole.toUpperCase()} VIEW`}
                      </span>
                    </div>
                </Link>

                {/* ROLE SWITCHER TOOLBAR */}
                <div className="bg-white/80 backdrop-blur-sm p-2 rounded-2xl mb-4 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 px-1">Switch View Role:</span>
                    <div className="grid grid-cols-3 gap-1 text-[11px] font-bold">
                        <button 
                          onClick={() => handleSwitchRole('admin')}
                          className={`py-1 rounded-lg transition-all cursor-pointer ${activeRole === 'admin' && !isDoctorPath && !isUserPath ? 'bg-[#1e74d2] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                          👑 Admin
                        </button>
                        <button 
                          onClick={() => handleSwitchRole('doctor')}
                          className={`py-1 rounded-lg transition-all cursor-pointer ${activeRole === 'doctor' || isDoctorPath ? 'bg-[#1e74d2] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                          🩺 Doctor
                        </button>
                        <button 
                          onClick={() => handleSwitchRole('user')}
                          className={`py-1 rounded-lg transition-all cursor-pointer ${activeRole === 'user' || isUserPath ? 'bg-[#1e74d2] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                          👤 Patient
                        </button>
                    </div>
                </div>

                <nav className="flex-1 flex flex-col gap-1 text-gray-600 overflow-y-auto pr-1 scrollbar-thin">
                    {renderNav()}
                </nav>

                <div className="pt-4 mt-4 border-t border-gray-400">
                    <Link className='flex items-center gap-2 text-gray-600 font-medium' to="/"><GoHome size={22} />Back to Home</Link>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center cursor-pointer gap-4 w-full mt-2 py-2.5 rounded-xl text-red-500 font-semibold transition-all duration-300 hover:bg-red-100 text-sm"
                    > 
                        <GoSignOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT & MOBILE DRAWER --- */}
            <main className="flex-1 overflow-y-auto">
                <div className="drawer lg:hidden">
                    <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
                    <div className="drawer-content flex flex-col">
                        {/* Navbar for Mobile */}
                        <div className="navbar bg-[#a7d4f9] text-slate-800 shadow-md">
                            <div className="flex-none">
                                <label htmlFor="my-drawer-3" aria-label="open sidebar" className="btn btn-square btn-ghost">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block h-6 w-6 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                                </label>
                            </div>
                            <div className="flex-1 px-2 mx-2 font-bold poppins">MediCamp Dashboard</div>
                            <div className="flex gap-1 text-[10px] font-bold">
                                <button onClick={() => handleSwitchRole('admin')} className="px-2 py-1 bg-white rounded-md text-slate-700">Admin</button>
                                <button onClick={() => handleSwitchRole('doctor')} className="px-2 py-1 bg-white rounded-md text-slate-700">Doctor</button>
                                <button onClick={() => handleSwitchRole('user')} className="px-2 py-1 bg-white rounded-md text-slate-700">User</button>
                            </div>
                        </div>
                        <div className="p-4 sm:p-6 min-h-screen">
                           <Outlet />
                        </div>
                    </div>
                    <div className="drawer-side z-50">
                        <label htmlFor="my-drawer-3" aria-label="close sidebar" className="drawer-overlay"></label>
                        <div className="menu p-4 w-72 min-h-full bg-gradient-to-tl from-[#e5f2fa] to-[#a7d4f9] flex flex-col">
                            <h1 className="text-xl font-bold text-slate-800 p-4 mb-2 poppins">MediCamp</h1>
                            <nav className="flex-1 flex flex-col gap-2 text-gray-600">
                                {renderNav()}
                            </nav>
                            <div className="pt-4 mt-4 border-t border-slate-200">
                                <Link className='flex items-center gap-2 text-gray-600' to="/"><GoHome size={22} />Back to Home</Link>
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center gap-4 w-full mt-2 py-3 rounded-xl text-red-500 font-semibold hover:bg-red-100"
                                >
                                    <GoSignOut size={22} />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main content area for desktop */}
                <div className="hidden lg:block p-6 sm:p-8 h-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Dashboard;