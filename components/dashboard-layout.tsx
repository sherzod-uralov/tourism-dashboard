"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Layout, Menu, Button, Dropdown, Avatar, Typography, Spin } from "antd"
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  CompassOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  LogoutOutlined,
  SettingOutlined,
} from "@ant-design/icons"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

const { Header, Sider, Content } = Layout
const { Text } = Typography

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout, isLoading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" tip="Loading..." />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const menuItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: <Link href="/dashboard">Dashboard</Link>,
    },
    {
      key: "/dashboard/users",
      icon: <TeamOutlined />,
      label: <Link href="/dashboard/users">Users</Link>,
    },
    {
      key: "/dashboard/difficulity",
      icon: <CompassOutlined />,
      label: <Link href="/dashboard/difficulity">difficulity</Link>,
    },
    {
      key: "/dashboard/tours",
      icon: <CompassOutlined />,
      label: <Link href="/dashboard/tours">Tours</Link>,
    },
    {
      key: "/dashboard/bookings",
      icon: <CalendarOutlined />,
      label: <Link href="/dashboard/bookings">Bookings</Link>,
    },
    {
      key: "/dashboard/payments",
      icon: <CreditCardOutlined />,
      label: <Link href="/dashboard/payments">Payments</Link>,
    },
    {
      key: "/dashboard/settings",
      icon: <SettingOutlined />,
      label: <Link href="/dashboard/settings">Settings</Link>,
    },
  ]

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
      onClick: () => router.push("/dashboard/profile"),
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: logout,
    },
  ]

  return (
    <Layout>
      <Sider trigger={null} collapsible collapsed={collapsed} width={240} theme="dark" className="min-h-screen">
        <div className="logo">{collapsed ? "UZ" : "Uzbekistan Tours"}</div>
        <Menu theme="dark" mode="inline" selectedKeys={[pathname]} items={menuItems} />
      </Sider>
      <Layout>
        <Header className="bg-white px-4 flex items-center justify-between">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="mr-4"
          />
          <div className="flex items-center">
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="flex items-center cursor-pointer">
                <Avatar icon={<UserOutlined />} />
                <Text className="ml-2 hidden md:inline">
                  {user.firstName} {user.lastName}
                </Text>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className="p-6 min-h-[calc(100vh-64px)]">{children}</Content>
      </Layout>
    </Layout>
  )
}
