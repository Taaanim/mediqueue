import React from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { Link, NavLink } from "react-router";
import './nav.css'
import useAuth from "../../hooks/useAuth/useAuth";
import { Bounce, toast } from "react-toastify";

const Navbar = () => {

    const { user, logOut } = useAuth();
    
    const handleSignOut = () => {
        localStorage.clear();
        if (logOut) logOut();
        toast.success('Sign Out Successful!', {
          position: 'top-left',
          autoClose: 2000,
          theme: 'light',
          transition: Bounce,
        });
        window.location.replace('/SignIn');
    };

    const links = <>
        <NavLink to='/'>Home</NavLink>
        <NavLink to='/HospitalQueue'>Hospital Queue</NavLink>
        <NavLink to='/Doctors'>Our Doctors</NavLink>
        <NavLink to='/AboutUs'>About Us</NavLink>
        <NavLink to='/Contact'>Contact</NavLink>
    </>

  return (
    <div className="sticky top-0 z-50 backdrop-blur-3xl shadow-2xs py-3">
      <div className="navbar w-11/12 mx-auto">
        <div className="navbar-start">
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
              <GiHamburgerMenu className="text-xl" />
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm flex gap-3 text-base dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
            >
              {links}
            </ul>
          </div>
          <div className="hidden lg:block">
            <div className="flex items-center ">
                <img 
                className=" w-18" 
                src="https://res.cloudinary.com/dv6p7mprd/image/upload/v1751923329/logo02_h3at9o.png" alt="" />
                <a className=" text-3xl font-bold text-[#1e74d2] poppins ">MediQueue</a>            
            </div>        
          </div>
        </div>
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1 flex gap-8 lg:gap-10 text-base font-normal text-slate-700">
           {links}
          </ul>
        </div>
        <div className="navbar-end">
          {!user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/SignIn"
                className="text-sm font-semibold text-slate-700 hover:text-[#1e74d2] border border-slate-300 rounded-xl px-5 py-2.5 hover:bg-slate-50 transition"
              >
                Login
              </Link>
              <Link
                to="/Doctors"
                className="text-sm font-semibold bg-[#1e74d2] text-white rounded-xl py-2.5 px-5 hover:bg-blue-700 transition shadow-md"
              >
                Book Appointment
              </Link>
            </div>
          ) : (
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="flex items-center gap-3 bg-white/90 hover:bg-[#e5f2fa] border border-slate-200/80 rounded-xl py-1.5 pl-1.5 pr-3 shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full ring-2 ring-[#1e74d2] overflow-hidden shrink-0">
                  <img
                    className="w-full h-full object-cover"
                    src={user.photoURL || 'https://res.cloudinary.com/dv6p7mprd/image/upload/v1752430406/istockphoto-1477583621-612x612_x1gcca.jpg'}
                    alt={user.displayName || 'User'}
                  />
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-sm font-bold text-slate-800 line-clamp-1 leading-tight poppins">
                    {user.displayName || 'User'}
                  </span>
                </div>
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              <ul
                tabIndex={0}
                className="dropdown-content mt-3 z-50 p-2 shadow-2xl bg-white border border-slate-100 rounded-2xl w-60 font-sans"
              >
                <li className="p-3 border-b border-slate-100 flex flex-row items-center gap-3">
                  <div className="w-10 h-10 rounded-full ring-1 ring-slate-200 overflow-hidden shrink-0">
                    <img
                      className="w-full h-full object-cover"
                      src={user.photoURL || 'https://res.cloudinary.com/dv6p7mprd/image/upload/v1752430406/istockphoto-1477583621-612x612_x1gcca.jpg'}
                      alt={user.displayName || 'User'}
                    />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <p className="font-bold text-slate-800 text-sm truncate poppins">{user.displayName || 'User'}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                </li>

                <li className="mt-1">
                  <Link
                    to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'doctor' ? '/doctor/dashboard' : '/user/dashboard'}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-all"
                  >
                    <span>Dashboard</span>
                  </Link>
                </li>

                <li>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                  >
                    <span>Sign Out</span>
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Navbar;
