import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dart Bangla Documentation",
  description: "Create, generate, publish, and browse blog posts.",
  icons: {
    icon: '/target.png',
  },
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
