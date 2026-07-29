import React from 'react';
import { Link, useNavigate } from 'react-router';
import useAuth from '../../hooks/useAuth/useAuth';
import { Bounce, toast } from 'react-toastify';
import { useForm } from 'react-hook-form';

const SignIn = () => {
    const { userSignInWithGoogle, userSignInWithEmailPass } = useAuth()
    const navigate = useNavigate()

     const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm();

    const onSubmit = ({ email, password }) => {
      userSignInWithEmailPass(email, password)
        .then(() => {
          toast.success('Signed in successfully!', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
            transition: Bounce,
          });
          
          let navPath = '/user/dashboard';
          if (email.toLowerCase().includes('admin')) navPath = '/admin/dashboard';
          if (email.toLowerCase().includes('doctor')) navPath = '/doctor/dashboard';

          navigate(location?.state?.from?.pathname || navPath);
        })
        .catch(error => {
          console.log(error);          
          toast.error('Invalid email or password!!', {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
            transition: Bounce,
          });
        });
    };


    const handleGoogleSignIn = () => {
        userSignInWithGoogle()
        .then((result)=>{
            toast.success('Signed in successfully!', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                transition: Bounce,
            });
            navigate(location?.state || '/')
        })
        .catch(error => {
            if (error) {
                toast.error('There was a problem signing in with Google!', {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                    transition: Bounce,
                    })
            }
        })
    }
    
  
  return (
    <div className=" flex items-center justify-center p-4 mt-8 mb-32">
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl flex flex-col lg:flex-row overflow-hidden">
          
          {/* Left Column: Image and Welcome Message */}
          <div className="w-full lg:w-1/2 relative">
            <img 
              src="https://res.cloudinary.com/dv6p7mprd/image/upload/v1752088744/close-up-health-worker_gt09sx.jpg" 
              alt="A smiling healthcare professional with a patient" 
              className="w-full h-64 lg:h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 flex items-end p-8">
              <div>
                <h2 className="text-3xl font-bold text-white">Your Health, Our Mission.</h2>
                <p className="text-white/80 mt-2">Sign in to access your details and manage your participation in our upcoming camps.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Sign-In Form */}
          <div className="w-full lg:w-1/2 bg-gradient-to-br from-[#e5f2fa] to-transparent p-8 sm:p-12 flex flex-col justify-center">
            <div className="w-full">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome Back</h2>
              <p className="text-slate-600 mb-8">Please enter your details to sign in.</p>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-6">
                  
                  {/* Email Input */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                      Email Address
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        name="email"
                        id="email"
                        
                        {...register("email", { required: "Username is required" })}
                        className="block w-full rounded-lg border-slate-300 pl-10 py-3 focus:border-[#1e74d2] focus:ring-[#1e74d2]"
                        placeholder="admin or user"
                      />
                    </div>
                     {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
                  </div>

                  {/* Password Input */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                      Password
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                       <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <input
                        type="password"
                        name="password"
                        id="password"
                        
                         {...register("password", { required: "Password is required" })}
                        className="block w-full rounded-lg border-slate-300 pl-10 py-3 focus:border-[#1e74d2] focus:ring-[#1e74d2]"
                        placeholder="••••••••"
                      />
                    </div>
                     {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
                  </div>

                  {/* Remember Me + Forgot Password */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 rounded border-slate-300 text-[#1e74d2] focus:ring-[#1e74d2]" />
                      <label htmlFor="remember-me" className="ml-2 block text-slate-900">
                        Remember me
                      </label>
                    </div>
                    <a href="#" className="font-medium text-[#1e74d2] hover:text-[#185dab]">
                      Forgot password?
                    </a>
                  </div>

                  {/* Submit Button */}
                  <div>
                    <button                     
                      className="flex w-full justify-center cursor-pointer rounded-lg bg-[#1e74d2] py-3 px-4 text-lg font-semibold text-white shadow-sm hover:bg-[#185dab] focus:outline-none focus:ring-2 focus:ring-[#1e74d2] focus:ring-offset-2 transition-all"
                    >
                      Sign In
                    </button>
                  </div>
                </div>
              </form>
              
              {/* "OR" Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-slate-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white rounded-full px-2 text-slate-500">OR</span>
                </div>
              </div>

              {/* Google Sign-In Button */}
              <div>
                <button onClick={handleGoogleSignIn} type="button" className="flex w-full items-center justify-center gap-3 cursor-pointer rounded-lg border border-slate-300 bg-white py-3 px-4 text-center font-semibold text-slate-800 shadow-sm hover:bg-slate-50 transition-all">
                  <svg className="h-6 w-6" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_17_80)">
                      <path d="M47.532 24.552c0-1.566-.14-3.084-.405-4.548h-23.01v8.59h13.01c-.563 2.76-2.156 5.17-4.64 6.813v5.56h7.15c4.188-3.858 6.59-9.522 6.59-16.415z" fill="#4285F4"/>
                      <path d="M24.117 48c6.494 0 11.97-2.145 15.96-5.81l-7.15-5.56c-2.156 1.452-4.918 2.31-8.81 2.31-6.765 0-12.5-4.55-14.54-10.61H2.227v5.733c4.253 8.41 12.87 13.937 21.89 13.937z" fill="#34A853"/>
                      <path d="M9.577 28.39c-.507-1.52-.79-3.13-.79-4.8s.283-3.28.79-4.8V13.06H2.227c-1.526 3.01-2.38 6.39-2.38 9.94s.854 6.93 2.38 9.94l7.35-5.75z" fill="#FBBC05"/>
                      <path d="M24.117 9.183c3.52 0 6.726 1.22 9.22 3.62l6.34-6.338C36.087 2.662 30.61 0 24.117 0 15.097 0 6.47 5.527 2.227 13.937l7.35 5.75c2.04-6.06 7.775-10.61 14.54-10.61z" fill="#EA4335"/>
                    </g>
                    <defs><clipPath id="clip0_17_80"><path fill="#fff" d="M0 0h48v48H0z"/></clipPath></defs>
                  </svg>
                  <span>Sign in with Google</span>
                </button>
              </div>

              {/* Registration Link */}
              <p className="mt-10 text-center text-sm text-slate-500">
                Don’t have an account?{' '}
                <Link to="/SignUp" className="font-semibold text-[#1e74d2] hover:text-[#185dab]">
                  Register
                </Link>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SignIn;