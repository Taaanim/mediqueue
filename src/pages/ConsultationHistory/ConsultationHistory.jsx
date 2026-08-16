import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Calendar, User, Stethoscope, Clock, Pill } from 'lucide-react';
import useAuth from '../../hooks/useAuth/useAuth';
import { mockDb } from '../../mockData/mockDb';

const ConsultationHistory = () => {
  const { user } = useAuth();

  const { data: history = [], isLoading } = useQuery({
    queryKey: ['consultationHistory', user?.email],
    queryFn: async () => {
      // Filter mock data for the logged-in user
      return mockDb.consultationHistory.filter(
        h => h.patientEmail === user?.email || h.patientEmail === 'user'
      ).sort((a, b) => new Date(b.date) - new Date(a.date));
    }
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><span className="loading loading-spinner loading-lg text-[#1e74d2]"></span></div>;
  }

  return (
    <div className="bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Consultation History</h1>
          <p className="mt-2 text-lg text-slate-500">A complete record of your past OPD visits and medical diagnoses.</p>
        </header>

        {history.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center shadow-sm border border-slate-200">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No History Found</h3>
            <p className="text-slate-500 text-sm mt-1">You do not have any past consultations on record.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {history.map((record) => (
              <div key={record._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 border-b border-blue-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{record.reason}</h3>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-[#1e74d2]" />
                        {new Date(record.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Stethoscope className="w-4 h-4 text-[#1e74d2]" />
                        {record.doctorName} <span className="text-xs font-semibold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full ml-1">{record.specialty}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" /> Diagnosis
                    </h4>
                    <p className="text-slate-800 font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {record.diagnosis}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Pill className="w-4 h-4" /> Prescription
                    </h4>
                    <p className="text-slate-800 font-medium bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-emerald-900">
                      {record.prescription}
                    </p>
                  </div>
                </div>

                {/* Footer/Notes */}
                {record.notes && (
                  <div className="px-5 pb-5">
                     <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Doctor's Notes
                    </h4>
                    <p className="text-slate-600 text-sm italic bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                      "{record.notes}"
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultationHistory;
