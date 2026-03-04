'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, User, LogOut, Settings, Ticket } from 'lucide-react';

const Navbar: React.FC = () => {
    const { user, logout, isAuthenticated, isOrganizer, isAdmin, isSuperAdmin } = useAuth();

    const handleLogout = () => {
        logout();
    };

    return (
        <nav className="fixed w-full z-50 bg-[#0a0f1c]/80 backdrop-blur-xl border-b border-white/10 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2 group">
                            <div className="p-1.5 rounded-lg bg-neon-purple/20 group-hover:bg-neon-purple/30 transition-colors shadow-[0_0_10px_rgba(139,92,246,0.3)]">
                                <Calendar className="h-6 w-6 text-neon-cyan" />
                            </div>
                            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-300 group-hover:from-neon-purple group-hover:to-neon-cyan transition-all duration-300">NexusEvents</span>
                        </Link>

                                                                        <div className="hidden md:flex items-center space-x-8 ml-10">
                            <Link href="/events" className="text-gray-300 hover:text-neon-cyan hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] px-3 py-2 rounded-md text-sm font-medium transition-all">
                                Events
                            </Link>
                            <Link href="/venues" className="text-gray-300 hover:text-neon-cyan hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] px-3 py-2 rounded-md text-sm font-medium transition-all">
                                Venues
                            </Link>
                            <Link href="/cart" className="text-gray-300 hover:text-neon-cyan hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] px-3 py-2 rounded-md text-sm font-medium transition-all">
                                Cart
                            </Link>
                            {isOrganizer && (
                                <Link href="/organizer/dashboard" className="text-gray-300 hover:text-neon-purple hover:drop-shadow-[0_0_8px_rgba(139,92,246,0.8)] px-3 py-2 rounded-md text-sm font-medium transition-all">
                                    Organize
                                </Link>
                            )}
                            {(isAdmin || isSuperAdmin) && (
                                <Link href="/admin/dashboard" className="text-gray-300 hover:text-fuchsia-400 hover:drop-shadow-[0_0_8px_rgba(217,70,239,0.8)] px-3 py-2 rounded-md text-sm font-medium transition-all">
                                    Admin
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <div className="flex items-center space-x-4">
                                <Link href="/mytickets" className="flex items-center text-gray-300 hover:text-neon-cyan hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] transition-all">
                                    <Ticket className="h-5 w-5 mr-1" />
                                    My Tickets
                                </Link>

                                <div className="relative group">
                                    <button className="flex items-center text-gray-300 hover:text-gray-100 transition-colors">
                                        <div className="bg-gray-800/40 p-1.5 rounded-full border border-white/10 mr-2">
                                            <User className="h-4 w-4 text-gray-300" />
                                        </div>
                                        {user?.firstName}
                                    </button>

                                    <div className="absolute right-0 mt-2 w-48 bg-[#0a0f1c]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                                        <div className="py-1">
                                            <Link href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800/60 hover:text-neon-cyan transition-colors">
                                                <Settings className="h-4 w-4 mr-2" />
                                                Profile Settings
                                            </Link>
                                            <Link href="/mytickets" className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800/60 hover:text-neon-purple transition-colors">
                                                <Ticket className="h-4 w-4 mr-2" />
                                                My Orders
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-left"
                                            >
                                                <LogOut className="h-4 w-4 mr-2" />
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <div className="relative group">
                                    <button className="inline-flex items-center px-4 py-2 text-sm font-bold text-white bg-neon-cyan/90 hover:bg-neon-cyan rounded-lg shadow-[0_0_18px_rgba(6,182,212,0.5)] hover:shadow-[0_0_28px_rgba(6,182,212,0.7)] transform hover:-translate-y-0.5 transition-all duration-300">
                                        Sign Up / Login
                                    </button>
                                    <div className="absolute right-0 mt-3 w-56 bg-[#0a0f1c]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] opacity-0 invisible pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto transition-all duration-200 z-50 overflow-hidden">
                                        <div className="py-1">
                                            <Link href="/login?role=visitor" className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800/60 hover:text-neon-cyan transition-colors">
                                                Visitor Sign In
                                            </Link>
                                            <Link href="/register?role=visitor" className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800/60 hover:text-neon-purple transition-colors">
                                                Visitor Sign Up
                                            </Link>
                                            <Link href="/login?role=organizer" className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800/60 hover:text-amber-300 transition-colors">
                                                Organizer Sign In
                                            </Link>
                                            <Link href="/register?role=organizer" className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800/60 hover:text-amber-200 transition-colors">
                                                Organizer Sign Up
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

