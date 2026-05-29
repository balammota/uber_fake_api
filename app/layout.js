import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Uber Fake API",
  description: "Fake Uber Eats OAuth 2.0 API for integration practice",
};

const themeScript = `
(function () {
  try {
    var t = localStorage.getItem("theme");
    if (t === "light") {
      document.documentElement.classList.remove("dark");
    } else if (t === "dark") {
      document.documentElement.classList.add("dark");
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  } catch (e) {
    document.documentElement.classList.add("dark");
  }
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${inter.variable} dark`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-zinc-50 font-sans text-zinc-800 antialiased transition-colors duration-200 dark:bg-[#0a0a0a] dark:text-zinc-300">
        {children}
      </body>
    </html>
  );
}
