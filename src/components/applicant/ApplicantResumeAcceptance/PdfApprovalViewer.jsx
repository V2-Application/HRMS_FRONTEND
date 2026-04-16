// ===== File: PdfApprovalViewer.jsx =====
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import axios from 'axios' // default fallback; you can pass your own instance via props
import './style.css'
import { Button } from 'antd'

// Set the PDF worker (works in CRA, Vite, Next)
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

const FALLBACK_PDF = '/RohitKhatri_Attendance_March.pdf' // <-- served from /public

export default function PdfApprovalViewer({
  loadUrl, // GET -> { status: 'pending'|'approved'|'rejected', pdfUrl: string }
  approveUrl, // optional POST -> { status: 'approved' }
  rejectUrl, // optional POST -> { status: 'rejected' }
  fileName = 'document.pdf',
  initialStatus = 'pending', // used until API responds
  requestInit, // optional axios config: { headers, withCredentials, params, ... }
  onApprove, // optional callback(status)
  onReject, // optional callback(status)
  axiosClient, // optional: pass your axiosInstance; defaults to axios
}) {
  const http = axiosClient || axios

  const [status, setStatus] = useState(initialStatus)
  const [pdfSrc, setPdfSrc] = useState(null) // string | ArrayBuffer | Uint8Array | Blob
  const [numPages, setNumPages] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const viewerRef = useRef(null)

  // Load current status + pdf link (with fallback)
  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true) // FIX: start in loading state
      setError(null)
      try {
        const res = await http.get(loadUrl, { ...(requestInit || {}) })
        const data = res?.data || {}
        if (cancelled) return

        const apiPdf =
          data && typeof data.pdfUrl === 'string' && data.pdfUrl.trim() ? data.pdfUrl : null
        setPdfSrc(apiPdf || FALLBACK_PDF) // <-- fallback if API doesn't return a file
        if (data && typeof data.status === 'string') setStatus(data.status)
      } catch (e) {
        if (!cancelled) {
          // Use fallback PDF on error too
          setPdfSrc(FALLBACK_PDF)
          setError(e?.response?.data?.message || e?.message || 'Failed to load')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    if (loadUrl) {
      load()
    } else {
      // If no API is provided, still show fallback
      setPdfSrc(FALLBACK_PDF)
      setLoading(false)
    }
    return () => {
      cancelled = true
    }
  }, [loadUrl, requestInit, http])

  // react-pdf callbacks
  const handleLoadSuccess = useCallback((pdf) => {
    setNumPages(pdf.numPages)
  }, [])

  const handleLoadError = useCallback((err) => {
    setError(err?.message || 'Failed to render PDF')
  }, [])

  // Actions
  const approve = useCallback(async () => {
    if (!approveUrl) {
      setStatus('approved')
      onApprove && onApprove('approved')
      return
    }
    try {
      setSubmitting(true)
      const res = await http.post(approveUrl, null, { ...(requestInit || {}) })
      const data = res?.data || {}
      const next = data?.status || 'approved'
      setStatus(next)
      onApprove && onApprove(next)
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Approve failed')
    } finally {
      setSubmitting(false)
    }
  }, [approveUrl, onApprove, requestInit, http])

  const reject = useCallback(async () => {
    if (!rejectUrl) {
      setStatus('rejected')
      onReject && onReject('rejected')
      return
    }
    try {
      setSubmitting(true)
      const res = await http.post(rejectUrl, null, { ...(requestInit || {}) })
      const data = res?.data || {}
      const next = data?.status || 'rejected'
      setStatus(next)
      onReject && onReject(next)
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Reject failed')
    } finally {
      setSubmitting(false)
    }
  }, [rejectUrl, onReject, requestInit, http])

  // Status pill class (kept for future use if you re-add a visual pill)
  const statusClass = useMemo(() => {
    const base = 'pdf-status'
    if (status === 'approved') return `${base} pdf-status--approved`
    if (status === 'rejected') return `${base} pdf-status--rejected`
    return `${base} pdf-status--pending`
  }, [status])

  // Download helper when src isn't a URL string
  const handleDownload = useCallback(
    (e) => {
      const src = pdfSrc
      if (typeof src === 'string') return // anchor has href when string
      e.preventDefault()
      try {
        let blob = null
        if (src instanceof Blob) {
          blob = src
        } else if (src && (src instanceof ArrayBuffer || ArrayBuffer.isView(src))) {
          blob = new Blob([src], { type: 'application/pdf' })
        }
        if (blob) {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = fileName
          document.body.appendChild(a)
          a.click()
          a.remove()
          setTimeout(() => URL.revokeObjectURL(url), 1000)
        }
      } catch (err) {
        console.error(err)
      }
    },
    [pdfSrc, fileName],
  )

  return (
    <div className="pdf-approval-root">
      {/* Top Toolbar */}
      <div className="pdf-toolbar">
        <div className="pdf-title">PDF Preview</div>

        {/* If you want to show the status pill, uncomment this:
        <div className={statusClass} aria-live="polite">
          <span className="pdf-status-dot" />
          <span className="pdf-status-text">{status}</span>
        </div>
        */}

        <Button type="primary">
          <a
            href={typeof pdfSrc === 'string' ? pdfSrc : undefined}
            onClick={handleDownload}
            download={fileName}
            target={typeof pdfSrc === 'string' ? '_blank' : undefined}
            rel="noreferrer"
          >
            Download
          </a>
        </Button>
        <Button onClick={approve} disabled={submitting}>
          Approve
        </Button>
        <Button onClick={reject} danger disabled={submitting}>
          Reject
        </Button>
      </div>

      {/* Viewer */}
      <div ref={viewerRef} className="pdf-viewer">
        <div className="pdf-viewer-inner">
          {loading && !error && <div className="pdf-msg">Loading PDF…</div>}
          {error && <div className="pdf-msg pdf-msg--error">{error}</div>}

          {!loading && pdfSrc && (
            <Document file={pdfSrc} onLoadSuccess={handleLoadSuccess} onLoadError={handleLoadError}>
              <Page
                pageNumber={1}
                width={Math.min(
                  1200,
                  typeof window !== 'undefined' ? window.innerWidth - 32 : 1200,
                )}
                renderAnnotationLayer={false}
                renderTextLayer={false}
              />
            </Document>
          )}
          {numPages && numPages > 1 && (
            <p className="pdf-pages-note">Showing page 1 of {numPages}</p>
          )}
        </div>
      </div>
    </div>
  )
}
