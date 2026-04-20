import { DM_Serif_Display, DM_Sans, DM_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'sonner';
import { cn } from "@/lib/utils";
import { ThemeProvider } from '@/components/theme-provider'; // ✅ ضفنا الـ Provider هنا

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
  variable: '--font-sans',
  display: 'swap',
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata = {
  title: 'Narvo Store',
  description: 'Your favorite store',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png', 
  },
};

export default function RootLayout({ children }) {
  return (
    // ✅ ضفنا suppressHydrationWarning هنا عشان نتجنب أخطاء التحميل
    <html lang="en" className={cn(dmSerif.variable, dmSans.variable, dmMono.variable, "font-sans")} suppressHydrationWarning>
      <body className="antialiased grain">
        
        {/* ✅ غلفنا التطبيق بالـ ThemeProvider */}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Providers>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  fontFamily: 'var(--font-sans)',
                  borderRadius: 'var(--radius)',
                },
              }}
            />
          </Providers>
        </ThemeProvider>

      </body>
    </html>
  );
}