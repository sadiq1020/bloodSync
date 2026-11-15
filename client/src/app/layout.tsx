import type { Metadata } from "next";
import {
  Fraunces,
  Hanken_Grotesk,
  IBM_Plex_Mono,
  Hind_Siliguri,
} from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/providers";
import { OfflineBanner } from "@/components/layout/OfflineBanner";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind-siliguri",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["bengali"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "BloodSync",
  description: "Emergency blood donor and request matching platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${hankenGrotesk.variable} ${ibmPlexMono.variable} ${hindSiliguri.variable} dark`}
    >
      <body className="bg-bg text-fg selection:bg-blood-deep selection:text-fg min-h-screen antialiased">
        <Providers>
          <TooltipProvider>
            <OfflineBanner />
            {children}
            {/* offset keeps toasts above the mobile bottom-nav (64px + safe area) */}
            <Toaster />
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
