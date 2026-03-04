/* eslint-disable @typescript-eslint/no-unused-vars */
// components/LanguageSelector.tsx
'use client';

import React, { useState } from 'react';
import { useI18nContext } from '@/components/providers/I18nProvider';
import { ChevronDown, Languages } from 'lucide-react';

interface LanguageSelectorProps {
    className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className = '' }) => {
    const { availableLanguages, currentLanguage, changeLanguage, t } = useI18nContext();
    const [isOpen, setIsOpen] = useState(false);

    const currentLang = availableLanguages.find(lang => lang.code === currentLanguage);

    return (
        <div className={`relative ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
                <Languages className="h-4 w-4" />
                <span className="text-sm font-medium">{currentLang?.flag} {currentLang?.nativeName}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                    {availableLanguages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => {
                                changeLanguage(lang.code);
                                setIsOpen(false);
                            }}
                            className={`flex items-center w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${currentLanguage === lang.code
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                    : 'text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            <span className="mr-3">{lang.flag}</span>
                            <div>
                                <div className="font-medium">{lang.nativeName}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{lang.name}</div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Click outside to close */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};

export default LanguageSelector;