import type { Metadata, Viewport } from "next";

import "./styles/globals.scss";
import "./styles/markdown.scss";
import "./styles/highlight.scss";

import { Providers } from '@/lib/providers';
import { getClientConfig } from "@/lib/configs/client";

export const metadata: Metadata = {
  title: "ChatGPT Web Proxy",
  description: "Your personal ChatGPT Chat Bot.",
  appleWebApp: {
    title: "ChatGPT Web Proxy",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#151515" },
  ],
}

export default function RootLayout(props: React.PropsWithChildren) {
  return (
    <Providers>
      <html lang="en">
        <head>
          <meta name="config" content={JSON.stringify(getClientConfig())} />
          <link rel="manifest" href="/site.webmanifest"></link>
          <script src="/serviceWorkerRegister.js" defer></script>
        </head>
        <body>
          {props.children}
        </body>
      </html>
    </Providers>
  );
}