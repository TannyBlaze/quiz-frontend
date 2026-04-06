import Script from "next/script";
import ClientLayout from "../components/ClientLayout";

export default function RootLayout({ children }) {
  return (
    <html>
      <title>Tannyblaze Quiz Options</title>
      <head>
        <Script
          src="https://cdn.tailwindcss.com"
          strategy="beforeInteractive"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
      </head>
      <body>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}