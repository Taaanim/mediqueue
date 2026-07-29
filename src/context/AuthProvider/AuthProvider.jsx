import React, { useEffect, useState } from 'react';
import { AuthContext } from '../AuthContext/AuthContext';
import { mockDb } from '../../mockData/mockDb';

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const saved = sessionStorage.getItem('user');
        if (saved) return JSON.parse(saved);
        
        // Bypass auth filter for direct link access
        const path = window.location.pathname.toLowerCase();
        if (path.startsWith('/admin')) {
            return { email: 'admin', role: 'admin', name: 'Admin Guest' };
        } else if (path.startsWith('/doctor')) {
            return { email: 'doctor', role: 'doctor', name: 'Doctor Guest' };
        } else if (path.startsWith('/user')) {
            return { email: 'user', role: 'user', name: 'Participant Guest' };
        }
        return null;
    });
    const [loading, setLoading] = useState(false);

    const userSignUpWithEmailPass = (email, password) => {
        setLoading(true);
        return new Promise((resolve) => {
            const newUser = { email, role: 'user', name: email.split('@')[0] || 'User' };
            setUser(newUser);
            sessionStorage.setItem('user', JSON.stringify(newUser));
            setLoading(false);
            resolve({ user: newUser });
        });
    };

    const userSignInWithEmailPass = (email, password) => {
        setLoading(true);
        return new Promise((resolve, reject) => {
            const clean = (email || '').toLowerCase().trim();
            let role = 'user';
            if (clean.includes('admin')) role = 'admin';
            else if (clean.includes('doctor')) role = 'doctor';

            const foundUser = mockDb.users.find(u => u.email.toLowerCase() === clean) || {
                email: clean,
                role: role,
                name: clean.charAt(0).toUpperCase() + clean.slice(1) + ' User'
            };

            setUser(foundUser);
            sessionStorage.setItem('user', JSON.stringify(foundUser));
            setLoading(false);
            resolve({ user: foundUser });
        });
    };

    const userSignInWithGoogle = () => {
        setLoading(true);
        return new Promise((resolve) => {
            const googleUser = { email: 'google@example.com', role: 'user', name: 'Google User' };
            setUser(googleUser);
            sessionStorage.setItem('user', JSON.stringify(googleUser));
            setLoading(false);
            resolve({ user: googleUser });
        });
    };

    const logOut = () => {
        setLoading(true);
        setUser(null);
        sessionStorage.clear();
        setLoading(false);
        return Promise.resolve();
    };

    const info = {
        user,
        loading,
        userSignUpWithEmailPass,
        userSignInWithEmailPass,
        userSignInWithGoogle,
        logOut
    };

    return (
        <AuthContext value={info}>
            {children}
        </AuthContext>
    );
};

export default AuthProvider;