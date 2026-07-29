import React from 'react';
import { FaHandHoldingMedical } from 'react-icons/fa';
import { Link } from 'react-router';

const Footer = () => {
    return (
        <div>
            <footer className="relative bg-[#a7d4f9] pt-32">
                
                
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="flex items-center justify-center h-32 w-32 bg-white rounded-full shadow-2xl">
                    <div className="flex flex-col items-center justify-center h-28 w-28 bg-[#1e74d2] text-white rounded-full">
                        <img 
                        className='w-12'
                        src="https://res.cloudinary.com/dv6p7mprd/image/upload/v1752010021/ChatGPT_Image_Jul_8__2025__03_05_06_AM-removebg-preview_nbdpj2.png" alt="" />
                        {/* <FaHandHoldingMedical className='text-white text-2xl' /> */}
                        <span className="mt-1 font-bold text-md poppins">MediCamp</span>
                    </div>
                    </div>
                </div>

                <div className="w-11/12 mx-auto px-8 pb-12 grid gap-12 text-white md:grid-cols-2 lg:grid-cols-4">
                    
                    <div className="md:col-span-2 lg:col-span-1">
                    <h3 className="text-xl font-bold text-slate-800 poppins">About MediCamp</h3>
                    <p className="mt-4 text-slate-700 leading-relaxed">
                        A non-profit organization dedicated to providing free, high-quality healthcare to underserved communities in Bagerhat and beyond through mobile medical camps.
                    </p>
                    </div>

                    <div>
                    <h3 className="text-xl font-bold text-slate-800 poppins">Quick Links</h3>
                    <ul className="mt-4 space-y-2 text-slate-700">
                        {/* <li><a href="#" className="hover:text-[#1e74d2] transition-colors">About Us</a></li> */}
                        <li><Link to='/AvailableCamps' className="hover:text-[#1e74d2] transition-colors">Our Camps</Link></li>
                        <li><a href="#feedbacks" className="hover:text-[#1e74d2] transition-colors">Feedback</a></li>
                        {/* <li><a href="#" className="hover:text-[#1e74d2] transition-colors">Contact</a></li> */}
                    </ul>
                    </div>

                    <div>
                    <h3 className="text-xl font-bold text-slate-800 poppins">Contact Us</h3>
                    <ul className="mt-4 space-y-3 text-slate-700">
                        <li className="flex items-start">
                        
                        <span>Bagerhat Sadar, Khulna Division, Bangladesh</span>
                        </li>
                        <li className="flex items-center">
                        
                        <a href="mailto:info@prohealth.org" className="hover:text-[#1e74d2]">info@medicamp.org</a>
                        </li>
                        <li className="flex items-center">
                        
                        <a href="tel:+8801234567890" className="hover:text-[#1e74d2]">+880 123 456 7890</a>
                        </li>
                    </ul>
                    </div>

                    <div>
                    <h3 className="text-xl font-bold text-slate-800 poppins">Get Involved</h3>
                    <p className="mt-4 text-slate-700">Your support helps us reach more people in need.</p>
                    <a href="#" className="inline-block mt-4 px-6 py-3 bg-[#1e74d2] text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition-colors">
                        Donate Now
                    </a>
                    </div>

                </div>

                <div className="bg-[#94c8f7] py-4">
                    <div className="max-w-7xl mx-auto px-8 flex flex-col sm:flex-row justify-between items-center text-sm text-slate-800">
                    <p>&copy; 2025 MediCamp. All Rights Reserved.</p>
                    <div className="mt-2 sm:mt-0 flex space-x-4">
                        <a href="#" className="hover:underline">Privacy Policy</a>
                        <a href="#" className="hover:underline">Terms of Service</a>
                    </div>
                    </div>
                </div>
                </footer>

        </div>
    );
};

export default Footer;