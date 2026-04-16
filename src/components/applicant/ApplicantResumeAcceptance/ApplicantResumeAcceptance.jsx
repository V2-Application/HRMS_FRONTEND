import axiosInstance from '../../../services/axiosInstance'
import PdfApprovalViewer from './PdfApprovalViewer'

export default function Page() {
  return (
    <PdfApprovalViewer
      loadUrl="/api/documents/123" // returns { status, pdfUrl }
      approveUrl="/api/documents/123/approve" // optional
      rejectUrl="/api/documents/123/reject" // optional
      requestInit={{ withCredentials: true }} // merged into axios config
      axiosClient={axiosInstance} // << use your axios instance
      fileName="policy.pdf"
      initialStatus="pending"
      onApprove={(s) => console.log('approved:', s)}
      onReject={(s) => console.log('rejected:', s)}
    />
  )
}
