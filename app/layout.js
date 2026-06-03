import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Uber API Documentation",
  description: "Uber API documentation — driver data, fleet management, and integration sandbox",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-white font-sans text-black antialiased">
        {children}
      </body>
    </html>
  );
}
