
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5251';

const getStorageItem = (key: string): string | null => {
    try {
        return typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    } catch (error) {
        console.warn(`Failed to access localStorage for key: ${key}`, error);
        return null;
    }
};

const setStorageItem = (key: string, value: string): void => {
    try {
        if (typeof window !== 'undefined') {
            localStorage.setItem(key, value);
        }
    } catch (error) {
        console.warn(`Failed to set localStorage for key: ${key}`, error);
    }
};

const removeStorageItem = (key: string): void => {
    try {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(key);
        }
    } catch (error) {
        console.warn(`Failed to remove localStorage for key: ${key}`, error);
    }
};

interface User {
    userId?: number;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    profileImageUrl?: string;
    isEmailVerified?: boolean;
    isPhoneVerified?: boolean;
    createdAt?: string;
    lastLoginAt?: string;
    status?: string;
    roles: string[];
}

interface AuthResponse {
    token: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    expiresAt?: string;
    user?: {
        userId: number;
        email: string;
        firstName: string;
        lastName: string;
        phoneNumber?: string;
        profileImageUrl?: string;
        isEmailVerified: boolean;
        isPhoneVerified: boolean;
        createdAt: string;
        lastLoginAt?: string;
        status: string;
    };
}

interface LoginRequest {
    email: string;
    password: string;
}

interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    userType?: string;
}

interface AuthContextType {
    user: User | null;
    login: (credentials: LoginRequest) => Promise<void>;
    register: (userData: RegisterRequest) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
    isAuthenticated: boolean;
    isOrganizer: boolean;
    isAdmin: boolean;
    isSuperAdmin: boolean;
    refreshUser: () => Promise<void>;
}

