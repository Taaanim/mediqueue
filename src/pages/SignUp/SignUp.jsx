import React from 'react';
import { Link, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { Bounce, toast } from 'react-toastify';

import useAuth from '../../hooks/useAuth/useAuth';

const SignUp = () => {
    const { userSignInWithGoogle, userSignUpWithEmailPass } = useAuth();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm({ mode: 'onBlur' }); 

    const password = watch('password');

    const onSubmit = ({ name, email, password }) => {
        userSignUpWithEmailPass(email, password)
            .then(async (result) => {
                toast.success('Signed up successfully!', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "colored",
                    transition: Bounce,
                });

                navigate(location?.state || '/');
            })
            .catch(error => {
                console.error("Sign-up error:", error);
                toast.error('Something went wrong while signing up. Please try again!', {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "colored",
                    transition: Bounce,
                });
            });
    };

    const handleGoogleSignIn = () => {
        userSignInWithGoogle()
            .then((result) => {
                toast.success('Signed in successfully!', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "colored",
                    transition: Bounce,
                });
                navigate(location?.state || '/');
            })
            .catch(error => {
                console.error("Google sign-in error:", error);
                toast.error('There was a problem signing in with Google!', {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "colored",
                    transition: Bounce,
                });
            });
    };

    return (
        <div className="flex items-center justify-center p-4 mt-8 mb-32">
            <div className="w-full max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-2xl flex flex-col lg:flex-row overflow-hidden">
                    
                    {/* Left Column: Image and Welcome Message */}
                    <div className="w-full lg:w-1/2 relative">
                        <img 
                            src="https://res.cloudinary.com/dv6p7mprd/image/upload/v1752089044/woman-doctor-wearing-lab-coat-with-stethoscope-isolated_zjj9tq.jpg" 
                            alt="A doctor in a lab coat" 
                            className="w-full h-64 lg:h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-end p-8">
                            <div>
                                <h2 className="text-3xl font-bold text-white">Join Our Community</h2>
                                <p className="text-white/80 mt-2">Create an account to register for camps, view your history, and be part of our mission to spread wellness.</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Sign-Up Form */}
                    <div className="w-full lg:w-1/2 bg-gradient-to-br from-[#e5f2fa] to-transparent p-8 sm:p-12 flex flex-col justify-center">
                        <div className="w-full">
                            <h2 className="text-3xl font-bold text-slate-800 mb-2">Create an Account</h2>
                            <p className="text-slate-600 mb-8">It's free and only takes a minute.</p>

                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="space-y-5">
                                    
                                    {/* Full Name Input */}
                                    <div>
                                        <label htmlFor="full-name" className="block text-sm font-medium text-slate-700">Full Name</label>
                                        <div className="mt-1 relative rounded-md shadow-sm">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zM10 11a6 6 0 00-6 6v1a1 1 0 001 1h10a1 1 0 001-1v-1a6 6 0 00-6-6z" /></svg>
                                            </div>
                                            <input
                                                type="text"
                                                id="full-name"
                                                {...register("name", { required: "Name is required" })}
                                                className="block w-full rounded-lg border-slate-300 pl-10 py-3 focus:border-[#1e74d2] focus:ring-[#1e74d2]"
                                                placeholder="Your full name"
                                            />
                                        </div>
                                        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
                                    </div>

                                    {/* Email Input */}
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
                                        <div className="mt-1 relative rounded-md shadow-sm">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                                            </div>
                                            <input
                                                type="email"
                                                id="email"
                                                {...register("email", { 
                                                    required: "Email is required",
                                                    pattern: {
                                                        value: /^\S+@\S+$/i,
                                                        message: "Entered value does not match email format"
                                                    } 
                                                })}
                                                className="block w-full rounded-lg border-slate-300 pl-10 py-3 focus:border-[#1e74d2] focus:ring-[#1e74d2]"
                                                placeholder="you@example.com"
                                            />
                                        </div>
                                        {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
                                    </div>

                                    {/* Password Input */}
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
                                        <div className="mt-1 relative rounded-md shadow-sm">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" /></svg>
                                            </div>
                                            <input
                                                type="password"
                                                id="password"
                                                {...register("password", {
                                                    required: "Password is required",
                                                    minLength: { value: 6, message: "Password must be at least 6 characters" },
                                                    pattern: {
                                                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                                                        message: "Password must include uppercase, lowercase, and a number"
                                                    }
                                                })}
                                                className="block w-full rounded-lg border-slate-300 pl-10 py-3 focus:border-[#1e74d2] focus:ring-[#1e74d2]"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
                                    </div>
                                    
                                    {/* Confirm Password Input */}
                                    <div>
                                        <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700">Confirm Password</label>
                                        <div className="mt-1 relative rounded-md shadow-sm">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                 <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" /></svg>
                                            </div>
                                            <input
                                                type="password"
                                                id="confirm-password"
                                                {...register("confirmPassword", {
                                                    required: "Please confirm your password",
                                                    validate: value =>
                                                        value === password || "Passwords do not match"
                                                })}
                                                className="block w-full rounded-lg border-slate-300 pl-10 py-3 focus:border-[#1e74d2] focus:ring-[#1e74d2]"
                                                placeholder="Confirm your password"
                                            />
                                        </div>
                                        {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
                                    </div>

                                    {/* Submit Button */}
                                    <div>
                                        <button
                                            type='submit'
                                            className="flex w-full justify-center cursor-pointer rounded-lg bg-[#1e74d2] py-3 px-4 text-lg font-semibold text-white shadow-sm hover:bg-[#185dab] focus:outline-none focus:ring-2 focus:ring-[#1e74d2] focus:ring-offset-2 transition-all duration-300 transform hover:scale-105"
                                        >
                                            Create Account
                                        </button>
                                    </div>
                                </div>
                            </form>

                            {/* "OR" Divider */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-slate-300" /></div>
                                <div className="relative flex justify-center text-sm"><span className="bg-white rounded-full px-2 text-slate-500">OR</span></div>
                            </div>

                            {/* Google Sign-Up Button */}
                            <div>
                                <button onClick={handleGoogleSignIn} type="button" className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white py-3 px-4 text-center font-semibold text-slate-800 shadow-sm hover:bg-slate-50 transition-all">
                                    <svg className="h-6 w-6" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_17_80)"><path d="M47.532 24.552c0-1.566-.14-3.084-.405-4.548h-23.01v8.59h13.01c-.563 2.76-2.156 5.17-4.64 6.813v5.56h7.15c4.188-3.858 6.59-9.522 6.59-16.415z" fill="#4285F4"/><path d="M24.117 48c6.494 0 11.97-2.145 15.96-5.81l-7.15-5.56c-2.156 1.452-4.918 2.31-8.81 2.31-6.765 0-12.5-4.55-14.54-10.61H2.227v5.733c4.253 8.41 12.87 13.937 21.89 13.937z" fill="#34A853"/><path d="M9.577 28.39c-.507-1.52-.79-3.13-.79-4.8s.283-3.28.79-4.8V13.06H2.227c-1.526 3.01-2.38 6.39-2.38 9.94s.854 6.93 2.38 9.94l7.35-5.75z" fill="#FBBC05"/><path d="M24.117 9.183c3.52 0 6.726 1.22 9.22 3.62l6.34-6.338C36.087 2.662 30.61 0 24.117 0 15.097 0 6.47 5.527 2.227 13.937l7.35 5.75c2.04-6.06 7.775-10.61 14.54-10.61z" fill="#EA4335"/></g><defs><clipPath id="clip0_17_80"><path fill="#fff" d="M0 0h48v48H0z"/></clipPath></defs></svg>
                                    <span>Sign up with Google</span>
                                </button>
                            </div>

                            <p className="mt-8 text-center text-sm text-slate-500">
                                Already a member?{' '}
                                <Link to="/SignIn" className="font-semibold leading-6 text-[#1e74d2] hover:text-[#185dab]">
                                    Sign in here
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;