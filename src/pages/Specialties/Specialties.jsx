import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Stethoscope } from 'lucide-react';
import { toast } from 'react-toastify';
import useAxiosSecure from '../../hooks/useAxiosSecure/useAxiosSecure';

const Specialties = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [isSpecialtyModalOpen, setIsSpecialtyModalOpen] = useState(false);
  const [newSpecialty, setNewSpecialty] = useState('');

  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const res = await axiosSecure.get('/doctors');
      return res.data;
    }
  });

  const { data: specialties = [] } = useQuery({
    queryKey: ['specialties'],
    queryFn: async () => {
      const res = await axiosSecure.get('/specialties');
      return res.data;
    }
  });

  const addSpecialtyMutation = useMutation({
    mutationFn: async (name) => {
      await axiosSecure.post('/specialties', { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['specialties']);
      toast.success('Specialty added!', { position: 'top-right', autoClose: 3000, theme: 'colored' });
      setIsSpecialtyModalOpen(false);
      setNewSpecialty('');
    }
  });

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-[#e5f2fa] to-[#a7d4f9] p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-between items-start">
        <span className="bg-[#1e74d2] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          Specialties
        </span>
        <h1 className="text-3xl font-extrabold poppins text-slate-800 mt-2">
          Manage Medical Specialties
        </h1>
        <p className="text-slate-600 text-sm mt-1 inter">Add and manage hospital departments.</p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800 poppins">Medical Specialties & Departments</h3>
          <button
            onClick={() => setIsSpecialtyModalOpen(true)}
            className="px-4 py-2 bg-[#1e74d2] text-white font-bold text-xs rounded-xl shadow-md hover:bg-blue-700 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Specialty
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {specialties.map((spec) => {
            const docCount = doctors.filter(d => d.specialty === spec).length;
            return (
              <div key={spec} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-slate-800 text-base">{spec}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{docCount} Doctor(s) assigned</p>
                </div>
                <div className="bg-blue-50 p-2.5 rounded-xl text-[#1e74d2]">
                  <Stethoscope className="w-5 h-5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isSpecialtyModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-3 poppins">Add Specialty</h3>
            <input
              type="text"
              value={newSpecialty}
              onChange={(e) => setNewSpecialty(e.target.value)}
              placeholder="e.g. Dermatology"
              className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#1e74d2]"
            />
            <div className="pt-4 flex justify-end gap-2 text-xs">
              <button type="button" onClick={() => setIsSpecialtyModalOpen(false)} className="px-3 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
              <button type="button" onClick={() => addSpecialtyMutation.mutate(newSpecialty)} className="px-4 py-2 bg-[#1e74d2] text-white font-bold rounded-xl shadow-md hover:bg-blue-700">Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Specialties;
