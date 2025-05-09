'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  // useTheme hook from next-themes provides the current theme and setTheme function
  const { theme, setTheme } = useTheme();

  // useEffect to ensure the component is mounted on the client side
  // This prevents hydration mismatches as next-themes reads from localStorage
  useEffect(() => {
    setMounted(true);
  }, []);

  // Render null on the server or during initial hydration to avoid mismatches
  if (!mounted) {
    return null;
  }

  // Render the Select component from shadcn/ui for theme selection
  return (
    <Select onValueChange={setTheme} value={theme}>
      <SelectTrigger className="w-[180px]"> {/* Added neumorphic styles */}
        <SelectValue placeholder="Select theme" />
      </SelectTrigger>
      <SelectContent> {/* Added neumorphic styles */}
        {/* Include the themes you want to offer */}
        {/* The 'system' option allows the theme to follow the user's OS preference */}
        <SelectItem value="system">System</SelectItem>
        <SelectItem value="light">Light</SelectItem>
        <SelectItem value="dark">Dark</SelectItem>
        <SelectItem value="ocean">Ocean</SelectItem>
        <SelectItem value="forest">Forest</SelectItem>
        <SelectItem value="earthy-teal">Earthy Teal</SelectItem>
        <SelectItem value="pastel-sky">Pastel Sky</SelectItem>
        <SelectItem value="cool-neutrals">Cool Neutrals</SelectItem>
        <SelectItem value="emerald-gold">Emerald Gold</SelectItem>
        <SelectItem value="vibrant-green">Vibrant Green</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default ThemeSwitcher;



<html lang="es" className="dark" color-scheme="light;">

</html>

