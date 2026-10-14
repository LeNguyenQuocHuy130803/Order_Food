import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css"

export const metadata: Metadata = {
  title: "E-commerce Store",
  description: "Cửa hàng mua sắm trực tuyến",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
