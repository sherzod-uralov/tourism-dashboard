
"use client"

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
  DatePicker,
  InputNumber,
  Switch,
  message,
  Popconfirm,
  Typography,
  Spin,
  Tag,
} from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"

const { Title, Text } = Typography
const { Option } = Select
const { TextArea } = Input
const { RangePicker } = DatePicker

export default function ToursPage() {
  const [form] = Form.useForm()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTour, setEditingTour] = useState<any>(null)
  const queryClient = useQueryClient()
  const router = useRouter()

  // Fetch tours
  const { data: tours, isLoading } = useQuery({
    queryKey: ["tours"],
    queryFn: async () => {
      const response = await api.get("/api/tours/admin")
      return response.data
    },
  })

  // Create tour mutation
  const createTour = useMutation({
    mutationFn: (tourData: any) => api.post("/api/tours", tourData),
    onSuccess: () => {
      message.success("Tour created successfully")
      queryClient.invalidateQueries({ queryKey: ["tours"] })
      setIsModalOpen(false)
      form.resetFields()
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to create tour")
    },
  })

  // Update tour mutation
  const updateTour = useMutation({
    mutationFn: ({ id, tourData }: { id: number; tourData: any }) => api.patch(`/api/tours/${id}`, tourData),
    onSuccess: () => {
      message.success("Tour updated successfully")
      queryClient.invalidateQueries({ queryKey: ["tours"] })
      setIsModalOpen(false)
      form.resetFields()
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to update tour")
    },
  })

  // Delete tour mutation
  const deleteTour = useMutation({
    mutationFn: (id: number) => api.delete(`/api/tours/${id}`),
    onSuccess: () => {
      message.success("Tour deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["tours"] })
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to delete tour")
    },
  })

  const showModal = (tour?: any) => {
    if (tour) {
      setEditingTour(tour)
      form.setFieldsValue({
        title: tour.title,
        description: tour.description,
        images: tour.images?.join(", "),
        location: tour.location,
        price: tour.price,
        dateRange: [dayjs(tour.startDate), dayjs(tour.endDate)],
        availableSeats: tour.availableSeats,
        category: tour.category,
        isActive: tour.isActive,
        duration: tour.duration,
        difficulty: tour.difficulty,
        includedServices: tour.includedServices,
        excludedServices: tour.excludedServices,
        itinerary: tour.itinerary,
        meetingPoint: tour.meetingPoint,
        endPoint: tour.endPoint,
        lemonSqueezyProductId: tour.lemonSqueezyProductId,
        lemonSqueezyVariantId: tour.lemonSqueezyVariantId,
      })
    } else {
      setEditingTour(null)
      form.resetFields()
    }
    setIsModalOpen(true)
  }

  const handleCancel = () => {
    setIsModalOpen(false)
    form.resetFields()
  }

  const handleSubmit = (values: any) => {
    const tourData = {
      ...values,
      images: values.images.split(",").map((img: string) => img.trim()),
      startDate: values.dateRange[0].format("YYYY-MM-DD"),
      endDate: values.dateRange[1].format("YYYY-MM-DD"),
    }

    // Remove fields that are not part of the API
    delete tourData.dateRange
    delete tourData.lemonSqueezyProductId
    delete tourData.lemonSqueezyVariantId

    if (editingTour) {
      updateTour.mutate({ id: editingTour.id, tourData })
    } else {
      createTour.mutate(tourData)
    }
  }


  const handleDelete = (id: number) => {
    deleteTour.mutate(id)
  }

  const viewTourDetails = (id: number) => {
    router.push(`/dashboard/tours/${id}`)
  }

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 60,
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      ellipsis: true,
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
      title: "Dates",
      key: "dates",
      render: (text: string, record: any) => (
          <span>
          {dayjs(record.startDate).format("MMM D")} - {dayjs(record.endDate).format("MMM D, YYYY")}
        </span>
      ),
    },
    {
      title: "Seats",
      dataIndex: "availableSeats",
      key: "availableSeats",
      width: 80,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category: string) => <Tag color="blue">{category.charAt(0).toUpperCase() + category.slice(1)}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => <Tag color={isActive ? "green" : "red"}>{isActive ? "Active" : "Inactive"}</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (text: string, record: any) => (
          <Space size="small">
            <Button icon={<EyeOutlined />} onClick={() => viewTourDetails(record.id)} size="small" />
            <Button icon={<EditOutlined />} onClick={() => showModal(record)} size="small" />
            <Popconfirm
                title="Are you sure you want to delete this tour?"
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

  const categoryOptions = [
    { value: "historical", label: "Historical" },
    { value: "cultural", label: "Cultural" },
    { value: "eco", label: "Eco" },
    { value: "luxury", label: "Luxury" },
    { value: "adventure", label: "Adventure" },
    { value: "culinary", label: "Culinary" },
    { value: "religious", label: "Religious" },
    { value: "educational", label: "Educational" },
    { value: "wellness", label: "Wellness" },
    { value: "photography", label: "Photography" },
  ]

  const difficultyOptions = [
    { value: "easy", label: "Easy" },
    { value: "moderate", label: "Moderate" },
    { value: "challenging", label: "Challenging" },
    { value: "difficult", label: "Difficult" },
    { value: "extreme", label: "Extreme" },
  ]

  return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <Title level={3}>Tour Management</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
            Add Tour
          </Button>
        </div>

        <Card>
          {isLoading ? (
              <div className="flex justify-center py-8">
                <Spin size="large" />
              </div>
          ) : (
              <Table dataSource={tours} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} scroll={{ x: 1000 }} />
          )}
        </Card>

        <Modal
            title={editingTour ? "Edit Tour" : "Add New Tour"}
            open={isModalOpen}
            onCancel={handleCancel}
            footer={null}
            width={800}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ isActive: true }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                  name="title"
                  label="Title"
                  rules={[{ required: true, message: "Please input tour title!" }]}
                  className="md:col-span-2"
              >
                <Input placeholder="Tour Title" />
              </Form.Item>

              <Form.Item
                  name="description"
                  label="Description"
                  rules={[{ required: true, message: "Please input description!" }]}
                  className="md:col-span-2"
              >
                <TextArea rows={4} placeholder="Tour Description" />
              </Form.Item>

              <Form.Item
                  name="images"
                  label="Images (comma separated URLs)"
                  rules={[{ required: true, message: "Please input image URLs!" }]}
                  className="md:col-span-2"
              >
                <TextArea rows={2} placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg" />
              </Form.Item>

              <Form.Item name="location" label="Location" rules={[{ required: true, message: "Please input location!" }]}>
                <Input placeholder="Location" />
              </Form.Item>

              <Form.Item name="price" label="Price" rules={[{ required: true, message: "Please input price!" }]}>
                <InputNumber
                    min={0}
                    step={0.01}
                    style={{ width: "100%" }}
                    formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    //@ts-ignore
                    parser={(value) => {
                      if (!value) return 0;
                      const parsed = value.replace(/\$\s?|(,*)/g, "");
                      return parseFloat(parsed) || 0;
                    }}
                    placeholder="Price"
                />
              </Form.Item>

              <Form.Item
                  name="dateRange"
                  label="Date Range"
                  rules={[{ required: true, message: "Please select date range!" }]}
                  className="md:col-span-2"
              >
                <RangePicker style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                  name="availableSeats"
                  label="Available Seats"
                  rules={[{ required: true, message: "Please input available seats!" }]}
              >
                <InputNumber min={1} style={{ width: "100%" }} placeholder="Available Seats" />
              </Form.Item>

              <Form.Item
                  name="category"
                  label="Category"
                  rules={[{ required: true, message: "Please select category!" }]}
              >
                <Select placeholder="Select a category">
                  {categoryOptions.map((option) => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="duration" label="Duration (days)">
                <InputNumber min={1} style={{ width: "100%" }} placeholder="Duration in days" />
              </Form.Item>

              <Form.Item name="difficulty" label="Difficulty">
                <Select placeholder="Select difficulty">
                  {difficultyOptions.map((option) => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="includedServices" label="Included Services" className="md:col-span-2">
                <TextArea rows={2} placeholder="Hotel accommodation, Breakfast, Guided tours, Transportation" />
              </Form.Item>

              <Form.Item name="excludedServices" label="Excluded Services" className="md:col-span-2">
                <TextArea rows={2} placeholder="Flights, Lunch and Dinner, Personal expenses" />
              </Form.Item>

              <Form.Item name="itinerary" label="Itinerary" className="md:col-span-2">
                <TextArea rows={4} placeholder="Day 1: Arrival and city tour. Day 2: Visit to Registan Square..." />
              </Form.Item>

              <Form.Item name="meetingPoint" label="Meeting Point">
                <Input placeholder="Meeting Point" />
              </Form.Item>

              <Form.Item name="endPoint" label="End Point">
                <Input placeholder="End Point" />
              </Form.Item>

              <Form.Item
                  name="lemonSqueezyProductId"
                  label="LemonSqueezy Product ID"
                  rules={[{ required: true, message: "Please input LemonSqueezy Product ID!" }]}
              >
                <Input placeholder="536690" />
              </Form.Item>

              <Form.Item
                  name="lemonSqueezyVariantId"
                  label="LemonSqueezy Variant ID"
                  rules={[{ required: true, message: "Please input LemonSqueezy Variant ID!" }]}
              >
                <Input placeholder="536690" />
              </Form.Item>

              <Form.Item name="isActive" label="Active" valuePropName="checked">
                <Switch />
              </Form.Item>
            </div>

            <Form.Item>
              <div className="flex justify-end gap-2">
                <Button onClick={handleCancel}>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={createTour.isPending || updateTour.isPending}>
                  {editingTour ? "Update" : "Create"}
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>
      </div>
  )
}