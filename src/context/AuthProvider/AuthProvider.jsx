import React, { useEffect, useState } from 'react';
import { AuthContext } from '../AuthContext/AuthContext';
import { mockDb } from '../../mockData/mockDb';

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const userSignUpWithEmailPass = (email, password) => {
        setLoading(true);
        return new Promise((resolve) => {
            const newUser = { email, role: 'user', name: 'New User' };
            setUser(newUser);
            localStorage.setItem('user', JSON.stringify(newUser));
            setLoading(false);
            resolve({ user: newUser });
        });
    }

    const userSignInWithEmailPass = (email, password) => {
        setLoading(true);
        return new Promise((resolve, reject) => {
            const foundUser = mockDb.users.find(u => u.email === email && password === email);
            if (foundUser) {
                setUser(foundUser);
                localStorage.setItem('user', JSON.stringify(foundUser));
                setLoading(false);
                resolve({ user: foundUser });
            } else {
                setLoading(false);
                reject(new Error('Invalid email or password'));
            }
        });
    }

    const userSignInWithGoogle = () => {
        setLoading(true);
        return new Promise((resolve) => {
            const googleUser = { email: 'google@example.com', role: 'user', name: 'Google User' };
            setUser(googleUser);
            localStorage.setItem('user', JSON.stringify(googleUser));
            setLoading(false);
            resolve({ user: googleUser });
        });
    }

    useEffect(() => {
        const loggedInUser = localStorage.getItem('user');
        if (loggedInUser) {
            setUser(JSON.parse(loggedInUser));
        } else {
            // Default demo admin user for direct link access without sign-in requirement
            const defaultUser = mockDb.users[0];
            setUser(defaultUser);
            localStorage.setItem('user', JSON.stringify(defaultUser));
        }
        setLoading(false);
    },[]);

    const info = {
        user,
        loading,
        userSignUpWithEmailPass,
        userSignInWithEmailPass,
        userSignInWithGoogle,
    };

    return (
        <AuthContext value={info}>
            {children}
        </AuthContext>
    );
};

export default AuthProvider;