import React from 'react';
import { Link } from 'react-router'; 
import { useQuery } from '@tanstack/react-query';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import useAxiosSecure from '../../hooks/useAxiosSecure/useAxiosSecure';


const CampCardSkeleton = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
        <div className="w-full h-56 bg-slate-200"></div>
        <div className="p-6">
            <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
            <div className="space-y-3">
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
            </div>
        </div>
        <div className="px-6 pb-6 pt-4 border-t border-slate-100 mt-4 flex justify-between items-center">
            <div className="h-5 bg-slate-200 rounded w-1/3"></div>
            <div className="h-10 bg-slate-200 rounded-lg w-1/4"></div>
        </div>
    </div>
);


const PopularCamps = () => {
    const axiosSecure = useAxiosSecure();


    const { data: popularCamps = [], isLoading, isError, error } = useQuery({
        queryKey: ['popularCamps'],
        queryFn: async () => {
            const res = await axiosSecure.get('/TopCamps');
            return res.data;
        }
    });

    return (
        <div className="bg-slate-50 py-20">
            <div className="text-center pb-12">
                <h1 className="poppins text-4xl font-bold text-slate-800 tracking-tight">Popular Medical Camps</h1>
                <p className="mt-3 text-lg text-slate-500">Join the camps that are making the biggest impact.</p>
            </div>
            <div className="w-11/12 mx-auto">
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
                        {[...Array(6)].map((_, i) => <CampCardSkeleton key={i} />)}
                    </div>
                ) : isError ? (
                    <div className="text-center text-red-500">Error fetching camps: {error.message}</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
                        {popularCamps.map((camp) => (
                            <div
                                key={camp._id} 
                                className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2 group"
                            >
                                <div className="relative">
                                    <img
                                        src={camp.imageUrl}
                                        alt={camp.name}
                                        className="w-full h-56 object-cover"
                                    />
                                    <div className="absolute top-4 right-4 bg-[#e5f2fa] text-[#1e74d2] text-sm font-bold px-4 py-1.5 rounded-full shadow-md">
                                        Fees: {typeof camp.fees === 'number' && camp.fees > 0 ? `$${camp.fees}` : 'Free'}
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h3
                                        className="text-2xl poppins font-bold text-slate-800 mb-4 truncate"
                                        title={camp.name}
                                    >
                                        {camp.name}
                                    </h3>
                                    <div className="space-y-3 text-slate-600">
                                        <div className="flex items-center">
                                            <Calendar className="h-5 w-5 text-[#1e74d2] mr-3" />

                                            <span>{camp.date} at {camp.time}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <MapPin className="h-5 w-5 text-[#1e74d2] mr-3" />
                                            <span>{camp.location}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-6 pb-6 pt-4 border-t border-slate-100 mt-4 flex justify-between items-center">
                                    <div className="flex items-center text-sm text-slate-500 font-medium">
                                        <Users className="h-5 w-5 mr-2" />
                                        <span>{camp.participantCount} Participants</span>
                                    </div>
                                    <Link
                                        to={`/CampDetails/${camp._id}`} 
                                        className="bg-[#1e74d2] text-white font-semibold px-5 py-2.5 rounded-lg transition-all duration-300 ease-in-out hover:bg-[#1e74d299] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
                                    >
                                        Details
                                        <ArrowRight className="h-5 w-5 ml-2 transform transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                

                <div className="mt-16 flex items-center justify-center">
                    <Link to='/AvailableCamps' className="text-lg poppins text-white bg-[#1e74d2] hover:bg-[#1e74d299] rounded-lg py-3 px-8 shadow-lg transition-transform transform hover:scale-105">
                        See All Camps
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PopularCamps;