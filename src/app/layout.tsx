import type { Metadata } from 'next';
import {
  Pirata_One,
  UnifrakturMaguntia,
  Caveat,
  Plus_Jakarta_Sans,
  JetBrains_Mono,
} from 'next/font/google';
import './globals.css';

// Matches the bold Old English / Blackletter Gothic font on the official "4BG" logo
const pirata = Pirata_One({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
});

const gothic = UnifrakturMaguntia({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-gothic',
});

// Matches the "Four Bloods Gang" handwritten script underneath "4BG" on the official logo
const caveat = Caveat({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-script',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: '4BLOODS GANG',
  description:
    'Hidup dalam darah, berjalan bersama keluarga, dan mati demi 4Bloods. Portal resmi 4Bloods Gang (4BG) di IME Roleplay — South Side Roxwood (Postal 1051–1052), Struktur Gang, Lookbook Pakaian, dan 4Bloods Multi-POV Cam.',
  icons: {
    icon: '/assets/logo_v2.png',
    shortcut: '/assets/logo_v2.png',
    apple: '/assets/logo_v2.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${pirata.variable} ${gothic.variable} ${caveat.variable} ${jakarta.variable} ${jetbrains.variable}`}
    >
      <body className="min-h-screen bg-[#070506] text-[#F4F4F6] antialiased selection:bg-red-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
