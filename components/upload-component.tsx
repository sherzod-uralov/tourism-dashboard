"use client"

import { useState } from "react"
import { Upload, message } from "antd"
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons"
import type { UploadProps } from "antd"
import { uploadFile } from "@/lib/api"

interface UploadComponentProps {
    onUploadSuccess?: (result: any) => void
    listType?: "text" | "picture" | "picture-card" | "picture-circle"
    multiple?: boolean
    maxSize?: number // in MB
    accept?: string
    showUploadList?: boolean
}

export default function UploadComponent({
                                            onUploadSuccess,
                                            listType = "picture-card",
                                            multiple = false,
                                            maxSize = 5,
                                            accept = "image/*",
                                            showUploadList = false,
                                        }: UploadComponentProps) {
    const [loading, setLoading] = useState(false)
    const [uploadedFiles, setUploadedFiles] = useState<any[]>([])

    const handleFileUpload = async (file: File) => {
        try {
            setLoading(true)
            const result = await uploadFile(file)
            setUploadedFiles((prev) => [...prev, result])
            message.success(`File ${result.originalname} uploaded successfully!`)
            onUploadSuccess?.(result)
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
        multiple,
        listType,
        showUploadList,
        customRequest: async ({ file, onSuccess, onError }) => {
            try {
                const result = await handleFileUpload(file as File)
                onSuccess?.(result)
            } catch (error) {
                onError?.(error as Error)
            }
        },
        beforeUpload: (file) => {
            if (accept === "image/*") {
                const isImage = file.type.startsWith("image/")
                if (!isImage) {
                    message.error("You can only upload image files!")
                    return false
                }
            }

            const isLtMaxSize = file.size / 1024 / 1024 < maxSize
            if (!isLtMaxSize) {
                message.error(`File must be smaller than ${maxSize}MB!`)
                return false
            }
            return true
        },
    }

    if (listType === "picture-card") {
        return (
            <Upload {...uploadProps}>
                {loading ? (
                    <div>
                        <LoadingOutlined />
                        <div style={{ marginTop: 8 }}>Uploading...</div>
                    </div>
                ) : (
                    <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                )}
            </Upload>
        )
    }

    return <Upload {...uploadProps}>Upload File</Upload>
}
