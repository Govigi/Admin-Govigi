export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

import "./globals.css";
import ClientLayout from "./ClientLayout";
import { Outfit, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";

const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${plusJakartaSans.className} ${plusJakartaSans.variable} ${plusJakartaSans.variable} antialiased`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}