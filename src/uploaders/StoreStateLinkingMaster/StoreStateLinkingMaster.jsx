import { ExportOutlined, UploadOutlined } from '@ant-design/icons'
import { Space, Table, Input, Button, message, Tooltip, Grid, Row, Col } from 'antd'
import React, { useEffect, useMemo, useState } from 'react'
import StoreStateLinkingUploader from './StoreStateLinkingUploader'
import { set } from '../../redux/uiSlice'
import { useDispatch, useSelector } from 'react-redux'
import { getStoreStateLinkings } from '../../services/Services'
import Pageheading from '../../components/shared/Pageheading'
import { exportExcelFromFrontend } from '../../components/shared/ExportExceFromFrontend'
import { useActionsMap } from '../../utils/useActionsMap'
import useMediaQuery from '../../hooks/useMediaQuery'

const { Search } = Input

const StoreStateLinkingMaster = () => {
  const isMobile = useMediaQuery('(max-width: 768px)')

  const dispatch = useDispatch()
  const [isUploaderVisible, setIsUploaderVisible] = useState(false)
  const [lodingLocal, setlodingLocal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])

  const filteredSideMenu = useSelector((state) => state?.auth?.filteredSideMenu || [])
  const actionsMap = useActionsMap(filteredSideMenu)

  // ✅ Desktop columns
  const desktopColumns = useMemo(
    () => [
      { title: 'State', dataIndex: 'state', key: 'state', width: 280, ellipsis: true },
      { title: 'Store Code', dataIndex: 'sT_CD', key: 'sT_CD', width: 220, ellipsis: true },
    ],
    [],
  )

  // ✅ Mobile columns (compact)
  const mobileColumns = useMemo(
    () => [
      {
        title: 'State',
        dataIndex: 'state',
        width: 150,
        render: (text) => (
          <div
            style={{
              fontSize: 11,
              fontWeight: 500,
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              lineHeight: '1.2',
            }}
          >
            {text || '-'}
          </div>
        ),
      },
      {
        title: 'Store Code',
        dataIndex: 'sT_CD',
        width: 120,
        render: (text) => <div style={{ fontSize: 11, fontWeight: 500 }}>{text || '-'}</div>,
      },
    ],
    [],
  )

  const columns = isMobile ? mobileColumns : desktopColumns
  const totalX = useMemo(
    () => desktopColumns.reduce((acc, c) => acc + (c.width || 160), 0),
    [desktopColumns],
  )

  // fetch
  const fetchStateStores = async () => {
    await dispatch(set({ loading: true }))
    const response = await getStoreStateLinkings()
    if (response?.status === 200) {
      const res_data =
        response?.data?.data?.map((dt) => ({
          ...dt,
          key: dt?.id ?? `${dt?.state}-${dt?.sT_CD}`,
        })) || []
      setData(res_data)
    } else {
      message.error(response?.response?.data?.message || 'Some error occurred')
      setData([])
    }
    await dispatch(set({ loading: false }))
  }

  useEffect(() => {
    fetchStateStores()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // search filter
  useEffect(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return setFilteredData(data)
    const filtered =
      data.length > 0
        ? data.filter((dt) =>
            Object.values(dt).some((d) => String(d).toLowerCase().trim().includes(q)),
          )
        : []
    setFilteredData(filtered)
  }, [searchQuery, data])

  const downloadDataInExcel = () => {
    const cols = [
      { header: 'State', key: 'state' },
      { header: 'Store Code', key: 'sT_CD' },
    ]
    setlodingLocal(true)
    const response = exportExcelFromFrontend(cols, filteredData, 'StoreStateLinking.xlsx')
    if (response.success) message.success(response.message)
    else message.error(response.message)
    setlodingLocal(false)
  }

  return (
    <>
      <StoreStateLinkingUploader
        isVisible={isUploaderVisible}
        setIsVisible={setIsUploaderVisible}
        refreshData={fetchStateStores}
      />

      <Pageheading title="Store-State Linking" />

      {/* Toolbar */}
      <div
        style={{
          marginBottom: isMobile ? 8 : 12,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 8 : 0,
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
        }}
      >
        {/* Left side (kept empty for symmetry / future chips) */}
        <div />

        {/* Right side actions + search */}
        <Row
          style={{ width: isMobile ? '100%' : 'auto' }}
          gutter={[8, 8]}
          justify={isMobile ? 'space-between' : 'end'}
          align="middle"
        >
          <Col flex="none">
            <Space wrap size={isMobile ? 6 : 8}>
              {actionsMap?.upload?.actionStatus && (
                <Tooltip placement="top" title="Upload">
                  <Button icon={<UploadOutlined />} onClick={() => setIsUploaderVisible(true)} />
                </Tooltip>
              )}

              {actionsMap?.export?.actionStatus && (
                <Tooltip placement="top" title="Export">
                  <Button
                    loading={lodingLocal}
                    onClick={downloadDataInExcel}
                    icon={<ExportOutlined />}
                  />
                </Tooltip>
              )}
            </Space>
          </Col>

          <Col flex={isMobile ? 'auto' : 'none'}>
            <Search
              placeholder="Search in table..."
              allowClear
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: isMobile ? '100%' : 320 }}
            />
          </Col>
        </Row>
      </div>

      {/* Table */}
      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey="key"
        size={isMobile ? 'small' : 'middle'}
        pagination={{
          pageSize: isMobile ? 100 : 100,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          size: isMobile ? 'small' : 'default',
          position: ['bottomRight'],
        }}
        scroll={{
          x: isMobile ? 'max-content' : Math.max(totalX, 600),
          y: 'calc(100vh - 120px)',
        }}
        bordered
      />
    </>
  )
}

export default StoreStateLinkingMaster
