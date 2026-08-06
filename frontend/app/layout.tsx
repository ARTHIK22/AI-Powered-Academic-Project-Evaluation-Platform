import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProjectSense AI — Academic Project Evaluation Platform",
  description:
    "AI-powered platform for evaluating academic projects. Get instant scores, viva questions, code analysis, and actionable feedback powered by Gemini AI.",
  keywords: ["academic evaluation", "AI project review", "viva questions", "code analysis"],
  openGraph: {
    title: "ProjectSense AI",
    description: "AI-powered academic project evaluation",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
