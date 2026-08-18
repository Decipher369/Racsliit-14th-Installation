import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

const READER_ID = 'qr-reader'

export default function QrScanTab({ onScanned, registrations }) {
  const scannerRef = useRef(null)
  const [status, setStatus] = useState('idle')
  const [errMsg, setErrMsg] = useState('')

  async function start() {
    setErrMsg('')
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode(READER_ID)
    }
    const scanner = scannerRef.current
    try {
      setStatus('starting')
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => handleScan(decodedText),
        () => {}
      )
      setStatus('active')
    } catch (err) {
      setStatus('idle')
      setErrMsg(
        'Could not start camera: ' + (err && err.message ? err.message : String(err)) +
        '. Make sure you are on HTTPS and have granted camera permission. You can also use the Search or Registration Number tabs.'
      )
    }
  }

  async function stop() {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop()
      } catch (e) { /* ignore */ }
    }
    setStatus('idle')
  }

  function handleScan(decodedText) {
    stop()
    const match = registrations.find((r) => String(r.id) === String(decodedText).trim())
    if (match) {
      onScanned(match)
    } else {
      setErrMsg('That QR code was not found in the registrations.')
      start()
    }
  }

  useEffect(() => {
    return () => {
      const s = scannerRef.current
      if (s && s.isScanning) {
        s.stop().catch(() => {})
        s.clear().catch(() => {})
      }
    }
  }, [])

  return (
    <div className="qr-panel">
      <div id={READER_ID}></div>
      {status !== 'active' && (
        <button className="btn" onClick={start} disabled={status === 'starting'}>
          {status === 'starting' ? 'Starting camera...' : 'Start Camera / Scan QR'}
        </button>
      )}
      {status === 'active' && (
        <button className="btn btn-ghost" onClick={stop}>Stop Scanner</button>
      )}
      {errMsg && <div className="alert alert-error" style={{ marginTop: 10 }}>{errMsg}</div>}
      <p className="qr-hint">Point the camera at the attendee's QR code (encoded with their registration id).</p>
    </div>
  )
}
