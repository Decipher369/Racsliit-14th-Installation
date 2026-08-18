// ============================================================
// In-browser card image composer for the QR check-in pass.
// No runtime deps: the QR is drawn to canvas and exported as PNG.
// ============================================================

const DISPLAY_FONT = '"Cormorant Garamond","Georgia",serif'
const SANS_FONT = '"Jost","ui-sans-serif",system-ui,sans-serif'

const CATEGORY_LABEL = {
  sliit_member: 'SLIIT Member',
  outside_sliit: 'Outside Guest',
}
const FOOD_LABEL = { veg: 'Veg', non_veg: 'Non-Veg' }

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to decode image'))
    img.src = src
  })
}

// Draw the full event card (header + QR + details) and return a PNG data URL.
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

function triggerDownload(urlOrBlob, filename) {
  const a = document.createElement('a')
  a.href = urlOrBlob instanceof Blob ? URL.createObjectURL(urlOrBlob) : urlOrBlob
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  if (urlOrBlob instanceof Blob) setTimeout(() => URL.revokeObjectURL(a.href), 4000)
}

export { drawCard, triggerDownload, CATEGORY_LABEL, FOOD_LABEL }
