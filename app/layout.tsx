import '@/app/ui/global.css';
import { App } from 'antd'; // Import App from antd
import { inter } from '@/app/ui/fonts';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {/* Antd兼容React19,要加App */}
        <App>{children}</App>
      </body>
    </html>
  );
}
