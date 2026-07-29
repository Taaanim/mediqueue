import React from 'react';

const ApproachToCare = () => {
    return (
        <div>
            <section className=" py-20 px-4 sm:px-6 lg:px-8 mb-32">
                    <div className="w-11/12 mx-auto">

                        <div className="text-center">
                        <h2 className="text-4xl poppins font-bold text-slate-800 tracking-tight">
                            Our Approach to Care
                        </h2>
                        <p className="mt-4 text-lg max-w-3xl mx-auto text-slate-600">
                            We believe in a thoughtful and sustainable approach. Here is a transparent look into our 3-step process for creating a lasting impact in the communities we serve.
                        </p>
                        </div>

                        <div className="relative mt-20">

                        <div aria-hidden="true" className="hidden lg:block absolute top-1/2 left-0 w-full h-px -translate-y-1/2">
                            <div className="w-full h-full border-t-2 border-dashed border-blue-300"></div>
                        </div>

                        <div className="relative grid gap-12 lg:grid-cols-3 lg:gap-8">

                            <div className="relative text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg">
                            <div className="flex items-center justify-center mx-auto h-16 w-16 rounded-full bg-[#1e74d2] text-white shadow-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                </svg>
                            </div>
                            <h3 className="mt-6 text-2xl poppins font-bold text-slate-800">
                                <span className="text-[#1e74d2]">01.</span> Community Planning
                            </h3>
                            <p className="mt-4 text-slate-600">
                                Before every camp, we collaborate with local leaders in Bagerhat to identify the most pressing health needs. This ensures our services are targeted, relevant, and respectful of the community.
                            </p>
                            </div>

                            <div className="relative text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg">
                            <div className="flex items-center justify-center mx-auto h-16 w-16 rounded-full bg-[#1e74d2] text-white shadow-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h3 className="mt-6 text-2xl poppins font-bold text-slate-800">
                                <span className="text-[#1e74d2]">02.</span> Compassionate Care
                            </h3>
                            <p className="mt-4 text-slate-600">
                                On the day of the camp, our team of dedicated healthcare professionals provides free consultations, diagnostics, and essential medicines in a safe and welcoming environment.
                            </p>
                            </div>

                            <div className="relative text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg">
                            <div className="flex items-center justify-center mx-auto h-16 w-16 rounded-full bg-[#1e74d2] text-white shadow-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                                </svg>
                            </div>
                            <h3 className="mt-6 text-2xl poppins font-bold text-slate-800">
                                <span className="text-[#1e74d2]">03.</span> Impact & Follow-up
                            </h3>
                            <p className="mt-4 text-slate-600">
                                Our work doesn't end with the camp. We provide referrals for critical cases and analyze data to measure our impact, continuously improving our approach for future events.
                            </p>
                            </div>

                        </div>
                        </div>
                    </div>
                    </section>

        </div>
    );
};

export default ApproachToCare;