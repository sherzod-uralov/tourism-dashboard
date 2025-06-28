"use client"
import { Card, Form, Input, Button, Typography, message, Switch, Select, Divider, Row, Col, Tabs } from "antd"
import { SettingOutlined, BellOutlined, LockOutlined } from "@ant-design/icons"

const { Title, Text } = Typography
const { Option } = Select
const { TabPane } = Tabs

export default function SettingsPage() {
  const [notificationsForm] = Form.useForm()
  const [securityForm] = Form.useForm()
  const [generalForm] = Form.useForm()

  const handleNotificationsSubmit = (values: any) => {
    console.log("Notification settings:", values)
    message.success("Notification settings updated successfully")
  }

  const handleSecuritySubmit = (values: any) => {
    console.log("Security settings:", values)
    message.success("Security settings updated successfully")
  }

  const handleGeneralSubmit = (values: any) => {
    console.log("General settings:", values)
    message.success("General settings updated successfully")
  }

  return (
    <div>
      <Title level={3} className="mb-6">
        Settings
      </Title>

      <Card>
        <Tabs defaultActiveKey="general">
          <TabPane
            tab={
              <span>
                <SettingOutlined />
                General
              </span>
            }
            key="general"
          >
            <Form
              form={generalForm}
              layout="vertical"
              onFinish={handleGeneralSubmit}
              initialValues={{
                language: "en",
                timezone: "UTC+0",
                dateFormat: "MM/DD/YYYY",
              }}
            >
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="language"
                    label="Language"
                    rules={[{ required: true, message: "Please select a language!" }]}
                  >
                    <Select placeholder="Select language">
                      <Option value="en">English</Option>
                      <Option value="ru">Russian</Option>
                      <Option value="uz">Uzbek</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} md={8}>
                  <Form.Item
                    name="timezone"
                    label="Timezone"
                    rules={[{ required: true, message: "Please select a timezone!" }]}
                  >
                    <Select placeholder="Select timezone">
                      <Option value="UTC+0">UTC+0 (London)</Option>
                      <Option value="UTC+5">UTC+5 (Tashkent)</Option>
                      <Option value="UTC-5">UTC-5 (New York)</Option>
                      <Option value="UTC-8">UTC-8 (Los Angeles)</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} md={8}>
                  <Form.Item
                    name="dateFormat"
                    label="Date Format"
                    rules={[{ required: true, message: "Please select a date format!" }]}
                  >
                    <Select placeholder="Select date format">
                      <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
                      <Option value="DD/MM/YYYY">DD/MM/YYYY</Option>
                      <Option value="YYYY-MM-DD">YYYY-MM-DD</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="siteTitle" label="Site Title">
                <Input placeholder="Uzbekistan Tourism" />
              </Form.Item>

              <Form.Item name="siteDescription" label="Site Description">
                <Input.TextArea rows={3} placeholder="Discover the beauty of Uzbekistan with our guided tours..." />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Save General Settings
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane
            tab={
              <span>
                <BellOutlined />
                Notifications
              </span>
            }
            key="notifications"
          >
            <Form
              form={notificationsForm}
              layout="vertical"
              onFinish={handleNotificationsSubmit}
              initialValues={{
                emailNotifications: true,
                bookingNotifications: true,
                paymentNotifications: true,
                marketingEmails: false,
              }}
            >
              <Form.Item name="emailNotifications" label="Email Notifications" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Text type="secondary" className="block mb-4">
                Receive email notifications for important system events
              </Text>

              <Form.Item name="bookingNotifications" label="Booking Notifications" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Text type="secondary" className="block mb-4">
                Receive notifications when new bookings are made
              </Text>

              <Form.Item name="paymentNotifications" label="Payment Notifications" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Text type="secondary" className="block mb-4">
                Receive notifications for payment events
              </Text>

              <Form.Item name="marketingEmails" label="Marketing Emails" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Text type="secondary" className="block mb-4">
                Receive marketing and promotional emails
              </Text>

              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Save Notification Settings
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane
            tab={
              <span>
                <LockOutlined />
                Security
              </span>
            }
            key="security"
          >
            <Form
              form={securityForm}
              layout="vertical"
              onFinish={handleSecuritySubmit}
              initialValues={{
                twoFactorAuth: false,
                sessionTimeout: "30",
              }}
            >
              <Form.Item name="twoFactorAuth" label="Two-Factor Authentication" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Text type="secondary" className="block mb-4">
                Enable two-factor authentication for additional security
              </Text>

              <Form.Item name="sessionTimeout" label="Session Timeout (minutes)">
                <Select>
                  <Option value="15">15 minutes</Option>
                  <Option value="30">30 minutes</Option>
                  <Option value="60">1 hour</Option>
                  <Option value="120">2 hours</Option>
                  <Option value="240">4 hours</Option>
                </Select>
              </Form.Item>
              <Text type="secondary" className="block mb-4">
                Set how long before an inactive session is automatically logged out
              </Text>

              <Divider />

              <Title level={5}>API Access</Title>
              <Form.Item name="apiKey" label="API Key">
                <Input.Password readOnly defaultValue="sk_test_51HZ3kEKLt2TrVlH5i8DQVfT5sJm2lSbZ" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Save Security Settings
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  )
}
