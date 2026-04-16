// ExcelImportModal.js
import React, { useState } from 'react'
import { Modal, Button, message } from 'antd'
import { ReactSpreadsheetImport } from 'react-spreadsheet-import'
// import 'react-spreadsheet-import/dist/index.css';

const ExcelImportModal = ({ importExelModal, setimportExelModal, title_fields }) => {
  const [isModalOpen, setIsModalOpen] = useState(true)
  const [importedData, setImportedData] = useState([])

  const handleComplete = (data) => {
    // console.log('Imported Data:', data);
    message.success('Uploaded Successful')
  }

  return (
    <>
      <ReactSpreadsheetImport
        isOpen={importExelModal}
        onClose={() => setimportExelModal(false)}
        onSubmit={handleComplete}
        fields={title_fields}
      />
    </>
  )
}

export default ExcelImportModal
