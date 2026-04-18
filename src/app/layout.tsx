import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-context";
import ErrorBoundary from "@/components/ErrorBoundary";
import SkipToContent from "@/components/SkipToContent";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kindle Highlights Manager",
  description:
    "A quiet home for your Kindle highlights. Upload clippings.txt, browse by book, and revisit what you've marked.",
  keywords: "kindle, highlights, reading, books, notes, library",
  authors: [{ name: "Kindle Highlights Manager" }],
  robots: "index, follow",
  openGraph: {
    title: "Kindle Highlights Manager",
    description: "A quiet home for your Kindle highlights.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Kindle Highlights Manager",
    description: "A quiet home for your Kindle highlights.",
  },
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
        <meta name="theme-color" content="#FAFAF9" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#09090B" media="(prefers-color-scheme: dark)" />
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
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-[color:var(--bg)] text-[color:var(--fg)]`}
      >
        <SkipToContent />
        <ErrorBoundary>
          <ThemeProvider>
            <main id="main-content">{children}</main>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
