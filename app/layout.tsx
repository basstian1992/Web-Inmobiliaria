import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import SiteHeader from "@/components/SiteHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Propiedades, Locales Comerciales, Compra-Venta en Chile",
  description: "Encuentra casas, parcelas, locales comerciales y propiedades en todo Chile con el mejor portal inmobiliario.",
  keywords: "parcela, propiedades, corretaje, venta, compra, casa, compra de casa, compra de terreno, terreno en venta, venta de casa, venta de propiedad, local comercial, arriendo de local comercial, compra de local comercial, derecho a llave, compraventa, propiedades, terrenos en chile",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html
        lang="es"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          <SiteHeader />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

