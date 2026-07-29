import React, { useState, useMemo, useEffect } from 'react'; 
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router'; 
import Swal from 'sweetalert2';
import { 
    CheckCircle, Clock, XCircle, Star, Send, 
    CreditCard, ShieldCheck, MessageSquare, Search, ChevronLeft, ChevronRight 
} from 'lucide-react';

import useAuth from '../../hooks/useAuth/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure/useAxiosSecure';


const FeedbackModal = ({ isOpen, onClose, onSubmit, campName }) => {
  
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    if (!isOpen) return null;

    const handleRating = (rate) => {
        setRating(rate);
    };

    const handleSubmit = () => {
        if (rating === 0) {
            Swal.fire('Rating Required', 'Please select a star rating before submitting.', 'warning');
            return;
        }
        onSubmit({ rating, comment });
        setComment('')
    };

    return (
        <div className="fixed inset-0 bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
                <h3 className="text-2xl font-bold text-slate-800">Provide Feedback for</h3>
                <p className="text-[#1e74d2] font-semibold mb-6">{campName}</p>
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Your Rating</label>
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                            <Star
                                key={star}
                                className={`w-8 h-8 cursor-pointer transition-colors ${rating >= star ? 'text-amber-400' : 'text-slate-300 hover:text-amber-300'}`}
                                onClick={() => handleRating(star)}
                            />
                        ))}
                    </div>
                </div>
                <div className="mb-8">
                    <label htmlFor="comment" className="block text-sm font-semibold text-slate-700 mb-2">Comments (Optional)</label>
                    <textarea
                        id="comment"
                        rows="4"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your experience..."
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e74d2]"
                    ></textarea>
                </div>
                <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="px-6 py-2 cursor-pointer rounded-lg font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200">Cancel</button>
                    <button onClick={handleSubmit} className="px-6 cursor-pointer py-2 rounded-lg font-semibold text-white bg-[#1e74d2] hover:bg-blue-700 flex items-center gap-2">
                        <Send className="w-4 h-4" /> Submit
                    </button>
                </div>
            </div>
        </div>
    );
};


