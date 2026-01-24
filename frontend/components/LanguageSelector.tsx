import React, { useState } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { Language } from '../utils/translations';

interface LanguageSelectorProps {
    lang: Language;
    setLang: (lang: Language) => void;
    className?: string; // For positioning
    buttonClassName?: string; // For button styling
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ lang, setLang, className = '', buttonClassName = '' }) => {
    const [isOpen, setIsOpen] = useState(false);

    const languages: { code: Language; label: string }[] = [
        { code: 'en', label: 'English' },
        { code: 'el', label: 'Ελληνικά' },
        { code: 'de', label: 'Deutsch' },
        { code: 'fr', label: 'Français' },
    ];

    return (
        <div className={`relative ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-1.5 transition-all ${buttonClassName}`}
            >
                <Globe size={16} />
                <span>{lang.toUpperCase()}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    {/* Backdrop to close on click outside */}
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-40 bg-white/90 backdrop-blur-md border border-stone-200 rounded-xl shadow-xl overflow-hidden z-20 animate-in fade-in slide-in-from-top-2">
                        {languages.map((l) => (
                            <button
                                key={l.code}
                                onClick={() => {
                                    setLang(l.code);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 transition-colors flex items-center justify-between ${lang === l.code ? 'text-green-700 font-semibold bg-green-50/50' : 'text-stone-600'
                                    }`}
                            >
                                {l.label}
                                {lang === l.code && <Check size={14} className="text-green-600" />}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default LanguageSelector;
