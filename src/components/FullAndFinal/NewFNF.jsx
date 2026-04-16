import { Tabs, message, Divider, Modal, Image, Button, Spin, Flex, Avatar, Typography, Row, Col, Card } from 'antd'
const { Text, Title } = Typography;
import React, { useEffect, useMemo, useRef, useState } from 'react'
import Additions from './Additions'
import Deductions from './Deductions'
import { fetchFNFEmployeeDetails, fetchLeftEmployees } from '../../services/Services'
import axiosInstance from '../../services/axiosInstance'
import { BriefcaseBusiness, Building, Calendar, IdCard, TextInitial, User } from 'lucide-react';

const NewFNF = ({ initialEmployee = null, initialEmployeeId = null, onBack }) => {
  const [employeesData, setEmployeesData] = useState([])
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [employeeDetails, setEmployeeDetails] = useState({})
  const [isEmployeeDetailsFetching, setIsEmployeeDetailsFetching] = useState(false)
  const [isEmployeesFetching, setIsEmmployeesFetching] = useState(false)
  const [fnfDetailsByEcode, setFnfDetailsByEcode] = useState(null);
  const [resignationDate, setResignationDate] = useState(null);

  // resignation attachments from API (key: resignationAttachment)
  const [resignationAttachments, setResignationAttachments] = useState([])

  // Preview modal state
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('') // object URL
  const [previewKind, setPreviewKind] = useState('unknown') // 'image' | 'pdf' | 'unknown'
  const lastObjectUrlRef = useRef('')

  // inner tabs: Additions / Deductions
  const [activeKey, setActiveKey] = useState('1')
  const onChange = (key) => setActiveKey(key)

  // Additions values for calculation in Deductions
  const [additionsData, setAdditionsData] = useState({
    unpaidSalaryAmount: 0,
    bonus: 0,
    gratuity: 0,
    noticeSalary: 0,
    elAmount: 0,
    otherAddition1: 0,
    otherAddition2: 0,
    otherAddition3: 0,
    otherAddition4: 0,
  })

  // -------- helpers (attachments + preview) --------
  const normalizeAttachments = (val) => {
    if (!val) return []
    if (Array.isArray(val)) {
      return val
        .filter(Boolean)
        .map(String)
        .map((s) => s.trim())
        .filter(Boolean)
    }

    const s = String(val).trim()
    if (!s) return []
    // allow comma/pipe/semicolon/newline separated strings
    const parts = s.split(/[,|;\n]+/g).map((x) => x.trim()).filter(Boolean)
    return parts.length ? parts : [s]
  }

  // For axiosInstance: if backend gives relative path, keep it relative so axios baseURL works.
  const toRequestUrl = (url) => {
    const u = String(url || '').trim()
    if (!u) return ''
    // absolute already
    if (/^https?:\/\//i.test(u)) return u
    // relative -> axiosInstance will prefix baseURL
    return u.startsWith('/') ? u : `/${u}`
  }

  const kindFromContentType = (ct = '') => {
    const c = String(ct).toLowerCase()
    if (c.includes('pdf')) return 'pdf'
    if (c.startsWith('image/')) return 'image'
    return 'unknown'
  }

  const revokeLastObjectUrl = () => {
    if (lastObjectUrlRef.current) {
      try {
        URL.revokeObjectURL(lastObjectUrlRef.current)
      } catch { }
      lastObjectUrlRef.current = ''
    }
  }

  const closePreview = () => {
    setPreviewOpen(false)
    setPreviewLoading(false)
    setPreviewKind('unknown')
    setPreviewUrl('')
    revokeLastObjectUrl()
  }

  // cleanup object URL on component unmount
  useEffect(() => {
    return () => revokeLastObjectUrl()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openPreviewModal = async (url) => {
    const reqUrl = toRequestUrl(url)
    if (!reqUrl) {
      message.error('Attachment URL not found')
      return
    }

    setPreviewOpen(true)
    setPreviewLoading(true)
    setPreviewKind('unknown')
    setPreviewUrl('')

    try {
      const res = await axiosInstance.get(reqUrl, { responseType: 'blob' })
      const blob = res?.data
      const contentType = res?.headers?.['content-type'] || blob?.type || ''

      revokeLastObjectUrl()
      const objectUrl = URL.createObjectURL(blob)
      lastObjectUrlRef.current = objectUrl

      setPreviewUrl(objectUrl)
      setPreviewKind(kindFromContentType(contentType))
    } catch (err) {
      console.error('Attachment preview error:', err)
      message.error(err?.response?.data?.message || 'Unable to load attachment')
      closePreview()
    } finally {
      setPreviewLoading(false)
    }
  }

  // -------- data fetch --------
  const fetchFNFEmployees = async () => {
    setIsEmmployeesFetching(true)
    try {
      const response = await fetchLeftEmployees()
      if (response?.status) {
        const data = Array.isArray(response?.data?.data) ? response?.data?.data : []
        setEmployeesData(data)
      } else {
        setEmployeesData([])
        setSelectedEmployee(null)
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setIsEmmployeesFetching(false)
    }
  }

  useEffect(() => {
    fetchFNFEmployees();
  }, [])

  // helper to apply a selected employee (used when coming from Pending)
  const applySelectedEmployee = (emp) => {
    if (!emp) return
    setSelectedEmployee(emp)
    setActiveKey('1')

    // reset additionsData on employee change
    setAdditionsData({
      unpaidSalaryAmount: 0,
      bonus: 0,
      gratuity: 0,
      noticeSalary: 0,
      elAmount: 0,
      otherAddition1: 0,
      otherAddition2: 0,
      otherAddition3: 0,
      otherAddition4: 0,
    })

    setResignationAttachments([])
    setEmployeeDetails({})
    closePreview()
  }

  // ✅ MAIN FIX:
  // If Pending passes the full record, select immediately (no "find()" dependency).
  useEffect(() => {
    console.log("initial employee", initialEmployee);
    if (initialEmployee) {
      applySelectedEmployee(initialEmployee);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialEmployee])

  // ✅ FALLBACK FIX:
  // If only initialEmployeeId is passed, try to find after list loads (type-safe) and allow changes.
  const lastAppliedIdRef = useRef(null)
  useEffect(() => {
    if (!employeesData.length) return
    if (!initialEmployeeId) return

    const id = Number(initialEmployeeId)
    if (!Number.isFinite(id)) return
    if (lastAppliedIdRef.current === id) return

    const emp = employeesData.find((e) => Number(e.employeeId) === id) || null
    if (emp) {
      applySelectedEmployee(emp)
      lastAppliedIdRef.current = id
    }
  }, [employeesData, initialEmployeeId])

  const fetchSelectedEmpDetails = async () => {
    if (!selectedEmployee?.employeeCode) return
    setIsEmployeeDetailsFetching(true)
    try {
      const response = await fetchFNFEmployeeDetails(selectedEmployee.employeeCode || '')
      if (response.status === 200) {
        const data = response.data?.data || {}
        setEmployeeDetails(data)

        setResignationAttachments(normalizeAttachments(data?.resignationAttachment))

        setResignationDate(data?.resignationDate);

        // Pre-fill additionsData from API values
        setAdditionsData({
          unpaidSalaryAmount: Number(data?.unpaidAmount || 0),
          bonus: Number(data?.finalBonus || 0),
          gratuity: Number(data?.gratuityAmount || 0),
          noticeSalary: 0, // user enters in Additions
          elAmount: Number(data?.earnedLeaveAmount || 0),
          otherAddition1: Number(data?.otherAddition1 || 0),
          otherAddition2: Number(data?.otherAddition2 || 0),
          otherAddition3: Number(data?.otherAddition3 || 0),
          otherAddition4: Number(data?.otherAddition4 || 0),
        })
      }
    } catch (error) {
      console.error('Error fetching employee details:', error)
      message.error(error?.response?.data?.message || 'Failed to fetch employee details')
    } finally {
      setIsEmployeeDetailsFetching(false)
    }
  }

  useEffect(() => {
    if (selectedEmployee?.employeeCode) fetchSelectedEmpDetails()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmployee?.employeeCode])

  const items = useMemo(
    () => [
      {
        key: '1',
        label: 'Additions',
        children: (
          <Additions
            employee={selectedEmployee}
            employeeDetails={employeeDetails}
            fetchFNFEmployees={fetchFNFEmployees}
            setSelectedEmployee={setSelectedEmployee}
            isLoading={isEmployeeDetailsFetching}
            goToDeductions={() => setActiveKey('2')}
            setAdditionsData={setAdditionsData}
            fnfDetailsByEcode={fnfDetailsByEcode}
          />
        ),
      },
      {
        key: '2',
        label: 'Deductions',
        children: (
          <Deductions
            employee={selectedEmployee}
            fetchFNFEmployees={fetchFNFEmployees}
            setSelectedEmployee={setSelectedEmployee}
            additionsData={additionsData}
          />
        ),
      },
    ],
    [selectedEmployee, employeeDetails, isEmployeeDetailsFetching, additionsData],
  )

  const renderSelectedEmployeeHeader = () => {
    if (!selectedEmployee) {
      if (isEmployeesFetching) {
        return (
          <div style={{ marginBottom: 12 }}>
            <Spin size="small" /> Loading employee...
          </div>
        )
      }
      return (
        <div style={{ marginBottom: 12, color: '#888' }}>
          No employee selected. Go back to Pending list.
        </div>
      )
    }

    const { name, employeeCode, department, designation, dateOfJoining, dateOfLeaving } = selectedEmployee;

    // console.log(dateOfJoining, typeof dateOfJoining, dateOfLeaving, typeof dateOfLeaving);

    return (
      <div
        style={{
          marginBottom: 12,
          padding: '12px 16px',
          borderRadius: 8,
          border: '1px solid #f0f0f0',
          background: '#fafafa',
        }}
      >
        <Flex style={{ fontWeight: 600, marginBottom: 8 }} gap={4} wrap align='center'>
          <Avatar icon={<User />} size={48} style={{ backgroundImage: "linear-gradient(to right bottom, #1e2939 0%, #90a1b9 100%)", border: "none" }} />
          <Title level={3} style={{ margin: "0" }}>Employee Details</Title>
        </Flex>
        <Row gutter={[8, 8]}>
          <Col xs={24} sm={16} lg={8}>
            <Card variant="borderless" size='small'>
              <Flex vertical style={{ padding: ".5rem" }}>
                <Avatar shape='square' icon={<TextInitial size={16} />} style={{ backgroundImage: "linear-gradient(to right bottom, #1e2939 0%, #90a1b9 100%)", border: "none" }} />
                <Text style={{ margin: "0", textTransform: "uppercase" }}>Name</Text>
                <Title level={5} style={{ margin: "0" }}>{name || "__"}</Title>
              </Flex>
            </Card>
          </Col>
          <Col xs={24} sm={16} lg={8}>
            <Card variant="borderless" size='small'>
              <Flex vertical style={{ padding: ".5rem" }}>
                <Avatar shape='square' icon={<IdCard size={16} />} style={{ backgroundImage: "linear-gradient(to right bottom, #1e2939 0%, #90a1b9 100%)", border: "none" }} />
                <Text style={{ margin: "0", textTransform: "uppercase" }}>Code</Text>
                <Title level={5} style={{ margin: "0" }}>{employeeCode || "__"}</Title>
              </Flex>
            </Card>
          </Col>
          <Col xs={24} sm={16} lg={8}>
            <Card variant="borderless" size='small'>
              <Flex vertical style={{ padding: ".5rem" }}>
                <Avatar shape='square' icon={<Building size={16} />} style={{ backgroundImage: "linear-gradient(to right bottom, #1e2939 0%, #90a1b9 100%)", border: "none" }} />
                <Text style={{ margin: "0", textTransform: "uppercase" }}>Department</Text>
                <Title level={5} style={{ margin: "0" }}>{department || "__"}</Title>
              </Flex>
            </Card>
          </Col>
          <Col xs={24} sm={16} lg={8}>
            <Card variant="borderless" size='small'>
              <Flex vertical style={{ padding: ".5rem" }}>
                <Avatar shape='square' icon={<BriefcaseBusiness size={16} />} style={{ backgroundImage: "linear-gradient(to right bottom, #1e2939 0%, #90a1b9 100%)", border: "none" }} />
                <Text style={{ margin: "0", textTransform: "uppercase" }}>Designation</Text>
                <Title level={5} style={{ margin: "0" }}>{designation || "__"}</Title>
              </Flex>
            </Card>
          </Col>
          <Col xs={24} sm={16} lg={8}>
            <Card variant="borderless" size='small'>
              <Flex vertical style={{ padding: ".5rem" }}>
                <Avatar shape='square' icon={<Calendar size={16} />} style={{ backgroundImage: "linear-gradient(to right bottom, #1e2939 0%, #90a1b9 100%)", border: "none" }} />
                <Text style={{ margin: "0", textTransform: "uppercase" }}>Joining Date</Text>
                <Title level={5} style={{ margin: "0" }}>{dateOfJoining ? dateOfJoining.slice(0, 10) : "__"}</Title>
              </Flex>
            </Card>
          </Col>
          <Col xs={24} sm={16} lg={8}>
            <Card variant="borderless" size='small' style={{ width: "100%" }}>
              <Flex vertical style={{ padding: ".5rem" }}>
                <Avatar shape='square' icon={<Calendar size={16} />} style={{ backgroundImage: "linear-gradient(to right bottom, #1e2939 0%, #90a1b9 100%)", border: "none" }} />
                <Text style={{ margin: "0", textTransform: "uppercase" }}>Resignation Date</Text>
                <Title level={5} style={{ margin: "0" }}>{resignationDate ? resignationDate.slice(0, 10) : "__"}</Title>
              </Flex>
            </Card>
          </Col>
        </Row>
        {/* <Row gutter={8}>
          </Row> */}
      </div>
    )
  }

  return (
    <div>
      {/* Back button when opened from Pending */}
      {/* {typeof onBack === 'function' && (
        <div style={{ marginBottom: 8 }}>
          <Button type="link" onClick={onBack}>
            ← Back to Pending list
          </Button>
        </div>
      )} */}

      {renderSelectedEmployeeHeader()}

      {/* Resignation Attachments Field */}
      <Card style={{ marginBottom: "1rem" }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <strong>Resignation Attachments:</strong>

          {!selectedEmployee ? (
            <span style={{ color: '#888' }}>Select employee</span>
          ) : isEmployeeDetailsFetching ? (
            <span style={{ color: '#888' }}>Loading...</span>
          ) : resignationAttachments.length === 0 ? (
            <span style={{ color: '#888' }}>No attachment</span>
          ) : (
            resignationAttachments.map((url, idx) => (
              <span
                key={`${url}-${idx}`}
                onClick={() => !previewLoading && openPreviewModal(url)}
                style={{
                  color: previewLoading ? '#999' : '#1677ff',
                  cursor: previewLoading ? 'not-allowed' : 'pointer',
                  textDecoration: 'underline',
                }}
                title="Preview"
              >
                {`Attachment ${idx + 1}`}
              </span>
            ))
          )}
        </div>
      </Card>

      {/* Preview Modal */}
      <Modal
        title="Resignation Attachment Preview"
        open={previewOpen}
        onCancel={closePreview}
        footer={[
          <Button key="close" onClick={closePreview}>
            Close
          </Button>,
        ]}
        width={900}
        destroyOnClose
        centered
      >
        {previewLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
            <Spin />
          </div>
        ) : !previewUrl ? (
          <div style={{ color: '#888' }}>No preview</div>
        ) : previewKind === 'image' ? (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Image
              src={previewUrl}
              alt="Resignation Attachment"
              style={{ maxHeight: '70vh', objectFit: 'contain' }}
            />
          </div>
        ) : previewKind === 'pdf' ? (
          <iframe
            title="pdf-preview"
            src={previewUrl}
            style={{ width: '100%', height: '70vh', border: '1px solid #f0f0f0', borderRadius: 8 }}
          />
        ) : (
          <div style={{ color: '#888' }}>Preview not supported for this file type.</div>
        )}
      </Modal>
      <Card>
        <Tabs activeKey={activeKey} items={items} onChange={onChange} />
      </Card>
    </div>
  )
}

export default NewFNF
