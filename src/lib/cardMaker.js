// ============================================================
// In-browser card image + Apple Wallet (.pkpass) generation.
// No runtime deps: QR is drawn to canvas, pass is a STORE-method
// ZIP built by hand (passkit accepts uncompressed entries).
// ============================================================

const PASS_TYPE_ID = 'pass.com.rotaractsliit.installation'
const TEAM_ID = 'RCRSLIIT'

const DISPLAY_FONT = '"Cormorant Garamond","Georgia",serif'
const SANS_FONT = '"Jost","system-ui",sans-serif'

const CATEGORY_LABEL = {
  sliit_member: 'SLIIT Member',
  outside_sliit: 'Outside Guest',
}
const FOOD_LABEL = { veg: 'Veg', non_veg: 'Non-Veg' }

// ---------- helpers ----------

function dataUrlToBytes(dataUrl) {
  const b64 = dataUrl.split(',')[1]
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to decode image'))
    img.src = src
  })
}

// ---------- CRC32 (needed by ZIP) ----------
const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(bytes) {
  let crc = 0xffffffff
  for (let i = 0; i < bytes.length; i++) crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ bytes[i]) & 0xff]
  return (crc ^ 0xffffffff) >>> 0
}

// ---------- minimal STORE ZIP writer ----------
function makeZip(files) {
  const enc = new TextEncoder()
  const parts = []
  const central = []
  let offset = 0

  for (const f of files) {
    const name = enc.encode(f.name)
    const data = f.data
    const crc = crc32(data)

    const loc = new ArrayBuffer(30)
    const lv = new DataView(loc)
    lv.setUint32(0, 0x04034b50, true) // local file header sig
    lv.setUint16(4, 20, true) // version needed
    lv.setUint16(6, 0x0800, true) // UTF-8 names
    lv.setUint16(8, 0, true) // STORE
    lv.setUint16(10, 0, true) // mod time
    lv.setUint16(12, 0x21, true) // mod date (1980-01-01)
    lv.setUint32(14, crc, true)
    lv.setUint32(18, data.length, true) // comp size
    lv.setUint32(22, data.length, true) // uncomp size
    lv.setUint16(26, name.length, true)
    lv.setUint16(28, 0, true) // extra len
    parts.push(new Uint8Array(loc), name, data)

    const cen = new ArrayBuffer(46)
    const cv = new DataView(cen)
    cv.setUint32(0, 0x02014b50, true) // central dir sig
    cv.setUint16(4, 20, true) // made by
    cv.setUint16(6, 20, true) // version needed
    cv.setUint16(8, 0x0800, true)
    cv.setUint16(10, 0, true) // STORE
    cv.setUint16(12, 0, true) // mod time
    cv.setUint16(14, 0x21, true) // mod date
    cv.setUint32(16, crc, true)
    cv.setUint32(20, data.length, true)
    cv.setUint32(24, data.length, true)
    cv.setUint16(28, name.length, true)
    cv.setUint16(30, 0, true) // extra
    cv.setUint16(32, 0, true) // comment
    cv.setUint16(34, 0, true) // disk start
    cv.setUint16(36, 0, true) // internal attrs
    cv.setUint32(38, 0, true) // external attrs
    cv.setUint32(42, offset, true) // local header offset
    central.push(new Uint8Array(cen), name)

    offset += 30 + name.length + data.length
  }

  const cdSize = central.reduce((s, a) => s + a.length, 0)

  const eocd = new ArrayBuffer(22)
  const ev = new DataView(eocd)
  ev.setUint32(0, 0x06054b50, true) // EOCD sig
  ev.setUint16(4, 0, true)
  ev.setUint16(6, 0, true)
  ev.setUint16(8, files.length, true)
  ev.setUint16(10, files.length, true)
  ev.setUint32(12, cdSize, true)
  ev.setUint32(16, offset, true)
  ev.setUint16(20, 0, true) // comment len

  const body = new Uint8Array(offset + cdSize + 22)
  let p = 0
  for (const a of parts.concat(central, [new Uint8Array(eocd)])) {
    body.set(a, p)
    p += a.length
  }
  return body
}

function dataUrlPng(bytes) {
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return 'data:image/png;base64,' + btoa(bin)
}

