import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-context";
import ErrorBoundary from "@/components/ErrorBoundary";
import SkipToContent from "@/components/SkipToContent";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Kindle Highlights Manager",
  description: "Organize and manage your Kindle highlights with a beautiful, modern interface",
  keywords: "kindle, highlights, reading, books, notes, organization",
  authors: [{ name: "Kindle Highlights Manager" }],
  creator: "Kindle Highlights Manager",
  publisher: "Kindle Highlights Manager",
  robots: "index, follow",
  openGraph: {
    title: "Kindle Highlights Manager",
    description: "Organize and manage your Kindle highlights with a beautiful, modern interface",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kindle Highlights Manager",
    description: "Organize and manage your Kindle highlights with a beautiful, modern interface",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#3b82f6" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })()
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <SkipToContent />
        <ErrorBoundary>
          <ThemeProvider>
            <main id="main-content">
              {children}
            </main>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
