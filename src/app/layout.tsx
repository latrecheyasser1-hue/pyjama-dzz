import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "بيجاما ديزاين | Master Admin ERP",
  description: "لوحة التحكم الرئيسية وإدارة ERP لمتجر بيجاما ديزاين (Pyjama Design)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-pyjama-cream min-h-screen text-pyjama-charcoal font-sans antialiased selection:bg-[#E8A5B8] selection:text-[#7A1C32]">
        {children}
      </body>
    </html>
  );
}
