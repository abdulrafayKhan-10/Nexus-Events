'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OrganizerIndexPage() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/organizer/dashboard');
    }, [router]);

    return (
        <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-white/10 border-t-cyan-400 rounded-full animate-spin" />
        </div>
    );
}
