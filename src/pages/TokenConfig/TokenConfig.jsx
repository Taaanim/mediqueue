import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import useAxiosSecure from '../../hooks/useAxiosSecure/useAxiosSecure';

const TokenConfig = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const { data: settings = {} } = useQuery({
    queryKey: ['queueSettings'],
    queryFn: async () => {
      const res = await axiosSecure.get('/queue-settings');
      return res.data;
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (payload) => {
      await axiosSecure.patch('/queue-settings', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['queueSettings']);
      toast.success('Queue parameters updated!', { position: 'top-right', autoClose: 3000, theme: 'colored' });
    }
  });

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-[#e5f2fa] to-[#a7d4f9] p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-between items-start">
        <span className="bg-[#1e74d2] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          Token Config
        </span>
        <h1 className="text-3xl font-extrabold poppins text-slate-800 mt-2">
          Token Generation Configuration
        </h1>
        <p className="text-slate-600 text-sm mt-1 inter">Configure queue generation and timing parameters.</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-md border border-slate-200 space-y-6 max-w-2xl">
        <h3 className="text-lg font-bold text-slate-800 poppins">Token Generation & Queue Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Hospital Name</label>
            <input
              type="text"
              defaultValue={settings.hospitalName || 'MediQueue Central Hospital'}
              onBlur={(e) => updateSettingsMutation.mutate({ hospitalName: e.target.value })}
              className="w-full px-4 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e74d2] outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Max Daily Tokens Per Doctor</label>
              <input
                type="number"
                defaultValue={settings.maxTokensPerDoctor || 40}
                onBlur={(e) => updateSettingsMutation.mutate({ maxTokensPerDoctor: parseInt(e.target.value) })}
                className="w-full px-4 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e74d2] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Default Slot Duration (Mins)</label>
              <input
                type="number"
                defaultValue={settings.avgConsultationTimeMinutes || 15}
                onBlur={(e) => updateSettingsMutation.mutate({ avgConsultationTimeMinutes: parseInt(e.target.value) })}
                className="w-full px-4 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e74d2] outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Auto-Cancel Inactive Tokens Timer (Minutes)</label>
            <input
              type="number"
              defaultValue={settings.autoCancelInactiveMinutes || 30}
              onBlur={(e) => updateSettingsMutation.mutate({ autoCancelInactiveMinutes: parseInt(e.target.value) })}
              className="w-full px-4 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e74d2] outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">Tokens that miss their calling window by this duration will automatically set to Cancelled.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenConfig;
