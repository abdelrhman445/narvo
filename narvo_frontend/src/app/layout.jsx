import { DM_Serif_Display, DM_Sans, DM_Mono } from 'next/font/google'; // شيلنا Geist من هنا
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'sonner';
import { cn } from "@/lib/utils";

// مسحنا السطر بتاع تعريف geist

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans', // غيرنا دي لـ sans عشان تعوض غياب Geist
  display: 'swap',
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata = {
  title: { default: 'Bazaar — Modern E-Commerce', template: '%s | Bazaar' },
  description: 'Discover unique products at great prices.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }) {
  return (
    // شيلنا geist.variable من الـ className
    <html lang="en" className={cn(dmSerif.variable, dmSans.variable, dmMono.variable, "font-sans")}>
      <body className="antialiased grain">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: 'var(--font-sans)', // عدلناها هنا كمان
                borderRadius: 'var(--radius)',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}