/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, Calendar, AlertCircle, ArrowLeft, Sparkles } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [role, setRole] = useState<'visitor' | 'organizer'>('visitor');

    const { login } = useAuth();
    const router = useRouter();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        const p = new URLSearchParams(window.location.search);
        if (p.get('role') === 'organizer') setRole('organizer');
    }, []);

    const isOrg = role === 'organizer';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await login({ email, password });
            // Redirect will be handled by useAuth based on user role
        } catch (error) {
            setError('Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[#0a0f1c] text-slate-200 font-sans selection:bg-purple-500/30">
            {/* Left Column: Form */}
            <div className="w-full lg:w-1/2 flex flex-col relative z-10">
                {/* Back Link */}
                <div className="p-8 lg:p-12 absolute top-0 left-0 w-full">
                    <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors group">
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </Link>
                </div>

                <div className="flex-1 flex items-center justify-center p-8 lg:p-12 mt-16 lg:mt-0">
                    <div className="w-full max-w-md animate-fade-in-up">
                        <div className="mb-10 lg:mb-12">
                            <div className="inline-flex items-center space-x-2 mb-6">
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-lg ${isOrg ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/20' : 'bg-gradient-to-br from-purple-600 to-cyan-500 shadow-purple-500/20'}`}>
                                    <Sparkles className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-2xl font-black tracking-tight text-white">NexusEvents</span>
                            </div>
                            {/* Role badge */}
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-5 border ${isOrg ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-purple-500/10 text-purple-400 border-purple-500/30'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isOrg ? 'bg-amber-400' : 'bg-purple-400'}`} />
                                {isOrg ? 'Signing in as Organizer' : 'Signing in as Attendee'}
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-black text-white mb-3 tracking-tight">
                                Welcome back
                            </h1>
                            <p className="text-lg text-slate-400">
                                {isOrg ? 'Access your organizer dashboard and manage events.' : 'Enter your credentials to access your account.'}
                            </p>
                        </div>

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-5 py-4 rounded-2xl text-sm flex items-center animate-shake">
                                    <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2.5">
                                <label htmlFor="email" className="block text-sm font-semibold text-slate-300 ml-1">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-5 py-4 bg-[#111827] border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all duration-300"
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between ml-1">
                                    <label htmlFor="password" className="block text-sm font-semibold text-slate-300">
                                        Password
                                    </label>
                                    <Link href="/forgot-password" className="text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-5 py-4 bg-[#111827] border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all duration-300 pr-12"
                                        placeholder="        "
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 hover:text-white transition-colors"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-300 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-2xl hover:from-purple-500 hover:to-cyan-500 shadow-[0_0_30px_-5px_rgba(168,85,247,0.4)] hover:shadow-[0_0_40px_-5px_rgba(34,211,238,0.5)] disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden mt-2"
                            >
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                                {isLoading ? (
                                    <div className="flex items-center">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                                        Authenticating...
                                    </div>
                                ) : 'Sign In'}
                            </button>
                        </form>

                        <p className="mt-10 text-center text-slate-400">
                            Don&apos;t have an account?{' '}
                            <Link href={`/register?role=${role}`} className="font-bold text-white hover:text-purple-400 transition-colors underline decoration-purple-500/30 underline-offset-4">
                                Create one now
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Column: Immersive Visual */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#050810]">
                {/* Abstract floating shapes behind image */}
                <div className="absolute top-[10%] right-[10%] w-[400px] h-[400px] bg-purple-600/30 rounded-full blur-[120px] mix-blend-screen animate-blob"></div>
                <div className="absolute bottom-[10%] left-[10%] w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-2000"></div>

                {/* The background image */}
                <div
                    className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540039155732-6761b54cb185?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-60 mix-blend-luminosity"
                ></div>

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1c] via-[#0a0f1c]/40 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f1c] via-transparent to-transparent"></div>

                {/* Content Overlay */}
                <div className="relative w-full h-full flex flex-col justify-end p-16">
                    <div className="glass-card bg-[#0a0f1c]/40 backdrop-blur-xl border border-white/10 rounded-3xl p-10 transform translate-y-0 hover:-translate-y-2 transition-transform duration-500">
                        <div className="mb-6 flex space-x-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <svg key={star} className="w-6 h-6 text-amber-400 fill-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                            ))}
                        </div>
                        <p className="text-2xl text-white font-medium leading-relaxed mb-8">
                            "NexusEvents transformed how we manage our conferences. The real-time analytics and seamless ticketing experience are unmatched in the industry."
                        </p>
                        <div className="flex items-center">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 p-[2px]">
                                <div className="w-full h-full rounded-full bg-[#0a0f1c] flex items-center justify-center">
                                    <span className="text-sm font-bold text-white">AK</span>
                                </div>
                            </div>
                            <div className="ml-4">
                                <h4 className="text-white font-bold text-lg">Alex Kharlamov</h4>
                                <p className="text-slate-400 text-sm">Event Director, TechSummit</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
