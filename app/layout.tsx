import type { Metadata } from 'next'
import './globals.css'
import ToastProvider from '@/components/ui/Toast'

export const metadata: Metadata = {
  title: {
    default: 'OmniDub — your voice, every language.',
    template: '%s — OmniDub',
  },
  description: 'AI-powered text to speech, voice cloning, and video dubbing. Free to start. No failed-generation charges. Ever.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  openGraph: {
    title: 'OmniDub — your voice, every language.',
    description: 'Transparent pricing. Studio-quality voices. Hear the product before you sign up.',
    type: 'website',
    siteName: 'OmniDub',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OmniDub — your voice, every language.',
    description: 'AI voice cloning and video dubbing. Free to start.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('omnidub-theme')||'dark';document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='dark'}})()`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        <ToastProvider />
      </body>
    </html>
  )
}
