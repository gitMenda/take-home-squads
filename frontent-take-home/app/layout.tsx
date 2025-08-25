import React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Roboto_Mono } from "next/font/google"

const GeistSans = Inter({ subsets: ["latin"] })
const GeistMono = Roboto_Mono({ subsets: ["latin"] })
import "../src/app/index.css"
import "../src/app/globals.css"

export const metadata: Metadata = {
  title: "LinkedIn Icebreaker Generator",
  description: "Create personalized, professional icebreaker messages that get responses",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.style.fontFamily};
  --font-mono: ${GeistMono.style.fontFamily};
}
        `}</style>
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
