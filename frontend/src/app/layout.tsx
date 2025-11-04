import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MCP Calendar',
  description: 'LLM-powered Calendar & Budget Tracker',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}