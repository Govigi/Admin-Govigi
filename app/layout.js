import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TopBar from "../components/Topbar"; 
import Sidebar from "../components/sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Go-vigi-Admin",
  description: "Bulk Orders, Smarter Benefits",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <div className="flex flex-col h-screen">
              <TopBar/>
              <div className="flex flex-1">
              <div className="w-50">
                <Sidebar/>
              </div>
              <main className="flex-1 p-6 overflow-auto bg-gray-50">
                {children}
              </main>
            </div>
          </div>
      </body>
    </html>
  );
}
