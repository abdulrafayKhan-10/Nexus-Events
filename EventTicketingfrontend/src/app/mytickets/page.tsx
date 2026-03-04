/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Calendar, MapPin, Clock, Ticket, Download, Search,
    CheckCircle, XCircle, AlertCircle, QrCode, User, Mail,
    ExternalLink, ChevronDown, ChevronUp, Filter, Tag,
    ArrowLeft, Sparkles, TicketCheck, Hash, Building
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { userApi } from '@/lib/api';
import { useI18n, useI18nContext } from '@/components/providers/I18nProvider';

interface TicketData {
    ticketId: number;
    eventId: number;
    eventTitle: string;
    ticketTypeId: number;
    ticketTypeName: string;
    ticketNumber: string;
    qrCode: string;
    pricePaid: number;
    currency?: string;
    status: string;
    purchaseDate: string;
    checkInDate?: string;
    attendeeFirstName: string;
    attendeeLastName: string;
    attendeeEmail: string;
    eventStartDateTime: string;
    venueName: string;
    venueAddress: string;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; dot: string }> = {
    valid:     { label: 'Valid',      bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
    used:      { label: 'Used',       bg: 'bg-blue-500/10',    text: 'text-blue-400',    border: 'border-blue-500/30',    dot: 'bg-blue-400'    },
    cancelled: { label: 'Cancelled',  bg: 'bg-rose-500/10',    text: 'text-rose-400',    border: 'border-rose-500/30',    dot: 'bg-rose-400'    },
    default:   { label: 'Pending',    bg: 'bg-amber-500/10',   text: 'text-amber-400',   border: 'border-amber-500/30',   dot: 'bg-amber-400'   },
};

const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
const fmtTime = (s: string) => new Date(s).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
const fmtMoney = (n: number, cur = 'USD') => {
    const sym: Record<string,string> = { USD:'$', EUR:'€', GBP:'£', JPY:'¥' };
    return cur === 'JPY' ? `${sym[cur]??'$'}${Math.round(n).toLocaleString()}` : `${sym[cur]??'$'}${n.toFixed(2)}`;
};
const isUpcoming = (d: string) => new Date(d) > new Date();

export default function MyTicketsPage() {
    const router = useRouter();
    const { t } = useI18nContext();
    const [tickets, setTickets]             = useState<TicketData[]>([]);
    const [loading, setLoading]             = useState(true);
    const [search, setSearch]               = useState('');
    const [statusFilter, setStatusFilter]   = useState('all');
    const [dateFilter, setDateFilter]       = useState('all');
    const [expanded, setExpanded]           = useState<number | null>(null);

    useEffect(() => { fetchTickets(); }, []);

    const fetchTickets = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('http://localhost:5251/api/tickets/my-tickets', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setTickets(await res.json());
        } catch {}
        finally { setLoading(false); }
    };

    const downloadTicket = async (id: number) => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`http://localhost:5251/api/tickets/${id}/download`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const url = URL.createObjectURL(await res.blob());
                const a = document.createElement('a');
                a.href = url; a.download = `ticket-${id}.pdf`;
                document.body.appendChild(a); a.click();
                document.body.removeChild(a); URL.revokeObjectURL(url);
            }
        } catch {}
    };

    const filtered = tickets.filter(tk => {
        const q = search.toLowerCase();
        const matchSearch = !q ||
            tk.eventTitle.toLowerCase().includes(q) ||
            tk.ticketTypeName.toLowerCase().includes(q) ||
            tk.venueName.toLowerCase().includes(q) ||
            tk.ticketNumber.toLowerCase().includes(q);
        const matchStatus = statusFilter === 'all' || tk.status.toLowerCase() === statusFilter;
        const matchDate = dateFilter === 'all'
            || (dateFilter === 'upcoming' && isUpcoming(tk.eventStartDateTime))
            || (dateFilter === 'past' && !isUpcoming(tk.eventStartDateTime));
        return matchSearch && matchStatus && matchDate;
    });

    const upcoming  = tickets.filter(tk => isUpcoming(tk.eventStartDateTime)).length;
    const attended  = tickets.filter(tk => tk.status.toLowerCase() === 'used').length;

    if (loading) return (
        <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-white/10 border-t-cyan-400 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0a0f1c] text-white">
            {/* Background glow */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-900/15 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">

                {/* ── Header ── */}
                <div className="mb-10">
                    <button onClick={() => router.back()} className="flex items-center text-gray-400 hover:text-white mb-6 text-sm transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
                    </button>
                    <div className="flex items-end justify-between flex-wrap gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-600/30 to-cyan-600/30 border border-white/10">
                                    <TicketCheck className="h-6 w-6 text-cyan-400" />
                                </div>
                                <h1 className="text-4xl font-black text-white tracking-tight">My Tickets</h1>
                            </div>
                            <p className="text-gray-400 ml-1">Your event tickets and purchase history</p>
                        </div>
                        <Link href="/events" className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white text-sm font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_28px_rgba(139,92,246,0.5)]">
                            Browse Events
                        </Link>
                    </div>
                </div>

                {/* ── Stats Row ── */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                        { label: 'Total Tickets', value: tickets.length, icon: Ticket,       color: 'text-cyan-400',   glow: 'shadow-[0_0_20px_rgba(6,182,212,0.15)]' },
                        { label: 'Upcoming',       value: upcoming,       icon: Calendar,     color: 'text-emerald-400', glow: 'shadow-[0_0_20px_rgba(52,211,153,0.15)]' },
                        { label: 'Attended',       value: attended,       icon: CheckCircle,  color: 'text-purple-400', glow: 'shadow-[0_0_20px_rgba(167,139,250,0.15)]' },
                    ].map(({ label, value, icon: Icon, color, glow }) => (
                        <div key={label} className={`bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 ${glow}`}>
                            <div className="flex items-center gap-3">
                                <Icon className={`h-5 w-5 ${color}`} />
                                <div>
                                    <p className="text-2xl font-bold text-white">{value}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Filters ── */}
                <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <input
                            value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search events, venues, ticket numbers…"
                            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition"
                        />
                    </div>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                        className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/40 transition appearance-none cursor-pointer">
                        <option value="all" className="bg-[#0f172a]">All Status</option>
                        <option value="valid" className="bg-[#0f172a]">Valid</option>
                        <option value="used" className="bg-[#0f172a]">Used</option>
                        <option value="cancelled" className="bg-[#0f172a]">Cancelled</option>
                    </select>
                    <select value={dateFilter} onChange={e => setDateFilter(e.target.value)}
                        className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/40 transition appearance-none cursor-pointer">
                        <option value="all" className="bg-[#0f172a]">All Events</option>
                        <option value="upcoming" className="bg-[#0f172a]">Upcoming</option>
                        <option value="past" className="bg-[#0f172a]">Past</option>
                    </select>
                </div>

                {/* ── Ticket List ── */}
                {filtered.length === 0 ? (
                    <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-16 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-5">
                            <Ticket className="h-8 w-8 text-gray-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                            {tickets.length === 0 ? 'No tickets yet' : 'No matching tickets'}
                        </h3>
                        <p className="text-gray-400 mb-8 text-sm">
                            {tickets.length === 0
                                ? 'Purchase tickets to events and they will appear here.'
                                : 'Try adjusting your search or filters.'}
                        </p>
                        {tickets.length === 0 && (
                            <Link href="/events" className="inline-flex items-center px-6 py-3 bg-cyan-500/90 hover:bg-cyan-400 text-[#0a0f1c] font-bold rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(6,182,212,0.35)]">
                                <Sparkles className="h-4 w-4 mr-2" /> Browse Events
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map(ticket => {
                            const st = STATUS_CONFIG[ticket.status.toLowerCase()] ?? STATUS_CONFIG.default;
                            const open = expanded === ticket.ticketId;
                            const soon = isUpcoming(ticket.eventStartDateTime);

                            return (
                                <div key={ticket.ticketId}
                                    className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-200">
                                    {/* ── top accent bar ── */}
                                    <div className={`h-1 w-full ${st.dot === 'bg-emerald-400' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : st.dot === 'bg-blue-400' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : st.dot === 'bg-rose-400' ? 'bg-gradient-to-r from-rose-500 to-pink-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'}`} />

                                    <div className="p-6">
                                        <div className="flex items-start justify-between gap-4">
                                            {/* left */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center flex-wrap gap-2.5 mb-3">
                                                    <h3 className="text-lg font-bold text-white truncate">{ticket.eventTitle}</h3>
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${st.bg} ${st.text} ${st.border}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                                                        {st.label}
                                                    </span>
                                                    {soon && (
                                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                                                            Upcoming
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-2 gap-x-4 text-sm text-gray-400 mb-4">
                                                    <span className="flex items-center gap-1.5">
                                                        <Calendar className="h-3.5 w-3.5 text-cyan-400/70 shrink-0" />
                                                        {fmtDate(ticket.eventStartDateTime)}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <Clock className="h-3.5 w-3.5 text-purple-400/70 shrink-0" />
                                                        {fmtTime(ticket.eventStartDateTime)}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <Building className="h-3.5 w-3.5 text-pink-400/70 shrink-0" />
                                                        <span className="truncate">{ticket.venueName}</span>
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-3 text-sm">
                                                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-300">
                                                        <Tag className="h-3 w-3 text-gray-400" />
                                                        {ticket.ticketTypeName}
                                                    </span>
                                                    <span className="font-bold text-white">{fmtMoney(ticket.pricePaid, ticket.currency || 'USD')}</span>
                                                    <span className="flex items-center gap-1 font-mono text-xs text-gray-500">
                                                        <Hash className="h-3 w-3" />{ticket.ticketNumber}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* right: QR + actions */}
                                            <div className="flex flex-col items-end gap-2 shrink-0">
                                                <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
                                                    <QrCode className="h-7 w-7 text-gray-400" />
                                                </div>
                                                <button onClick={() => downloadTicket(ticket.ticketId)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/90 hover:bg-cyan-400 text-[#0a0f1c] text-xs font-bold rounded-lg transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                                                    <Download className="h-3.5 w-3.5" /> PDF
                                                </button>
                                                <button onClick={() => setExpanded(open ? null : ticket.ticketId)}
                                                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all">
                                                    {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                                    Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── Expanded details ── */}
                                    {open && (
                                        <div className="border-t border-white/10 bg-white/[0.02] px-6 py-5">
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">Attendee</p>
                                                    <div className="space-y-1.5 text-gray-300">
                                                        <p className="font-medium text-white">{ticket.attendeeFirstName} {ticket.attendeeLastName}</p>
                                                        <p className="flex items-center gap-1.5 text-xs">
                                                            <Mail className="h-3.5 w-3.5 text-gray-500" /> {ticket.attendeeEmail}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">Venue</p>
                                                    <div className="space-y-1.5 text-gray-300">
                                                        <p className="font-medium text-white">{ticket.venueName}</p>
                                                        <p className="text-xs text-gray-400">{ticket.venueAddress}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">Purchase</p>
                                                    <div className="space-y-1.5 text-gray-300 text-xs">
                                                        <p>Bought: <span className="text-white">{fmtDate(ticket.purchaseDate)}</span></p>
                                                        <p>Price: <span className="text-white font-bold">{fmtMoney(ticket.pricePaid, ticket.currency||'USD')}</span></p>
                                                        {ticket.checkInDate && <p>Checked in: <span className="text-emerald-400">{fmtDate(ticket.checkInDate)}</span></p>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-white/10">
                                                <Link href={`/events/${ticket.eventId}`}
                                                    className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
                                                    <ExternalLink className="h-3.5 w-3.5" /> View event details
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
