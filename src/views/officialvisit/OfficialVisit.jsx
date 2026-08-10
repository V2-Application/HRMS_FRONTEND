import React, { useEffect, useMemo, useState } from 'react'
import {
  Tabs,
  Card,
  Row,
  Col,
  Form,
  DatePicker,
  Select,
  Input,
  Button,
  Table,
  Tag,
  message,
  Typography,
  Spin,
  Empty,
} from 'antd'
import { SendOutlined, HistoryOutlined, FormOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useSelector } from 'react-redux'
import Pageheading from '../../components/shared/Pageheading'
import {
  getOfficialVisitStores,
  applyOfficialVisit,
  getMyOfficialVisitRequests,
  searchEmployeeDropdown,
} from '../../services/Services'

const { RangePicker } = DatePicker
const { TextArea } = Input
const { Text } = Typography

const PURPOSE_OPTIONS = [
  'Client Meeting',
  'Store Audit',
  'Training',
  'Vendor Meeting',
  'Inventory Check',
  'Others',
]

const statusTag = (statusId) => {
  switch (statusId) {
    case 1:
      return <Tag color="green">Approved</Tag>
    case 2:
      return <Tag color="red">Rejected</Tag>
    case 4:
      return <Tag color="orange">Pending</Tag>
    default:
      return <Tag color="blue">Approved</Tag> // HR-uploaded rows carry no ManagerApprovalStatusId in this UI's simplified view
  }
}

