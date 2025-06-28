"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, Form, Input, Button, Typography, Alert } from "antd"
import { UserOutlined, LockOutlined } from "@ant-design/icons"

const { Title } = Typography

export default function LoginPage() {
  const { login, isLoading } = useAuth()
  const [error, setError] = useState("")

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      setError("")
      await login(values.email, values.password)
    } catch (err) {
      setError("Invalid email or password")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md shadow-md">
        <div className="text-center mb-6">
          <Title level={3}>Tourism Admin Dashboard</Title>
          <p className="text-gray-500">Login to access the admin panel</p>
        </div>

        {error && <Alert message="Login Failed" description={error} type="error" showIcon className="mb-4" />}

        <Form name="login" initialValues={{ remember: true }} onFinish={onFinish} layout="vertical" size="large">
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input prefix={<UserOutlined className="text-gray-400" />} placeholder="Email" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: "Please input your password!" }]}>
            <Input.Password prefix={<LockOutlined className="text-gray-400" />} placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full" loading={isLoading}>
              Log in
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
