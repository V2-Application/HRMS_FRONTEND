// import React, { useEffect, useMemo, useState } from 'react'
// import {
//   Layout,
//   Typography,
//   Card,
//   Space,
//   Button,
//   Table,
//   Select,
//   Input,
//   Switch,
//   Tag,
//   message,
//   Divider,
//   Tooltip,
// } from 'antd'
// import {
//   PlusOutlined,
//   SaveOutlined,
//   DeleteOutlined,
//   CheckCircleTwoTone,
//   CloseCircleTwoTone,
//   SearchOutlined,
// } from '@ant-design/icons'
// import { fetchLocationMaster, getLocationNameWithCode } from '../../../services/Services'



// const { Header, Content } = Layout
// const { Title, Text } = Typography

// const emptyRow = (i) => ({
//   key: `${Date.now()}-${i}`,
//   storeCode: undefined,
//   storeName: '',
//   storeAddress: '',
//   geofenceAllowed: false,
// })

// export default function GeofenceAssignment() {
//   const [rows, setRows] = useState([emptyRow(0)])
//   const [filter, setFilter] = useState('')
//   const [storeMaster, setStoreMaster] = useState([])
//   const [loadingStores, setLoadingStores] = useState(false)

//   // --- Fetch store/location master from API ---
//   useEffect(() => {
//     const loadStores = async () => {
//       try {
//         setLoadingStores(true)
//         const res = await fetchLocationMaster()
//         // assuming response structure: { data: [...] }
//         // const list = Array.isArray(res?.data) ? res.data : []

//         const list = Array.isArray(res?.data) ? res.data : []

//         setStoreMaster(list)
//       } catch (err) {
//         console.error('Failed to load location master', err)
//         message.error('Failed to load store list. Please try again.')
//       } finally {
//         setLoadingStores(false)
//       }
//     }

//     loadStores()
//   }, [])

//   const storeOptions = useMemo(() => {
//     // Only active & not deleted
//     const base = storeMaster.filter((s) => s.isActive && !s.isDeleted)

//     if (!filter) {
//       return base.map((s) => ({
//         label: `${s.stCode} — ${s.locationName}`,
//         value: s.stCode,
//       }))
//     }

//     const f = filter.toLowerCase()
//     return base
//       .filter(
//         (s) => s.stCode?.toLowerCase().includes(f) || s.locationName?.toLowerCase().includes(f),
//       )
//       .map((s) => ({
//         label: `${s.stCode} — ${s.locationName}`,
//         value: s.stCode,
//       }))
//   }, [filter, storeMaster])

//   const setRow = (key, patch) =>
//     setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)))

//   const columns = [
//     {
//       title: 'Store Code',
//       dataIndex: 'stCode',
//       width: 260,
//       render: (_, record) => (
//         <Select
//           showSearch
//           placeholder={loadingStores ? 'Loading stores...' : 'Select code'}
//           value={record.storeCode}
//           onSearch={setFilter}
//           onChange={(code) => {
//             const sel = storeMaster.find((s) => s.stCode === code)
//             setRow(record.key, {
//               storeCode: code,
//               storeName: sel?.locationName || '',
//               // address not present in API; keep as empty or map if added later
//               storeAddress: '',
//             })
//           }}
//           options={storeOptions}
//           filterOption={false}
//           style={{ width: 440 }}
//           loading={loadingStores}
//           allowClear
//         />
//       ),
//     },
//     {
//       title: 'Store Name',
//       dataIndex: 'locationName',
//       width: 580,
//       render: (v) => <Input value={v} readOnly disabled />,
//     },
//     {
//       title: 'Geofence Allowed',
//       dataIndex: 'geofenceAllowed',
//       width: 200,
//       align: 'center',
//       render: (v, record) => (
//         <Space>
//           <Switch
//             checked={v}
//             onChange={(checked) => setRow(record.key, { geofenceAllowed: checked })}
//             checkedChildren="Enabled"
//             unCheckedChildren="Disabled"
//           />
//           {v ? (
//             <Tag icon={<CheckCircleTwoTone twoToneColor="#52c41a" />} color="success">
//               Active
//             </Tag>
//           ) : (
//             <Tag icon={<CloseCircleTwoTone twoToneColor="#ff4d4f" />} color="error">
//               Off
//             </Tag>
//           )}
//         </Space>
//       ),
//     },
//     {
//       title: 'Actions',
//       key: 'actions',
//       width: 120,
//       align: 'right',
//       render: (_, record) => (
//         <Tooltip title="Remove row">
//           <Button
//             type="text"
//             danger
//             icon={<DeleteOutlined />}
//             onClick={() => setRows((prev) => prev.filter((r) => r.key !== record.key))}
//           />
//         </Tooltip>
//       ),
//     },
//   ]