const RegisteredCamps = () => {
    const { user, loading: authLoading } = useAuth();
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [selectedRegistration, setSelectedRegistration] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const ROWS_PER_PAGE = 10;

    const { data: registeredCamps = [], isLoading } = useQuery({
        queryKey: ['registeredCamps', user?.email],
        enabled: !authLoading && !!user?.email,
        queryFn: async () => {
            const { data } = await axiosSecure.get(`/participants/email/${user.email}`);
            return data;
        },
    });


    const filteredCamps = useMemo(() => {
        if (!searchTerm) {
            return registeredCamps;
        }
        return registeredCamps.filter(reg =>
            reg.camp_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [registeredCamps, searchTerm]);
    
    const paginatedCamps = useMemo(() => {
        const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
        const endIndex = startIndex + ROWS_PER_PAGE;
        return filteredCamps.slice(startIndex, endIndex);
    }, [currentPage, filteredCamps]);

    const totalPages = Math.ceil(filteredCamps.length / ROWS_PER_PAGE);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const { mutate: cancelRegistration } = useMutation({
        mutationFn: (registrationId) => axiosSecure.delete(`/participants/delete/${registrationId}`),
        onSuccess: () => {
            Swal.fire('Cancelled!', 'Your registration has been successfully cancelled.', 'success');
            queryClient.invalidateQueries({ queryKey: ['registeredCamps', user?.email] });
        },
        onError: (error) => Swal.fire('Error', `Could not cancel registration: ${error.message}`, 'error')
    });

    const { mutate: submitFeedback } = useMutation({
        mutationFn: (feedbackData) => axiosSecure.post('/feedback', feedbackData),
        onSuccess: () => Swal.fire('Thank You!', 'Your feedback has been submitted successfully.', 'success'),
        onError: (error) => Swal.fire('Error', `Could not submit feedback: ${error.message}`, 'error')
    });
    
    // Handlers remain the same...
    const handleCancelClick = (registration) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to cancel your registration for "${registration.camp_name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, cancel it!'
        }).then((result) => {
            if (result.isConfirmed) {
                cancelRegistration(registration._id);
            }
        });
    };

    const handlePayClick = (registration) => {
        navigate('/PayForRegistration', { state: { registration } });
    };

    const handleFeedbackClick = (registration) => {
        setSelectedRegistration(registration);
        setIsFeedbackModalOpen(true);
    };

    const handleFeedbackSubmit = (feedbackData) => {
        const payload = {
            ...feedbackData,
            campId: selectedRegistration.campId,
            campName: selectedRegistration.camp_name,
            participantName: user?.displayName,
            participantEmail: user?.email,
        };
        submitFeedback(payload);
        setIsFeedbackModalOpen(false);
    };

    if (isLoading || authLoading) {
        return <div className="flex justify-center items-center h-screen"><span className="loading loading-spinner loading-lg text-[#1e74d2]"></span></div>;
    }

    return (
        <div className="bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-800 tracking-tight">My Registered Camps</h1>
                    <p className="mt-2 text-lg text-slate-500">Here is a list of all the camps you have registered for.</p>
                </header>
                
                <div className="mb-6">
                    <div className="relative w-full md:max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by camp name..."
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e74d2] focus:border-[#1e74d2] transition-all"
                        />
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-700">
                            <thead className="bg-slate-100 border-b-2 border-slate-200">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-slate-600 uppercase tracking-wider">Camp Name</th>
                                    <th className="p-4 text-sm font-semibold text-slate-600 uppercase tracking-wider">Camp Fees</th>
                                    <th className="p-4 text-sm font-semibold text-slate-600 uppercase tracking-wider">Payment Status</th>
                                    <th className="p-4 text-sm font-semibold text-slate-600 uppercase tracking-wider">Confirmation Status</th>
                                    <th className="p-4 text-center text-sm font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {/* --- 4. Map over the paginated list --- */}
                                {paginatedCamps.length > 0 ? paginatedCamps.map((reg) => (
                                    <tr key={reg._id} className="hover:bg-slate-50">
                                        <td className="p-4 font-medium text-slate-900">{reg.camp_name}</td>
                                        <td className="p-4">${reg.camp_fee}</td>
                                        <td className="p-4">
                                            {reg.isPayment_confirmed === true ? (
                                                <div className="flex items-center gap-2 text-green-600 font-semibold"><CheckCircle className="w-5 h-5" /> Paid</div>
                                            ) : (
                                                <button onClick={() => handlePayClick(reg)} className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold cursor-pointer text-white bg-[#1e74d2] hover:bg-blue-700 transition-all"><CreditCard className="w-4 h-4" /> Pay</button>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {reg.isPayment_confirmed === true || reg.isAdmin_approved === true ? (
                                                <div className="inline-flex items-center gap-2 text-teal-700 bg-teal-100 px-3 py-1 rounded-full font-semibold"><ShieldCheck className="w-5 h-5" /> Confirmed</div>
                                            ) : (
                                                <div className="inline-flex items-center gap-2 text-amber-700 bg-amber-100 px-3 py-1 rounded-full font-semibold"><Clock className="w-5 h-5" /> Pending</div>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex justify-center items-center gap-3">
                                                {reg.isPayment_confirmed !== true && (<button onClick={() => handleCancelClick(reg)} disabled={reg.isPayment_confirmed === true} className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-rose-600 bg-rose-100 hover:bg-rose-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed">
                                                    <XCircle className="w-4 h-4" /> Cancel
                                                </button>)}
                                                
                                                {reg.isPayment_confirmed === true && (
                                                     <button onClick={() => handleFeedbackClick(reg)} className="flex cursor-pointer items-center gap-2 px-4 py-2 rounded-lg font-semibold text-[#1e74d2] bg-indigo-100 hover:bg-indigo-200">
                                                         <MessageSquare className="w-4 h-4" /> Feedback
                                                     </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="text-center p-8 text-slate-500">
                                            {searchTerm ? 'No camps found matching your search.' : 'You have not registered for any camps yet.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* --- 5. Pagination Controls UI --- */}
                    {totalPages >= 1 && (
                        <div className="p-4 flex items-center justify-center gap-4 border-t border-slate-200">
                            <button
                                onClick={() => setCurrentPage(prev => prev - 1)}
                                disabled={currentPage === 1}
                                className="flex items-center cursor-pointer gap-2 px-4 py-2 rounded-lg font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-4 h-4" /> Previous
                            </button>
                            <span className="text-sm font-semibold text-slate-600">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                disabled={currentPage === totalPages}
                                className="flex items-center cursor-pointer gap-2 px-4 py-2 rounded-lg font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
                            >
                                Next <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <FeedbackModal 
                isOpen={isFeedbackModalOpen}
                onClose={() => setIsFeedbackModalOpen(false)}
                onSubmit={handleFeedbackSubmit}
                campName={selectedRegistration?.camp_name}
            />
        </div>
    );
};

export default RegisteredCamps;