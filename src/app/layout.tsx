import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Motzkin Store - School Equipment",
  description: "Select your school, grade, and class to view your equipment list",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
