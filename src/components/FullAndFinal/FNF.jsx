import React, { useState } from 'react'
import { Badge, Button, Flex, message, Segmented, Tabs, Typography } from 'antd'
import PendingFNF from './PendingFNF'
import NewFNF from './NewFNF'
import FNFList from './FNFList'
import { tooltip } from 'leaflet'
import { ArrowLeft, ClipboardCheck, ClipboardClock, Download } from 'lucide-react'
import axiosInstance from '../../services/axiosInstance'
import FNFBulkUploadModal from './FNFBulkUploadModal'
import ProcessedFNF from './ProcessedFNF'

const { Title } = Typography

const FNF = () => {
  const [activeKey, setActiveKey] = useState('pending')
  const [pendingExportLoading, setPendingExportLoading] = useState(false);

  // When selectedEmployee exists => show NewFNF and hide main tabs
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [activeTab, setActiveTab] = useState("pending");

  const handleProcess = (employeeRecord) => {
    setSelectedEmployee(employeeRecord)
  }

  const handleBack = () => {
    setSelectedEmployee(null)
    setActiveKey('pending')
  }

  async function handlePendingExport() {
    // const response = await axiosInstance.get("/api/Fnf/export-pending-excel");
    setPendingExportLoading(true);
    try {
      const response = await axiosInstance.get(
        '/api/Fnf/export-pending-excel',
        {
          responseType: 'blob'
        }
      );

      // Get filename from response header
      const contentDisposition = response.headers['content-disposition'];
      let fileName = 'FNF_Pending_List.xlsx';

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match && match[1]) {
          fileName = match[1];
        }
      }

      // Create download
      const blob = new Blob(
        [response.data],
        { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
      );

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
      message.success("Data Exported Successfully.");
      setPendingExportLoading(false);
    } catch (error) {
      setPendingExportLoading(false);
      message.error(error?.message || "Failed to export data.\nPlease try again.")
      console.error('Excel download failed', error);
    }
  }

  const Header = () => (
    <div style={{ paddingTop: 8, paddingBottom: 8 }}>
      <Flex gap={8} align='center'>
        {
          selectedEmployee && <Button style={{ paddingLeft: ".25rem" }} color="default" variant='solid' shape='round' onClick={handleBack} icon={<Flex align='center' justify='center' style={{ backgroundColor: "white", width: "1.5rem", height: "1.5rem", borderRadius: "50%" }}><ArrowLeft color='black' size={14} /></Flex>}>Back</Button>
        }
        <Title level={3} style={{ margin: 0, fontWeight: 700 }}>FULL &amp; FINAL</Title>
      </Flex>
    </div>
  )

  // ✅ When processing, hide tabs
  if (selectedEmployee) {
    return (
      <div style={{ width: '100%' }}>
        <Header />
        <NewFNF
          initialEmployee={selectedEmployee}
          initialEmployeeId={selectedEmployee?.employeeId}
          onBack={handleBack}
        />
      </div>
    )
  }

  const items = [
    {
      value: 'pending',
      label: (
        <div style={{ paddingBlock: ".25rem" }}>
          <Flex gap={4} align='center'>
            <Flex style={{ width: "1.5rem", height: "1.5rem", borderRadius: "50%", backgroundColor: "#fef9c2" }} align='center' justify='center'>
              <ClipboardClock size={16} color='#894b00' />
            </Flex>
            <span>Pending</span>
          </Flex>
        </div>
      ),
      tooltip: "Pending FNF"
    },
    {
      value: 'processed',
      label: (
        <div style={{ paddingBlock: ".25rem" }}>
          <Flex gap={4} align='center'>
            <Flex style={{ width: "1.5rem", height: "1.5rem", borderRadius: "50%", backgroundColor: "#c2d3feff" }} align='center' justify='center'>
              <ClipboardClock size={16} color='#003989ff' />
            </Flex>
            <span>Processed</span>
          </Flex>
        </div>
      ),
      tooltip: "Pending FNF"
    },
    {
      value: "completed",
      label: (
        <div style={{ paddingBlock: ".25rem" }}>
          <Flex gap={4} align='center'>
            <Flex style={{ width: "1.5rem", height: "1.5rem", borderRadius: "50%", backgroundColor: "#cbfbf1" }} align='center' justify='center'>
              <ClipboardCheck size={16} color='#005f5a' />
            </Flex>
            <span>Completed</span>
          </Flex>
        </div>
      ),
      tooltip: "Completed FNF"
    },
  ]

  return (
    <div style={{ width: '100%' }}>
      <Header />
      <Flex justify='space-between' align='center' wrap>
        <Segmented options={items} onChange={(val) => setActiveTab(val)} />
        {
          activeTab === "pending"
          &&
          <Flex gap={8} align='center'>
            <FNFBulkUploadModal />
            <Button disabled={pendingExportLoading} loading={pendingExportLoading} onClick={handlePendingExport} icon={<Download size={16} />} color='cyan' variant='filled'>Export Data</Button>
          </Flex>
        }
      </Flex>
      {
        activeTab === "pending" && <PendingFNF onProcess={handleProcess} />
      }
      {
        activeTab === 'processed' && <ProcessedFNF />
      }
      {
        activeTab === "completed" && <FNFList />
      }
    </div>
  )
}

export default FNF
