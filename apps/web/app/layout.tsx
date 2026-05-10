import './globals.css';
import Header from '@/components/Header';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="max-container">
          {children}
        </main>
      </body>
    </html>
  );
}
