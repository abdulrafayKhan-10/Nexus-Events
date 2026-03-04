import Link from 'next/link';
import { Calendar, Search, MapPin, Clock } from 'lucide-react';

export default function EventsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section - Customer Focused */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                            Discover Amazing Events
                        </h1>
                        <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
                            Find and book tickets for concerts, conferences, workshops, and more in your area.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <div className="relative max-w-md mx-auto sm:mx-0">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search events..."
                                    className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>
                            <button className="bg-blue-500 hover:bg-blue-400 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors duration-200">
                                Search Events
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Featured Categories */}
            <div className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Popular Event Categories
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Browse events by category and find exactly what you&apos;re looking for.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <Link href="/events/concerts" className="bg-white p-6 rounded-lg shadow-md border border-gray-200 text-center hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <Calendar className="h-6 w-6 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Concerts & Music</h3>
                            <p className="text-gray-600">Live music, festivals, and concert experiences.</p>
                        </Link>

                        <Link href="/events/conferences" className="bg-white p-6 rounded-lg shadow-md border border-gray-200 text-center hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <Clock className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Conferences</h3>
                            <p className="text-gray-600">Professional development and networking events.</p>
                        </Link>

                        <Link href="/events/workshops" className="bg-white p-6 rounded-lg shadow-md border border-gray-200 text-center hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <Search className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Workshops</h3>
                            <p className="text-gray-600">Learn new skills and expand your knowledge.</p>
                        </Link>

                        <Link href="/events/local" className="bg-white p-6 rounded-lg shadow-md border border-gray-200 text-center hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <MapPin className="h-6 w-6 text-orange-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Local Events</h3>
                            <p className="text-gray-600">Community gatherings and local experiences.</p>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Upcoming Events Preview */}
            <div className="bg-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Trending Events This Week
                        </h2>
                        <p className="text-xl text-gray-600">
                            Don&apos;t miss out on these popular events happening soon.
                        </p>
                    </div>

                    {/* Placeholder for actual event cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                                <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-500"></div>
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Sample Event {i}</h3>
                                    <p className="text-gray-600 mb-4">Event description goes here...</p>
                                    <div className="flex items-center text-sm text-gray-500 mb-4">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        <span>Dec 15, 2024</span>
                                        <MapPin className="h-4 w-4 ml-4 mr-2" />
                                        <span>Downtown</span>
                                    </div>
                                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gray-900 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Never Miss an Event Again
                    </h2>
                    <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                        Create an account to save your favorite events and get personalized recommendations.
                    </p>
                    <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors duration-200">
                        Sign Up Now
                    </Link>
                </div>
            </div>
        </div>
    );
}