// ---------- card image (PNG) ----------
async function drawCard({ full_name, reg_number, category, food, qrDataUrl }) {
  const img = await loadImage(qrDataUrl)
  const W = 560
  const H = 760
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')

  // header
  const g = ctx.createLinearGradient(0, 0, W, 0)
  g.addColorStop(0, '#3a2560')
  g.addColorStop(1, '#8b4a9f')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, 250)

  ctx.fillStyle = 'rgba(255,255,255,.85)'
  ctx.font = '600 19px ' + SANS_FONT
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('ROTARACT CLUB OF SLIIT', W / 2, 46)

  ctx.fillStyle = '#d4af37'
  ctx.fillRect(W / 2 - 60, 62, 120, 2)

  ctx.fillStyle = '#ffffff'
  ctx.font = '600 38px ' + DISPLAY_FONT
  ctx.fillText(full_name, W / 2, 128)

  ctx.fillStyle = '#e6c76a'
  ctx.font = '600 70px ' + DISPLAY_FONT
  ctx.fillText('#' + reg_number, W / 2, 218)

  // body
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 250, W, H - 250)

  // QR panel
  const qrSize = 224
  const qx = (W - qrSize) / 2
  const qy = 292
  ctx.fillStyle = '#faf8ff'
  ctx.fillRect(qx - 12, qy - 12, qrSize + 24, qrSize + 24)
  ctx.strokeStyle = '#e2d9f2'
  ctx.lineWidth = 2
  ctx.strokeRect(qx - 12, qy - 12, qrSize + 24, qrSize + 24)
  ctx.drawImage(img, qx, qy, qrSize, qrSize)

  ctx.fillStyle = '#5a4f68'
  ctx.font = '500 16px ' + SANS_FONT
  ctx.fillText('Show this QR at the entrance', W / 2, 570)

  ctx.fillStyle = '#3a2560'
  ctx.font = '600 24px ' + DISPLAY_FONT
  ctx.fillText(CATEGORY_LABEL[category] || category, W / 2, 622)
  ctx.fillStyle = '#8a7aa3'
  ctx.font = '500 15px ' + SANS_FONT
  ctx.fillText('Food: ' + (FOOD_LABEL[food] || food), W / 2, 650)
  ctx.fillText('14th Installation Ceremony · SLIIT Auditorium', W / 2, 678)

  return c.toDataURL('image/png')
}

// ---------- Apple Wallet pass ----------
function iconCanvasDataUrl(img, size) {
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#3a2560'
  ctx.fillRect(0, 0, size, size)
  const m = Math.round(size * 0.08)
  ctx.drawImage(img, m, m, size - m * 2, size - m * 2)
  return c.toDataURL('image/png')
}

// Pure pass.json builder (DOM-free, unit-testable).
function walletPassJson({ full_name, reg_number, category, food, id }) {
  return {
    formatVersion: 1,
    passTypeIdentifier: PASS_TYPE_ID,
    serialNumber: 'RCS-' + reg_number,
    teamIdentifier: TEAM_ID,
    organizationName: 'Rotaract Club of SLIIT',
    description: '14th Installation Ceremony entry pass',
    logoText: 'Rotaract SLIIT',
    foregroundColor: 'rgb(255,255,255)',
    backgroundColor: 'rgb(58,37,96)',
    labelColor: 'rgb(212,175,55)',
    barcode: {
      format: 'PKBarcodeFormatQR',
      message: String(id),
      messageEncoding: 'iso-8859-1',
    },
    generic: {
      primaryFields: [
        { key: 'guest', label: 'GUEST', value: full_name },
      ],
      secondaryFields: [
        { key: 'reg', label: 'REG #', value: '#' + reg_number },
        { key: 'cat', label: 'CATEGORY', value: CATEGORY_LABEL[category] || category },
      ],
      auxiliaryFields: [
        { key: 'food', label: 'FOOD', value: FOOD_LABEL[food] || food },
        { key: 'venue', label: 'VENUE', value: 'SLIIT Auditorium' },
      ],
    },
  }
}

async function buildWalletPass({ full_name, reg_number, category, food, id, qrDataUrl }) {
  const qrImg = await loadImage(qrDataUrl)
  const pass = walletPassJson({ full_name, reg_number, category, food, id })

  const passBytes = new TextEncoder().encode(JSON.stringify(pass))
  const icon = dataUrlToBytes(iconCanvasDataUrl(qrImg, 29))
  const icon2x = dataUrlToBytes(iconCanvasDataUrl(qrImg, 58))
  const icon3x = dataUrlToBytes(iconCanvasDataUrl(qrImg, 87))

  const zip = makeZip([
    { name: 'pass.json', data: passBytes },
    { name: 'icon.png', data: icon },
    { name: 'icon@2x.png', data: icon2x },
    { name: 'icon@3x.png', data: icon3x },
  ])

  const blob = new Blob([zip], { type: 'application/vnd.apple.pkpass' })
  return { blob, filename: 'Rotaract-Card-' + reg_number + '.pkpass' }
}

function triggerDownload(urlOrBlob, filename) {
  const a = document.createElement('a')
  a.href = urlOrBlob instanceof Blob ? URL.createObjectURL(urlOrBlob) : urlOrBlob
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  if (urlOrBlob instanceof Blob) setTimeout(() => URL.revokeObjectURL(a.href), 4000)
}

export {
  drawCard,
  buildWalletPass,
  triggerDownload,
  walletPassJson,
  makeZip,
  crc32,
  dataUrlToBytes,
  dataUrlPng,
  CATEGORY_LABEL,
  FOOD_LABEL,
}
