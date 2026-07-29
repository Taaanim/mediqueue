import React from 'react'; 
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { toast, Bounce, ToastContainer } from 'react-toastify';
import { useQuery } from '@tanstack/react-query'; 
import { GoHome, GoSignOut } from 'react-icons/go';
import { MdOutlineDashboard, MdOutlinePerson, MdOutlineAddLocation, MdOutlineSettings } from 'react-icons/md';
import { BsCheck2Square } from 'react-icons/bs';
import useAxiosSecure from '../hooks/useAxiosSecure/useAxiosSecure';
import useAuth from '../hooks/useAuth/useAuth';

const Dashboard = () => {
    const { user, logOut } = useAuth();
    const axiosSecure = useAxiosSecure();
    const location = useLocation();

    const { data: userData, isLoading: isRoleLoading } = useQuery({
        queryKey: ['userRole', user?.email],
        queryFn: async () => {
            if (!user?.email) return null;
            const res = await axiosSecure.get(`/users/${user.email}`);
            return res.data[0];
        },
        enabled: !!user?.email,
    });

    const handleSignOut = () => {
        sessionStorage.clear();
        if (logOut) logOut();
        toast.success('Sign Out Successful!', {
            position: 'top-right', autoClose: 2000, theme: 'light', transition: Bounce,
        });
        window.location.replace('/SignIn');
    };

    const navLinkClass = ({ isActive }) => 
        `flex items-center gap-2 mb-3.5 w-fit transition-all ${
            isActive 
            ? 'text-[#1e74d2] font-bold drop-shadow-sm' 
            : 'text-gray-600 hover:text-[#1e74d2] font-medium'
        }`;

    const adminSidebarLinks = (
        <>
            <NavLink end className={navLinkClass} to="/admin/dashboard"><MdOutlineDashboard size={20} /> Overview</NavLink>
            <NavLink className={navLinkClass} to="/admin/dashboard/OrganizerProfile"><MdOutlinePerson size={20} />Organizer Profile</NavLink>
            
            <div className="pt-2 pb-1 border-t border-slate-300/60 my-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2">
              Smart Hospital OPD
            </div>
            <NavLink className={navLinkClass} to="/admin/dashboard/ManageQueueSystem"><MdOutlineSettings size={20} />Queue Management</NavLink>
            <NavLink className={navLinkClass} to="/admin/dashboard/QueueAnalytics"><BsCheck2Square size={20} />Queue Analytics</NavLink>
            
            <div className="pt-2 pb-1 border-t border-slate-300/60 my-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2">
              Camp Management
            </div>
            <NavLink className={navLinkClass} to="/admin/dashboard/AddACamp"><MdOutlineAddLocation size={20} />Add a Camp</NavLink>
            <NavLink className={navLinkClass} to="/admin/dashboard/ManageCamps"><MdOutlineSettings size={20} />Manage Camps</NavLink>
            <NavLink className={navLinkClass} to="/admin/dashboard/ManageRegisteredCamps"><BsCheck2Square size={20} />Manage Registrations</NavLink>
        </>
    );

    const doctorSidebarLinks = (
        <>
            <NavLink end className={navLinkClass} to="/doctor/dashboard"><MdOutlineDashboard size={20} />Live Patient Queue</NavLink>
            <NavLink className={navLinkClass} to="/doctor/dashboard/QueueAnalytics"><BsCheck2Square size={20} />Queue Analytics</NavLink>
            <NavLink className={navLinkClass} to="/doctor/dashboard/OrganizerProfile"><MdOutlinePerson size={20} />Doctor Profile</NavLink>
        </>
    );

    const userSidebarLinks = (
        <>
            <NavLink className={navLinkClass} to="/user/dashboard/MyQueueTokens"><BsCheck2Square size={20} />My OPD Queue Tokens</NavLink>
            <NavLink className={navLinkClass} to="/user/dashboard/BrowseDoctors"><MdOutlineAddLocation size={20} />Browse OPD Doctors</NavLink>
            
            <div className="pt-2 pb-1 border-t border-slate-300/60 my-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2">
              Participant Account
            </div>
            <NavLink end className={navLinkClass} to="/user/dashboard"><MdOutlineDashboard size={20} /> Analytics</NavLink>
            <NavLink className={navLinkClass} to="/user/dashboard/OrganizerProfile"><MdOutlinePerson size={20} />Participant Profile</NavLink>
            <NavLink className={navLinkClass} to="/user/dashboard/RegisteredCamps"><MdOutlineAddLocation size={20} />Registered Camps</NavLink>
            <NavLink className={navLinkClass} to="/user/dashboard/PaymentHistory"><MdOutlineSettings size={20} />Payment History</NavLink>
        </>
    );

    const SidebarSkeleton = () => (
        <div className="flex flex-col gap-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="h-8 bg-slate-300 rounded-lg animate-pulse"></div>
            ))}
        </div>
    );

    // Intelligently infer navigation view from current URL if opened via direct link
    const path = location.pathname.toLowerCase();
    
    let computedRole = 'user';
    if (path.startsWith('/admin')) computedRole = 'admin';
    else if (path.startsWith('/doctor')) computedRole = 'doctor';
    else if (path.startsWith('/user')) computedRole = 'user';

    // Strictly enforce the view based on the URL so /admin always shows admin layout
    const activeRole = computedRole;

    const renderNav = () => {
      if (isRoleLoading) return <SidebarSkeleton />;
      if (activeRole === 'doctor') return doctorSidebarLinks;
      if (activeRole === 'admin') return adminSidebarLinks;
      return userSidebarLinks;
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            <ToastContainer />
            {/* --- DESKTOP SIDEBAR --- */}
            <aside className="w-72 bg-gradient-to-br from-[#e5f2fa] to-[#a7d4f9] sticky top-0 h-screen hidden lg:flex flex-col p-6">
                <Link to='/' className="flex items-center gap-3 mb-10">
                    <div className="bg-[#1e74d2] p-2 rounded-lg">
                        <img className='w-12' src="https://res.cloudinary.com/dv6p7mprd/image/upload/v1752010021/ChatGPT_Image_Jul_8__2025__03_05_06_AM-removebg-preview_nbdpj2.png" alt="" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-600 poppins">MediCamp</h1>
                </Link>

                <nav className="flex-1 flex flex-col gap-1 text-gray-600 overflow-y-auto pr-1 scrollbar-thin">
                    {renderNav()}
                </nav>

                <div className="pt-4 mt-4 border-t border-gray-400">
                    <Link className='flex items-center gap-2 text-gray-600' to="/"><GoHome size={22} />Back to Home</Link>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center cursor-pointer gap-4 w-full mt-2 py-3 rounded-xl text-red-400 font-semibold transition-all duration-300 hover:bg-red-100"
                    > 
                        <GoSignOut size={22} />
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
                        <div className="navbar bg-[#a7d4f9] text-gray-600 shadow-lg">
                            <div className="flex-none">
                                <label htmlFor="my-drawer-3" aria-label="open sidebar" className="btn btn-square btn-ghost">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block h-6 w-6 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                                </label>
                            </div>
                            <div className="flex-1 px-2 mx-2 font-bold">MediCamp Dashboard</div>
                        </div>
                        <div className="p-4 sm:p-6 min-h-screen">
                           <Outlet />
                        </div>
                    </div>
                    <div className="drawer-side z-50">
                        <label htmlFor="my-drawer-3" aria-label="close sidebar" className="drawer-overlay"></label>
                        <div className="menu p-4 w-72 min-h-full bg-gradient-to-tl from-[#e5f2fa] to-[#a7d4f9] flex flex-col">
                            <h1 className="text-xl font-bold text-slate-800 p-4 mb-4 poppins">MediCamp</h1>
                            <nav className="flex-1 flex flex-col gap-2 text-gray-600">
                                {renderNav()}
                            </nav>
                            <div className="pt-4 mt-4 border-t border-slate-200">
                                <Link className='flex items-center gap-2 text-gray-600' to="/"><GoHome size={22} />Back to Home</Link>
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center gap-4 w-full mt-2 py-3 rounded-xl text-red-400 font-semibold transition-all duration-300 hover:bg-red-100"
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