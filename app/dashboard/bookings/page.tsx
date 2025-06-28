"use client"

import type React from "react"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import {
  Table,
  Card,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  message,
  Popconfirm,
  Typography,
  Spin,
  Tag,
  Badge,
} from "antd"
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  DollarOutlined,
} from "@ant-design/icons"
import { useRouter } from "next/navigation"

const { Title } = Typography
const { Option } = Select
const { TextArea } = Input

export default function BookingsPage() {
  const [form] = Form.useForm()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBooking, setEditingBooking] = useState<any>(null)
  const queryClient = useQueryClient()
  const router = useRouter()

  // Fetch bookings
  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const response = await api.get("/api/bookings")
      return response.data
    },
  })

  // Fetch tours for dropdown
  const { data: tours, isLoading: toursLoading } = useQuery({
    queryKey: ["tours-list"],
    queryFn: async () => {
      const response = await api.get("/api/tours")
      return response.data
    },
  })

  // Update booking mutation
  const updateBooking = useMutation({
    mutationFn: ({ id, bookingData }: { id: number; bookingData: any }) =>
      api.patch(`/api/bookings/${id}`, bookingData),
    onSuccess: () => {
      message.success("Booking updated successfully")
      queryClient.invalidateQueries({ queryKey: ["bookings"] })
      setIsModalOpen(false)
      form.resetFields()
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to update booking")
    },
  })

  // Delete booking mutation
  const deleteBooking = useMutation({
    mutationFn: (id: number) => api.delete(`/api/bookings/${id}`),
    onSuccess: () => {
      message.success("Booking deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["bookings"] })
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to delete booking")
    },
  })

  // Confirm payment mutation
  const confirmPayment = useMutation({
    mutationFn: (id: number) => api.post(`/api/bookings/${id}/confirm-payment`),
    onSuccess: () => {
      message.success("Payment confirmed successfully")
      queryClient.invalidateQueries({ queryKey: ["bookings"] })
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to confirm payment")
    },
  })

  // Complete booking mutation
  const completeBooking = useMutation({
    mutationFn: (id: number) => api.post(`/api/bookings/${id}/complete`),
    onSuccess: () => {
      message.success("Booking marked as completed")
      queryClient.invalidateQueries({ queryKey: ["bookings"] })
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to complete booking")
    },
  })

  // Cancel booking mutation
  const cancelBooking = useMutation({
    mutationFn: (id: number) => api.post(`/api/bookings/${id}/cancel`),
    onSuccess: () => {
      message.success("Booking cancelled successfully")
      queryClient.invalidateQueries({ queryKey: ["bookings"] })
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to cancel booking")
    },
  })

  const showModal = (booking?: any) => {
    if (booking) {
      setEditingBooking(booking)
      form.setFieldsValue({
        tourId: booking.tourId,
        numberOfPeople: booking.numberOfPeople,
        specialRequests: booking.specialRequests,
        contactPhone: booking.contactPhone,
        contactEmail: booking.contactEmail,
        status: booking.status,
        isPaid: booking.isPaid,
      })
    } else {
      setEditingBooking(null)
      form.resetFields()
    }
    setIsModalOpen(true)
  }

  const handleCancel = () => {
    setIsModalOpen(false)
    form.resetFields()
  }

  const handleSubmit = (values: any) => {
    if (editingBooking) {
      updateBooking.mutate({ id: editingBooking.id, bookingData: values })
    }
  }

  const handleDelete = (id: number) => {
    deleteBooking.mutate(id)
  }

  const handleConfirmPayment = (id: number) => {
    confirmPayment.mutate(id)
  }

  const handleCompleteBooking = (id: number) => {
    completeBooking.mutate(id)
  }

  const handleCancelBooking = (id: number) => {
    cancelBooking.mutate(id)
  }

  const viewBookingDetails = (id: number) => {
    router.push(`/dashboard/bookings/${id}`)
  }

  const generateInvoice = (bookingId: number) => {
    api
      .post(`/api/payments/generate-invoice/${bookingId}`)
      .then((response) => {
        message.success("Invoice generated successfully")
        // Open invoice URL in new tab
        window.open(response.data.invoiceUrl, "_blank")
      })
      .catch((error) => {
        message.error(error.response?.data?.message || "Failed to generate invoice")
      })
  }

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; icon: React.ReactNode }> = {
      pending: { color: "orange", icon: <Badge status="processing" /> },
      confirmed: { color: "blue", icon: <Badge status="success" /> },
      completed: { color: "green", icon: <CheckCircleOutlined /> },
      cancelled: { color: "red", icon: <CloseCircleOutlined /> },
    }

    const { color, icon } = statusMap[status] || { color: "default", icon: null }

    return (
      <Tag color={color} icon={icon}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Tag>
    )
  }

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 60,
    },
    {
      title: "Tour",
      dataIndex: "tourId",
      key: "tourId",
      render: (tourId: number) => {
        const tour = tours?.find((t: any) => t.id === tourId)
        return tour ? tour.title : `Tour #${tourId}`
      },
    },
    {
      title: "People",
      dataIndex: "numberOfPeople",
      key: "numberOfPeople",
      width: 80,
    },
    {
      title: "Contact",
      dataIndex: "contactEmail",
      key: "contactEmail",
      ellipsis: true,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => getStatusTag(status),
    },
    {
      title: "Payment",
      dataIndex: "isPaid",
      key: "isPaid",
      render: (isPaid: boolean) => <Tag color={isPaid ? "green" : "red"}>{isPaid ? "Paid" : "Unpaid"}</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      width: 240,
      render: (text: string, record: any) => (
        <Space size="small" wrap>
          <Button icon={<EyeOutlined />} onClick={() => viewBookingDetails(record.id)} size="small" />
          <Button icon={<EditOutlined />} onClick={() => showModal(record)} size="small" />
          {!record.isPaid && record.status !== "cancelled" && (
            <Button
              icon={<DollarOutlined />}
              onClick={() => handleConfirmPayment(record.id)}
              size="small"
              type="primary"
            />
          )}
          {record.status === "pending" && (
            <Popconfirm
              title="Are you sure you want to cancel this booking?"
              onConfirm={() => handleCancelBooking(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button icon={<CloseCircleOutlined />} danger size="small" />
            </Popconfirm>
          )}
          {record.status === "confirmed" && record.isPaid && (
            <Button
              icon={<CheckCircleOutlined />}
              onClick={() => handleCompleteBooking(record.id)}
              size="small"
              type="primary"
              ghost
            />
          )}
          <Popconfirm
            title="Are you sure you want to delete this booking?"
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
        <Title level={3}>Booking Management</Title>
      </div>

      <Card>
        {bookingsLoading || toursLoading ? (
          <div className="flex justify-center py-8">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            dataSource={bookings}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1000 }}
          />
        )}
      </Card>

      <Modal title="Edit Booking" open={isModalOpen} onCancel={handleCancel} footer={null} width={600}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="tourId" label="Tour" rules={[{ required: true, message: "Please select a tour!" }]}>
            <Select placeholder="Select a tour" disabled>
              {tours?.map((tour: any) => (
                <Option key={tour.id} value={tour.id}>
                  {tour.title}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="numberOfPeople"
            label="Number of People"
            rules={[{ required: true, message: "Please input number of people!" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="specialRequests" label="Special Requests">
            <TextArea rows={3} placeholder="Special requests" />
          </Form.Item>

          <Form.Item
            name="contactPhone"
            label="Contact Phone"
            rules={[{ required: true, message: "Please input contact phone!" }]}
          >
            <Input placeholder="Contact Phone" />
          </Form.Item>

          <Form.Item
            name="contactEmail"
            label="Contact Email"
            rules={[
              { required: true, message: "Please input contact email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input placeholder="Contact Email" />
          </Form.Item>

          <Form.Item name="status" label="Status" rules={[{ required: true, message: "Please select status!" }]}>
            <Select placeholder="Select status">
              <Option value="pending">Pending</Option>
              <Option value="confirmed">Confirmed</Option>
              <Option value="completed">Completed</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </Form.Item>

          <Form.Item name="isPaid" label="Payment Status" valuePropName="checked">
            <Select placeholder="Select payment status">
              <Option value={true}>Paid</Option>
              <Option value={false}>Unpaid</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end gap-2">
              <Button onClick={handleCancel}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={updateBooking.isPending}>
                Update
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
