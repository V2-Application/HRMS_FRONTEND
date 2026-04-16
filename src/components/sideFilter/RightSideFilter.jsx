import React, { useState } from 'react'
import { DatePicker, Select, Button, Drawer, Space } from 'antd'
import { FilterOutlined } from '@ant-design/icons'
import './RightSideFilter.css'
import { useSelector } from 'react-redux'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker
const { Option } = Select

const RightSideFilter = ({ onFilter, resetFilters }) => {
  const [open, setOpen] = useState(false)
  const [filters, setFilters] = useState({
    dateRange: [],
    location: [],
    designation: [],
    statusId: [],
    hrApprovalStatus: [],
    auditApprovalStatus: [],
    clusterManagerApprovalStatus: [],
  })

  const { Designation, Department, Location } = useSelector(
    (state) => state.dropdown.response || {},
  )

  function transformData(input) {
    return {
      startDate: input.dateRange?.[0] ? dayjs(input.dateRange[0]).format('YYYY-MM-DD') : '',
      endDate: input.dateRange?.[1] ? dayjs(input.dateRange[1]).format('YYYY-MM-DD') : '',
      locationIds: (input.location || []).map(String),
      designationIds: (input.designation || []).map(String),
      departmentIds: (input.department || []).map(String),
      statusIds: (input.statusId || []).map(String),
      hrApprovalStatuses: (input.hrApprovalStatus || []).map(String),
      auditApprovalStatuses: (input.auditApprovalStatus || []).map(String),
      clusterManagerApprovalStatuses: (input.clusterManagerApprovalStatus || []).map(String),
    }
  }

  const handleApply = async () => {
    const data = await transformData(filters)
    onFilter(data)
    setOpen(false)
  }

  const handleReset = () => {
    // const resetFilters = {
    //   dateRange: [],
    //   location: [],
    //   designation: [],
    //   statusId: [],
    //   hrApprovalStatus: [],
    //   auditApprovalStatus: [],
    //   clusterManagerApprovalStatus: [],
    // };
    // setFilters(resetFilters);
    // onFilter(resetFilters);
    resetFilters()
    setOpen(false)
  }

  return (
    <>
      <Button
        className="filter-arrow-button"
        icon={<FilterOutlined />}
        onClick={() => setOpen(true)}
      >
        Filter
      </Button>
      <Drawer
        title="Filter Table"
        placement="right"
        onClose={() => setOpen(false)}
        open={open}
        width={290}
        className="custom-drawer"
        style={{ marginTop: 40 }}
      >
        <div className="filter-scroll-area">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <label>Date Range:</label>
              <RangePicker
                value={filters.dateRange}
                onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
              />
            </div>

            <div>
              <label>Designation:</label>
              <Select
                mode="multiple"
                value={filters.designation}
                onChange={(value) => setFilters({ ...filters, designation: value })}
                style={{ width: '100%' }}
                placeholder="Select Designation"
                // options={designationOptions}
              >
                {Designation?.map((item) => (
                  <Select.Option key={item.designationId} value={item.designationId}>
                    {item.designationName}
                  </Select.Option>
                ))}
              </Select>
            </div>

            <div>
              <label>Location:</label>
              <Select
                mode="multiple"
                placeholder="Select a location"
                style={{ width: '100%' }}
                value={filters.location}
                onChange={(value) => setFilters({ ...filters, location: value.map(String) })}
                allowClear
              >
                {Location?.map((item) => (
                  <Select.Option key={item.locationId} value={String(item.locationId)}>
                    {item.locationName}
                  </Select.Option>
                ))}
              </Select>
            </div>

            <div>
              <label>Department:</label>
              <Select
                mode="multiple"
                placeholder="Select a Department"
                style={{ width: '100%' }}
                value={filters.department}
                onChange={(value) => setFilters({ ...filters, department: value.map(String) })}
                allowClear
              >
                {Department?.map((item) => (
                  <Select.Option key={item.departmentId} value={String(item.departmentId)}>
                    {item.departmentName}
                  </Select.Option>
                ))}
              </Select>
            </div>

            <div>
              <label>Status:</label>
              <Select
                // value={filters.statusId}
                onChange={(value) => setFilters({ ...filters, statusId: [value.toString()] })}
                style={{ width: '100%' }}
                placeholder="Select Status"
              >
                <Option value={4}>Pending</Option>
                <Option value={1}>Approved</Option>
                <Option value={2}>Rejected</Option>
              </Select>
            </div>

            <div>
              <label>HR Approval:</label>
              <Select
                // value={filters.hrApprovalStatus}
                onChange={(value) =>
                  setFilters({ ...filters, hrApprovalStatus: [value.toString()] })
                }
                style={{ width: '100%' }}
                placeholder="Select HR Approval"
              >
                <Option value={4}>Pending</Option>
                <Option value={1}>Approved</Option>
              </Select>
            </div>

            <div>
              <label>Audit Approval:</label>
              <Select
                // value={filters.auditApprovalStatus}
                onChange={(value) =>
                  setFilters({ ...filters, auditApprovalStatus: [value.toString()] })
                }
                style={{ width: '100%' }}
                placeholder="Select Audit Approval"
              >
                <Option value={4}>Pending</Option>
                <Option value={1}>Approved</Option>
              </Select>
            </div>

            <div>
              <label>Cluster Manager Approval:</label>
              <Select
                // value={filters.clusterManagerApprovalStatus}
                onChange={(value) =>
                  setFilters({ ...filters, clusterManagerApprovalStatus: [value.toString()] })
                }
                style={{ width: '100%' }}
                placeholder="Select Cluster Manager Approval"
              >
                <Option value={4}>Pending</Option>
                <Option value={1}>Approved</Option>
              </Select>
            </div>

            <Space>
              <Button type="primary" onClick={handleApply}>
                Apply
              </Button>
              <Button onClick={handleReset}>Reset</Button>
            </Space>
          </Space>
        </div>
      </Drawer>
    </>
  )
}

export default RightSideFilter
