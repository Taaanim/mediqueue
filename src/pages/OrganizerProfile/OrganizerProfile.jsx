import React, { useState } from 'react';
import { Mail, Phone, User, KeyRound, Edit, Save } from 'lucide-react';
import useAuth from '../../hooks/useAuth/useAuth';
import { Bounce, toast } from 'react-toastify';
import { mockDb } from '../../mockData/mockDb';

const OrganizerProfile = () => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [formData, setFormData] = useState(() => {
        const localUser = JSON.parse(localStorage.getItem('user')) || {};
        return {
            displayName: localUser.displayName || user?.displayName || '',
            phone: localUser.phone || '',
            photoURL: localUser.photoURL || user?.photoURL || '',
        };
    });

    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async () => {
        if (!/^\d{11}$/.test(formData.phone)) {
            return toast.error('Phone number must be exactly 11 digits', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "colored",
                transition: Bounce,
            });
        }

        try {
            // Mocking profile update
            let loggedInUser = JSON.parse(localStorage.getItem('user')) || {};
            loggedInUser.displayName = formData.displayName;
            loggedInUser.photoURL = formData.photoURL;
            loggedInUser.phone = formData.phone;
            localStorage.setItem('user', JSON.stringify(loggedInUser));

            toast.success('Profile updated successfully');
            setIsEditing(false);
        } catch (error) {
            toast.error('Failed to update profile');
            console.error(error);
        }
    };

    const handleChangePassword = async () => {
        console.log(passwordData.newPassword, passwordData.confirmPassword);
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
           return toast.error('Passwords do not match', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                transition: Bounce,
                });
            
        }

        try {
            // Mocking password update
            toast.success('Password changed successfully', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
            transition: Bounce,
            });
            setPasswordData({ newPassword: '', confirmPassword: '' });
            setShowPasswordForm(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to change password.");
        }
    };

    const mockUser = mockDb.users.find(u => u.email === user?.email) || { role: 'user' };
    const isParticipant = mockUser.role === 'user';
    const isDoctor = mockUser.role === 'doctor';

    const profileData = {
        coverPhoto: isParticipant ? 'https://res.cloudinary.com/dv6p7mprd/image/upload/v1752178852/labor-union-members-working-together_tjhtde.jpg' : 'https://res.cloudinary.com/dv6p7mprd/image/upload/v1752178852/labor-union-members-working-together_tjhtde.jpg',
        role: isParticipant ? 'Participant' : isDoctor ? 'Doctor' : 'Lead Camp Organizer',
        stats: isParticipant ? [
            { label: 'Camps Registered', value: mockDb.registeredCamps.filter(c => c.participant_email === user?.email).length || 2 },
            { label: 'Tokens Generated', value: mockDb.queueTokens.filter(t => t.patientEmail === user?.email).length || 3 },
            { label: 'Member Since', value: '2023' },
        ] : isDoctor ? [
            { label: 'Patients Served', value: '120+' },
            { label: 'Average Rating', value: '4.8/5' },
            { label: 'Member Since', value: '2022' },
        ] : [
            { label: 'Camps Organized', value: 12 },
            { label: 'Total Participants', value: '1.8k+' },
            { label: 'Member Since', value: '2023' },
        ],
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-full">
                <span className="loading loading-bars loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* --- Header --- */}
            <div className="relative bg-white rounded-2xl shadow-md border border-slate-200/80 overflow-hidden">
                <img src={profileData.coverPhoto} alt="Cover" className="w-full h-88 object-cover" />
                <div className="relative p-6 bg-transparent -mt-16 flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative flex-shrink-0">
                        <img src={formData.photoURL || user?.photoURL || 'https://res.cloudinary.com/dv6p7mprd/image/upload/v1752430406/istockphoto-1477583621-612x612_x1gcca.jpg'} alt="Profile" className="h-28 w-28 rounded-full object-cover border-4 border-white shadow-lg" />
                    </div>
                    <div className="text-center sm:text-left mt-4 sm:mt-10">
                        <h1 className="text-3xl font-bold text-slate-800">{formData.displayName || user?.displayName || 'Profile Name'}</h1>
                        {/* <p className="text-md text-[#1e74d2] font-semibold">{profileData.role}</p> */}
                        <p className="text-md text-[#1e74d2] font-semibold">Customize Profile</p>
                    </div>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="sm:ml-auto cursor-pointer mt-4 sm:mt-10 bg-[#1e74d2] text-white font-semibold py-2 px-5 rounded-lg flex items-center gap-2 transition-all hover:bg-[#185dab] hover:scale-105"
                    >
                        {isEditing ? <Save size={16} /> : <Edit size={16} />}
                        {isEditing ? 'Cancel' : 'Edit Profile'}
                    </button>
                </div>
            </div>

            {/* --- Main Grid --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* --- Left: Info --- */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200/80">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Personal Information</h3>
                        <div className="space-y-4 text-slate-700">
                            {isEditing ? (
                                <>
                                    <div className="space-y-1">
                                        <label className="text-sm">Full Name</label>
                                        <input type="text" name="displayName" value={formData.displayName} onChange={handleInputChange} className="input input-bordered w-full" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm">Photo URL</label>
                                        <input type="text" name="photoURL" value={formData.photoURL} onChange={handleInputChange} className="input input-bordered w-full" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm">Phone</label>
                                        <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="input input-bordered w-full" />
                                    </div>
                                    <button onClick={handleUpdate} className="btn mt-4 bg-[#1e74d2] text-white hover:bg-[#185dab]">Update Profile</button>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center gap-4">
                                        <User className="w-5 h-5 text-[#1e74d2]" />
                                        <span>{formData.displayName || user?.displayName || 'Not Provided'}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Mail className="w-5 h-5 text-[#1e74d2]" />
                                        <span>{user?.email || 'Not Provided'}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Phone className="w-5 h-5 text-[#1e74d2]" />
                                        <span>{formData.phone || 'Not Provided'}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* --- Security Section --- */}
                    <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200/80">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Security</h3>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <p className="font-semibold text-slate-700">Password</p>
                                <p className="text-sm text-slate-500">Last changed on 10 Jul 2025</p>
                            </div>
                            <button
                                onClick={() => setShowPasswordForm(!showPasswordForm)}
                                className="border border-slate-300 font-semibold text-slate-700 py-2 px-5 rounded-lg hover:bg-slate-100 flex items-center gap-2"
                            >
                                <KeyRound size={16} />
                                {showPasswordForm === true ? 'Cancel' : 'Change Password' }
                            </button>
                        </div>

                        {showPasswordForm && (
                            <div className="mt-4 space-y-4">
                                <input
                                    type="password"
                                    placeholder="New Password"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    className="input input-bordered w-full"
                                />
                                <input
                                    type="password"
                                    placeholder="Confirm Password"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    className="input input-bordered w-full"
                                />
                                <button
                                    onClick={handleChangePassword}
                                    className="btn bg-[#1e74d2] text-white hover:bg-[#185dab]"
                                >
                                    Save Password
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- Right: Stats --- */}
                <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200/80">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">Activity Stats</h3>
                    <div className="space-y-5">
                        {profileData.stats.map(stat => (
                            <div key={stat.label} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                <p className="font-semibold text-slate-600">{stat.label}</p>
                                <p className="font-bold text-lg text-[#1e74d2]">{stat.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganizerProfile;
