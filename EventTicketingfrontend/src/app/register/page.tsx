'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, AlertCircle, ArrowLeft, Sparkles, Music } from 'lucide-react';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [role, setRole] = useState<'visitor' | 'organizer'>('visitor');

    const { register } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const p = new URLSearchParams(window.location.search);
        if (p.get('role') === 'organizer') setRole('organizer');
    }, []);

    const isOrg = role === 'organizer';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            setIsLoading(false);
            return;
        }

        try {
            await register({
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                phoneNumber: formData.phoneNumber,
                userType: isOrg ? 'Organizer' : 'Attendee'
            });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            setError('Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-row-reverse bg-[#0a0f1c] text-slate-200 font-sans selection:bg-cyan-500/30">
            {/* Right Column: Form (Flex reverse pushes this to the left on visual display, 
                 but we want register to feel like a mirror of login) Let's keep it Left Form, Right Image or vice versa? 
                 Let's do Left form, Right Image to be consistent with Login. So we revert flex-row-reverse. 
                 Wait, I used flex-row-reverse to make it visually distinct but structurally similar. 
                 Actually, just row is fine to keep the layout consistent. */}
            <div className="w-full lg:w-1/2 flex flex-col relative z-10 bg-[#0a0f1c] border-l border-white/5">
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
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-lg ${isOrg ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/20' : 'bg-gradient-to-br from-cyan-500 to-purple-600 shadow-cyan-500/20'}`}>
                                    <Sparkles className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-2xl font-black tracking-tight text-white">NexusEvents</span>
                            </div>
                            {/* Role badge */}
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-5 border ${isOrg ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isOrg ? 'bg-amber-400' : 'bg-cyan-400'}`} />
                                {isOrg ? 'Creating Organizer Account' : 'Creating Attendee Account'}
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-black text-white mb-3 tracking-tight">
                                {isOrg ? 'Start Organizing' : 'Join the Party'}
                            </h1>
                            <p className="text-lg text-slate-400">
                                {isOrg ? 'Create your organizer account and start hosting events.' : 'Create an account to discover and manage epic events.'}
                            </p>
                        </div>

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            {error && (
                                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-5 py-4 rounded-2xl text-sm flex items-center animate-shake">
                                    <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="firstName" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 ml-1">
                                        First Name
                                    </label>
                                    <input
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        required
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="w-full px-5 py-3.5 bg-[#111827] border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 transition-all duration-300"
                                        placeholder="John"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="lastName" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 ml-1">
                                        Last Name
                                    </label>
                                    <input
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        required
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="w-full px-5 py-3.5 bg-[#111827] border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all duration-300"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 ml-1">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-5 py-3.5 bg-[#111827] border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 transition-all duration-300"
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="phoneNumber" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 ml-1">
                                    Phone Number <span className="text-slate-500 italic lowercase normal-case">(optional)</span>
                                </label>
                                <input
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    type="tel"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    className="w-full px-5 py-3.5 bg-[#111827] border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all duration-300"
                                    placeholder="+1 (555) 123-4567"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 ml-1">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            autoComplete="new-password"
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full px-5 py-3.5 bg-[#111827] border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 transition-all duration-300 pr-12"
                                            placeholder="6+ chars"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="confirmPassword" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 ml-1">
                                        Confirm
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            autoComplete="new-password"
                                            required
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="w-full px-5 py-3.5 bg-[#111827] border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all duration-300 pr-12"
                                            placeholder="Match pwd"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-300 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-2xl hover:from-cyan-500 hover:to-purple-500 shadow-[0_0_30px_-5px_rgba(34,211,238,0.4)] hover:shadow-[0_0_40px_-5px_rgba(168,85,247,0.5)] disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden mt-6"
                            >
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                                {isLoading ? (
                                    <div className="flex items-center">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                                        Creating Account...
                                    </div>
                                ) : 'Create Account'}
                            </button>
                        </form>

                        <p className="mt-8 text-center text-slate-400">
                            Already have an account?{' '}
                            <Link href={`/login?role=${role}`} className="font-bold text-white hover:text-cyan-400 transition-colors underline decoration-cyan-500/30 underline-offset-4">
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Left Column (Actually rendered on the left visually using flex-row-reverse? No we want Right Visual. We'll stick to Right Visual to parallel login.) */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#050810]">
                {/* Abstract floating shapes behind image */}
                <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] bg-cyan-600/30 rounded-full blur-[120px] mix-blend-screen animate-blob"></div>
                <div className="absolute bottom-[20%] right-[20%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-4000"></div>

                {/* The background image (Concert/Party vibe) */}
                <div
                    className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1533174000223-149fa564dcff?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-70 mix-blend-luminosity"
                ></div>

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1c] via-[#0a0f1c]/40 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-l from-[#0a0f1c] via-transparent to-transparent"></div>

                {/* Content Overlay */}
                <div className="relative w-full h-full flex flex-col justify-end p-16">
                    <div className="glass-card bg-[#0a0f1c]/40 backdrop-blur-xl border border-white/10 rounded-3xl p-10 transform translate-y-0 hover:-translate-y-2 transition-transform duration-500">
                        <div className="mb-6 inline-flex p-3 rounded-2xl bg-white/5 border border-white/10">
                            <Music className="w-8 h-8 text-cyan-400" />
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-4">Discover the Unforgettable</h3>
                        <p className="text-lg text-slate-300 font-medium leading-relaxed mb-6">
                            Join over 500,000+ attendees and start your journey to epic experiences, zero hidden fees, and seamless secure digital tickets.
                        </p>

                        <div className="flex -space-x-4">
                            <img className="w-12 h-12 rounded-full border-2 border-[#0a0f1c] object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop" alt="User" />
                            <img className="w-12 h-12 rounded-full border-2 border-[#0a0f1c] object-cover" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=100&auto=format&fit=crop" alt="User" />
                            <img className="w-12 h-12 rounded-full border-2 border-[#0a0f1c] object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop" alt="User" />
                            <div className="w-12 h-12 rounded-full border-2 border-[#0a0f1c] bg-[#111827] flex items-center justify-center text-xs font-bold text-white">+500k</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