//   const addRow = () => setRows((prev) => [...prev, emptyRow(prev.length)])

//   const onSave = () => {
//     const payload = rows
//       .filter((r) => r.storeCode)
//       .map(({ storeCode, geofenceAllowed }) => ({ storeCode, geofenceAllowed }))

//     if (!payload.length) {
//       message.warning('No rows to save. Please select at least one store code.')
//       return
//     }

//     // TODO: Replace with actual API call for saving
//     // await saveGeofenceConfig(payload)
//     message.success(`Saved ${payload.length} record(s).`)
//     // console.log("Payload:", payload);
//   }

//   return (
//     <Layout style={{ minHeight: '100vh', background: '#f5f7fb' }}>
//       <Header style={{ background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
//         <Space style={{ width: '100%', justifyContent: 'space-between' }}>
//           <Space direction="vertical" size={0}>
//             <Title level={6} style={{ margin: 0 }}>
//               Geofence Assignment
//             </Title>
//           </Space>
//           <Space>
//             <Input
//               allowClear
//               prefix={<SearchOutlined />}
//               placeholder="Filter stores (code / name)"
//               style={{ width: 320 }}
//               onChange={(e) => setFilter(e.target.value)}
//             />
//             <Button icon={<PlusOutlined />} onClick={addRow}>
//               Add Row
//             </Button>
//             <Button type="primary" icon={<SaveOutlined />} onClick={onSave}>
//               Save Changes
//             </Button>
//           </Space>
//         </Space>
//       </Header>

//       <Content style={{ padding: 24 }}>
//         <Space direction="vertical" size={16} style={{ display: 'flex' }}>
//           <Card
//             title={<span>Assignments</span>}
//             bordered={false}
//             style={{ boxShadow: '0 6px 30px rgba(33, 37, 41, 0.06)', borderRadius: 16 }}
//           >
//             <Table
//               rowKey="key"
//               columns={columns}
//               dataSource={rows}
//               pagination={false}
//               size="middle"
//             />
//             <Divider style={{ marginTop: 16 }} />
//           </Card>
//         </Space>
//       </Content>
//     </Layout>
//   )
// }


import React, { useEffect, useMemo, useState } from 'react'
import {
  Layout,
  Typography,
  Card,
  Space,
  Button,
  Table,
  Select,
  Input,
  Switch,
  Tag,
  message,
  Divider,
  Tooltip,
} from 'antd'
import {
  PlusOutlined,
  SaveOutlined,
  DeleteOutlined,
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  SearchOutlined,
} from '@ant-design/icons'
// ⛔️ fetchLocationMaster not needed now
// import { fetchLocationMaster, getLocationNameWithCode } from '../../../services/Services'
import { getLocationNameWithCode } from '../../../services/Services'

const { Header, Content } = Layout
const { Title } = Typography

const emptyRow = (i) => ({
  key: `${Date.now()}-${i}`,
  storeCode: undefined, // selected stCode
  storeName: '', // storeLocationName from API
  storeAddress: '',
  geofenceAllowed: false,
})