const handleApiError = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    return 'An unexpected error occurred';
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const refreshUser = useCallback(async () => {
        try {
            const token = getStorageItem('authToken');
            if (!token) return;

            const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const userData = await response.json();

                const updatedUser: User = {
                    userId: userData.userId,
                    email: userData.email,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    phoneNumber: userData.phoneNumber,
                    profileImageUrl: userData.profileImageUrl,
                    isEmailVerified: userData.isEmailVerified,
                    isPhoneVerified: userData.isPhoneVerified,
                    createdAt: userData.createdAt,
                    lastLoginAt: userData.lastLoginAt,
                    status: userData.status,
                    roles: userData.roles || user?.roles || [] // Fix: Ensure roles are properly set
                };

                setUser(updatedUser);
                setStorageItem('user', JSON.stringify(updatedUser));
            } else if (response.status === 401) {
                logout();
            }
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error('Error refreshing user data:', error);
            }
        }
    }, [user?.roles]);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const token = getStorageItem('authToken');
                const userData = getStorageItem('user');

                if (token && userData) {
                    const parsedUser = JSON.parse(userData);

                    if (parsedUser && Array.isArray(parsedUser.roles)) {
                        setUser(parsedUser);
                    } else {
                        removeStorageItem('authToken');
                        removeStorageItem('user');
                    }
                }
            } catch (error) {
                if (process.env.NODE_ENV === 'development') {
                    console.error('Error parsing user data:', error);
                }
                removeStorageItem('authToken');
                removeStorageItem('user');
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = async (credentials: LoginRequest) => {
        try {
            setIsLoading(true);

            if (!credentials.email?.trim() || !credentials.password?.trim()) {
                throw new Error('Email and password are required');
            }

            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                let errorMessage = 'Login failed';

                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.error || errorMessage;
                } catch {
                    errorMessage = `Login failed (${response.status})`;
                }

                throw new Error(errorMessage);
            }

            const authData: AuthResponse = await response.json();

            // Validate response data
            if (!authData.token || !authData.roles) {
                throw new Error('Invalid login response from server');
            }

            const userData: User = {
                userId: authData.user?.userId,
                email: authData.email,
                firstName: authData.firstName,
                lastName: authData.lastName,
                phoneNumber: authData.user?.phoneNumber,
                profileImageUrl: authData.user?.profileImageUrl,
                isEmailVerified: authData.user?.isEmailVerified,
                isPhoneVerified: authData.user?.isPhoneVerified,
                createdAt: authData.user?.createdAt,
                lastLoginAt: authData.user?.lastLoginAt,
                status: authData.user?.status,
                roles: Array.isArray(authData.roles) ? authData.roles : [] // Ensure roles is array
            };

            setStorageItem('authToken', authData.token);
            setStorageItem('user', JSON.stringify(userData));
            setUser(userData);

            setTimeout(() => {
                if (userData.roles.includes('SuperAdmin')) {
                    router.push('/admin/dashboard');
                } else if (userData.roles.includes('Admin')) {
                    router.push('/admin/dashboard');
                } else if (userData.roles.includes('Organizer')) {
                    router.push('/organizer/dashboard');
                } else {
                    router.push('/events');
                }
            }, 100);

        } catch (error) {
            const errorMessage = handleApiError(error);

            if (process.env.NODE_ENV === 'development') {
                console.error('Login error:', error);
            }

            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData: RegisterRequest) => {
        try {
            setIsLoading(true);

            // Validate input
            if (!userData.email?.trim() || !userData.password?.trim() ||
                !userData.firstName?.trim() || !userData.lastName?.trim()) {
                throw new Error('All required fields must be filled');
            }

            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                let errorMessage = 'Registration failed';

                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.error || errorMessage;
                } catch {
                    errorMessage = `Registration failed (${response.status})`;
                }

                throw new Error(errorMessage);
            }

            const authData: AuthResponse = await response.json();

            // Validate response data
            if (!authData.token || !authData.roles) {
                throw new Error('Invalid registration response from server');
            }

            const user: User = {
                userId: authData.user?.userId,
                email: authData.email,
                firstName: authData.firstName,
                lastName: authData.lastName,
                phoneNumber: authData.user?.phoneNumber,
                profileImageUrl: authData.user?.profileImageUrl,
                isEmailVerified: authData.user?.isEmailVerified,
                isPhoneVerified: authData.user?.isPhoneVerified,
                createdAt: authData.user?.createdAt,
                lastLoginAt: authData.user?.lastLoginAt,
                status: authData.user?.status,
                roles: Array.isArray(authData.roles) ? authData.roles : []
            };

            setStorageItem('authToken', authData.token);
            setStorageItem('user', JSON.stringify(user));
            setUser(user);

            // Navigate based on user role
            setTimeout(() => {
                if (user.roles.includes('SuperAdmin')) {
                    router.push('/admin/dashboard');
                } else if (user.roles.includes('Admin')) {
                    router.push('/admin/dashboard');
                } else if (user.roles.includes('Organizer')) {
                    router.push('/organizer/dashboard');
                } else {
                    router.push('/events');
                }
            }, 100);

        } catch (error) {
            const errorMessage = handleApiError(error);

            if (process.env.NODE_ENV === 'development') {
                console.error('Registration error:', error);
            }

            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = useCallback(() => {
        removeStorageItem('authToken');
        removeStorageItem('user');
        setUser(null);
        router.push('/');
    }, [router]);

    // Computed values with null safety
    const isAuthenticated = !!user && Array.isArray(user.roles);
    const isOrganizer = user?.roles?.includes('Organizer') ?? false;
    const isAdmin = user?.roles?.includes('Admin') ?? false;
    const isSuperAdmin = user?.roles?.includes('SuperAdmin') ?? false;

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                register,
                logout,
                isLoading,
                isAuthenticated,
                isOrganizer,
                isAdmin,
                isSuperAdmin,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const useAuthDebug = () => {
    const auth = useAuth();

    if (process.env.NODE_ENV === 'development') {
        const debugInfo = {
            isAuthenticated: auth.isAuthenticated,
            isOrganizer: auth.isOrganizer,
            isAdmin: auth.isAdmin,
            userRoles: auth.user?.roles,
            userId: auth.user?.userId,
        };

        return debugInfo;
    }

    return null;
};