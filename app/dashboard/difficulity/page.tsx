"use client"

import { useState, useEffect } from "react"
import {
    Layout,
    Card,
    Table,
    Button,
    Modal,
    Form,
    Input,
    Upload,
    message,
    Popconfirm,
    Tabs,
    Space,
    Typography,
    Divider,
    Tag,
} from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined, InboxOutlined, LoadingOutlined } from "@ant-design/icons"
import { uploadFile, categoriesApi, difficultiesApi } from "@/lib/api"
import type { UploadProps, TableColumnsType } from "antd"

const { Header, Content } = Layout
const { Title, Text } = Typography
const { Dragger } = Upload
const { TextArea } = Input

interface Category {
    id: number
    name: string
    categoryUrl: string
    description: string
    imageUrl?: string // Add this field
    createdAt: string
    updatedAt: string
}

interface Difficulty {
    id: number
    name: string
    description: string
    createdAt: string
    updatedAt: string
}

interface UploadedFile {
    originalname: string
    filename: string
    mimetype: string
    size: number
    url: string
}

export default function AdminPanel() {
    const [categories, setCategories] = useState<Category[]>([])
    const [difficulties, setDifficulties] = useState<Difficulty[]>([])
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
    const [loading, setLoading] = useState(false)

    // Modal states
    const [categoryModalVisible, setCategoryModalVisible] = useState(false)
    const [difficultyModalVisible, setDifficultyModalVisible] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [editingDifficulty, setEditingDifficulty] = useState<Difficulty | null>(null)

    // Forms
    const [categoryForm] = Form.useForm()
    const [difficultyForm] = Form.useForm()

    // New state for category file uploading
    const [categoryFileUploading, setCategoryFileUploading] = useState(false)

    // Load data on component mount
    useEffect(() => {
        loadCategories()
        loadDifficulties()
    }, [])

    const loadCategories = async () => {
        try {
            setLoading(true)
            const response = await categoriesApi.getAll()
            setCategories(response.data)
        } catch (error) {
            message.error("Failed to load categories")
            console.error("Error loading categories:", error)
        } finally {
            setLoading(false)
        }
    }

    const loadDifficulties = async () => {
        try {
            setLoading(true)
            const response = await difficultiesApi.getAll()
            setDifficulties(response.data)
        } catch (error) {
            message.error("Failed to load difficulties")
            console.error("Error loading difficulties:", error)
        } finally {
            setLoading(false)
        }
    }

    // File Upload handlers
    const handleFileUpload = async (file: File) => {
        try {
            setLoading(true)
            const result = await uploadFile(file)
            setUploadedFiles((prev) => [...prev, result])
            message.success(`File ${result.originalname} uploaded successfully!`)
            return result
        } catch (error) {
            message.error("File upload failed")
            console.error("Upload error:", error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    const uploadProps: UploadProps = {
        name: "file",
        multiple: true,
        customRequest: async ({ file, onSuccess, onError }) => {
            try {
                const result = await handleFileUpload(file as File)
                onSuccess?.(result)
            } catch (error) {
                onError?.(error as Error)
            }
        },
        showUploadList: {
            showPreviewIcon: true,
            showRemoveIcon: true,
        },
    }

    // Category handlers
    const handleCategorySubmit = async (values: any) => {
        try {
            setLoading(true)

            // Prepare the data to send to API
            const categoryData = {
                name: values.name,
                categoryUrl: values.categoryUrl,
                description: values.description,
            }

            console.log("Sending category data:", categoryData) // Debug log

            if (editingCategory) {
                await categoriesApi.update(editingCategory.id, categoryData)
                message.success("Category updated successfully!")
            } else {
                await categoriesApi.create(categoryData)
                message.success("Category created successfully!")
            }
            setCategoryModalVisible(false)
            setEditingCategory(null)
            categoryForm.resetFields()
            loadCategories()
        } catch (error: any) {
            console.error("Category save error:", error)

            // Better error handling
            if (error.response?.data?.message) {
                message.error(`Failed to save category: ${error.response.data.message}`)
            } else {
                message.error("Failed to save category")
            }
        } finally {
            setLoading(false)
        }
    }

    const handleCategoryEdit = (category: Category) => {
        setEditingCategory(category)
        categoryForm.setFieldsValue(category)
        setCategoryModalVisible(true)
    }

    const handleCategoryDelete = async (id: number) => {
        try {
            setLoading(true)
            await categoriesApi.delete(id)
            message.success("Category deleted successfully!")
            loadCategories()
        } catch (error) {
            message.error("Failed to delete category")
            console.error("Category delete error:", error)
        } finally {
            setLoading(false)
        }
    }

    console.log(categories)
    const handleCategoryFileUpload = async (file: File) => {
        try {
            setCategoryFileUploading(true)
            const result = await uploadFile(file)
            // Set the uploaded file URL to the categoryUrl field (not imageUrl)
            categoryForm.setFieldsValue({
                categoryUrl: result.url,
            })
            message.success(`Image uploaded successfully!`)
            return result
        } catch (error) {
            message.error("Image upload failed")
            console.error("Upload error:", error)
            throw error
        } finally {
            setCategoryFileUploading(false)
        }
    }

    // Difficulty handlers
    const handleDifficultySubmit = async (values: any) => {
        try {
            setLoading(true)
            if (editingDifficulty) {
                await difficultiesApi.update(editingDifficulty.id, values)
                message.success("Difficulty updated successfully!")
            } else {
                await difficultiesApi.create(values)
                message.success("Difficulty created successfully!")
            }
            setDifficultyModalVisible(false)
            setEditingDifficulty(null)
            difficultyForm.resetFields()
            loadDifficulties()
        } catch (error) {
            message.error("Failed to save difficulty")
            console.error("Difficulty save error:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleDifficultyEdit = (difficulty: Difficulty) => {
        setEditingDifficulty(difficulty)
        difficultyForm.setFieldsValue(difficulty)
        setDifficultyModalVisible(true)
    }

    const handleDifficultyDelete = async (id: number) => {
        try {
            setLoading(true)
            await difficultiesApi.delete(id)
            message.success("Difficulty deleted successfully!")
            loadDifficulties()
        } catch (error) {
            message.error("Failed to delete difficulty")
            console.error("Difficulty delete error:", error)
        } finally {
            setLoading(false)
        }
    }

    // Table columns
    const categoryColumns: TableColumnsType<Category> = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 80,
        },
        {
            title: "Image",
            dataIndex: "categoryUrl",
            key: "categoryUrl",
            width: 100,
            render: (url: string) =>
                url ? (
                    <img
                        src={url || "/placeholder.svg"}
                        alt="Category"
                        style={{ width: 50, height: 50, objectFit: "cover", borderRadius: "4px" }}
                    />
                ) : (
                    <Text type="secondary">No image</Text>
                ),
        },
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
            ellipsis: true,
        },
        {
            title: "Created",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date: string) => new Date(date).toLocaleDateString(),
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button type="primary" size="small" icon={<EditOutlined />} onClick={() => handleCategoryEdit(record)}>
                        Edit
                    </Button>
                    <Popconfirm
                        title="Are you sure you want to delete this category?"
                        onConfirm={() => handleCategoryDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="primary" danger size="small" icon={<DeleteOutlined />}>
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ]

    const difficultyColumns: TableColumnsType<Difficulty> = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 80,
        },
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
            ellipsis: true,
        },
        {
            title: "Created",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date: string) => new Date(date).toLocaleDateString(),
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button type="primary" size="small" icon={<EditOutlined />} onClick={() => handleDifficultyEdit(record)}>
                        Edit
                    </Button>
                    <Popconfirm
                        title="Are you sure you want to delete this difficulty?"
                        onConfirm={() => handleDifficultyDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="primary" danger size="small" icon={<DeleteOutlined />}>
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ]

    const fileColumns: TableColumnsType<UploadedFile> = [
        {
            title: "Original Name",
            dataIndex: "originalname",
            key: "originalname",
        },
        {
            title: "File Name",
            dataIndex: "filename",
            key: "filename",
        },
        {
            title: "Type",
            dataIndex: "mimetype",
            key: "mimetype",
            render: (type: string) => <Tag color="green">{type}</Tag>,
        },
        {
            title: "Size",
            dataIndex: "size",
            key: "size",
            render: (size: number) => `${(size / 1024).toFixed(2)} KB`,
        },
        {
            title: "URL",
            dataIndex: "url",
            key: "url",
            render: (url: string) => (
                <a href={url} target="_blank" rel="noopener noreferrer">
                    View File
                </a>
            ),
        },
    ]

    const tabItems = [
        {
            key: "1",
            label: "File Upload",
            children: (
                <Card>
                    <Title level={4}>Upload Files</Title>
                    <Dragger {...uploadProps} style={{ marginBottom: 24 }}>
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">Click or drag file to this area to upload</p>
                        <p className="ant-upload-hint">
                            Support for single or bulk upload. Strictly prohibited from uploading company data or other banned files.
                        </p>
                    </Dragger>

                    {uploadedFiles.length > 0 && (
                        <>
                            <Divider />
                            <Title level={5}>Uploaded Files</Title>
                            <Table columns={fileColumns} dataSource={uploadedFiles} rowKey="filename" pagination={{ pageSize: 10 }} />
                        </>
                    )}
                </Card>
            ),
        },
        {
            key: "2",
            label: "Categories",
            children: (
                <Card>
                    <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Title level={4} style={{ margin: 0 }}>
                            Categories Management
                        </Title>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCategoryModalVisible(true)}>
                            Add Category
                        </Button>
                    </div>
                    <Table
                        columns={categoryColumns}
                        dataSource={categories}
                        rowKey="id"
                        loading={loading}
                        pagination={{ pageSize: 10 }}
                    />
                </Card>
            ),
        },
        {
            key: "3",
            label: "Difficulties",
            children: (
                <Card>
                    <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Title level={4} style={{ margin: 0 }}>
                            Difficulties Management
                        </Title>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => setDifficultyModalVisible(true)}>
                            Add Difficulty
                        </Button>
                    </div>
                    <Table
                        columns={difficultyColumns}
                        dataSource={difficulties}
                        rowKey="id"
                        loading={loading}
                        pagination={{ pageSize: 10 }}
                    />
                </Card>
            ),
        },
    ]

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Header style={{ background: "#fff", padding: "0 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                <Title level={2} style={{ margin: "16px 0", color: "#1890ff" }}>
                    Tour Admin Panel
                </Title>
            </Header>

            <Content style={{ padding: "24px", background: "#f0f2f5" }}>
                <Tabs defaultActiveKey="1" items={tabItems} />
            </Content>

            {/* Category Modal */}
            <Modal
                title={editingCategory ? "Edit Category" : "Add Category"}
                open={categoryModalVisible}
                onCancel={() => {
                    setCategoryModalVisible(false)
                    setEditingCategory(null)
                    categoryForm.resetFields()
                }}
                footer={null}
                width={600}
            >
                <Form form={categoryForm} layout="vertical" onFinish={handleCategorySubmit}>
                    <Form.Item
                        name="name"
                        label="Category Name"
                        rules={[{ required: true, message: "Please enter category name" }]}
                    >
                        <Input placeholder="Enter category name" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[{ required: true, message: "Please enter description" }]}
                    >
                        <TextArea rows={4} placeholder="Enter category description" />
                    </Form.Item>

                    <Form.Item label="Upload Category Image">
                        <Upload
                            name="file"
                            listType="picture-card"
                            className="category-image-uploader"
                            showUploadList={false}
                            customRequest={async ({ file, onSuccess, onError }) => {
                                try {
                                    await handleCategoryFileUpload(file as File)
                                    onSuccess?.("ok")
                                } catch (error) {
                                    onError?.(error as Error)
                                }
                            }}
                            beforeUpload={(file) => {
                                const isImage = file.type.startsWith("image/")
                                if (!isImage) {
                                    message.error("You can only upload image files!")
                                    return false
                                }
                                const isLt5M = file.size / 1024 / 1024 < 5
                                if (!isLt5M) {
                                    message.error("Image must be smaller than 5MB!")
                                    return false
                                }
                                return true
                            }}
                        >
                            {categoryFileUploading ? (
                                <div>
                                    <LoadingOutlined />
                                    <div style={{ marginTop: 8 }}>Uploading...</div>
                                </div>
                            ) : (
                                <div>
                                    <PlusOutlined />
                                    <div style={{ marginTop: 8 }}>Upload Image</div>
                                </div>
                            )}
                        </Upload>
                        {categoryForm.getFieldValue("categoryUrl") && (
                            <div style={{ marginTop: 16 }}>
                                <img
                                    src={categoryForm.getFieldValue("categoryUrl") || "/placeholder.svg"}
                                    alt="Category preview"
                                    style={{ width: 100, height: 100, objectFit: "cover", borderRadius: "8px" }}
                                />
                            </div>
                        )}
                    </Form.Item>

                    {/* Hidden field for auto-generated categoryUrl */}
                    <Form.Item name="categoryUrl" hidden>
                        <Input />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
                        <Space>
                            <Button
                                onClick={() => {
                                    setCategoryModalVisible(false)
                                    setEditingCategory(null)
                                    categoryForm.resetFields()
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                {editingCategory ? "Update" : "Create"}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Difficulty Modal */}
            <Modal
                title={editingDifficulty ? "Edit Difficulty" : "Add Difficulty"}
                open={difficultyModalVisible}
                onCancel={() => {
                    setDifficultyModalVisible(false)
                    setEditingDifficulty(null)
                    difficultyForm.resetFields()
                }}
                footer={null}
                width={600}
            >
                <Form form={difficultyForm} layout="vertical" onFinish={handleDifficultySubmit}>
                    <Form.Item
                        name="name"
                        label="Difficulty Name"
                        rules={[{ required: true, message: "Please enter difficulty name" }]}
                    >
                        <Input placeholder="Enter difficulty name (e.g., Moderate)" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[{ required: true, message: "Please enter description" }]}
                    >
                        <TextArea rows={4} placeholder="Enter difficulty description" />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
                        <Space>
                            <Button
                                onClick={() => {
                                    setDifficultyModalVisible(false)
                                    setEditingDifficulty(null)
                                    difficultyForm.resetFields()
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                {editingDifficulty ? "Update" : "Create"}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </Layout>
    )
}
