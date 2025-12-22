import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google" // <--- The "Google Sans" Twin
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

// Setup the font
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "AI Engineering Portfolio",
  description: "Showcase of AI & Data Science Projects",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jakarta.variable} antialiased font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}