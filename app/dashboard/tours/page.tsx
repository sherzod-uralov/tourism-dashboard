"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api, categoriesApi, difficultiesApi } from "@/lib/api"
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
  Image,
  List,
  Alert,
} from "antd"
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CloseOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import UploadComponent from "@/components/upload-component"

const { Title, Text } = Typography
const { Option } = Select
const { TextArea } = Input
const { RangePicker } = DatePicker

export default function ToursPage() {
  const [form] = Form.useForm()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTour, setEditingTour] = useState<any>(null)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [includedServices, setIncludedServices] = useState<string[]>([])
  const [excludedServices, setExcludedServices] = useState<string[]>([])
  const [itineraryItems, setItineraryItems] = useState<string[]>([])
  const [newIncludedService, setNewIncludedService] = useState("")
  const [newExcludedService, setNewExcludedService] = useState("")
  const [newItineraryItem, setNewItineraryItem] = useState("")

  const queryClient = useQueryClient()
  const router = useRouter()

  // Fetch tours
  const { data: tours, isLoading, error } = useQuery({
    queryKey: ["tours"],
    queryFn: async () => {
      try {
        const response = await api.get("/api/tours/admin")
        return response.data || []
      } catch (error) {
        console.error("Failed to fetch tours:", error)
        throw error
      }
    },
    retry: 1,
    retryDelay: 1000,
  })

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const response = await categoriesApi.getAll()
        return response.data || []
      } catch (error) {
        console.error("Failed to fetch categories:", error)
        return []
      }
    },
  })

  // Fetch difficulties
  const { data: difficulties, isLoading: difficultiesLoading } = useQuery({
    queryKey: ["difficulties"],
    queryFn: async () => {
      try {
        const response = await difficultiesApi.getAll()
        return response.data || []
      } catch (error) {
        console.error("Failed to fetch difficulties:", error)
        return []
      }
    },
  })

  // Create tour mutation
  const createTour = useMutation({
    mutationFn: (tourData: any) => api.post("/api/tours", tourData),
    onSuccess: () => {
      message.success("Tour created successfully")
      queryClient.invalidateQueries({ queryKey: ["tours"] })
      setIsModalOpen(false)
      resetForm()
    },
    onError: (error: any) => {
      console.error("Create tour error:", error)
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
      resetForm()
    },
    onError: (error: any) => {
      console.error("Update tour error:", error)
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
      console.error("Delete tour error:", error)
      message.error(error.response?.data?.message || "Failed to delete tour")
    },
  })

  const resetForm = () => {
    form.resetFields()
    setUploadedImages([])
    setIncludedServices([])
    setExcludedServices([])
    setItineraryItems([])
    setNewIncludedService("")
    setNewExcludedService("")
    setNewItineraryItem("")
    setEditingTour(null)
  }

  const safeString = (value: any): string => {
    if (value === null || value === undefined) return ""
    return typeof value === 'string' ? value : String(value)
  }

  const safeParseServices = (services: any): string[] => {
    if (!services) return []
    const serviceString = safeString(services)
    if (!serviceString.trim()) return []
    return serviceString.split(", ").filter(item => item && item.trim())
  }

  const safeParseItinerary = (itinerary: any): string[] => {
    if (!itinerary) return []
    const itineraryString = safeString(itinerary)
    if (!itineraryString.trim()) return []
    return itineraryString.split(". ").filter((item: any) => item && item.trim())
  }

  const showModal = (tour?: any) => {
    try {
      if (tour) {
        setEditingTour(tour)
        
        // Safely handle images
        const images = tour.images || []
        const validImages = Array.isArray(images) 
          ? images.filter(img => img && typeof img === 'string')
          : []
        setUploadedImages(validImages)

        // Parse services and itinerary safely
        setIncludedServices(safeParseServices(tour.includedServices))
        setExcludedServices(safeParseServices(tour.excludedServices))
        setItineraryItems(safeParseItinerary(tour.itinerary))

        // Find category and difficulty IDs safely
        const categoryId = tour.categoryId || 
          (categories && Array.isArray(categories) 
            ? categories.find((cat: any) => 
                cat && cat.name && tour.category && 
                (cat.name.toLowerCase() === tour.category.toLowerCase() || cat.categoryUrl === tour.category)
              )?.id
            : null)

        const difficultyId = tour.difficultyId || 
          (difficulties && Array.isArray(difficulties)
            ? difficulties.find((diff: any) => 
                diff && diff.name && tour.difficulty && 
                diff.name.toLowerCase() === tour.difficulty.toLowerCase()
              )?.id
            : null)

        // Set form values safely
        form.setFieldsValue({
          title: safeString(tour.title),
          description: safeString(tour.description),
          location: safeString(tour.location),
          price: tour.price || 0,
          dateRange: tour.startDate && tour.endDate 
            ? [dayjs(tour.startDate), dayjs(tour.endDate)]
            : undefined,
          availableSeats: tour.availableSeats || 0,
          categoryId: categoryId || undefined,
          isActive: tour.isActive !== undefined ? tour.isActive : true,
          duration: tour.duration || 0,
          difficultyId: difficultyId || undefined,
          meetingPoint: safeString(tour.meetingPoint),
          endPoint: safeString(tour.endPoint),
          lemonSqueezyProductId: safeString(tour.lemonSqueezyProductId),
          lemonSqueezyVariantId: safeString(tour.lemonSqueezyVariantId),
        })
      } else {
        setEditingTour(null)
        resetForm()
      }
      setIsModalOpen(true)
    } catch (error) {
      console.error("Error in showModal:", error)
      message.error("Failed to load tour data")
    }
  }

  const handleCancel = () => {
    setIsModalOpen(false)
    resetForm()
  }

  const handleImageUpload = (result: any) => {
    try {
      if (!result || (!result.url && !result.path)) {
        message.error("Invalid image upload result")
        return
      }
      
      const imageUrl = result.url || result.path
      if (imageUrl && typeof imageUrl === 'string') {
        setUploadedImages((prev) => [...prev, imageUrl])
        message.success("Image uploaded successfully!")
      } else {
        message.error("Invalid image URL")
      }
    } catch (error) {
      console.error("Error handling image upload:", error)
      message.error("Failed to upload image")
    }
  }

  const removeImage = (indexToRemove: number) => {
    try {
      setUploadedImages((prev) => prev.filter((_, index) => index !== indexToRemove))
      message.success("Image removed successfully!")
    } catch (error) {
      console.error("Error removing image:", error)
      message.error("Failed to remove image")
    }
  }

  // Service and itinerary handlers
  const addIncludedService = () => {
    try {
      const service = newIncludedService.trim()
      if (service) {
        setIncludedServices([...includedServices, service])
        setNewIncludedService("")
      }
    } catch (error) {
      console.error("Error adding included service:", error)
    }
  }

  const removeIncludedService = (index: number) => {
    try {
      setIncludedServices(includedServices.filter((_, i) => i !== index))
    } catch (error) {
      console.error("Error removing included service:", error)
    }
  }

  const addExcludedService = () => {
    try {
      const service = newExcludedService.trim()
      if (service) {
        setExcludedServices([...excludedServices, service])
        setNewExcludedService("")
      }
    } catch (error) {
      console.error("Error adding excluded service:", error)
    }
  }

  const removeExcludedService = (index: number) => {
    try {
      setExcludedServices(excludedServices.filter((_, i) => i !== index))
    } catch (error) {
      console.error("Error removing excluded service:", error)
    }
  }

  const addItineraryItem = () => {
    try {
      const item = newItineraryItem.trim()
      if (item) {
        setItineraryItems([...itineraryItems, item])
        setNewItineraryItem("")
      }
    } catch (error) {
      console.error("Error adding itinerary item:", error)
    }
  }

  const removeItineraryItem = (index: number) => {
    try {
      setItineraryItems(itineraryItems.filter((_, i) => i !== index))
    } catch (error) {
      console.error("Error removing itinerary item:", error)
    }
  }

  const handleSubmit = (values: any) => {
    try {
      if (!values.dateRange || !values.dateRange[0] || !values.dateRange[1]) {
        message.error("Please select a valid date range")
        return
      }

      const tourData = {
        ...values,
        images: uploadedImages.filter(img => img && typeof img === 'string'),
        startDate: values.dateRange[0].format("YYYY-MM-DD"),
        endDate: values.dateRange[1].format("YYYY-MM-DD"),
        categoryId: values.categoryId,
        difficultyId: values.difficultyId,
        includedServices: includedServices.filter(s => s && s.trim()).join(", "),
        excludedServices: excludedServices.filter(s => s && s.trim()).join(", "),
        itinerary: itineraryItems.filter(i => i && i.trim()).join(". ") + 
                  (itineraryItems.length > 0 ? "." : ""),
      }

      // Remove fields that are not part of the API
      delete tourData.dateRange

      if (editingTour) {
        updateTour.mutate({ id: editingTour.id, tourData })
      } else {
        createTour.mutate(tourData)
      }
    } catch (error) {
      console.error("Error submitting tour:", error)
      message.error("Failed to submit tour data")
    }
  }

  const handleDelete = (id: number) => {
    try {
      deleteTour.mutate(id)
    } catch (error) {
      console.error("Error deleting tour:", error)
      message.error("Failed to delete tour")
    }
  }

  const viewTourDetails = (id: number) => {
    try {
      router.push(`/dashboard/tours/${id}`)
    } catch (error) {
      console.error("Error navigating to tour details:", error)
      message.error("Failed to navigate to tour details")
    }
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Alert
          message="Error loading tours"
          description="Please try refreshing the page or contact support if the problem persists."
          type="error"
          showIcon
          action={
            <Button type="primary" onClick={() => window.location.reload()}>
              Refresh
            </Button>
          }
        />
      </div>
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
      title: "Title",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
      render: (text: any) => safeString(text) || "N/A",
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      ellipsis: true,
      render: (text: any) => safeString(text) || "N/A",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price: any) => {
        if (price === null || price === undefined || isNaN(Number(price))) {
          return "N/A"
        }
        return `$${Number(price).toFixed(2)}`
      },
    },
    {
      title: "Dates",
      key: "dates",
      render: (text: string, record: any) => {
        try {
          if (!record.startDate || !record.endDate) return "N/A"
          return (
            <span>
              {dayjs(record.startDate).format("MMM D")} - {dayjs(record.endDate).format("MMM D, YYYY")}
            </span>
          )
        } catch (error) {
          console.error("Error formatting dates:", error)
          return "Invalid Date"
        }
      },
    },
    {
      title: "Seats",
      dataIndex: "availableSeats",
      key: "availableSeats",
      width: 80,
      render: (seats: any) => seats || 0,
    },
    {
      title: "Category",
      key: "category",
      render: (text: string, record: any) => {
        try {
          const category = categories?.find((cat: any) => cat && cat.id === record.categoryId)
          return <Tag color="blue">{category?.name || "Unknown"}</Tag>
        } catch (error) {
          console.error("Error rendering category:", error)
          return <Tag color="red">Error</Tag>
        }
      },
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (text: string, record: any) => (
        <Space size="small">
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => viewTourDetails(record.id)} 
            size="small" 
          />
          <Button 
            icon={<EditOutlined />} 
            onClick={() => showModal(record)} 
            size="small" 
          />
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
          <Table 
            dataSource={tours || []} 
            columns={columns} 
            rowKey="id" 
            pagination={{ pageSize: 10 }} 
            scroll={{ x: 1000 }} 
          />
        )}
      </Card>

      <Modal
        title={editingTour ? "Edit Tour" : "Add New Tour"}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={900}
        destroyOnClose
      >
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleSubmit} 
          initialValues={{ isActive: true }}
          preserve={false}
        >
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

            {/* Images Section */}
            <Form.Item label="Images" className="md:col-span-2">
              <div className="space-y-4">
                <div>
                  <Text type="secondary">Upload Images:</Text>
                  <div className="mt-2">
                    <UploadComponent
                      onUploadSuccess={handleImageUpload}
                      listType="picture-card"
                      multiple={true}
                      accept="image/*"
                    />
                  </div>
                </div>

                {uploadedImages.length > 0 && (
                  <div>
                    <Text strong>Uploaded Images:</Text>
                    <div className="grid grid-cols-4 gap-4 mt-2">
                      {uploadedImages
                        .filter(imageUrl => imageUrl && typeof imageUrl === 'string')
                        .map((imageUrl, index) => (
                          <div key={index} className="relative">
                            <Image
                              src={imageUrl || "/placeholder.svg"}
                              alt={`Tour image ${index + 1}`}
                              width={100}
                              height={100}
                              className="object-cover rounded"
                            />
                            <Button
                              type="primary"
                              danger
                              size="small"
                              icon={<CloseOutlined />}
                              className="absolute -top-2 -right-2"
                              onClick={() => removeImage(index)}
                            />
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </Form.Item>

            <Form.Item 
              name="location" 
              label="Location" 
              rules={[{ required: true, message: "Please input location!" }]}
            >
              <Input placeholder="Location" />
            </Form.Item>

            <Form.Item 
              name="price" 
              label="Price" 
              rules={[{ required: true, message: "Please input price!" }]}
            >
              <InputNumber
                min={0}
                step={0.01}
                style={{ width: "100%" }}
                formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(value) => {
                  if (!value) return 0
                  const parsed = safeString(value).replace(/\$\s?|(,*)/g, "")
                  return Number.parseFloat(parsed) || 0
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
              name="categoryId"
              label="Category"
              rules={[{ required: true, message: "Please select category!" }]}
            >
              <Select placeholder="Select a category" loading={categoriesLoading}>
                {categories?.map((category: any) => (
                  <Option key={category.id} value={category.id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="duration" label="Duration (days)">
              <InputNumber min={1} style={{ width: "100%" }} placeholder="Duration in days" />
            </Form.Item>

            <Form.Item name="difficultyId" label="Difficulty">
              <Select placeholder="Select difficulty" loading={difficultiesLoading}>
                {difficulties?.map((difficulty: any) => (
                  <Option key={difficulty.id} value={difficulty.id}>
                    {difficulty.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Included Services */}
            <Form.Item label="Included Services" className="md:col-span-2">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add included service"
                    value={newIncludedService}
                    onChange={(e) => setNewIncludedService(e.target.value)}
                    onPressEnter={addIncludedService}
                  />
                  <Button type="primary" icon={<PlusOutlined />} onClick={addIncludedService}>
                    Add
                  </Button>
                </div>
                {includedServices.length > 0 && (
                  <List
                    size="small"
                    dataSource={includedServices}
                    renderItem={(item, index) => (
                      <List.Item 
                        key={index}
                        actions={[
                          <Button
                            key="remove"
                            type="text"
                            danger
                            size="small"
                            icon={<MinusCircleOutlined />}
                            onClick={() => removeIncludedService(index)}
                          />
                        ]}
                      >
                        {item}
                      </List.Item>
                    )}
                  />
                )}
              </div>
            </Form.Item>

            {/* Excluded Services */}
            <Form.Item label="Excluded Services" className="md:col-span-2">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add excluded service"
                    value={newExcludedService}
                    onChange={(e) => setNewExcludedService(e.target.value)}
                    onPressEnter={addExcludedService}
                  />
                  <Button type="primary" icon={<PlusOutlined />} onClick={addExcludedService}>
                    Add
                  </Button>
                </div>
                {excludedServices.length > 0 && (
                  <List
                    size="small"
                    dataSource={excludedServices}
                    renderItem={(item, index) => (
                      <List.Item 
                        key={index}
                        actions={[
                          <Button
                            key="remove"
                            type="text"
                            danger
                            size="small"
                            icon={<MinusCircleOutlined />}
                            onClick={() => removeExcludedService(index)}
                          />
                        ]}
                      >
                        {item}
                      </List.Item>
                    )}
                  />
                )}
              </div>
            </Form.Item>

            {/* Itinerary */}
            <Form.Item label="Itinerary" className="md:col-span-2">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add itinerary item (e.g., Day 1: Arrival and city tour)"
                    value={newItineraryItem}
                    onChange={(e) => setNewItineraryItem(e.target.value)}
                    onPressEnter={addItineraryItem}
                  />
                  <Button type="primary" icon={<PlusOutlined />} onClick={addItineraryItem}>
                    Add
                  </Button>
                </div>
                {itineraryItems.length > 0 && (
                  <List
                    size="small"
                    dataSource={itineraryItems}
                    renderItem={(item, index) => (
                      <List.Item 
                        key={index}
                        actions={[
                          <Button
                            key="remove"
                            type="text"
                            danger
                            size="small"
                            icon={<MinusCircleOutlined />}
                            onClick={() => removeItineraryItem(index)}
                          />
                        ]}
                      >
                        <Text strong>Day {index + 1}:</Text> {item}
                      </List.Item>
                    )}
                  />
                )}
              </div>
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
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={createTour.isPending || updateTour.isPending}
              >
                {editingTour ? "Update" : "Create"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}