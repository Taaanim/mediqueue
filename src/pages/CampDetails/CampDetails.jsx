import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import useAuth from '../../hooks/useAuth/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure/useAxiosSecure';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';
import Swal from 'sweetalert2';

const CampDetails = () => {
    const { id } = useParams()
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: camp = [], isLoading, isError } = useQuery({
        queryKey: ['Camp'],
        queryFn: async () => {
        const res = await axiosSecure.get(`/camps/${id}`);
        return res.data;
        }
    }); 

     const {
        register,
        handleSubmit,
        reset,
    } = useForm()
    
    const handleFormSubmit = async (data) => {
        const joinCampData = {
            ...data,
            campId: camp._id,
            isPayment_pending: true,
            isPayment_confirmed: false,
            isAdmin_approved: false,
            isAdmin_cancel: false,
        };

        try {
            const { data: participants } = await axiosSecure.get(`/participants/email/${user.email}`);
            const alreadyJoined = participants?.some(participant => participant.campId === camp._id);
            
            
            
            if (alreadyJoined) {
            Swal.fire({
                icon: "warning",
                title: "Already Joined",
                text: "You have already joined this camp.",
                confirmButtonColor: "#1e74d2"
            });
            return; 
            }

            const res = await axiosSecure.post('/participants', joinCampData);
            if (res.data.insertedId) {
                await axiosSecure.patch(`/camps/participantCount/${camp._id}`);
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Joined camp successfully!",
                showConfirmButton: false,
                timer: 1500
            });
            reset();
            }
        } catch (error) {
            console.error('Submission failed:', error);
            Swal.fire({
            icon: "error",
            confirmButtonColor: "#00A79D",
            title: "Oops...",
            text: "Error: While joining the camp!",
            });
        } finally {
            setIsModalOpen(false);
            reset();
        }
        };


    if (isLoading) {
        return (
        <div className="h-screen flex justify-center items-center text-lg font-medium text-gray-600">
            Loading overview...
        </div>
        );
    }

    if (isError) {
        return (
        <div className="h-screen flex justify-center items-center text-red-500">
            Failed to load overview data.
        </div>
        );
    }
