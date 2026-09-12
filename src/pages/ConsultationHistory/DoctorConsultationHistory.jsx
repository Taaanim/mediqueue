import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Calendar, User, Stethoscope, Clock, Pill, Search, ShieldAlert, Phone } from 'lucide-react';
import useAuth from '../../hooks/useAuth/useAuth';
import { mockDb } from '../../mockData/mockDb';

const DoctorConsultationHistory = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [diseaseSearch, setDiseaseSearch] = useState('');
  const [showEmergencyOnly, setShowEmergencyOnly] = useState(false);

  const { data: allHistory = [], isLoading } = useQuery({
    queryKey: ['doctorConsultationHistory', user?.email],
    queryFn: async () => {
      // Find doctor by email (mocked)
      const doctor = mockDb.doctors.find(d => d.email === user?.email || d.email === 'doctor');
      if (!doctor) return [];
      
      // Filter mock data for this doctor
      // Also enrich with phone/name if missing for demo purposes
      return mockDb.consultationHistory
        .filter(h => h.doctorName === doctor.name)
        .map(h => ({
            ...h,
            patientPhone: h.patientPhone || '+8801700112233',
            patientName: h.patientName || h.patientEmail || 'Patient',
            isEmergency: h.isEmergency || false
        }))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    }
  });

  const filteredHistory = useMemo(() => {
    let filtered = allHistory;

    if (searchTerm.trim()) {
      filtered = filtered.filter(h => 
        h.patientPhone?.includes(searchTerm.trim()) || 
        h.patientName?.toLowerCase().includes(searchTerm.trim().toLowerCase())
      );
    }

    if (diseaseSearch.trim()) {
      filtered = filtered.filter(h => 
        h.diagnosis?.toLowerCase().includes(diseaseSearch.trim().toLowerCase())
      );
    }

    if (showEmergencyOnly) {
      filtered = filtered.filter(h => h.isEmergency);
    }

    if (!searchTerm && !diseaseSearch && !showEmergencyOnly) {
        return filtered.slice(0, 5);
    }

    return filtered;
  }, [allHistory, searchTerm, diseaseSearch, showEmergencyOnly]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><span className="loading loading-spinner loading-lg text-[#1e74d2]"></span></div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-[#e5f2fa] to-[#a7d4f9] p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
        <span className="bg-[#1e74d2] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          Doctor Workspace
        </span>
        <h1 className="text-3xl font-extrabold poppins text-slate-800 mt-2">
          Patient Consultation History
        </h1>
        <p className="text-slate-600 text-sm mt-1 inter">Review past patient records, diagnoses, and prescriptions.</p>
      </div>

        {/* --- FILTERS --- */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-8 flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative w-full sm:w-1/3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search phone or name..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e74d2] outline-none text-sm"
                />
            </div>
            <div className="relative w-full sm:w-1/3">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Filter by disease/diagnosis..." 
                    value={diseaseSearch}
                    onChange={e => setDiseaseSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e74d2] outline-none text-sm"
                />
            </div>
            <div className="w-full sm:w-1/3 flex items-center justify-end">
                <label className="flex items-center gap-2 cursor-pointer bg-red-50 px-4 py-2 rounded-xl border border-red-100 hover:bg-red-100 transition-colors text-red-700 font-semibold text-sm">
                    <input 
                        type="checkbox" 
                        checked={showEmergencyOnly}
                        onChange={e => setShowEmergencyOnly(e.target.checked)}
                        className="w-4 h-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                    />
                    <ShieldAlert className="w-4 h-4" /> Emergency Only
                </label>
            </div>
        </div>

        {/* --- LIST --- */}
        {filteredHistory.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center shadow-sm border border-slate-200">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No Patient History Found</h3>
            <p className="text-slate-500 text-sm mt-1">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {!searchTerm && !diseaseSearch && !showEmergencyOnly && (
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Showing 5 Most Recent</div>
            )}
            {filteredHistory.map((record) => (
              <div key={record._id} className={`bg-white rounded-2xl shadow-sm border ${record.isEmergency ? 'border-red-200' : 'border-slate-200'} overflow-hidden hover:shadow-md transition-all`}>
                <div className={`p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${record.isEmergency ? 'bg-red-50/50' : 'bg-gradient-to-r from-blue-50 to-indigo-50'}`}>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        {record.patientName}
                        {record.isEmergency && <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Emergency</span>}
                    </h3>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-[#1e74d2]" />
                        {new Date(record.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-[#1e74d2]" />
                        {record.patientPhone}
                      </div>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Reason</p>
                    <p className="text-sm font-semibold text-slate-700 mt-0.5">{record.reason}</p>
                  </div>
                </div>

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
              </div>
            ))}
          </div>
        )}
    </div>
  );
};

export default DoctorConsultationHistory;
