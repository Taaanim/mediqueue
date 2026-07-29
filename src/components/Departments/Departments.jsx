import React from 'react';

const Departments = () => {
    return (
        <div>
            <section className="pb-8 ">
                <div className="">
                    <div className="relative bg-white/70 backdrop-blur-sm overflow-hidden">
                    
                    <div aria-hidden="true" className="absolute inset-x-0 top-0 z-0">
                        <svg className="w-full h-auto text-[#a7d4f9]/50" viewBox="0 0 1440 220" fill="currentColor" preserveAspectRatio="none">
                        <path d="M0,160 C240,100 480,100 720,160 S960,220 1200,160 S1440,100 1440,100 L1440,0 L0,0 Z"></path>
                        </svg>
                    </div>

                    <div className="relative z-10 p-8 sm:p-12">
                        <div className="text-center mb-12">
                        <h2 className="text-4xl poppins font-bold text-slate-800 tracking-tight">
                            Our Core Departments
                        </h2>
                        <p className="mt-3 text-lg max-w-2xl mx-auto text-slate-600">
                            Providing comprehensive care through specialized services.
                        </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">

                        <div className="group flex flex-col items-center justify-center text-center p-6 bg-white/50 rounded-xl shadow-md transition-all duration-300 hover:bg-[#1e74d2] hover:text-white hover:scale-105 hover:shadow-lg text-[#1e74d2]">
                            <div className="w-12 h-12">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" /></svg>
                            </div>
                            <p className="mt-2 font-semibold text-sm">General Medicine</p>
                        </div>
                        
                        <div className="group flex flex-col items-center justify-center text-center p-6 bg-white/50 rounded-xl shadow-md transition-all duration-300 hover:bg-[#1e74d2] hover:text-white hover:scale-105 hover:shadow-lg text-[#1e74d2]">
                            <div className="w-12 h-12">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.952A11.952 11.952 0 0112 10.5c1.294 0 2.56.223 3.741.645A4.002 4.002 0 0112 16.25v-3.375m-8.471-1.064A12.052 12.052 0 0112 10.5c.77 0 1.518.074 2.234.212A4.009 4.009 0 0112 16.25v-4.125m-8.471-1.064c-.184.22-.36.444-.528.672A11.952 11.952 0 003 13.125c0 2.458.732 4.735 2.029 6.577m11.942-8.324a4.009 4.009 0 00-1.518-2.096A11.952 11.952 0 0012 10.5c-1.294 0-2.56.223-3.741.645A4.002 4.002 0 0012 16.25v-3.375" /></svg>
                            </div>
                            <p className="mt-2 font-semibold text-sm">Pediatrics</p>
                        </div>

                        <div className="group flex flex-col items-center justify-center text-center p-6 rounded-xl shadow-lg transition-all duration-300 scale-105 bg-[#1e74d2] text-white">
                            <div className="w-12 h-12">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
                            </div>
                            <p className="mt-2 font-semibold text-sm">Maternal Health</p>
                        </div>
                        
                        <div className="group flex flex-col items-center justify-center text-center p-6 bg-white/50 rounded-xl shadow-md transition-all duration-300 hover:bg-[#1e74d2] hover:text-white hover:scale-105 hover:shadow-lg text-[#1e74d2]">
                            <div className="w-12 h-12">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" /></svg>
                            </div>
                            <p className="mt-2 font-semibold text-sm">Dental Care</p>
                        </div>
                        
                        <div className="group flex flex-col items-center justify-center text-center p-6 bg-white/50 rounded-xl shadow-md transition-all duration-300 hover:bg-[#1e74d2] hover:text-white hover:scale-105 hover:shadow-lg text-[#1e74d2]">
                            <div className="w-12 h-12">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </div>
                            <p className="mt-2 font-semibold text-sm">Eye Care</p>
                        </div>
                        
                        <div className="group flex flex-col items-center justify-center text-center p-6 bg-white/50 rounded-xl shadow-md transition-all duration-300 hover:bg-[#1e74d2] hover:text-white hover:scale-105 hover:shadow-lg text-[#1e74d2]">
                            <div className="w-12 h-12">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <p className="mt-2 font-semibold text-sm">Pharmacy</p>
                        </div>

                        </div>
                    </div>
                    </div>
                </div>
                </section>

        </div>
    );
};

export default Departments;