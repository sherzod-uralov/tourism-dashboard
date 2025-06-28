import type React from "react"
import { Inter } from "next/font/google"
import { ConfigProvider } from "antd"
import { Providers } from "@/providers"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Tourism Admin Dashboard",
  description: "Admin dashboard for tourism website",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: "#1677ff",
              borderRadius: 4,
            },
            components: {
              Layout: {
                colorBgHeader: "#ffffff",
                colorBgBody: "#f5f5f5",
                colorBgTrigger: "#ffffff",
              },
            },
          }}
        >
          <Providers>{children}</Providers>
        </ConfigProvider>
      </body>
    </html>
  )
}
