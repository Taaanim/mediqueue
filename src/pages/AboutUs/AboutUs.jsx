import React from 'react';
import { Link } from 'react-router';

const AboutUs = () => {
  const departments = [
    { title: 'Cardiology & Heart Care', icon: '❤️', count: '6 Doctors', desc: 'Comprehensive cardiac evaluations, ECG, echocardiography, and preventive heart care.' },
    { title: 'Ophthalmology & Eye Care', icon: '👁️', count: '4 Doctors', desc: 'Advanced vision testing, corneal treatments, cataract screening, and optical care.' },
    { title: 'Pediatrics & Child Health', icon: '👶', count: '5 Doctors', desc: 'Specialized neonatal care, child growth monitoring, vaccinations, and pediatric medicine.' },
    { title: 'Orthopedics & Bone Health', icon: '🦴', count: '5 Doctors', desc: 'Joint reconstruction, fracture management, spinal care, and physical rehabilitation.' },
    { title: 'Neurology & Brain Center', icon: '🧠', count: '4 Doctors', desc: 'Specialized neuro-diagnostic evaluations, headache clinics, and stroke prevention.' },
    { title: 'Dentistry & Oral Surgery', icon: '🦷', count: '4 Doctors', desc: 'Restorative dental surgery, cosmetic smiles, root canals, and oral hygiene.' },
    { title: 'General Medicine & OPD', icon: '🩺', count: '8 Doctors', desc: 'Primary health consultations, chronic disease management, and general diagnoses.' },
    { title: '24/7 Emergency Care', icon: '🚑', count: 'Always Open', desc: 'Round-the-clock emergency trauma response, critical triage, and ambulance services.' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen font-sans pb-24">
      {/* HERO SECTION - Soft Blue Theme */}
      <div className="bg-gradient-to-br from-[#e5f2fa] to-[#a7d4f9] py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="inline-block bg-[#1e74d2]/10 text-[#1e74d2] font-semibold px-4 py-1.5 rounded-full text-sm mb-4">
            Smart Healthcare & OPD Queue Solution
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 poppins">
            About MediQueue Central Hospital
          </h1>
          <p className="text-slate-600 inter mt-4 text-lg max-w-2xl mx-auto">
            Delivering world-class healthcare with state-of-the-art digital queue management. Eliminating long hospital waiting lines and providing transparent, patient-first outpatient care.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Link to="/Doctors" className="bg-[#1e74d2] hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl shadow-md transition-all transform hover:scale-105">
              Browse Doctors
            </Link>
            <Link to="/Contact" className="bg-white text-slate-700 hover:bg-slate-100 font-semibold px-8 py-3 rounded-xl border border-slate-300 transition-all shadow-sm">
              Contact Desk
            </Link>
          </div>
        </div>
      </div>

      {/* ABOUT HOSPITAL OVERVIEW */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-[#1e74d2] font-extrabold text-sm uppercase tracking-wider">About Our Institution</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 poppins mt-2">
              Transforming Hospital OPD Care Through Innovation
            </h2>
            <p className="text-slate-600 inter mt-4 leading-relaxed">
              MediQueue Central Hospital is a premier multi-specialty healthcare institution dedicated to patient comfort and medical excellence. Founded with a vision to eliminate patient suffering caused by overcrowded waiting rooms, we pioneered the Smart OPD Live Token System.
            </p>
            <p className="text-slate-600 inter mt-4 leading-relaxed">
              Our facilities house over 40 board-certified senior doctors across 8 specialized clinical departments. With real-time token tracking, automated consultation estimates, and emergency priority routing, we ensure every patient receives dignity, speed, and care.
            </p>

            <div className="grid grid-cols-2 gap-6 mt-8">
              <div className="border-l-4 border-[#1e74d2] pl-4">
                <h4 className="font-bold text-slate-800 text-lg poppins">Patient-First Care</h4>
                <p className="text-slate-500 text-sm mt-1 inter">Zero unnecessary waiting hours with live position tracking.</p>
              </div>
              <div className="border-l-4 border-[#1e74d2] pl-4">
                <h4 className="font-bold text-slate-800 text-lg poppins">Expert Specialists</h4>
                <p className="text-slate-500 text-sm mt-1 inter">Top-tier doctors and certified medical practitioners.</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800"
                alt="MediQueue Hospital Facility"
                className="w-full h-[420px] object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 hidden sm:block max-w-xs">
              <div className="flex items-center gap-4">
                <div className="bg-[#1e74d2]/10 text-[#1e74d2] p-3 rounded-xl font-bold text-2xl">
                  98%
                </div>
                <div>
                  <h5 className="font-bold text-slate-800 poppins">Satisfaction</h5>
                  <p className="text-xs text-slate-500 inter">Based on over 50,000 OPD patient consultations.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HOSPITAL DEPARTMENTS & SERVICES */}
      <div className="bg-white py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-[#1e74d2] font-extrabold text-sm uppercase tracking-wider">Clinical Departments</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 poppins mt-2">
              Comprehensive Medical Services
            </h2>
            <p className="text-slate-600 inter mt-3 text-base">
              Our hospital features specialized departments equipped with modern diagnostic technologies and experienced medical staff.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {departments.map((dept, idx) => (
              <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 hover:border-[#1e74d2] hover:shadow-lg transition-all group">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{dept.icon}</div>
                <span className="text-xs font-bold text-[#1e74d2] bg-blue-50 px-2.5 py-1 rounded-full">{dept.count}</span>
                <h3 className="font-bold text-slate-800 text-lg poppins mt-3 mb-2">{dept.title}</h3>
                <p className="text-slate-500 text-sm inter leading-relaxed">{dept.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* STATISTICS COUNTER - Light Soft Blue Theme */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="bg-gradient-to-r from-[#e5f2fa] via-[#d0e6f9] to-[#e5f2fa] rounded-3xl p-10 border border-blue-200 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl sm:text-5xl font-extrabold text-[#1e74d2] poppins">50,000+</p>
              <p className="text-slate-700 text-sm mt-2 inter font-semibold">OPD Tokens Issued</p>
            </div>
            <div>
              <p className="text-4xl sm:text-5xl font-extrabold text-[#1e74d2] poppins">40+</p>
              <p className="text-slate-700 text-sm mt-2 inter font-semibold">Specialist Doctors</p>
            </div>
            <div>
              <p className="text-4xl sm:text-5xl font-extrabold text-[#1e74d2] poppins">15+</p>
              <p className="text-slate-700 text-sm mt-2 inter font-semibold">Modern Chambers</p>
            </div>
            <div>
              <p className="text-4xl sm:text-5xl font-extrabold text-[#1e74d2] poppins">24/7</p>
              <p className="text-slate-700 text-sm mt-2 inter font-semibold">Emergency Response</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
