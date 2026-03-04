'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Calendar,
    MapPin,
    Users,
    Search,
    Globe,
    ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

interface Venue {
    venueId: number;
    name: string;
    description: string;
    address: string;
    city: string;
    state: string;
    country: string;
    capacity: number;
    imageUrl?: string;
    isActive: boolean;
    eventCount?: number;
}

const sampleVenues: Venue[] = [
    {
        venueId: 1001,
        name: 'Aurora Grand Hall',
        description: 'Futuristic hall with immersive lighting and crystal-clear acoustics.',
        address: '1 Starfall Ave',
        city: 'Neo City',
        state: 'CA',
        country: 'USA',
        capacity: 22000,
        imageUrl: '/placeholder-venue.jpg',
        isActive: true,
        eventCount: 14
    },
    {
        venueId: 1002,
        name: 'Lumen Sky Garden',
        description: 'Rooftop garden overlooking the skyline with modular staging.',
        address: '88 Helix Blvd',
        city: 'Skyport',
        state: 'NY',
        country: 'USA',
        capacity: 8500,
        imageUrl: '/placeholder-venue.jpg',
        isActive: true,
        eventCount: 9
    },
    {
        venueId: 1003,
        name: 'Pulse Arena',
        description: 'Adaptive arena built for esports, concerts, and conferences.',
        address: '500 Circuit Way',
        city: 'Byte Harbor',
        state: 'WA',
        country: 'USA',
        capacity: 16000,
        imageUrl: '/placeholder-venue.jpg',
        isActive: true,
        eventCount: 11
    }
];

export default function VenuesList() {
    const router = useRouter();
    const { user } = useAuth();
    const [venues, setVenues] = useState<Venue[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchVenues();
    }, []);

    const fetchVenues = async () => {
        try {
            const response = await fetch('http://localhost:5251/api/venues');
            if (response.ok) {
                const data = await response.json();
                const active = data.filter((v: Venue) => v.isActive);
                setVenues(active.length > 0 ? active : sampleVenues);
            } else {
                setVenues(sampleVenues);
            }
        } catch (error) {
            console.error('Failed to fetch venues:', error);
            setVenues(sampleVenues);
        } finally {
            setLoading(false);
        }
    };

    const getFullImageUrl = (path: string) => {
        if (!path) return '/placeholder-venue.jpg';
        if (path.startsWith('http')) return path;
        return `http://localhost:5251${path}`;
    };

    const filteredVenues = venues.filter(venue => 
        venue.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        venue.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venue.country.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.1)_0%,transparent_50%)]"></div>
                <div className="text-center z-10 relative">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-slate-400 font-medium tracking-wide">Loading venues...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0f1c] text-slate-200 selection:bg-purple-500/30 selection:text-purple-300 font-sans transition-colors duration-500 relative overflow-hidden">
            {/* Animated Background Gradients */}
            <div className="fixed top-0 left-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0a0f1c]/0 to-transparent pointer-events-none z-0"></div>
            <div className="fixed top-0 right-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-900/20 via-[#0a0f1c]/0 to-transparent pointer-events-none z-0"></div>

            {/* Main Content */}
            <main className="relative z-10 pt-32 pb-24">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-4 drop-shadow-lg">
                            Premium <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Venues</span>
                        </h2>
                        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                            Discover extraordinary locations holding the world's most spectacular events.
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto mt-8">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search venues by name, city, or country..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 text-white bg-[#111827]/80 backdrop-blur-md border border-white/10 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-xl"
                                />
                            </div>
                        </div>
                    </div>

                    {filteredVenues.length === 0 ? (
                        <div className="text-center py-20 bg-[#111827]/40 backdrop-blur-md rounded-3xl border border-white/5">
                            <MapPin className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-white mb-2">No Venues Found</h3>
                            <p className="text-slate-400">Try adjusting your search criteria.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredVenues.map((venue) => (
                                <Link href={`/venues/${venue.venueId}`} key={venue.venueId} className="group flex flex-col bg-[#111827]/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden hover:scale-[1.02] hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.3)] transition-all duration-500">
                                    <div className="relative h-48 w-full bg-slate-800 overflow-hidden">
                                        <img
                                            src={getFullImageUrl(venue.imageUrl || '')}
                                            alt={venue.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = '/placeholder-venue.jpg';
                                                target.style.opacity = '0.5';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#111827] to-transparent"></div>
                                        <div className="absolute bottom-4 left-4 right-4">
                                            <h3 className="text-xl font-bold text-white mb-1 truncate">{venue.name}</h3>
                                            <div className="flex items-center text-sm text-cyan-300">
                                                <MapPin className="h-4 w-4 mr-1" />
                                                <span className="truncate">{venue.city}, {venue.country}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 flex flex-col flex-grow">
                                        <p className="text-slate-400 text-sm line-clamp-2 mb-6 flex-grow">
                                            {venue.description || 'A spectacular venue perfect for hosting unforgettable events.'}
                                        </p>
                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="flex items-center text-slate-300 px-3 py-1.5 bg-white/5 rounded-full text-sm">
                                                <Users className="h-4 w-4 mr-2 text-purple-400" />
                                                <span>{venue.capacity.toLocaleString()} Capacity</span>
                                            </div>
                                            <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                                                <ExternalLink className="h-4 w-4 text-purple-300 group-hover:text-white transition-colors" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

