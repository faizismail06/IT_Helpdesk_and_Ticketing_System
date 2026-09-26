/** @type {import('tailwindcss').Config} */
export default {
 content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
 darkMode: 'class',
 theme: {
 extend: {
 colors: {
 dark: {
 bg: '#090d16',
 card: '#111726',
 surface: '#1a2236',
 border: 'rgba(255, 255, 255, 0.08)',
 'border-strong': 'rgba(255, 255, 255, 0.18)',
 },
 brand: {
 blue: '#3b82f6',
 cyan: '#06b6d4',
 indigo: '#6366f1',
 },
 },
 fontFamily: {
 mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
 sans: ['Inter', 'system-ui', 'sans-serif'],
 },
 },
 },
 plugins: [],
};
