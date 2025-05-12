/* eslint-env node */                        //  ➜  évite l'alerte ESLint « require »

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './index.html',
      './src/**/*.{js,jsx}',
    ],
    theme: {
      extend: {
        colors: {                              //  Nuancier primaire
          primary: {
            50:  '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a',
            950: '#172554',
          },
        },
        fontFamily: { sans: ['Inter', 'sans-serif'] },
        borderRadius: { sm:'0.125rem', DEFAULT:'0.25rem', md:'0.375rem', lg:'0.5rem', xl:'0.75rem', '2xl':'1rem' },
        boxShadow: {                            //  Ombres identiques
          sm: '0 1px 2px 0 rgba(0,0,0,0.05)',
          DEFAULT: '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06)',
          md: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
          lg: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
          xl: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
        },
      },
    },
    plugins: [
      require('@tailwindcss/forms'),            //  plugin officiel v4 :contentReference[oaicite:1]{index=1}
    ],
  };
  