// Employee self-service: apply for an official visit (date range, goes to reporting manager),
// and track the history/status of everything you've ever raised.
const OfficialVisit = () => {
  const { theme } = useSelector((state) => state.ui)
  const [form] = Form.useForm()

  const [stores, setStores] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const [recommendedByOptions, setRecommendedByOptions] = useState([])
  const [recommendedBySearching, setRecommendedBySearching] = useState(false)

  const loadStores = async () => {
    try {
      const res = await getOfficialVisitStores()
      setStores(Array.isArray(res?.data) ? res.data : [])
    } catch (e) {
      /* non-fatal */
    }
  }

  const loadHistory = async () => {
    setHistoryLoading(true)
    try {
      const res = await getMyOfficialVisitRequests()
      setHistory(Array.isArray(res?.data) ? res.data : [])
    } catch (e) {
      message.error('Failed to load your visit history.')
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    loadStores()
    loadHistory()
  }, [])

  const debouncedRecommendedBySearch = useMemo(() => {
    let t
    return (text) => {
      clearTimeout(t)
      setRecommendedBySearching(true)
      t = setTimeout(async () => {
        try {
          const res = await searchEmployeeDropdown(text || '')
          setRecommendedByOptions(
            (res?.data?.employees || []).map((e) => ({
              value: e.ecode,
              label: `${e.ecode} — ${e.fullName}`,
            })),
          )
        } catch (e) {
          /* non-fatal */
        } finally {
          setRecommendedBySearching(false)
        }
      }, 350)
    }
  }, [])

  const handleSubmit = async (values) => {
    const [from, to] = values.range || []
    if (!from || !to) {
      message.warning('Pick a From/To date range.')
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        fromDate: from.format('YYYY-MM-DD'),
        toDate: to.format('YYYY-MM-DD'),
        purpose: values.purpose === 'Others' ? values.purposeOther : values.purpose,
        visitStoreCode: values.visitStoreCode,
        recommendedByEcode: values.recommendedByEcode,
        employeeRemarks: values.employeeRemarks,
      }
      const res = await applyOfficialVisit(payload)
      if (res?.status) {
        message.success(res.message || 'Request submitted.')
        form.resetFields()
        loadHistory()
      } else {
        message.error(res?.message || 'Submission failed.')
      }
    } catch (e) {
      message.error(e?.response?.data?.message || 'Submission failed.')
    } finally {
      setSubmitting(false)
    }
  }

  const historyColumns = [
    {
      title: 'Dates',
      key: 'dates',
      width: 200,
      render: (_, r) =>
        `${dayjs(r.FromDate).format('DD-MMM-YY')} – ${dayjs(r.ToDate).format('DD-MMM-YY')}`,
    },
    { title: 'Purpose', dataIndex: 'Purpose', key: 'Purpose', ellipsis: true },
    {
      title: 'Visit Location',
      key: 'visitLocation',
      width: 200,
      render: (_, r) =>
        r.VisitStoreCode ? `${r.VisitStoreCode} — ${r.VisitLocationName || ''}` : '-',
    },
    {
      title: 'Recommended By',
      key: 'recommendedBy',
      width: 180,
      render: (_, r) =>
        r.RecommendedByEcode ? `${r.RecommendedByEcode} — ${r.RecommendedByName || ''}` : '-',
    },
    {
      title: 'Status',
      dataIndex: 'ManagerApprovalStatusId',
      key: 'ManagerApprovalStatusId',
      width: 120,
      render: statusTag,
    },
    {
      title: 'Manager Remarks',
      dataIndex: 'ManagerRemarks',
      key: 'ManagerRemarks',
      ellipsis: true,
    },
    {
      title: 'Raised On',
      dataIndex: 'CreatedOn',
      key: 'CreatedOn',
      width: 150,
      render: (v) => (v ? dayjs(v).format('DD-MMM-YY hh:mm A') : '-'),
    },
  ]

  return (
    <>
      <Pageheading title="Official Visit" />
      <div className="def" style={{ padding: 10 }}>
        <Tabs
          items={[
            {
              key: 'apply',
              label: (
                <span>
                  <FormOutlined /> Apply
                </span>
              ),
              children: (
                <Card size="small" bordered className={theme === 'dark' ? 'dark-theme' : ''}>
                  <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Row gutter={[16, 8]}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="range"
                          label="Visit Date Range"
                          rules={[{ required: true, message: 'Pick a From/To date range.' }]}
                        >
                          <RangePicker format="DD-MMM-YY" style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="visitStoreCode"
                          label="Visit Location (Store)"
                          rules={[{ required: true, message: 'Select the visit location.' }]}
                        >
                          <Select
                            allowClear
                            showSearch
                            optionFilterProp="label"
                            placeholder="Select destination store"
                            options={stores.map((s) => ({
                              value: s.storeCode,
                              label: s.locationName
                                ? `${s.storeCode} — ${s.locationName}`
                                : s.storeCode,
                            }))}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="purpose"
                          label="Purpose of Visit"
                          rules={[{ required: true, message: 'Select the purpose of visit.' }]}
                        >
                          <Select
                            placeholder="Select a reason"
                            options={PURPOSE_OPTIONS.map((p) => ({ value: p, label: p }))}
                            onChange={(val) => {
                              if (val !== 'Others') form.setFieldValue('purposeOther', undefined)
                            }}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          noStyle
                          shouldUpdate={(prev, cur) => prev.purpose !== cur.purpose}
                        >
                          {({ getFieldValue }) =>
                            getFieldValue('purpose') === 'Others' && (
                              <Form.Item
                                name="purposeOther"
                                label="Specify Purpose"
                                rules={[{ required: true, message: 'Enter the purpose of visit.' }]}
                              >
                                <Input placeholder="Type the purpose of visit" />
                              </Form.Item>
                            )
                          }
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="recommendedByEcode"
                          label="Recommended By"
                          rules={[
                            { required: true, message: 'Select who recommended this visit.' },
                          ]}
                        >
                          <Select
                            allowClear
                            showSearch
                            filterOption={false}
                            loading={recommendedBySearching}
                            onSearch={debouncedRecommendedBySearch}
                            placeholder="Search & select ecode"
                            options={recommendedByOptions}
                            notFoundContent={
                              recommendedBySearching ? (
                                <Spin size="small" />
                              ) : (
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                              )
                            }
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24}>
                        <Form.Item
                          name="employeeRemarks"
                          label="Remarks"
                          rules={[{ required: true, message: 'Enter remarks for your manager.' }]}
                        >
                          <TextArea
                            rows={3}
                            placeholder="Any additional details for your manager"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      htmlType="submit"
                      loading={submitting}
                    >
                      Submit Request
                    </Button>
                    <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                      This goes to your reporting manager for approval.
                    </Text>
                  </Form>
                </Card>
              ),
            },
            {
              key: 'history',
              label: (
                <span>
                  <HistoryOutlined /> My History
                </span>
              ),
              children: (
                <Table
                  rowKey="OfficialVisitRequestId"
                  columns={historyColumns}
                  dataSource={history}
                  loading={historyLoading}
                  bordered
                  pagination={{ pageSize: 20 }}
                  className={theme === 'dark' ? 'dark-theme' : ''}
                />
              ),
            },
          ]}
        />
      </div>
    </>
  )
}

export default OfficialVisit