export default function GeofenceAssignment() {
  const [rows, setRows] = useState([emptyRow(0)])
  const [filter, setFilter] = useState('')
  const [storeMaster, setStoreMaster] = useState([])
  const [loadingStores, setLoadingStores] = useState(false)

  // --- Fetch store/location master from getLocationNameWithCode ---
  useEffect(() => {
    const loadStores = async () => {
      try {
        setLoadingStores(true)
        const res = await getLocationNameWithCode()

        // Based on uploaded JSON: { status, message, data: [ { stCode, storeLocationName, status } ] }
        const list = Array.isArray(res?.data?.data) ? res.data.data : []

        setStoreMaster(list)
      } catch (err) {
        console.error('Failed to load location master', err)
        message.error('Failed to load store list. Please try again.')
      } finally {
        setLoadingStores(false)
      }
    }

    loadStores()
  }, [])

  // Build dropdown options (only active stores where status === true)
  const storeOptions = useMemo(() => {
    const base = storeMaster.filter((s) => s.status === true)

    if (!filter) {
      return base.map((s) => ({
        label: `${s.stCode} — ${s.storeLocationName}`,
        value: s.stCode,
      }))
    }

    const f = filter.toLowerCase()
    return base
      .filter(
        (s) =>
          s.stCode?.toLowerCase().includes(f) || s.storeLocationName?.toLowerCase().includes(f),
      )
      .map((s) => ({
        label: `${s.stCode} — ${s.storeLocationName}`,
        value: s.stCode,
      }))
  }, [filter, storeMaster])

  const setRow = (key, patch) =>
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)))

  const columns = [
    {
      title: 'Store Code',
      dataIndex: 'storeCode',
      width: 260,
      render: (_, record) => (
        <Select
          showSearch
          placeholder={loadingStores ? 'Loading stores...' : 'Select code'}
          value={record.storeCode}
          onSearch={setFilter}
          onChange={(code) => {
            const sel = storeMaster.find((s) => s.stCode === code)
            setRow(record.key, {
              storeCode: code,
              storeName: sel?.storeLocationName || '',
              // address still not available from API; keep as empty / future mapping
              storeAddress: '',
            })
          }}
          options={storeOptions}
          filterOption={false}
          style={{ width: 440 }}
          loading={loadingStores}
          allowClear
        />
      ),
    },
    {
      title: 'Store Name',
      dataIndex: 'storeName',
      width: 580,
      render: (_, record) => <Input value={record.storeName} readOnly disabled />,
    },
    {
      title: 'Geofence Allowed',
      dataIndex: 'geofenceAllowed',
      width: 200,
      align: 'center',
      render: (v, record) => (
        <Space>
          <Switch
            checked={v}
            onChange={(checked) => setRow(record.key, { geofenceAllowed: checked })}
            checkedChildren="Enabled"
            unCheckedChildren="Disabled"
          />
          {v ? (
            <Tag icon={<CheckCircleTwoTone twoToneColor="#52c41a" />} color="success">
              Active
            </Tag>
          ) : (
            <Tag icon={<CloseCircleTwoTone twoToneColor="#ff4d4f" />} color="error">
              Off
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      align: 'right',
      render: (_, record) => (
        <Tooltip title="Remove row">
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => setRows((prev) => prev.filter((r) => r.key !== record.key))}
          />
        </Tooltip>
      ),
    },
  ]

  const addRow = () => setRows((prev) => [...prev, emptyRow(prev.length)])

  const onSave = () => {
    const payload = rows
      .filter((r) => r.storeCode)
      .map(({ storeCode, geofenceAllowed }) => ({ storeCode, geofenceAllowed }))

    if (!payload.length) {
      message.warning('No rows to save. Please select at least one store code.')
      return
    }

    // TODO: Replace with actual API call for saving
    // await saveGeofenceConfig(payload)
    message.success(`Saved ${payload.length} record(s).`)
    // console.log("Payload:", payload);
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f7fb' }}>
      <Header style={{ background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space direction="vertical" size={0}>
            <Title level={6} style={{ margin: 0 }}>
              Geofence Assignment
            </Title>
          </Space>
          <Space>
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="Filter stores (code / name)"
              style={{ width: 320 }}
              onChange={(e) => setFilter(e.target.value)}
            />
            <Button icon={<PlusOutlined />} onClick={addRow}>
              Add Row
            </Button>
            <Button type="primary" icon={<SaveOutlined />} onClick={onSave}>
              Save Changes
            </Button>
          </Space>
        </Space>
      </Header>

      <Content style={{ padding: 24 }}>
        <Space direction="vertical" size={16} style={{ display: 'flex' }}>
          <Card
            title={<span>Assignments</span>}
            bordered={false}
            style={{ boxShadow: '0 6px 30px rgba(33, 37, 41, 0.06)', borderRadius: 16 }}
          >
            <Table
              rowKey="key"
              columns={columns}
              dataSource={rows}
              pagination={false}
              size="middle"
            />
            <Divider style={{ marginTop: 16 }} />
          </Card>
        </Space>
      </Content>
    </Layout>
  )
}
