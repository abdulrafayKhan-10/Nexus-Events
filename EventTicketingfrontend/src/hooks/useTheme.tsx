// hooks/useTheme.ts - Complete version with proper initialization
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface ThemeSettings {
    theme: 'light' | 'dark' | 'auto';
    accentColor: string;
    fontSize: 'small' | 'medium' | 'large';
    compactMode: boolean;
}

const ACCENT_COLORS = {
    blue: 'rgb(59, 130, 246)',
    purple: 'rgb(168, 85, 247)',
    green: 'rgb(34, 197, 94)',
    red: 'rgb(239, 68, 68)',
    orange: 'rgb(249, 115, 22)',
    pink: 'rgb(236, 72, 153)'
};

const defaultSettings: ThemeSettings = {
    theme: 'light',
    accentColor: 'blue',
    fontSize: 'medium',
    compactMode: false
};

export const useTheme = () => {
    const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);
    const [isDark, setIsDark] = useState(false);
    const [isCompact, setIsCompact] = useState(false);
    const isInitialized = useRef(false);

    const applyTheme = useCallback((newSettings: ThemeSettings) => {
        if (typeof window === 'undefined') return;

        const root = document.documentElement;
        const body = document.body;

        const shouldBeDark = newSettings.theme === 'dark' ||
            (newSettings.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

        setIsDark(shouldBeDark);
        body.classList.toggle('dark', shouldBeDark);
        root.classList.toggle('dark', shouldBeDark);

        body.classList.remove('text-size-small', 'text-size-medium', 'text-size-large');
        body.classList.add(`text-size-${newSettings.fontSize}`);
        root.classList.remove('text-size-small', 'text-size-medium', 'text-size-large');
        root.classList.add(`text-size-${newSettings.fontSize}`);

        setIsCompact(newSettings.compactMode);
        body.classList.toggle('compact', newSettings.compactMode);
        root.classList.toggle('compact', newSettings.compactMode);

        const accentColor = ACCENT_COLORS[newSettings.accentColor as keyof typeof ACCENT_COLORS] || ACCENT_COLORS.blue;
        root.style.setProperty('--color-primary', accentColor);

        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { ...newSettings, isDark: shouldBeDark }
        }));
    }, []);

    const updateTheme = useCallback((newSettings: Partial<ThemeSettings>) => {
        setSettings(prevSettings => {
            const updatedSettings = { ...prevSettings, ...newSettings };

            applyTheme(updatedSettings);

            try {
                localStorage.setItem('themeSettings', JSON.stringify(updatedSettings));
            } catch (error) {
                console.error('Error saving theme settings:', error);
            }

            return updatedSettings;
        });
    }, [applyTheme]);

    useEffect(() => {
        if (isInitialized.current || typeof window === 'undefined') return;
        isInitialized.current = true;

        let initialSettings = defaultSettings;

        try {
            const saved = localStorage.getItem('themeSettings');
            if (saved) {
                const parsed = JSON.parse(saved);
                initialSettings = { ...defaultSettings, ...parsed };
            }
        } catch (error) {
            console.error('Error loading theme settings:', error);
        }

        setSettings(initialSettings);
        applyTheme(initialSettings);

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (initialSettings.theme === 'auto') {
                applyTheme(initialSettings);
            }
        };

        mediaQuery.addEventListener('change', handleChange);

        return () => {
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, [applyTheme]);

    const initializeTheme = useCallback(() => {
        if (typeof window !== 'undefined') {
            applyTheme(settings);
        }
    }, [settings, applyTheme]);

    return {
        settings,
        isDark,
        isCompact,
        updateTheme,
        initializeTheme,
        applyTheme,
        accentColors: ACCENT_COLORS,
        getAccentColor: () => ACCENT_COLORS[settings.accentColor as keyof typeof ACCENT_COLORS] || ACCENT_COLORS.blue
    };
};

