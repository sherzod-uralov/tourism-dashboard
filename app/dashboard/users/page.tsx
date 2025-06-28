"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Table, Card, Button, Space, Modal, Form, Input, Select, message, Popconfirm, Typography, Spin } from "antd"
import { UserAddOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons"

const { Title } = Typography
const { Option } = Select

export default function UsersPage() {
  const [form] = Form.useForm()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const queryClient = useQueryClient()

  // Fetch users
  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await api.get("/api/users")
      return response.data
    },
  })

  // Create user mutation
  const createUser = useMutation({
    mutationFn: (userData: any) => api.post("/api/users", userData),
    onSuccess: () => {
      message.success("User created successfully")
      queryClient.invalidateQueries({ queryKey: ["users"] })
      setIsModalOpen(false)
      form.resetFields()
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to create user")
    },
  })

  // Update user mutation
  const updateUser = useMutation({
    mutationFn: ({ id, userData }: { id: string; userData: any }) => api.patch(`/api/users/${id}`, userData),
    onSuccess: () => {
      message.success("User updated successfully")
      queryClient.invalidateQueries({ queryKey: ["users"] })
      setIsModalOpen(false)
      form.resetFields()
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to update user")
    },
  })

  // Delete user mutation
  const deleteUser = useMutation({
    mutationFn: (id: string) => api.delete(`/api/users/${id}`),
    onSuccess: () => {
      message.success("User deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to delete user")
    },
  })

  const showModal = (user?: any) => {
    if (user) {
      setEditingUser(user)
      form.setFieldsValue({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        role: user.role,
        address: user.address,
        city: user.city,
        country: user.country,
        postalCode: user.postalCode,
      })
    } else {
      setEditingUser(null)
      form.resetFields()
    }
    setIsModalOpen(true)
  }

  const handleCancel = () => {
    setIsModalOpen(false)
    form.resetFields()
  }

  const handleSubmit = (values: any) => {
    if (editingUser) {
      updateUser.mutate({ id: editingUser.id, userData: values })
    } else {
      createUser.mutate(values)
    }
  }

  const handleDelete = (id: string) => {
    deleteUser.mutate(id)
  }

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Name",
      key: "name",
      render: (text: string, record: any) => `${record.firstName} ${record.lastName}`,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: string) => role.charAt(0).toUpperCase() + role.slice(1),
    },
    {
      title: "Actions",
      key: "actions",
      render: (text: string, record: any) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => showModal(record)} size="small" />
          <Popconfirm
            title="Are you sure you want to delete this user?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={3}>User Management</Title>
        <Button type="primary" icon={<UserAddOutlined />} onClick={() => showModal()}>
          Add User
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spin size="large" />
          </div>
        ) : (
          <Table dataSource={users} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />
        )}
      </Card>

      <Modal
        title={editingUser ? "Edit User" : "Add New User"}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ role: "tourist" }}>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please input email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input placeholder="Email" />
          </Form.Item>

          {!editingUser && (
            <Form.Item name="password" label="Password" rules={[{ required: true, message: "Please input password!" }]}>
              <Input.Password placeholder="Password" />
            </Form.Item>
          )}

          <Form.Item
            name="firstName"
            label="First Name"
            rules={[{ required: true, message: "Please input first name!" }]}
          >
            <Input placeholder="First Name" />
          </Form.Item>

          <Form.Item name="lastName" label="Last Name" rules={[{ required: true, message: "Please input last name!" }]}>
            <Input placeholder="Last Name" />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            label="Phone Number"
            rules={[{ required: true, message: "Please input phone number!" }]}
          >
            <Input placeholder="Phone Number" />
          </Form.Item>

          <Form.Item name="role" label="Role" rules={[{ required: true, message: "Please select role!" }]}>
            <Select placeholder="Select a role">
              <Option value="admin">Admin</Option>
              <Option value="tourist">Tourist</Option>
            </Select>
          </Form.Item>

          <Form.Item name="address" label="Address">
            <Input placeholder="Address" />
          </Form.Item>

          <Form.Item name="city" label="City">
            <Input placeholder="City" />
          </Form.Item>

          <Form.Item name="country" label="Country">
            <Input placeholder="Country" />
          </Form.Item>

          <Form.Item name="postalCode" label="Postal Code">
            <Input placeholder="Postal Code" />
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end gap-2">
              <Button onClick={handleCancel}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={createUser.isPending || updateUser.isPending}>
                {editingUser ? "Update" : "Create"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
