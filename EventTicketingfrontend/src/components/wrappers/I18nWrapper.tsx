/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable react-hooks/rules-of-hooks */
// components/wrappers/I18nWrapper.tsx
'use client';

import React, { ReactNode } from 'react';

// Fallback translations
const fallbackTranslations: Record<string, string> = {
    dashboard: 'Dashboard',
    welcomeBack: 'Welcome back, {name}!',
    createEvent: 'Create Event',
    totalEvents: 'Total Events',
    ticketsSold: 'Tickets Sold',
    totalRevenue: 'Total Revenue',
    upcomingEvents: 'Upcoming Events',
    yourEvents: 'Your Events',
    viewAllEvents: 'View all events →',
    noEventsYet: 'No events yet',
    createFirstEventPrompt: 'Create your first event to get started with EventPro.',
    createYourFirstEvent: 'Create Your First Event',
    loadingDashboard: 'Loading your dashboard...',
    dashboardError: 'Failed to load dashboard data',
    published: 'Published',
    draft: 'Draft',
    online: 'Online',
    inPerson: 'In-Person',
    view: 'View',
    edit: 'Edit',
    publish: 'Publish',
    unpublish: 'Unpublish',
    delete: 'Delete',
    virtualEvent: 'Virtual Event',
    uncategorized: 'Uncategorized',
    revenue: 'Revenue',
    maxCapacity: 'Max Capacity',
    unlimited: 'Unlimited',
    multiDaySchedule: 'Multi-day schedule',
    dayEvent: '{count}-day event',
    publishedCount: '{count} published',
    loading: 'Loading...',
    language: 'Language',
    logout: 'Logout',
    events: 'Events',
    settings: 'Settings'
};

// Fallback functions
const fallbackT = (key: string, params?: Record<string, any>) => {
    let translation = fallbackTranslations[key] || key;

    if (params) {
        Object.keys(params).forEach(paramKey => {
            translation = translation.replace(`{${paramKey}}`, String(params[paramKey]));
        });
    }

    return translation;
};

const fallbackFormatCurrency = (amount: number, currency?: string) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD'
    }).format(amount);
};

const fallbackChangeLanguage = () => {
    console.log('Language change not available in fallback mode');
};

const fallbackAvailableLanguages = [
    { code: 'en', flag: '🇺🇸', nativeName: 'English', name: 'English' }
];

interface I18nWrapperProps {
    children: (i18nProps: {
        t: (key: string, params?: Record<string, any>) => string;
        formatCurrency: (amount: number, currency?: string) => string;
        changeLanguage: (code: string) => void;
        availableLanguages: Array<{
            code: string;
            flag: string;
            nativeName: string;
            name: string;
        }>;
        currentLanguage: string;
    }) => ReactNode;
}

export const I18nWrapper: React.FC<I18nWrapperProps> = ({ children }) => {
    let i18nProps;

    try {
        const { useI18nContext } = require('@/components/providers/I18nProvider');
        i18nProps = useI18nContext();
    } catch (error) {
        i18nProps = {
            t: fallbackT,
            formatCurrency: fallbackFormatCurrency,
            changeLanguage: fallbackChangeLanguage,
            availableLanguages: fallbackAvailableLanguages,
            currentLanguage: 'en'
        };
    }

    return <>{children(i18nProps)}</>;
};