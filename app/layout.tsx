import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import SiteHeader from "@/components/SiteHeader";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Propiedades & Parcelas Chile | Compra, Venta y Arriendo de Terrenos, Casas y Locales Comerciales",
    template: "%s | Propiedades & Parcelas Chile",
  },
  description: "Encuentra las mejores propiedades en Chile: terrenos, parcelas, casas y locales comerciales en venta y arriendo. Portal inmobiliario con SEO optimizado, fotos reales y contacto directo con vendedores. El sitio #1 en compraventa de propiedades en Chile.",
  keywords: "parcela, propiedades, corretaje, venta, compra, casa, compra de casa, compra de terreno, terreno en venta, venta de casa, venta de propiedad, local comercial, arriendo de local comercial, compra de local comercial, derecho a llave, compraventa, propiedades, terrenos en chile, inversion inmobiliaria, propiedades chile, portal inmobiliario, propiedadesyparcelas.cl, terreno agricola, parcela de agrado, subdivisión predial, loteo, sitio eriazo",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'es_CL',
    siteName: 'Propiedades & Parcelas Chile',
    url: 'https://www.propiedadesyparcelas.cl/',
    images: [{ url: 'https://www.propiedadesyparcelas.cl/logo-nuevo.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@propiedadescl',
  },
  verification: {
    google: 'google-site-verification',
  },
  category: 'Real Estate',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();

  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html
        lang="es"
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-background text-foreground">
          <ThemeProvider attribute="class" defaultTheme="light">
            <SiteHeader userId={userId} />
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

