import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { CheckCircle, Clock, XCircle, ShieldCheck, UserCheck, ShieldAlert, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import useAxiosSecure from '../../hooks/useAxiosSecure/useAxiosSecure';

const ManageRegisteredCamps = () => {
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');


    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const { data: registrations = [], isLoading, error } = useQuery({
        queryKey: ['allRegistrations'],
        queryFn: async () => {
            const { data } = await axiosSecure.get('/participants');
            return data;
        },
    });

    const filteredRegistrations = useMemo(() => {
        if (!searchTerm) {
            return registrations;
        }
        const lowercasedFilter = searchTerm.toLowerCase();
        return registrations.filter(reg =>
            reg.participant_name.toLowerCase().includes(lowercasedFilter) ||
            reg.participant_email.toLowerCase().includes(lowercasedFilter) ||
            reg.camp_name.toLowerCase().includes(lowercasedFilter)
        );
    }, [searchTerm, registrations]);


    const totalPages = Math.ceil(filteredRegistrations.length / ITEMS_PER_PAGE);


    const paginatedRegistrations = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredRegistrations.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [currentPage, filteredRegistrations]);


    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);



    const { mutate: confirmRegistration, isPending: isConfirming } = useMutation({
        mutationFn: (registrationId) => {
            return axiosSecure.patch(`/registrations/confirm/${registrationId}`);
        },
        onSuccess: () => {
            Swal.fire('Confirmed!', 'The registration has been confirmed.', 'success');
            queryClient.invalidateQueries({ queryKey: ['allRegistrations'] });
        },
        onError: (err) => {
            Swal.fire('Error', `Could not confirm registration: ${err.message}`, 'error');
        }
    });

    const { mutate: cancelRegistration } = useMutation({
        mutationFn: (registrationId) => {
            return axiosSecure.delete(`/participants/delete/${registrationId}`);
        },
        onSuccess: () => {
            Swal.fire('Cancelled!', 'The registration has been removed.', 'success');
            queryClient.invalidateQueries({ queryKey: ['allRegistrations'] });
        },
        onError: (err) => {
            Swal.fire('Error', `Could not cancel registration: ${err.message}`, 'error');
        }
    });

    const handleConfirmClick = (registration) => {
        if (registration.isPayment_confirmed !== true) {
            Swal.fire({
                title: 'Payment Not Confirmed',
                text: 'You can only confirm registrations that have been paid for.',
                icon: 'warning',
                confirmButtonColor: '#3085d6',
            });
            return;
        }
        confirmRegistration(registration._id);
    };

    const handleCancelClick = (registration) => {
        Swal.fire({
            title: 'Are you sure?',
            html: `You are about to cancel the registration for <strong>${registration.participant_name}</strong> in <strong>"${registration.camp_name}"</strong>.`,
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

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><span className="loading loading-spinner loading-lg text-indigo-600"></span></div>;
    }

    if (error) {
        return <div className="text-center text-red-500 my-20 font-semibold text-lg">Error loading data: {error.message}</div>;
    }

    return (
        <div className="bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Manage Registered Camps</h1>
                    <p className="mt-2 text-lg text-slate-500">Oversee and manage all participant registrations.</p>
                </header>

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-slate-200">
                        <div className="relative w-full md:max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name, email, or camp..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-700">
                            <thead className="bg-slate-100 border-b-2 border-slate-200">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-slate-600 uppercase tracking-wider">Participant</th>
                                    <th className="p-4 text-sm font-semibold text-slate-600 uppercase tracking-wider">Camp Details</th>
                                    <th className="p-4 text-sm font-semibold text-slate-600 uppercase tracking-wider">Payment Status</th>
                                    <th className="p-4 text-sm font-semibold text-slate-600 uppercase tracking-wider">Confirmation Status</th>
                                    <th className="p-4 text-center text-sm font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">

                                {paginatedRegistrations.length > 0 ? paginatedRegistrations.map((reg) => (
                                    (reg.isAdmin_cancel === false ? <tr key={reg._id} className="hover:bg-slate-50">
                                        <td className="p-4 font-medium text-slate-900">
                                            <div>{reg.participant_name}</div>
                                            <div className="text-xs text-slate-500">{reg.participant_email}</div>
                                        </td>
                                        <td className="p-4">
                                            <div>{reg.camp_name}</div>
                                            <div className="text-xs text-slate-500 font-semibold">${reg.camp_fee}</div>
                                        </td>
                                        <td className="p-4">
                                            {reg.isPayment_confirmed === true ? (
                                                <div className="flex items-center gap-2 text-green-600 font-semibold">
                                                    <CheckCircle className="w-5 h-5" /> Paid
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-slate-500 font-semibold">
                                                    <Clock className="w-5 h-5" /> Unpaid
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {reg.isPayment_confirmed === true || reg.isAdmin_approved === true ? (
                                                <div className="inline-flex items-center gap-2 text-teal-700 bg-teal-100 px-3 py-1 rounded-full font-semibold">
                                                    <ShieldCheck className="w-5 h-5" /> Confirmed
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleConfirmClick(reg)}
                                                    disabled={isConfirming || reg.isPayment_confirmed !== true}
                                                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all"
                                                >
                                                    <UserCheck className="w-4 h-4" /> Pending
                                                </button>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => handleCancelClick(reg)}
                                                disabled={reg.isPayment_confirmed === true || reg.isAdmin_approved === true}
                                                className="flex items-center justify-center mx-auto gap-2 px-4 py-2 rounded-lg font-semibold text-rose-600 cursor-pointer bg-rose-100 hover:bg-rose-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-all"
                                            >
                                                <XCircle className="w-4 h-4" /> Cancel
                                            </button>
                                        </td>
                                    </tr> : '')
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="text-center p-12 text-slate-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <ShieldAlert className="w-12 h-12 text-slate-300" />
                                                <span className="font-semibold text-lg">{searchTerm ? 'No Matching Registrations' : 'No Registrations Found'}</span>
                                                {searchTerm && <span className="text-sm">Try adjusting your search terms.</span>}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>


                    {totalPages >= 1 && (
                        <div className="p-4 flex items-center justify-center gap-4 border-t border-gray-200">
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
        </div>
    );
};

export default ManageRegisteredCamps;