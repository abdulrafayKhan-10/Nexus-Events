/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/LanguageSettings.tsx
import React, { useState } from 'react';
import { useI18n, SUPPORTED_LANGUAGES } from '@/hooks/useSafeI18n';
import { useThemeClasses } from '@/hooks/useTheme';
import {
    Globe,
    Check,
    ChevronDown,
    Search,
    Clock,
    Calendar,
    DollarSign,
    MapPin,
    Monitor,
    Smartphone,
    Info
} from 'lucide-react';

interface LanguageSettingsProps {
    onLanguageChange?: (languageCode: string) => void;
    onPreferenceChange?: (key: string, value: any) => void;
    userPreferences?: {
        language: string;
        timeFormat: '12h' | '24h';
        dateFormat: string;
        currency: string;
        region?: string;
    };
    disabled?: boolean;
}

const LanguageSettings: React.FC<LanguageSettingsProps> = ({
    onLanguageChange,
    onPreferenceChange,
    userPreferences,
    disabled = false
}) => {
    const { currentLanguage, changeLanguage, t, formatDate, formatTime, formatCurrency } = useI18n();
    const themeClasses = useThemeClasses();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);

    const selectedLanguage = userPreferences?.language || currentLanguage;
    const selectedLangData = SUPPORTED_LANGUAGES.find(lang => lang.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];

    const filteredLanguages = SUPPORTED_LANGUAGES.filter(lang =>
        lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lang.nativeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lang.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleLanguageSelect = (languageCode: string) => {
        const langData = SUPPORTED_LANGUAGES.find(lang => lang.code === languageCode);
        if (!langData) return;

        if (onLanguageChange) {
            onLanguageChange(languageCode);
        } else {
            changeLanguage(languageCode);
        }

        if (onPreferenceChange) {
            onPreferenceChange('language', languageCode);
            onPreferenceChange('timeFormat', langData.timeFormat);
            onPreferenceChange('dateFormat', langData.dateFormat);
            onPreferenceChange('currency', langData.currency);
        }

        setIsDropdownOpen(false);
        setSearchTerm('');
    };

    const LanguageOption: React.FC<{ language: typeof SUPPORTED_LANGUAGES[0]; isSelected: boolean }> = ({
        language,
        isSelected
    }) => (
        <button
            onClick={() => handleLanguageSelect(language.code)}
            disabled={disabled}
            className={`w-full flex items-center justify-between p-3 text-left transition-colors ${isSelected
                    ? 'accent-bg text-white'
                    : `${themeClasses.hover} ${themeClasses.themeFg}`
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
            <div className="flex items-center space-x-3">
                <span className="text-xl">{language.flag}</span>
                <div>
                    <div className={`font-medium ${isSelected ? 'text-white' : themeClasses.themeFg}`}>
                        {language.name}
                    </div>
                    <div className={`text-sm ${isSelected ? 'text-white/80' : themeClasses.themeMutedFg}`}>
                        {language.nativeName}
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-2">
                {language.direction === 'rtl' && (
                    <span className={`text-xs px-2 py-1 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}>
                        RTL
                    </span>
                )}
                {isSelected && <Check className="w-4 h-4" />}
            </div>
        </button>
    );

    return (
        <div className="space-y-6">
            {/* Language Selection */}
            <div className={`${themeClasses.themeCard} rounded-lg ${themeClasses.compactCard} shadow-sm border ${themeClasses.themeBorder}`}>
                <div className="flex items-center space-x-2 mb-4">
                    <Globe className={`w-5 h-5 ${themeClasses.themeMutedFg}`} />
                    <h3 className={`${themeClasses.textLg} font-semibold ${themeClasses.themeFg}`}>
                        Language & Region
                    </h3>
                </div>

                <div className="space-y-4">
                    {/* Current Language Display */}
                    <div>
                        <label className={`block ${themeClasses.textSm} font-medium ${themeClasses.themeFg} mb-2`}>
                            Selected Language
                        </label>
                        <div className="relative">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                disabled={disabled}
                                className={`w-full flex items-center justify-between p-3 border rounded-lg transition-colors ${themeClasses.themeCard
                                    } ${themeClasses.themeBorder} ${themeClasses.hover} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                    }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <span className="text-xl">{selectedLangData.flag}</span>
                                    <div className="text-left">
                                        <div className={`font-medium ${themeClasses.themeFg}`}>
                                            {selectedLangData.name}
                                        </div>
                                        <div className={`text-sm ${themeClasses.themeMutedFg}`}>
                                            {selectedLangData.nativeName}
                                        </div>
                                    </div>
                                </div>
                                <ChevronDown className={`w-4 h-4 ${themeClasses.themeMutedFg} transition-transform ${isDropdownOpen ? 'rotate-180' : ''
                                    }`} />
                            </button>

                            {/* Dropdown */}
                            {isDropdownOpen && (
                                <div className={`absolute top-full left-0 right-0 mt-1 ${themeClasses.themeCard} border ${themeClasses.themeBorder} rounded-lg shadow-lg z-50 max-h-80 overflow-hidden`}>
                                    {/* Search */}
                                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                                        <div className="relative">
                                            <Search className={`absolute left-3 top-2.5 w-4 h-4 ${themeClasses.themeMutedFg}`} />
                                            <input
                                                type="text"
                                                placeholder="Search languages..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className={`w-full pl-10 pr-3 py-2 border rounded ${themeClasses.themeCard} ${themeClasses.themeBorder} ${themeClasses.themeFg} placeholder-gray-400`}
                                            />
                                        </div>
                                    </div>

                                    {/* Language List */}
                                    <div className="max-h-60 overflow-y-auto">
                                        {filteredLanguages.length > 0 ? (
                                            filteredLanguages.map((language) => (
                                                <LanguageOption
                                                    key={language.code}
                                                    language={language}
                                                    isSelected={language.code === selectedLanguage}
                                                />
                                            ))
                                        ) : (
                                            <div className={`p-3 text-center ${themeClasses.themeMutedFg}`}>
                                                No languages found
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Language Info */}
                    <div className={`p-3 rounded-lg ${themeClasses.isDark ? 'bg-blue-900/20' : 'bg-blue-50'} border ${themeClasses.isDark ? 'border-blue-800' : 'border-blue-200'}`}>
                        <div className="flex items-start space-x-2">
                            <Info className={`w-4 h-4 mt-0.5 ${themeClasses.isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                            <div className={`text-sm ${themeClasses.isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                                <p className="font-medium mb-1">Language Settings Applied:</p>
                                <ul className="space-y-1 text-xs">
                                    <li>• Interface language: {selectedLangData.name}</li>
                                    <li>• Default time format: {selectedLangData.timeFormat === '12h' ? '12-hour' : '24-hour'}</li>
                                    <li>• Default date format: {selectedLangData.dateFormat}</li>
                                    <li>• Default currency: {selectedLangData.currency}</li>
                                    <li>• Text direction: {selectedLangData.direction.toUpperCase()}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Regional Preferences */}
            <div className={`${themeClasses.themeCard} rounded-lg ${themeClasses.compactCard} shadow-sm border ${themeClasses.themeBorder}`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <MapPin className={`w-5 h-5 ${themeClasses.themeMutedFg}`} />
                        <h3 className={`${themeClasses.textLg} font-semibold ${themeClasses.themeFg}`}>
                            Regional Preferences
                        </h3>
                    </div>
                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className={`text-sm ${themeClasses.themeMutedFg} hover:${themeClasses.themeFg} transition-colors`}
                    >
                        {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Time Format */}
                    <div>
                        <label className={`block ${themeClasses.textSm} font-medium ${themeClasses.themeFg} mb-2`}>
                            <Clock className="w-4 h-4 inline mr-1" />
                            Time Format
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {(['12h', '24h'] as const).map((format) => (
                                <button
                                    key={format}
                                    onClick={() => onPreferenceChange?.('timeFormat', format)}
                                    disabled={disabled}
                                    className={`p-3 rounded-lg border-2 transition-all ${(userPreferences?.timeFormat || selectedLangData.timeFormat) === format
                                            ? 'accent-border bg-blue-50 dark:bg-blue-900/20'
                                            : `${themeClasses.themeBorder} ${themeClasses.hover}`
                                        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    <div className={`${themeClasses.textSm} font-medium ${themeClasses.themeFg}`}>
                                        {format === '12h' ? '12-hour' : '24-hour'}
                                    </div>
                                    <div className={`${themeClasses.textSm} ${themeClasses.themeMutedFg}`}>
                                        {format === '12h' ? formatTime(new Date(), '12h') : formatTime(new Date(), '24h')}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date Format */}
                    <div>
                        <label className={`block ${themeClasses.textSm} font-medium ${themeClasses.themeFg} mb-2`}>
                            <Calendar className="w-4 h-4 inline mr-1" />
                            Date Format
                        </label>
                        <select
                            value={userPreferences?.dateFormat || selectedLangData.dateFormat}
                            onChange={(e) => onPreferenceChange?.('dateFormat', e.target.value)}
                            disabled={disabled}
                            className={`w-full p-3 border rounded-lg ${themeClasses.themeCard} ${themeClasses.themeBorder} ${themeClasses.themeFg} ${disabled ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            <option value="MM/dd/yyyy">MM/dd/yyyy (US)</option>
                            <option value="dd/MM/yyyy">dd/MM/yyyy (EU)</option>
                            <option value="yyyy/MM/dd">yyyy/MM/dd (ISO)</option>
                            <option value="dd.MM.yyyy">dd.MM.yyyy (DE)</option>
                            <option value="yyyy年MM月dd日">yyyy年MM月dd日 (JP)</option>
                        </select>
                        <div className={`mt-1 ${themeClasses.textSm} ${themeClasses.themeMutedFg}`}>
                            Preview: {formatDate(new Date())}
                        </div>
                    </div>
                </div>

                {/* Currency */}
                <div className="mt-4">
                    <label className={`block ${themeClasses.textSm} font-medium ${themeClasses.themeFg} mb-2`}>
                        <DollarSign className="w-4 h-4 inline mr-1" />
                        Currency
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {[
                            { code: 'USD', symbol: '$', name: 'US Dollar' },
                            { code: 'EUR', symbol: '€', name: 'Euro' },
                            { code: 'GBP', symbol: '£', name: 'Pound' },
                            { code: 'JPY', symbol: '¥', name: 'Yen' },
                            { code: 'CNY', symbol: '¥', name: 'Yuan' },
                            { code: 'KRW', symbol: '₩', name: 'Won' },
                            { code: 'MYR', symbol: 'RM', name: 'Ringgit' },
                            { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' }
                        ].map((currency) => (
                            <button
                                key={currency.code}
                                onClick={() => onPreferenceChange?.('currency', currency.code)}
                                disabled={disabled}
                                className={`p-2 rounded border-2 transition-all ${(userPreferences?.currency || selectedLangData.currency) === currency.code
                                        ? 'accent-border bg-blue-50 dark:bg-blue-900/20'
                                        : `${themeClasses.themeBorder} ${themeClasses.hover}`
                                    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                                <div className={`${themeClasses.textSm} font-medium ${themeClasses.themeFg}`}>
                                    {currency.symbol}
                                </div>
                                <div className={`text-xs ${themeClasses.themeMutedFg}`}>
                                    {currency.code}
                                </div>
                            </button>
                        ))}
                    </div>
                    <div className={`mt-2 ${themeClasses.textSm} ${themeClasses.themeMutedFg}`}>
                        Preview: {formatCurrency(1234.56, userPreferences?.currency)}
                    </div>
                </div>

                {/* Advanced Settings */}
                {showAdvanced && (
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                        <h4 className={`${themeClasses.textBase} font-medium ${themeClasses.themeFg}`}>
                            Advanced Regional Settings
                        </h4>

                        {/* Number Format */}
                        <div>
                            <label className={`block ${themeClasses.textSm} font-medium ${themeClasses.themeFg} mb-2`}>
                                Number Format
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <button
                                    className={`p-3 rounded border-2 text-left ${themeClasses.themeBorder} ${themeClasses.hover}`}
                                >
                                    <div className={`${themeClasses.textSm} font-medium ${themeClasses.themeFg}`}>
                                        Decimal: comma (1.234,56)
                                    </div>
                                    <div className={`text-xs ${themeClasses.themeMutedFg}`}>
                                        European format
                                    </div>
                                </button>
                                <button
                                    className={`p-3 rounded border-2 text-left accent-border bg-blue-50 dark:bg-blue-900/20`}
                                >
                                    <div className={`${themeClasses.textSm} font-medium ${themeClasses.themeFg}`}>
                                        Decimal: period (1,234.56)
                                    </div>
                                    <div className={`text-xs ${themeClasses.themeMutedFg}`}>
                                        US/UK format
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* First Day of Week */}
                        <div>
                            <label className={`block ${themeClasses.textSm} font-medium ${themeClasses.themeFg} mb-2`}>
                                First Day of Week
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    className={`p-3 rounded border-2 accent-border bg-blue-50 dark:bg-blue-900/20`}
                                >
                                    <div className={`${themeClasses.textSm} font-medium ${themeClasses.themeFg}`}>
                                        Monday
                                    </div>
                                    <div className={`text-xs ${themeClasses.themeMutedFg}`}>
                                        Most countries
                                    </div>
                                </button>
                                <button
                                    className={`p-3 rounded border-2 ${themeClasses.themeBorder} ${themeClasses.hover}`}
                                >
                                    <div className={`${themeClasses.textSm} font-medium ${themeClasses.themeFg}`}>
                                        Sunday
                                    </div>
                                    <div className={`text-xs ${themeClasses.themeMutedFg}`}>
                                        US, Canada
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Live Preview */}
            <div className={`${themeClasses.themeCard} rounded-lg ${themeClasses.compactCard} shadow-sm border ${themeClasses.themeBorder}`}>
                <div className="flex items-center space-x-2 mb-4">
                    <Monitor className={`w-5 h-5 ${themeClasses.themeMutedFg}`} />
                    <h3 className={`${themeClasses.textLg} font-semibold ${themeClasses.themeFg}`}>
                        Live Preview
                    </h3>
                </div>

                <div className={`border-2 border-dashed ${themeClasses.themeBorder} rounded-lg p-4 space-y-3`}>
                    <div className="flex items-center justify-between">
                        <span className={`${themeClasses.textSm} ${themeClasses.themeMutedFg}`}>
                            Current Date & Time:
                        </span>
                        <span className={`${themeClasses.textSm} font-medium ${themeClasses.themeFg}`}>
                            {formatDate(new Date())} {formatTime(new Date())}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className={`${themeClasses.textSm} ${themeClasses.themeMutedFg}`}>
                            Sample Price:
                        </span>
                        <span className={`${themeClasses.textSm} font-medium ${themeClasses.themeFg}`}>
                            {formatCurrency(99.99, userPreferences?.currency)}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className={`${themeClasses.textSm} ${themeClasses.themeMutedFg}`}>
                            Interface Language:
                        </span>
                        <span className={`${themeClasses.textSm} font-medium ${themeClasses.themeFg}`}>
                            {selectedLangData.flag} {selectedLangData.nativeName}
                        </span>
                    </div>

                    {selectedLangData.direction === 'rtl' && (
                        <div className={`p-2 rounded ${themeClasses.isDark ? 'bg-amber-900/20' : 'bg-amber-50'} border ${themeClasses.isDark ? 'border-amber-800' : 'border-amber-200'}`}>
                            <div className="flex items-center space-x-2">
                                <Smartphone className={`w-4 h-4 ${themeClasses.isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                                <span className={`text-xs ${themeClasses.isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                                    Right-to-left (RTL) layout will be applied
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LanguageSettings;