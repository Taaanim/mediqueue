import React, { useState } from 'react';
import { toast, Bounce } from 'react-toastify';

const Contact = () => {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    department: 'General OPD',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      return toast.warning('Please fill in your name, email, and message.');
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Thank you! Your message has been sent to MediQueue Hospital Administration.', {
        position: 'top-right',
        autoClose: 4000,
        theme: 'colored',
        transition: Bounce
      });
      setContactForm({
        name: '',
        email: '',
        phone: '',
        subject: 'General Inquiry',
        department: 'General OPD',
        message: ''
      });
    }, 1000);
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans pb-24">
      {/* Hero Section - Matching Soft Blue Theme */}
      <div className="bg-gradient-to-br from-[#e5f2fa] to-[#a7d4f9] py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="inline-block bg-[#1e74d2]/10 text-[#1e74d2] font-semibold px-4 py-1.5 rounded-full text-sm mb-4">
            24/7 Support & Hospital Desk
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 poppins">
            Contact MediQueue Hospital
          </h1>
          <p className="text-slate-600 inter mt-4 text-lg max-w-2xl mx-auto">
            Have inquiries regarding OPD doctor schedules, queue tokens, or emergency care? Reach out to our hospital administration team anytime.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Contact Info Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200/80 flex items-start gap-4 hover:shadow-lg transition-all">
              <div className="bg-[#e5f2fa] text-[#1e74d2] p-3.5 rounded-2xl text-2xl shrink-0">📍</div>
              <div>
                <h4 className="font-bold text-slate-800 poppins">Hospital Address</h4>
                <p className="text-slate-600 text-sm mt-1 inter leading-relaxed">
                  122 Healthcare Boulevard, Medical Zone, Green Road, Dhaka - 1205
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200/80 flex items-start gap-4 hover:shadow-lg transition-all">
              <div className="bg-[#e5f2fa] text-[#1e74d2] p-3.5 rounded-2xl text-2xl shrink-0">📞</div>
              <div>
                <h4 className="font-bold text-slate-800 poppins">Phone & Emergency Hotline</h4>
                <p className="text-slate-600 text-sm mt-1 inter">
                  Emergency 24/7: <span className="font-bold text-red-600">+880 9611-999000</span>
                </p>
                <p className="text-slate-600 text-sm inter">OPD Reception: +880 2-88112233</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200/80 flex items-start gap-4 hover:shadow-lg transition-all">
              <div className="bg-[#e5f2fa] text-[#1e74d2] p-3.5 rounded-2xl text-2xl shrink-0">⏰</div>
              <div>
                <h4 className="font-bold text-slate-800 poppins">OPD Hours & Schedule</h4>
                <p className="text-slate-600 text-sm mt-1 inter">Saturday - Thursday: 8:00 AM - 10:00 PM</p>
                <p className="text-slate-600 text-sm inter">Friday: Emergency & Critical Care Only</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200/80 flex items-start gap-4 hover:shadow-lg transition-all">
              <div className="bg-[#e5f2fa] text-[#1e74d2] p-3.5 rounded-2xl text-2xl shrink-0">✉️</div>
              <div>
                <h4 className="font-bold text-slate-800 poppins">Official Email</h4>
                <p className="text-slate-600 text-sm mt-1 inter">info@mediqueue-hospital.org</p>
                <p className="text-slate-600 text-sm inter">support@mediqueue-hospital.org</p>
              </div>
            </div>
          </div>

          {/* Interactive Inquiry Form */}
          <div className="lg:col-span-7 bg-white p-8 rounded-3xl shadow-xl border border-slate-200/80">
            <h3 className="text-2xl font-bold text-slate-800 poppins mb-2">Send Us an Inquiry</h3>
            <p className="text-slate-500 text-sm inter mb-6">Fill out the form below and our hospital support team will get back to you promptly.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1e74d2] focus:border-[#1e74d2]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1e74d2] focus:border-[#1e74d2]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+880 1700-000000"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1e74d2] focus:border-[#1e74d2]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Department</label>
                  <select
                    value={contactForm.department}
                    onChange={(e) => setContactForm({ ...contactForm, department: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1e74d2] focus:border-[#1e74d2] bg-white"
                  >
                    <option value="General OPD">General OPD</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Ophthalmology">Ophthalmology</option>
                    <option value="Dentistry">Dentistry</option>
                    <option value="Emergency">Emergency Care</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="Query regarding doctor consultation..."
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1e74d2] focus:border-[#1e74d2]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Message</label>
                <textarea
                  rows="4"
                  required
                  placeholder="How can we help you today?"
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1e74d2] focus:border-[#1e74d2]"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#1e74d2] hover:bg-blue-700 text-white font-bold text-base rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Sending Message...' : 'Send Message to Hospital'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
