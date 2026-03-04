'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { adminApi } from '@/lib/api';
import { Users, Shield, ShieldAlert, Loader2, CheckCircle, RefreshCcw, Activity } from 'lucide-react';

interface UserProfile {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    roles: string[];
    createdAt: string;
    lastLoginAt?: string;
    status: string;
}

const AdminDashboard: React.FC = () => {
    const { isAuthenticated, isSuperAdmin, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState<number | null>(null);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
            return;
        }

        if (!authLoading && !isSuperAdmin) {
            router.push('/events'); // Redirect non-admins
            return;
        }

        if (isSuperAdmin) {
            fetchUsers();
        }
    }, [isAuthenticated, isSuperAdmin, authLoading, router]);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await adminApi.getAllUsers();
            setUsers(data as UserProfile[]);
        } catch (err: any) {
            console.error('Failed to fetch users:', err);
            setError(err.message || 'Failed to successfully load users. Please ensure you have SuperAdmin privileges.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRoleChange = async (userId: number, newRole: string) => {
        try {
            setIsUpdating(userId);
            await adminApi.updateUserRole(userId, newRole);

            // Optimistically update the UI
            setUsers(prevUsers =>
                prevUsers.map(u =>
                    u.userId === userId ? { ...u, roles: [newRole] } : u
                )
            );
        } catch (err: any) {
            console.error('Failed to update role:', err);
            setError(err.message || 'Failed to update user role');
        } finally {
            setIsUpdating(null);
        }
    };

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0f1c] flex justify-center items-center">
                <Loader2 className="w-12 h-12 text-neon-cyan animate-spin" />
            </div>
        );
    }

    if (!isSuperAdmin) return null;

    const availableRoles = ['Customer', 'Organizer', 'Admin', 'SuperAdmin'];

    return (
        <div className="min-h-screen bg-[#0a0f1c] text-gray-100 pt-24 pb-12 relative overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                            Admin Control Panel
                        </h1>
                        <p className="text-gray-400 text-lg">
                            Manage users, roles, and system operations securely.
                        </p>
                    </div>
                    <button
                        onClick={fetchUsers}
                        className="inline-flex items-center px-4 py-2 bg-gray-800/40 hover:bg-white/5 border border-white/10 rounded-xl transition-colors backdrop-blur-sm shadow-[0_4px_15px_rgba(0,0,0,0.5)]"
                    >
                        <RefreshCcw className="w-5 h-5 mr-2 text-neon-cyan" />
                        Refresh Data
                    </button>
                </div>

                {/* KPI KPI Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gray-800/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-400 font-medium">Total Users</h3>
                            <Users className="w-6 h-6 text-neon-purple drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                        </div>
                        <p className="text-3xl font-bold text-white">{users.length}</p>
                    </div>
                    <div className="bg-gray-800/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-400 font-medium">Active Organizers</h3>
                            <Activity className="w-6 h-6 text-neon-cyan drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
                        </div>
                        <p className="text-3xl font-bold text-white">
                            {users.filter(u => u.roles.includes('Organizer')).length}
                        </p>
                    </div>
                    <div className="bg-gray-800/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-400 font-medium">System Admins</h3>
                            <Shield className="w-6 h-6 text-fuchsia-400 drop-shadow-[0_0_8px_rgba(217,70,239,0.6)]" />
                        </div>
                        <p className="text-3xl font-bold text-white">
                            {users.filter(u => u.roles.includes('SuperAdmin') || u.roles.includes('Admin')).length}
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center text-red-400">
                        <ShieldAlert className="w-5 h-5 mr-3 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {/* Users Table */}
                <div className="bg-[#0f172a]/60 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden">
                    <div className="p-6 border-b border-white/10 bg-gray-900/40">
                        <h2 className="text-xl font-bold text-white flex items-center">
                            <Users className="w-5 h-5 mr-2 text-neon-purple" />
                            User Management Directory
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-gray-800/20">
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Joined</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Current Role</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {users.map((user) => (
                                    <tr key={user.userId} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 border border-white/10 flex items-center justify-center text-gray-300 font-bold mr-3 shadow-[0_0_10px_rgba(139,92,246,0.1)]">
                                                    {user.firstName[0]}
                                                    {user.lastName[0]}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-100">{user.firstName} {user.lastName}</p>
                                                    <p className="text-sm text-gray-400">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Active
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full border backdrop-blur-sm ${user.roles.includes('SuperAdmin') || user.roles.includes('Admin')
                                                    ? 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30 shadow-[0_0_10px_rgba(217,70,239,0.2)]'
                                                    : user.roles.includes('Organizer')
                                                        ? 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                                                        : 'bg-neon-purple/10 text-neon-purple border-neon-purple/30 shadow-[0_0_10px_rgba(139,92,246,0.2)]'
                                                }`}>
                                                {user.roles[0] || 'Customer'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end">
                                                <select
                                                    disabled={isUpdating === user.userId}
                                                    value={user.roles[0] || 'Customer'}
                                                    onChange={(e) => handleRoleChange(user.userId, e.target.value)}
                                                    className="bg-gray-900 border border-white/10 text-gray-200 text-sm rounded-lg focus:ring-neon-cyan focus:border-neon-cyan block w-32 p-2.5 outline-none transition-all disabled:opacity-50"
                                                >
                                                    {availableRoles.map(role => (
                                                        <option key={role} value={role}>{role}</option>
                                                    ))}
                                                </select>
                                                {isUpdating === user.userId && (
                                                    <Loader2 className="w-5 h-5 ml-3 text-neon-cyan animate-spin" />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                                            No users found in the system.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
