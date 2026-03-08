import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = { title: 'HOME·OS', description: 'Dashboard familial privé' };

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={inter.className} style={{ margin: 0, background: '#09090F' }}>
        {children}
      </body>
    </html>
  );
}
