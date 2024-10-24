import type { Metadata, Viewport } from 'next'
import { Inter as FontSans } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { ThemeProvider } from '@/components/theme-provider'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Sidebar } from '@/components/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { MapToggleProvider } from '@/components/map-toggle-context'
import { ProfileActionsProvider } from '@/components/profile-toggle-context'

// Load the Inter font from Google Fonts
const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans'
})

// Define the title and description for the application
const title = 'MapGPT'
const description =
  'language to Maps'

// Define the metadata for the application
export const metadata: Metadata = {
  metadataBase: new URL('https://labs.queue.cx'),
  title,
  description,
  openGraph: {
    title,
    description
  },
  twitter: {
    title,
    description,
    card: 'summary_large_image',
    creator: '@queuelabs'
  }
}

// Define the viewport settings for the application
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1
}

// Define the root layout component for the application
export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('font-sans antialiased', fontSans.variable)}>
        <ProfileActionsProvider>
        <MapToggleProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            themes={['light', 'dark', 'earth']}
          >
            <Header />
            
            {children}
            <Sidebar />
            <Footer />
            <Toaster />
          </ThemeProvider>
        </MapToggleProvider>
        </ProfileActionsProvider>

      </body>
    </html>
  )
}
