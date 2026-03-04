/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { Calendar, Users, Ticket, ArrowRight, Sparkles, Music, MapPin, LogOut, User, Zap, Shield, BarChart3, Globe } from 'lucide-react';

export default function Home() {
    const router = useRouter();
    const { user, isLoading, isOrganizer, logout } = useAuth();
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShowContent(true), 300);
        return () => clearTimeout(timer);
    }, []);

    const handleOrganizerClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();
        try {
            if (user && !isLoading) {
                await router.push('/organizer/dashboard');
            } else {
                await router.push('/login?type=organizer');
            }
        } catch (error) { }
    };

    const handleCustomerClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();
        try {
            if (user && !isLoading) {
                await router.push('/events');
            } else {
                await router.push('/login?type=customer');
            }
        } catch (error) { }
    };

    const handleLogout = async () => {
        try {
            await logout();
            await router.push('/login');
        } catch (error) { }
    };

    const handleLogin = async () => {
        try {
            await router.push('/login');
        } catch (error) { }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.1)_0%,transparent_50%)]"></div>
                <div className="text-center z-10 relative">
                    <div className="flex justify-center mb-6">
                        <Sparkles className="h-16 w-16 text-purple-500 animate-pulse" />
                    </div>
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-slate-400 font-medium tracking-wide">Initializing NexusEvents...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen bg-[#0a0f1c] text-slate-200 transition-opacity duration-700 relative overflow-hidden ${showContent ? 'opacity-100' : 'opacity-0'}`}>
            {/* Animated Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/40 via-[#0a0f1c]/0 to-transparent pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-900/40 via-[#0a0f1c]/0 to-transparent pointer-events-none"></div>

            {/* Main Content */}
            <main className="pt-32 pb-24 px-6 sm:px-8 relative z-10">
                <div className="max-w-7xl mx-auto">

                    {/* Hero Section */}
                    <div className="text-center py-16 lg:py-24 max-w-4xl mx-auto">
                        <div className="inline-flex items-center space-x-2 px-4 py-2 mb-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium tracking-wide">
                            <span className="flex h-2 w-2 rounded-full bg-cyan-500 animate-pulse"></span>
                            <span>The Next Generation Ticketing Platform</span>
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black text-white mb-8 leading-[1.1] tracking-tight">
                            Elevate Your <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-500 to-cyan-400">
                                Event Experience.
                            </span>
                        </h2>
                        <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto mb-12 font-light leading-relaxed">
                            Discover extraordinary events or create your own. Built for scale, designed for simplicity, and obsessed with aesthetics.
                        </p>
                    </div>

                    {/* Interactive Role Selection Cards */}
                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-32">
                        {/* Organizer Card */}
                        <div className="group relative rounded-3xl bg-[#111827]/80 backdrop-blur-md border border-white/10 p-10 transition-all duration-500 hover:scale-[1.02] hover:bg-[#111827] hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.4)] overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                                <Globe className="w-32 h-32 text-purple-500" />
                            </div>

                            <div className="relative z-10">
                                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-purple-500/30 mb-8 transform group-hover:-translate-y-2 transition-transform duration-500">
                                    <Users className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-3xl font-bold text-white mb-4">Event Organizer</h3>
                                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                                    Create compelling events, sell tickets globally, and access powerful real-time analytics.
                                </p>

                                <ul className="space-y-4 mb-10 text-slate-300">
                                    <li className="flex items-center">
                                        <div className="h-6 w-6 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
                                            <Calendar className="h-3.5 w-3.5 text-purple-400" />
                                        </div>
                                        Seamless Management
                                    </li>
                                    <li className="flex items-center">
                                        <div className="h-6 w-6 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
                                            <BarChart3 className="h-3.5 w-3.5 text-purple-400" />
                                        </div>
                                        Real-time Analytics
                                    </li>
                                </ul>

                                <button
                                    onClick={handleOrganizerClick}
                                    className="w-full relative px-6 py-4 rounded-xl bg-white text-slate-900 font-bold text-lg hover:bg-slate-200 transition-all duration-300 flex items-center justify-center group/btn shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
                                >
                                    {user ? 'View Dashboard' : 'Start Organizing'}
                                    <ArrowRight className="ml-3 h-5 w-5 group-hover/btn:translate-x-2 transition-transform" />
                                </button>
                            </div>
                        </div>

                        {/* Customer Card */}
                        <div className="group relative rounded-3xl bg-[#111827]/80 backdrop-blur-md border border-white/10 p-10 transition-all duration-500 hover:scale-[1.02] hover:bg-[#111827] hover:shadow-[0_0_40px_-10px_rgba(6,182,212,0.4)] overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                                <Zap className="w-32 h-32 text-cyan-500" />
                            </div>

                            <div className="relative z-10">
                                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 mb-8 transform group-hover:-translate-y-2 transition-transform duration-500">
                                    <Ticket className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-3xl font-bold text-white mb-4">Event Attendee</h3>
                                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                                    Discover epic experiences, purchase verified tickets securely, and skip the line.
                                </p>

                                <ul className="space-y-4 mb-10 text-slate-300">
                                    <li className="flex items-center">
                                        <div className="h-6 w-6 rounded-full bg-cyan-500/20 flex items-center justify-center mr-3">
                                            <Music className="h-3.5 w-3.5 text-cyan-400" />
                                        </div>
                                        Curated Discoveries
                                    </li>
                                    <li className="flex items-center">
                                        <div className="h-6 w-6 rounded-full bg-cyan-500/20 flex items-center justify-center mr-3">
                                            <Shield className="h-3.5 w-3.5 text-cyan-400" />
                                        </div>
                                        Secure Digital Tickets
                                    </li>
                                </ul>

                                <button
                                    onClick={handleCustomerClick}
                                    className="w-full relative px-6 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 flex items-center justify-center group/btn shadow-[0_0_20px_-5px_rgba(6,182,212,0.5)]"
                                >
                                    {user ? 'Explore Events' : 'Join the Community'}
                                    <ArrowRight className="ml-3 h-5 w-5 group-hover/btn:translate-x-2 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Features Showcase */}
                    <div className="border-t border-white/10 pt-24 pb-12">
                        <div className="text-center mb-16">
                            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Choose NexusEvents?</h3>
                            <p className="text-slate-400 text-lg">Uncompromising performance meets stunning design.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { icon: Zap, title: "Lightning Fast", desc: "Built on Next.js 15 for instantaneous page loads and seamless transitions.", color: "text-amber-400", bg: "bg-amber-400/10" },
                                { icon: Shield, title: "Bank-Grade Security", desc: "JWT authenticated sessions with rigorous input validation.", color: "text-emerald-400", bg: "bg-emerald-400/10" },
                                { icon: Globe, title: "Global Scale", desc: "Robust .NET 9 backend ready to handle thousands of concurrent bookings.", color: "text-blue-400", bg: "bg-blue-400/10" },
                            ].map((feat, i) => (
                                <div key={i} className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                                    <div className={`h-12 w-12 rounded-xl ${feat.bg} flex items-center justify-center mb-6`}>
                                        <feat.icon className={`h-6 w-6 ${feat.color}`} />
                                    </div>
                                    <h4 className="text-xl font-bold text-white mb-3">{feat.title}</h4>
                                    <p className="text-slate-400 leading-relaxed">{feat.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

