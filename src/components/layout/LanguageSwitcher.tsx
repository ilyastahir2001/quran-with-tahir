import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        document.documentElement.dir = ['ar', 'ur'].includes(lng) ? 'rtl' : 'ltr';
        document.documentElement.lang = lng;

        // Set font family based on language
        if (lng === 'ar') {
            document.body.style.fontFamily = "'Cairo', sans-serif";
        } else if (lng === 'ur') {
            document.body.style.fontFamily = "'Noto Nastaliq Urdu', serif";
        } else {
            document.body.style.fontFamily = "inherit";
        }
    };

    const languages = [
        { code: 'en', label: 'English' },
        { code: 'ar', label: 'العربية' },
        { code: 'ur', label: 'اردو' },
        { code: 'fr', label: 'Français' },
    ];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full w-9 h-9">
                    <Globe className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className="flex justify-between"
                    >
                        {lang.label}
                        {i18n.resolvedLanguage === lang.code && (
                            <span className="text-primary text-xs ml-2">✓</span>
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
