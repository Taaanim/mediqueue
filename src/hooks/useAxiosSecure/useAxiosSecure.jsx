import { mockDb } from '../../mockData/mockDb';

const useAxiosSecure = () => {
    return {
        get: async (url) => {
            if (url.includes('/camps')) {
                return { data: mockDb.camps };
            }
            if (url.includes('/doctors')) {
                return { data: mockDb.doctors };
            }
            if (url.includes('/specialties')) {
                return { data: mockDb.specialties };
            }
            if (url.includes('/queue-tokens')) {
                return { data: mockDb.queueTokens };
            }
            if (url.includes('/queue-settings')) {
                return { data: mockDb.queueSettings };
            }
            if (url.includes('/users/')) {
                const email = url.split('/').pop();
                const foundUser = mockDb.users.find(u => u.email === email);
                return { data: foundUser ? [foundUser] : [] };
            }
            if (url.includes('/users')) {
                return { data: mockDb.users };
            }
            if (url.includes('/participants/email/')) {
                return { data: mockDb.registeredCamps };
            }
            if (url.includes('/participants')) {
                return { data: mockDb.registeredCamps };
            }
            if (url.includes('/registered-camps')) {
                return { data: mockDb.registeredCamps };
            }
            if (url.includes('/payments')) {
                return { data: mockDb.payments };
            }
            return { data: [] };
        },
        post: async (url, payload) => {
            if (url.includes('/queue-tokens')) {
                const doc = mockDb.doctors.find(d => d._id === payload.doctorId);
                const count = mockDb.queueTokens.filter(t => t.doctorId === payload.doctorId).length + 1;
                const prefix = doc ? doc.specialty.substring(0, 3).toUpperCase() : 'TOK';
                const tokenNumber = `${prefix}-${String(count).padStart(3, '0')}`;
                
                const newToken = {
                    _id: 'tok_' + Date.now(),
                    tokenNumber,
                    doctorId: payload.doctorId,
                    doctorName: doc ? doc.name : 'Doctor',
                    specialty: doc ? doc.specialty : 'General',
                    roomNo: doc ? doc.roomNo : 'Room 101',
                    patientName: payload.patientName || 'Anonymous',
                    patientPhone: payload.patientPhone || '',
                    patientEmail: payload.patientEmail || 'user',
                    age: payload.age || 30,
                    gender: payload.gender || 'Other',
                    medicalNotes: payload.medicalNotes || '',
                    status: 'Waiting',
                    isEmergency: payload.isEmergency || false,
                    createdAt: new Date().toISOString()
                };

                // If emergency, insert after current calling/in consultation or at top of waiting list
                if (payload.isEmergency) {
                    mockDb.queueTokens.unshift(newToken);
                } else {
                    mockDb.queueTokens.push(newToken);
                }
                return { data: { insertedId: newToken._id, token: newToken } };
            }

            if (url.includes('/doctors')) {
                const newDoc = {
                    _id: 'doc_' + Date.now(),
                    name: payload.name,
                    specialty: payload.specialty,
                    roomNo: payload.roomNo,
                    isAvailable: true,
                    maxTokensPerDay: payload.maxTokensPerDay || 40,
                    avgConsultTimeMinutes: payload.avgConsultTimeMinutes || 15,
                    imageUrl: payload.imageUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
                    phone: payload.phone || '',
                    bio: payload.bio || '',
                    unavailableTimings: []
                };
                mockDb.doctors.push(newDoc);
                return { data: { insertedId: newDoc._id, doctor: newDoc } };
            }

            if (url.includes('/specialties')) {
                if (!mockDb.specialties.includes(payload.name)) {
                    mockDb.specialties.push(payload.name);
                }
                return { data: { success: true } };
            }

            return { data: { insertedId: 'mock_id', token: 'mock_token' } };
        },
        patch: async (url, payload) => {
            if (url.includes('/queue-tokens/')) {
                const tokenId = url.split('/').pop();
                const token = mockDb.queueTokens.find(t => t._id === tokenId);
                if (token) {
                    Object.assign(token, payload);
                }
                return { data: { modifiedCount: 1, token } };
            }

            if (url.includes('/doctors/')) {
                const docId = url.split('/').pop();
                const doc = mockDb.doctors.find(d => d._id === docId);
                if (doc) {
                    Object.assign(doc, payload);
                }
                return { data: { modifiedCount: 1, doctor: doc } };
            }

            if (url.includes('/registrations/confirm/')) {
                const regId = url.split('/').pop();
                const reg = mockDb.registeredCamps.find(r => r._id === regId);
                if (reg) {
                    reg.isAdmin_approved = true;
                }
                return { data: { modifiedCount: 1 } };
            }

            if (url.includes('/queue-settings')) {
                Object.assign(mockDb.queueSettings, payload);
                return { data: { modifiedCount: 1 } };
            }

            return { data: { modifiedCount: 1 } };
        },
        delete: async (url) => {
            if (url.includes('/participants/delete/')) {
                const regId = url.split('/').pop();
                const idx = mockDb.registeredCamps.findIndex(r => r._id === regId);
                if (idx !== -1) {
                    mockDb.registeredCamps.splice(idx, 1);
                }
                return { data: { deletedCount: 1 } };
            }
            if (url.includes('/queue-tokens/')) {
                const tokenId = url.split('/').pop();
                const idx = mockDb.queueTokens.findIndex(t => t._id === tokenId);
                if (idx !== -1) {
                    mockDb.queueTokens.splice(idx, 1);
                }
                return { data: { deletedCount: 1 } };
            }
            return { data: { deletedCount: 1 } };
        }
    };
};

export default useAxiosSecure;