// console.log();

    return (
        <main className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 mb-32">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-12">

                {/* Left Column: Info At a Glance */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Camp Image */}
                    <div className="rounded-2xl shadow-2xl overflow-hidden aspect-w-1 aspect-h-1">
                        <img className="w-full h-full object-cover" src={camp.imageUrl} />
                    </div>

                    {/* Details Card */}
                    <div className="bg-gradient-to-br from-[#e5f2fa] to-transparent backdrop-blur-sm rounded-2xl shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-slate-800 poppins border-b pb-3 mb-4">Camp Details</h2>
                        <ul className="space-y-4 text-slate-700">
                            <li className="flex items-start">
                                <div>
                                    <span className="font-semibold text-slate-800">Date</span><br />
                                    {camp.date}
                                </div>
                            </li>
                            <li className="flex items-start">
                                <div>
                                    <span className="font-semibold text-slate-800">Time</span><br />
                                    {camp.time}
                                </div>
                            </li>
                            <li className="flex items-start">
                                <div>
                                    <span className="font-semibold text-slate-800">Location</span><br />
                                    {camp.location}
                                </div>
                            </li>
                            <li className="flex items-start">
                                <div>
                                    <span className="font-semibold text-slate-800">Camp Fees</span><br />
                                    $ {camp.fees}
                                </div>
                            </li>
                            {/* <li className="flex items-start">
                                <div>
                                    <span className="font-semibold text-slate-800">Available Slots</span><br />
                                    Over 300+ slots available
                                </div>
                            </li> */}
                        </ul>
                    </div>
                </div>
                
                {/* Right Column: Main Content */}
                <div className="lg:col-span-2">
                    <div className="bg-gradient-to-br from-[#e5f2fa] to-transparent backdrop-blur-sm rounded-2xl shadow-lg p-8 sm:p-12">
                        {/* Camp Name */}
                        <h1 className="text-4xl lg:text-5xl font-bold text-slate-800 poppins leading-tight">
                            {camp.name}
                        </h1>

                        {/* Lead Professional */}
                        <div className="mt-6 flex items-center space-x-4 border-t border-b border-slate-200 py-4">
                            {/* <img className="h-16 w-16 rounded-full object-cover" src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2070" alt="Portrait of Dr. Ibrahim Chowdhury" /> */}
                            <div>
                                <p className="text-sm text-slate-500">Lead Healthcare Professional</p>
                                <p className="text-xl font-bold text-[#1e74d2]">{camp.professionalName}</p>
                                <p className="text-sm text-slate-600">MBBS, MD (Internal Medicine)</p>
                            </div>
                        </div>

                        {/* Description Section */}
                        <div className="mt-8 prose prose-lg max-w-none text-slate-600">
                            <h2 className="text-slate-800">About this Camp</h2>
                            <p>{camp.description}</p>
                        </div>
                        
                        {/* Join Camp Button */}
                        <div className="mt-10">
                            <button 
                                onClick={() => setIsModalOpen(true)}
                                className="inline-block w-full sm:w-auto text-center px-10 py-4 bg-[#1e74d2] text-white font-bold text-lg rounded-xl shadow-lg hover:bg-[#185dab] cursor-pointer transition-all duration-300 transform hover:scale-105"
                            >
                                Join Camp
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- REGISTRATION MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-opacity-60 backdrop-blur-sm px-4 py-12 sm:px-6">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 ease-in-out max-h-screen overflow-y-auto">
                        <div className="p-6 sm:p-8">
                        {/* Modal Header */}
                        <div className="flex justify-between items-start">
                            <div>
                            <h2 className="text-2xl font-bold text-slate-800">Register for Camp</h2>
                            <p className="text-slate-500 mt-1">Confirm your details to secure your spot.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
                        </div>

                        {/* Registration Form */}
                        <form onSubmit={handleSubmit(handleFormSubmit)} className="mt-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Read-only fields */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Camp Name</label>
                                <input type="text" readOnly {...register("camp_name")} value={camp.name} className="mt-1 block w-full bg-slate-100 border-slate-300 rounded-md shadow-sm p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Camp Fees</label>
                                <input type="text" readOnly {...register("camp_fee")} value={camp.fees} className="mt-1 block w-full bg-slate-100 border-slate-300 rounded-md shadow-sm p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Location</label>
                                <input type="text" readOnly {...register("location")} value={camp.location} className="mt-1 block w-full bg-slate-100 border-slate-300 rounded-md shadow-sm p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Healthcare Professional</label>
                                <input type="text" readOnly {...register("healthcare_professional")} value={camp.professionalName} className="mt-1 block w-full bg-slate-100 border-slate-300 rounded-md shadow-sm p-2" />
                            </div>

                            {/* Participant info */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Participant Name</label>
                                <input type="text" readOnly {...register("participant_name")} value={user.displayName} className="mt-1 block w-full bg-slate-100 border-slate-300 rounded-md shadow-sm p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Participant Email</label>
                                <input type="email" readOnly {...register("participant_email")} value={user.email} className="mt-1 block w-full bg-slate-100 border-slate-300 rounded-md shadow-sm p-2" />
                            </div>

                            {/* Editable fields */}
                            <div>
                                <label htmlFor="age" className="block text-sm font-medium text-slate-700">Age</label>
                                <input type="number" id="age" required {...register("age")} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2 focus:border-[#1e74d2] focus:ring-[#1e74d2]" />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Phone Number</label>
                                <input type="number" id="phone" required {...register("phone_number")} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2 focus:border-[#1e74d2] focus:ring-[#1e74d2]" />
                            </div>
                            <div>
                                <label htmlFor="gender" className="block text-sm font-medium text-slate-700">Gender</label>
                                <select id="gender" required {...register("gender")} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2 focus:border-[#1e74d2] focus:ring-[#1e74d2]">
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="emergency-contact" className="block text-sm font-medium text-slate-700">Emergency Contact</label>
                                <input type="number" id="emergency-contact" required {...register("emergency_contact")} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2 focus:border-[#1e74d2] focus:ring-[#1e74d2]" />
                            </div>
                            </div>

                            <div className="pt-6  flex flex-col sm:flex-row justify-end sm:space-x-4 space-y-3 sm:space-y-0">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="w-full cursor-pointer sm:w-auto px-6 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200">Cancel</button>
                            <button type="submit" className="w-full sm:w-auto px-6 py-2 text-sm font-medium text-white bg-[#1e74d2] rounded-lg hover:bg-[#185dab] cursor-pointer shadow-sm">Confirm Registration</button>
                            </div>
                        </form>
                        </div>
                    </div>
                    </div>

            )}
        </main>
    );
};

export default CampDetails;