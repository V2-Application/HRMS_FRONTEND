import React, { useEffect, useRef, useState } from 'react'
import { Col, Form, Select } from 'antd'
import { getSubDepartments } from '../../services/Services'

const { useWatch } = Form

// Three cascading Sub-Department <Select>s (Level 1 → 2 → 3) tied to a Department field.
// Drop the component inside an antd <Row> next to the Department field. All three are OPTIONAL.
// Values are stored in the form under [...namePrefix, 'subDepartmentId1'|2|3] as numeric ids.
//
// Props:
//   form           - antd form instance
//   departmentName - array path of the department field (e.g. ['user','department'])
//   namePrefix     - array prefix for the sub-dept fields (e.g. ['user'] or [])
//   colSpan        - antd Col span for each select (default 8)
//   disabled       - disable all three
const SubDepartmentCascade = ({
  form,
  departmentName,
  namePrefix = [],
  colProps = { xs: 24, sm: 12, md: 8 },
  disabled = false,
}) => {
  const n1 = [...namePrefix, 'subDepartmentId1']
  const n2 = [...namePrefix, 'subDepartmentId2']
  const n3 = [...namePrefix, 'subDepartmentId3']

  const deptVal = useWatch(departmentName, form)
  const v1 = useWatch(n1, form)
  const v2 = useWatch(n2, form)
  const v3 = useWatch(n3, form)

  const [opt1, setOpt1] = useState([])
  const [opt2, setOpt2] = useState([])
  const [opt3, setOpt3] = useState([])

  // Track previous parent values so we only RESET children on a real user switch,
  // not on the initial prefill (undefined → value transition must not clear).
  const prevDept = useRef(undefined)
  const prevV1 = useRef(undefined)
  const prevV2 = useRef(undefined)

  const toNum = (v) => (v === '' || v === undefined || v === null ? null : Number(v))
  const listOf = (r) => r?.data?.data ?? r?.data?.Data ?? []

  // Department → load Level 1 options; reset children only on a genuine change.
  useEffect(() => {
    const dept = toNum(deptVal)
    if (dept) {
      getSubDepartments({ departmentId: dept, depthLevel: 1 })
        .then((r) => setOpt1(listOf(r)))
        .catch(() => setOpt1([]))
    } else {
      setOpt1([])
      setOpt2([])
      setOpt3([])
    }
    if (prevDept.current !== undefined && prevDept.current !== deptVal) {
      form.setFields([
        { name: n1, value: undefined },
        { name: n2, value: undefined },
        { name: n3, value: undefined },
      ])
      setOpt2([])
      setOpt3([])
    }
    prevDept.current = deptVal
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deptVal])

  // Sub-Dept 1 → load Level 2 options.
  useEffect(() => {
    const dept = toNum(deptVal)
    const p = toNum(v1)
    if (dept && p) {
      getSubDepartments({ departmentId: dept, parentSubDepartmentId: p, depthLevel: 2 })
        .then((r) => setOpt2(listOf(r)))
        .catch(() => setOpt2([]))
    } else {
      setOpt2([])
    }
    if (prevV1.current !== undefined && prevV1.current !== v1) {
      form.setFields([
        { name: n2, value: undefined },
        { name: n3, value: undefined },
      ])
      setOpt3([])
    }
    prevV1.current = v1
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v1, deptVal])

  // Sub-Dept 2 → load Level 3 options.
  useEffect(() => {
    const dept = toNum(deptVal)
    const p = toNum(v2)
    if (dept && p) {
      getSubDepartments({ departmentId: dept, parentSubDepartmentId: p, depthLevel: 3 })
        .then((r) => setOpt3(listOf(r)))
        .catch(() => setOpt3([]))
    } else {
      setOpt3([])
    }
    if (prevV2.current !== undefined && prevV2.current !== v2) {
      form.setFields([{ name: n3, value: undefined }])
    }
    prevV2.current = v2
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v2, deptVal])

  const selectFilter = (input, option) =>
    String(option?.children || '')
      .toLowerCase()
      .includes(String(input).toLowerCase())

  const renderSelect = (name, options, label, isDisabled) => (
    <Form.Item name={name} label={label}>
      <Select
        allowClear
        showSearch
        optionFilterProp="children"
        placeholder={label}
        disabled={disabled || isDisabled}
        filterOption={selectFilter}
      >
        {options.map((s) => (
          <Select.Option key={s.subDepartmentId} value={s.subDepartmentId}>
            {s.subDepartmentName}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  )

  return (
    <>
      <Col {...colProps}>{renderSelect(n1, opt1, 'Sub-Department 1', !toNum(deptVal))}</Col>
      <Col {...colProps}>{renderSelect(n2, opt2, 'Sub-Department 2', !toNum(v1))}</Col>
      <Col {...colProps}>{renderSelect(n3, opt3, 'Sub-Department 3', !toNum(v2))}</Col>
    </>
  )
}

export default SubDepartmentCascade
