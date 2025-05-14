/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
      './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
      './src/components/**/*.{js,ts,jsx,tsx,mdx}',
      './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', '[data-theme]'], // Enable dark mode and data-theme
  theme: {
      extend: {
          colors: {
              border: "hsl(var(--border))",
              input: "hsl(var(--input-solid))", // Use solid version for input background
              ring: "hsl(var(--ring))",
              background: "hsl(var(--background-solid))", // For solid background color
              foreground: "hsl(var(--foreground))",
              primary: {
                  DEFAULT: "hsl(var(--primary-solid))", // For solid primary color
                  foreground: "hsl(var(--primary-foreground))",
              },
              secondary: {
                  DEFAULT: "hsl(var(--secondary-solid))", // For solid secondary color
                  foreground: "hsl(var(--secondary-foreground))",
              },
              destructive: {
                  DEFAULT: "hsl(var(--destructive-solid))", // For solid destructive color
                  foreground: "hsl(var(--destructive-foreground))",
              },
              muted: {
                  DEFAULT: "hsl(var(--muted-solid))", // For solid muted color
                  foreground: "hsl(var(--muted-foreground))",
              },
              accent: {
                  DEFAULT: "hsl(var(--accent-solid))", // For solid accent color
                  foreground: "hsl(var(--accent-foreground))",
              },
              popover: {
                  DEFAULT: "hsl(var(--popover-solid))", // For solid popover color
                  foreground: "hsl(var(--popover-foreground))",
              },
              card: {
                  DEFAULT: "hsl(var(--card-solid))", // For solid card color
                  foreground: "hsl(var(--card-foreground))",
              },
              // Custom aliases using solid colors
              'app-bg': 'hsl(var(--background-solid))',
              'element-bg': 'hsl(var(--card-solid))',
              'text-primary': 'hsl(var(--foreground))',
              'text-secondary': 'hsl(var(--muted-foreground))',
              'accent-primary': 'hsl(var(--primary-solid))',
              'accent-secondary': 'hsl(var(--secondary-solid))',
              // Shadow colors remain as they are (they are solid colors themselves)
              'shadow-light-color': 'hsl(var(--shadow-light))',
              'shadow-dark-color': 'hsl(var(--shadow-dark))',
          },
          backgroundImage: { // For using gradient variables with bg-* utilities
            'gradient-background': 'var(--background)',
            'gradient-card': 'var(--card)',
            'gradient-popover': 'var(--popover)',
            'gradient-primary': 'var(--primary)',
            'gradient-secondary': 'var(--secondary)',
            'gradient-muted': 'var(--muted)',
            'gradient-accent': 'var(--accent)',
            'gradient-destructive': 'var(--destructive)',
            // If you made --input a gradient, you'd add it here:
            // 'gradient-input': 'var(--input)',
          },
          borderRadius: {
              lg: "var(--radius)",
              md: "calc(var(--radius) - 4px)", // Matched to globals.css
              sm: "calc(var(--radius) - 8px)", // Matched to globals.css
          },
          keyframes: {
              "accordion-down": {
                  from: { height: "0" },
                  to: { height: "var(--radix-accordion-content-height)" },
              },
              "accordion-up": {
                  from: { height: "var(--radix-accordion-content-height)" },
                  to: { height: "0" },
              },
          },
          animation: {
              "accordion-down": "accordion-down 0.2s ease-out",
              "accordion-up": "accordion-up 0.2s ease-out",
          },
          boxShadow: {
              // Values updated to match globals.css utilities
              'neumorphic': '3px 3px 3px var(--shadow-dark-color), 0px 0px 8px var(--shadow-light-color)',
              'neumorphic-sm': '3px 3px 6px var(--shadow-dark-color), -3px -3px 6px var(--shadow-light-color)', // This was already matching
              'neumorphic-inset': 'inset 0px 0px 50px var(--shadow-dark-color), inset 0px 0px 40px var(--shadow-light-color)',
              'neumorphic-inset-sm': 'inset 3px 3px 6px var(--shadow-dark-color), inset -3px -3px 6px var(--shadow-light-color)', // Added to match globals.css
          },
      },
  },
  plugins: [require("tailwindcss-animate")],
};