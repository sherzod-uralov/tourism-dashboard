"use client"

import { useEffect, useState } from "react"
import { Card, Row, Col, Statistic, Table, Typography, Spin, Button } from "antd"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { UserOutlined, CompassOutlined, CalendarOutlined, CreditCardOutlined } from "@ant-design/icons"
import { useRouter } from "next/navigation"

const { Title } = Typography

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTours: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingBookings: 0,
  })

  // Fetch recent bookings
  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ["recent-bookings"],
    queryFn: async () => {
      const response = await api.get("/api/bookings")
      return response.data.slice(0, 5) // Get only 5 most recent bookings
    },
  })

  // Fetch recent tours
  const { data: tours, isLoading: toursLoading } = useQuery({
    queryKey: ["recent-tours"],
    queryFn: async () => {
      const response = await api.get("/api/tours/admin")
      return response.data.slice(0, 5) // Get only 5 most recent tours
    },
  })

  // Calculate dashboard statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // In a real app, you might have a dedicated endpoint for stats
        // Here we're fetching data from multiple endpoints
        const [usersRes, toursRes, bookingsRes] = await Promise.all([
          api.get("/api/users"),
          api.get("/api/tours/admin"),
          api.get("/api/bookings"),
        ])

        const users = usersRes.data
        const tours = toursRes.data
        const bookings = bookingsRes.data

        // Calculate total revenue from bookings
        const revenue = bookings.reduce((total: number, booking: any) => {
          if (booking.isPaid) {
            // Find the tour price
            const tour = tours.find((t: any) => t.id === booking.tourId)
            if (tour) {
              return total + tour.price * booking.numberOfPeople
            }
          }
          return total
        }, 0)

        // Count pending bookings
        const pendingBookings = bookings.filter((booking: any) => booking.status === "pending").length

        setStats({
          totalUsers: users.length,
          totalTours: tours.length,
          totalBookings: bookings.length,
          totalRevenue: revenue,
          pendingBookings,
        })
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error)
      }
    }

    fetchStats()
  }, [])

  // Booking columns for the table
  const bookingColumns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Tour",
      dataIndex: "tourId",
      key: "tourId",
      render: (tourId: number) => `Tour #${tourId}`,
    },
    {
      title: "People",
      dataIndex: "numberOfPeople",
      key: "numberOfPeople",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <span className={`status-${status.toLowerCase()}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      ),
    },
    {
      title: "Paid",
      dataIndex: "isPaid",
      key: "isPaid",
      render: (isPaid: boolean) => (isPaid ? "Yes" : "No"),
    },
  ]

  // Tour columns for the table
  const tourColumns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price: any) => {
        if (price === null || price === undefined || isNaN(Number(price))) {
          return "N/A";
        }
        return `$${Number(price).toFixed(2)}`;
      },
    },
    {
      title: "Available Seats",
      dataIndex: "availableSeats",
      key: "availableSeats",
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <Title level={3}>Dashboard Overview</Title>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card className="dashboard-card" onClick={() => router.push("/dashboard/users")}>
            <Statistic title="Total Users" value={stats.totalUsers} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="dashboard-card" onClick={() => router.push("/dashboard/tours")}>
            <Statistic title="Total Tours" value={stats.totalTours} prefix={<CompassOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="dashboard-card" onClick={() => router.push("/dashboard/bookings")}>
            <Statistic
              title="Total Bookings"
              value={stats.totalBookings}
              prefix={<CalendarOutlined />}
              suffix={
                <span className="text-xs text-orange-500">
                  {stats.pendingBookings > 0 && `${stats.pendingBookings} pending`}
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="dashboard-card" onClick={() => router.push("/dashboard/payments")}>
            <Statistic
              title="Total Revenue"
              value={stats.totalRevenue}
              precision={2}
              prefix={<CreditCardOutlined />}
              suffix="$"
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24} lg={12}>
          <Card
            title="Recent Bookings"
            extra={
              <Button type="link" onClick={() => router.push("/dashboard/bookings")}>
                View All
              </Button>
            }
          >
            {bookingsLoading ? (
              <div className="flex justify-center py-8">
                <Spin />
              </div>
            ) : (
              <Table dataSource={bookings} columns={bookingColumns} rowKey="id" pagination={false} size="small" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title="Recent Tours"
            extra={
              <Button type="link" onClick={() => router.push("/dashboard/tours")}>
                View All
              </Button>
            }
          >
            {toursLoading ? (
              <div className="flex justify-center py-8">
                <Spin />
              </div>
            ) : (
              <Table dataSource={tours} columns={tourColumns} rowKey="id" pagination={false} size="small" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}
