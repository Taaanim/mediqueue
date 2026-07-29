import React, { useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Star, MessageSquareQuote } from 'lucide-react';
import useAxiosSecure from '../../hooks/useAxiosSecure/useAxiosSecure'; 


const StarRating = ({ rating, className = 'h-6 w-6' }) => {
    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={`${className} transition-colors ${i < rating ? 'text-amber-400' : 'text-slate-300'}`}
                    fill={i < rating ? 'currentColor' : 'none'}
                />
            ))}
        </div>
    );
};

const FeedbackAndRatings = () => {
    const axiosSecure = useAxiosSecure();
    const { data: allFeedback = [], isLoading } = useQuery({
        queryKey: ['allFeedback'],
        queryFn: async () => {
            const res = await axiosSecure.get('/feedbacks');
            return res.data;
        },
    });

    const [selectedFeedback, setSelectedFeedback] = useState(null);

    useEffect(() => {
        if (allFeedback.length > 0) {
            setSelectedFeedback(allFeedback[0]);
        }
    }, [allFeedback]);

    const { averageRating, totalReviews } = useMemo(() => {
        if (!allFeedback || allFeedback.length === 0) {
            return { averageRating: 0, totalReviews: 0 };
        }
        const totalRating = allFeedback.reduce((sum, item) => sum + item.rating, 0);
        return {
            averageRating: (totalRating / allFeedback.length).toFixed(1),
            totalReviews: allFeedback.length,
        };
    }, [allFeedback]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><span className="loading loading-spinner loading-lg text-indigo-600"></span></div>;
    }

    if (allFeedback.length === 0) {
        return (
            <section className="bg-slate-50 py-20 text-center">
                <h2 className="text-2xl font-bold text-slate-700">No Feedback Yet</h2>
                <p className="text-slate-500 mt-2">Check back later to see what participants are saying!</p>
            </section>
        );
    }
    
    return (
        <section id='feedbacks' className="bg-gradient-to-br from-[#e5f2fa] to-slate-50 py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* --- Dynamic Header --- */}
                <div className="text-center">
                    <h2 className="text-4xl font-bold text-slate-800 tracking-tight">
                        Voices from Our Community
                    </h2>
                    <p className="mt-4 text-lg max-w-2xl mx-auto text-slate-600">
                        See what people are saying about our recent medical camps and the impact we've made together.
                    </p>
                </div>

                {/* --- Dynamic Overall Rating --- */}
                <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 bg-white/50 backdrop-blur-sm p-8 rounded-2xl max-w-2xl mx-auto shadow-lg">
                    <div className="text-center sm:text-left">
                        <p className="text-5xl font-bold text-[#1e74d2]">{averageRating}</p>
                        <p className="text-slate-600 font-medium">out of 5</p>
                    </div>
                    <div className="w-px h-16 bg-slate-300 hidden sm:block"></div>
                    <div className="text-center sm:text-left">
                        <StarRating rating={Math.round(averageRating)} className="h-8 w-8" />
                        <p className="mt-1 text-sm text-slate-500">Based on {totalReviews} participant reviews</p>
                    </div>
                </div>

                {/* --- Interactive Testimonials Section --- */}
                <div className="mt-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    <div className="lg:col-span-4">
                        <div className="flex flex-col space-y-2">
                            {allFeedback.map((feedback) => (
                                <div
                                    key={feedback._id}
                                    onClick={() => setSelectedFeedback(feedback)}
                                    className={`p-4 rounded-xl transition-all duration-300 cursor-pointer ${selectedFeedback?._id === feedback._id ? 'bg-white shadow-2xl ring-2 ring-white/50' : 'hover:bg-white/70'}`}
                                >
                                    <div className="flex items-center space-x-4">
                                        {/* <img 
                                            className="h-14 w-14 rounded-full object-cover bg-slate-200" 
                                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(feedback.participantName)}&background=random`}
                                            alt={`Photo of ${feedback.participantName}`} 
                                        /> */}
                                        <div>
                                            <p className="font-bold text-slate-800">{feedback.participantName}</p>
                                            <p className="text-sm text-slate-500">{feedback.participantEmail}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Decorative Divider */}
                    <div className="hidden lg:flex lg:col-span-1 h-64 justify-center">
                        <div className="relative w-px h-full bg-blue-200">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-5 h-5 bg-[#1e74d2] border-4 border-white rounded-full shadow-md"></div>
                        </div>
                    </div>

                    {/* 5. Dynamic Selected Feedback Display */}
                    <div className="lg:col-span-7">
                        {selectedFeedback && (
                            <div className="relative animate-fade-in">
                                <MessageSquareQuote className="absolute -top-8 -left-8 w-32 h-32 text-[#1e74d2]/10" strokeWidth={1.5} />
                                <blockquote className="relative text-lg text-slate-700 leading-relaxed italic">
                                    "{selectedFeedback.comment}"
                                </blockquote>
                                <footer className="mt-6">
                                    <StarRating rating={selectedFeedback.rating} />
                                    <p className="font-bold text-slate-800 mt-4">- {selectedFeedback.participantName}</p>
                                    <p className="text-sm text-slate-500">Feedback for "{selectedFeedback.campName}"</p>
                                </footer>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeedbackAndRatings;