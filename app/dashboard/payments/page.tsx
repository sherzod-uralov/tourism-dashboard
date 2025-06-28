"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import {
  Table,
  Card,
  Button,
  Space,
  Typography,
  Spin,
  Tag,
  Tooltip,
  DatePicker,
  Form,
  Select,
  Row,
  Col,
  Statistic,
} from "antd"
import { DollarOutlined, FileTextOutlined, FilterOutlined } from "@ant-design/icons"
import dayjs from "dayjs"

const { Title, Text } = Typography
const { RangePicker } = DatePicker
const { Option } = Select

export default function PaymentsPage() {
  const [filters, setFilters] = useState({
    dateRange: null,
    status: "all",
  })

  // Fetch bookings with payment info
  const { data: bookings, isLoading } = useQuery({
    queryKey: ["bookings-payments"],
    queryFn: async () => {
      const response = await api.get("/api/bookings")
      return response.data
    },
  })

  // Fetch tours for reference
  const { data: tours } = useQuery({
    queryKey: ["tours-reference"],
    queryFn: async () => {
      const response = await api.get("/api/tours/admin")
      return response.data
    },
  })

  const generateInvoice = (bookingId: number) => {
    api
      .post(`/api/payments/generate-invoice/${bookingId}`)
      .then((response) => {
        window.open(response.data.invoiceUrl, "_blank")
      })
      .catch((error) => {
        console.error("Failed to generate invoice:", error)
      })
  }

  const resetFilters = () => {
    setFilters({
      dateRange: null,
      status: "all",
    })
  }

  // Filter bookings based on current filters
  const filteredBookings = bookings?.filter((booking: any) => {
    // Filter by payment status
    if (filters.status !== "all") {
      const isPaid = filters.status === "paid"
      if (booking.isPaid !== isPaid) return false
    }

    // Filter by date range
    if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
      const bookingDate = dayjs(booking.createdAt)
      const startDate = dayjs(filters.dateRange[0])
      const endDate = dayjs(filters.dateRange[1])

      if (bookingDate.isBefore(startDate) || bookingDate.isAfter(endDate)) {
        return false
      }
    }

    return true
  })

  // Calculate total revenue
  const totalRevenue =
    filteredBookings?.reduce((total: number, booking: any) => {
      if (booking.isPaid) {
        const tour = tours?.find((t: any) => t.id === booking.tourId)
        if (tour) {
          return total + tour.price * booking.numberOfPeople
        }
      }
      return total
    }, 0) || 0

  // Calculate pending revenue
  const pendingRevenue =
    filteredBookings?.reduce((total: number, booking: any) => {
      if (!booking.isPaid && booking.status !== "cancelled") {
        const tour = tours?.find((t: any) => t.id === booking.tourId)
        if (tour) {
          return total + tour.price * booking.numberOfPeople
        }
      }
      return total
    }, 0) || 0

  const columns = [
    {
      title: "Booking ID",
      dataIndex: "id",
      key: "id",
      width: 100,
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
      title: "Customer",
      dataIndex: "userId",
      key: "userId",
      render: (userId: string, record: any) => record.contactEmail,
    },
    {
      title: "Amount",
      key: "amount",
      render: (text: string, record: any) => {
        const tour = tours?.find((t: any) => t.id === record.tourId)
        const amount = tour ? tour.price * record.numberOfPeople : 0
        return `$${amount.toFixed(2)}`
      },
    },
    {
      title: "Status",
      dataIndex: "isPaid",
      key: "isPaid",
      render: (isPaid: boolean, record: any) => {
        if (record.status === "cancelled") {
          return <Tag color="red">Cancelled</Tag>
        }
        return <Tag color={isPaid ? "green" : "orange"}>{isPaid ? "Paid" : "Pending"}</Tag>
      },
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => dayjs(date).format("MMM D, YYYY"),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (text: string, record: any) => (
        <Space size="small">
          {record.isPaid && (
            <Tooltip title="Generate Invoice">
              <Button icon={<FileTextOutlined />} onClick={() => generateInvoice(record.id)} size="small" />
            </Tooltip>
          )}
          {!record.isPaid && record.status !== "cancelled" && (
            <Tooltip title="Confirm Payment">
              <Button
                icon={<DollarOutlined />}
                onClick={() => {
                  api
                    .post(`/api/bookings/${record.id}/confirm-payment`)
                    .then(() => {
                      window.location.reload()
                    })
                    .catch((error) => {
                      console.error("Failed to confirm payment:", error)
                    })
                }}
                type="primary"
                size="small"
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={3}>Payment Management</Title>
      </div>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={totalRevenue}
              precision={2}
              prefix={<DollarOutlined />}
              suffix="$"
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Pending Revenue"
              value={pendingRevenue}
              precision={2}
              prefix={<DollarOutlined />}
              suffix="$"
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Paid Bookings"
              value={filteredBookings?.filter((b: any) => b.isPaid).length || 0}
              suffix={`/ ${filteredBookings?.length || 0}`}
              valueStyle={{ color: "#1677ff" }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="mb-6">
        <Form layout="inline" className="mb-4">
          <Form.Item label="Date Range">
            <RangePicker
              value={filters.dateRange}
              onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item label="Payment Status">
            <Select
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
              style={{ width: 120 }}
            >
              <Option value="all">All</Option>
              <Option value="paid">Paid</Option>
              <Option value="unpaid">Unpaid</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button icon={<FilterOutlined />} onClick={resetFilters} type="default">
              Reset
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            dataSource={filteredBookings}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1000 }}
          />
        )}
      </Card>
    </div>
  )
}