export const useThemeClasses = () => {
    const [isDark, setIsDark] = useState(false);
    const [isCompact, setIsCompact] = useState(false);
    const observerRef = useRef<MutationObserver | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const updateThemeState = () => {
            const currentIsDark = document.documentElement.classList.contains('dark') ||
                document.body.classList.contains('dark');
            const currentIsCompact = document.documentElement.classList.contains('compact') ||
                document.body.classList.contains('compact');

            setIsDark(prev => prev !== currentIsDark ? currentIsDark : prev);
            setIsCompact(prev => prev !== currentIsCompact ? currentIsCompact : prev);
        };

        setTimeout(updateThemeState, 0);

        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        observerRef.current = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    setTimeout(updateThemeState, 0);
                    break;
                }
            }
        });

        observerRef.current.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });

        observerRef.current.observe(document.body, {
            attributes: true,
            attributeFilter: ['class']
        });

        const handleThemeChange = () => {
            setTimeout(updateThemeState, 0);
        };

        window.addEventListener('themeChanged', handleThemeChange);

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
            window.removeEventListener('themeChanged', handleThemeChange);
        };
    }, []);

    return {
        isDark,
        isCompact,

        themeBg: isDark ? 'bg-gray-900' : 'bg-gray-50',
        themeCard: isDark ? 'bg-gray-800' : 'bg-white',
        themeMuted: isDark ? 'bg-gray-700' : 'bg-gray-100',

        themeFg: isDark ? 'text-gray-100' : 'text-gray-900',
        themeCardFg: isDark ? 'text-gray-100' : 'text-gray-900',
        themeMutedFg: isDark ? 'text-gray-400' : 'text-gray-600',

        themeBorder: isDark ? 'border-gray-700' : 'border-gray-200',

        hover: isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100',

        textXs: 'text-xs',
        textSm: 'text-responsive-sm text-sm',
        textBase: 'text-responsive-base text-base',
        textLg: 'text-responsive-lg text-lg',
        textXl: 'text-responsive-xl text-xl',
        text2Xl: 'text-responsive-2xl text-2xl',
        text3Xl: 'text-responsive-3xl text-3xl',

        compactCard: isCompact ? 'p-3' : 'p-6',
        compactInput: isCompact ? 'py-1.5 px-3' : 'py-2 px-4',
        compactButton: isCompact ? 'py-1.5 px-3' : 'py-2 px-4',
        compactGap: isCompact ? 'gap-2' : 'gap-4',
        compactSpace: isCompact ? 'space-y-2' : 'space-y-4',

        background: isDark ? 'bg-gray-900' : 'bg-gray-50',
        card: isDark ? 'bg-gray-800' : 'bg-white',
        text: isDark ? 'text-gray-100' : 'text-gray-900',
        textMuted: isDark ? 'text-gray-400' : 'text-gray-600',
        border: isDark ? 'border-gray-700' : 'border-gray-200',

        btnAccent: `bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors ${isCompact ? 'text-sm' : ''}`,
        btnAccentOutline: `border-2 border-blue-600 text-blue-600 bg-transparent px-4 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-colors ${isCompact ? 'text-sm' : ''}`
    };
};

export const useThemeUtils = () => {
    const { isDark, isCompact } = useTheme();
    const themeClasses = useThemeClasses();

    const getInputStyles = useCallback((hasError = false) => {
        const baseStyles = `w-full border rounded-lg focus:ring-2 accent-focus placeholder-opacity-60 transition-colors`;
        const themeStyles = `${themeClasses.themeCard} ${themeClasses.themeFg} ${themeClasses.themeBorder} ${themeClasses.compactInput}`;
        const errorStyles = hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : '';
        return `${baseStyles} ${themeStyles} ${errorStyles}`;
    }, [themeClasses]);

    const getCardStyles = useCallback((interactive = false) => {
        const baseStyles = `rounded-lg shadow-sm border transition-all`;
        const themeStyles = `${themeClasses.themeCard} ${themeClasses.themeBorder} ${themeClasses.compactCard}`;
        const interactiveStyles = interactive ? 'hover:shadow-md cursor-pointer' : '';
        return `${baseStyles} ${themeStyles} ${interactiveStyles}`;
    }, [themeClasses]);

    const getButtonStyles = useCallback((variant: 'primary' | 'secondary' | 'danger' = 'primary') => {
        const baseStyles = `font-medium rounded-lg transition-colors ${themeClasses.compactButton}`;

        switch (variant) {
            case 'primary':
                return `${baseStyles} accent-bg text-white hover:opacity-90`;
            case 'secondary':
                return `${baseStyles} ${themeClasses.themeBorder} border ${themeClasses.themeFg} ${themeClasses.hover}`;
            case 'danger':
                return `${baseStyles} bg-red-600 text-white hover:bg-red-700`;
            default:
                return `${baseStyles} accent-bg text-white hover:opacity-90`;
        }
    }, [themeClasses]);

    return {
        getInputStyles,
        getCardStyles,
        getButtonStyles,
        isDark,
        isCompact
    };
};