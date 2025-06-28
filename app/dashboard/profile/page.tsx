"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useMutation } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Card, Form, Input, Button, Typography, message, Divider, Avatar, Row, Col, Upload } from "antd"
import { UserOutlined, UploadOutlined, LockOutlined } from "@ant-design/icons"

const { Title } = Typography

export default function ProfilePage() {
  const { user } = useAuth()
  const [form] = Form.useForm()
  const [passwordForm] = Form.useForm()
  const [isEditing, setIsEditing] = useState(false)

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: (userData: any) => api.patch("/api/users/profile", userData),
    onSuccess: () => {
      message.success("Profile updated successfully")
      setIsEditing(false)
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to update profile")
    },
  })

  // Change password mutation
  const changePassword = useMutation({
    mutationFn: (passwordData: any) => api.patch("/api/users/profile", passwordData),
    onSuccess: () => {
      message.success("Password changed successfully")
      passwordForm.resetFields()
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to change password")
    },
  })

  const handleProfileUpdate = (values: any) => {
    updateProfile.mutate(values)
  }

  const handlePasswordChange = (values: any) => {
    changePassword.mutate({ password: values.newPassword })
  }

  return (
    <div>
      <Title level={3} className="mb-6">
        My Profile
      </Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={16}>
          <Card title="Profile Information">
            {!isEditing ? (
              <div className="space-y-4">
                <div className="flex items-center">
                  <Avatar size={64} icon={<UserOutlined />} src={user?.profilePicture} />
                  <div className="ml-4">
                    <Title level={4} className="m-0">
                      {user?.firstName} {user?.lastName}
                    </Title>
                    <p className="text-gray-500">{user?.role}</p>
                  </div>
                </div>

                <Divider />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 mb-1">Email</p>
                    <p>{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Phone</p>
                    <p>{user?.phoneNumber || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Address</p>
                    <p>{user?.address || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">City</p>
                    <p>{user?.city || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Country</p>
                    <p>{user?.country || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Postal Code</p>
                    <p>{user?.postalCode || "Not provided"}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <Button type="primary" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                </div>
              </div>
            ) : (
              <Form
                form={form}
                layout="vertical"
                initialValues={{
                  email: user?.email,
                  firstName: user?.firstName,
                  lastName: user?.lastName,
                  phoneNumber: user?.phoneNumber,
                  address: user?.address,
                  city: user?.city,
                  country: user?.country,
                  postalCode: user?.postalCode,
                  profilePicture: user?.profilePicture,
                }}
                onFinish={handleProfileUpdate}
              >
                <Row gutter={16}>
                  <Col span={24} className="mb-4">
                    <Upload
                      name="profilePicture"
                      listType="picture"
                      maxCount={1}
                      action="/api/upload" // This would be your upload endpoint
                      showUploadList={false}
                    >
                      <Button icon={<UploadOutlined />}>Upload Profile Picture</Button>
                    </Upload>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      name="firstName"
                      label="First Name"
                      rules={[{ required: true, message: "Please input your first name!" }]}
                    >
                      <Input placeholder="First Name" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      name="lastName"
                      label="Last Name"
                      rules={[{ required: true, message: "Please input your last name!" }]}
                    >
                      <Input placeholder="Last Name" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      name="email"
                      label="Email"
                      rules={[
                        { required: true, message: "Please input your email!" },
                        { type: "email", message: "Please enter a valid email!" },
                      ]}
                    >
                      <Input placeholder="Email" disabled />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      name="phoneNumber"
                      label="Phone Number"
                      rules={[{ required: true, message: "Please input your phone number!" }]}
                    >
                      <Input placeholder="Phone Number" />
                    </Form.Item>
                  </Col>

                  <Col span={24}>
                    <Form.Item name="address" label="Address">
                      <Input placeholder="Address" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={8}>
                    <Form.Item name="city" label="City">
                      <Input placeholder="City" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={8}>
                    <Form.Item name="country" label="Country">
                      <Input placeholder="Country" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={8}>
                    <Form.Item name="postalCode" label="Postal Code">
                      <Input placeholder="Postal Code" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item>
                  <div className="flex gap-2">
                    <Button onClick={() => setIsEditing(false)}>Cancel</Button>
                    <Button type="primary" htmlType="submit" loading={updateProfile.isPending}>
                      Save Changes
                    </Button>
                  </div>
                </Form.Item>
              </Form>
            )}
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card title="Change Password">
            <Form form={passwordForm} layout="vertical" onFinish={handlePasswordChange}>
              <Form.Item
                name="currentPassword"
                label="Current Password"
                rules={[{ required: true, message: "Please input your current password!" }]}
              >
                <Input.Password prefix={<LockOutlined className="text-gray-400" />} placeholder="Current Password" />
              </Form.Item>

              <Form.Item
                name="newPassword"
                label="New Password"
                rules={[
                  { required: true, message: "Please input your new password!" },
                  { min: 8, message: "Password must be at least 8 characters!" },
                ]}
              >
                <Input.Password prefix={<LockOutlined className="text-gray-400" />} placeholder="New Password" />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Confirm Password"
                dependencies={["newPassword"]}
                rules={[
                  { required: true, message: "Please confirm your password!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error("The two passwords do not match!"))
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined className="text-gray-400" />} placeholder="Confirm Password" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={changePassword.isPending}>
                  Change Password
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
