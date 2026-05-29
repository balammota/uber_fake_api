export const metadata = {
  title: "Uber Fake API",
  description: "Fake Uber Eats OAuth 2.0 API for integration practice",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
