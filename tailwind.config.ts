import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#2A1D16',        // coklat tulisan di logo — teks utama
        daun: '#2E4630',       // hijau daun salam tua — panel & struktur
        daunmuda: '#7E9A6B',   // hijau sage dari daun di logo
        gerabah: '#B4623B',    // terakota anglo
        sambal: '#C2452A',     // cabai — aksi & stempel HABIS
        kunyit: '#D9A03C',     // kuning kunyit — sorotan
        paper: '#F3EEE4',      // kertas krem, sama seperti latar logo
        kertas: '#FCFAF5',     // kartu / struk
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        struk: ['var(--font-struk)', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        papan: '0 18px 40px -24px rgba(23,19,15,0.55)',
      },
      keyframes: {
        kedip: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(37,211,102,0.55)' },
          '50%': { boxShadow: '0 0 0 14px rgba(37,211,102,0)' },
        },
        goyang: {
          '0%, 88%, 100%': { transform: 'rotate(0deg)' },
          '91%': { transform: 'rotate(-11deg)' },
          '94%': { transform: 'rotate(11deg)' },
          '97%': { transform: 'rotate(-6deg)' },
        },
        naik: {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        uap: {
          '0%': { opacity: '0', transform: 'translateY(4px) scaleX(1)' },
          '40%': { opacity: '0.9' },
          '100%': { opacity: '0', transform: 'translateY(-14px) scaleX(1.4)' },
        },
      },
      animation: {
        kedip: 'kedip 1.6s ease-out infinite',
        goyang: 'goyang 4s ease-in-out infinite',
        naik: 'naik .45s ease-out both',
        uap: 'uap 2.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
export default config;
