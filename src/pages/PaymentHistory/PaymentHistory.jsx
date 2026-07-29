import React, { useState, useMemo, useEffect } from 'react'; 
import { useQuery } from '@tanstack/react-query';
import { 
    ChevronDown, ChevronUp, CreditCard, DollarSign, 
    Calendar, Hash, Search, ChevronLeft, ChevronRight 
} from 'lucide-react';

import useAuth from '../../hooks/useAuth/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure/useAxiosSecure';


const SortableHeader = ({ children, columnKey, sortConfig, requestSort }) => {
    const isSorted = sortConfig.key === columnKey;
    const icon = isSorted ? (sortConfig.direction === 'ascending' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />) : null;
    
    return (
        <th onClick={() => requestSort(columnKey)} className="p-4 text-sm font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-200 transition-colors">
            <div className="flex items-center gap-2">
                {children} {icon}
            </div>
        </th>
    );
};


const PaymentHistory = () => {
    const { user, loading: authLoading } = useAuth();
    const axiosSecure = useAxiosSecure();
    const [sortConfig, setSortConfig] = useState({ key: 'paidAt', direction: 'descending' });
    
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ROWS_PER_PAGE = 10;

    const { data: payments = [], isLoading } = useQuery({
        queryKey: ['paymentHistory', user?.email],
        enabled: !authLoading && !!user?.email,
        queryFn: async () => {
            const { data } = await axiosSecure.get(`/participants/email/${user.email}`);
            return data;
        },
    });


    const processedPayments = useMemo(() => {

        const confirmedPayments = payments.filter(p => p.isPayment_confirmed === true);
        const filtered = confirmedPayments.filter(p => 
            p.camp_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        

        let sortableItems = [...filtered];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                let aValue = sortConfig.key === 'paidAt' ? a.data?.paidAt : a[sortConfig.key];
                let bValue = sortConfig.key === 'paidAt' ? b.data?.paidAt : b[sortConfig.key];

                if (sortConfig.key === 'paidAt') {
                    aValue = new Date(aValue);
                    bValue = new Date(bValue);
                }

                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [payments, searchTerm, sortConfig]);


    const paginatedPayments = useMemo(() => {
        const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
        return processedPayments.slice(startIndex, startIndex + ROWS_PER_PAGE);
    }, [currentPage, processedPayments]);

    const totalPages = Math.ceil(processedPayments.length / ROWS_PER_PAGE);


    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    if (isLoading || authLoading) {
        return <div className="flex justify-center items-center h-screen"><span className="loading loading-spinner loading-lg text-indigo-600"></span></div>;
    }

    return (
        <div className="bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Payment History</h1>
                    <p className="mt-2 text-lg text-slate-500">A record of all your completed payments.</p>
                </header>

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

                    <div className="p-6 border-b border-slate-200">
                        <div className="relative w-full md:max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by camp name..."
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
                                    <SortableHeader columnKey="camp_name" sortConfig={sortConfig} requestSort={requestSort}>Camp Name</SortableHeader>
                                    <SortableHeader columnKey="camp_fee" sortConfig={sortConfig} requestSort={requestSort}>Amount Paid</SortableHeader>
                                    <th className="p-4 text-sm font-semibold text-slate-600 uppercase tracking-wider">Transaction ID</th>
                                    <SortableHeader columnKey="paidAt" sortConfig={sortConfig} requestSort={requestSort}>Payment Date</SortableHeader>
                                    <th className="p-4 text-sm font-semibold text-slate-600 uppercase tracking-wider">Payment Method</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">

                                {paginatedPayments.length > 0 ? paginatedPayments.map((payment) => (
                                    <tr key={payment._id} className="hover:bg-slate-50">
                                        <td className="p-4 font-medium text-slate-900">{payment.camp_name}</td>
                                        <td className="p-4">
                                            <div className="flex items-center font-semibold text-green-600">
                                                <DollarSign className="w-4 h-4 mr-1" />
                                                {parseFloat(payment.camp_fee).toFixed(2)}
                                            </div>
                                        </td>
                                        <td className="p-4 font-mono text-slate-500 text-xs">
                                            <div className="flex items-center gap-2">
                                                <Hash className="w-4 h-4" />
                                                {payment.data?.transactionId || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                                                {payment.data?.paidAt ? new Date(payment.data.paidAt).toLocaleDateString('en-US', {
                                                    year: 'numeric', month: 'long', day: 'numeric',
                                                }) : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="inline-flex items-center gap-2 capitalize bg-slate-200 text-slate-800 px-3 py-1 rounded-full font-semibold">
                                                <CreditCard className="w-4 h-4" />
                                                {payment.data?.paymentMethod || 'N/A'}
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="text-center p-12 text-slate-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <CreditCard className="w-12 h-12 text-slate-300" />
                                                <span className="font-semibold text-lg">{searchTerm ? 'No Payments Found' : 'No Payment History'}</span>
                                                {searchTerm && <span className="text-sm">Try a different search term.</span>}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

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
        </div>
    );
};

export default PaymentHistory;