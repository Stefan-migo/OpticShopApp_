'use client';

import * as React from 'react';
import { useRouter, useParams, usePathname, useSearchParams } from 'next/navigation'; // Import usePathname and useSearchParams
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Locale, i18n } from '@/lib/i18n/config';
import { Dictionary } from '@/lib/i18n/types';

interface LanguageSwitcherProps {
  dictionary: Dictionary;
}

export default function LanguageSwitcher({ dictionary }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname(); // Get current pathname
  const searchParams = useSearchParams(); // Get current search params
  const params = useParams(); // Get route parameters
  const currentLocale = params.lang as Locale; // Get current locale from route params

  const handleLocaleChange = (newLocale: Locale) => {
    // Construct the new path by replacing the current locale segment
    const segments = pathname.split('/');
    // Find the index of the current locale segment (it should be the first segment after the initial empty string)
    const localeIndex = segments.indexOf(currentLocale);

    if (localeIndex !== -1) {
      segments[localeIndex] = newLocale;
    } else {
      // Fallback: If locale not found, prepend it after the initial empty string
      segments.splice(1, 0, newLocale);
    }

    const newPathname = segments.join('/');

    // Preserve existing query parameters
    const newUrl = `${newPathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    router.push(newUrl);
  };

  return (
    <Select onValueChange={handleLocaleChange} defaultValue={currentLocale}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={dictionary.settings.selectLanguagePlaceholder} />
      </SelectTrigger>
      <SelectContent>
        {i18n.locales.map((locale) => (
          <SelectItem key={locale} value={locale}>
            {dictionary.languages[locale as keyof Dictionary['languages']]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
