const moment = require('moment')

function isValidEmail(email) {
  return /^[^@]+@[^@]+\.[^@]+$/.test(email)
}

function formatDate(d) {
  return moment(d).format('DD/MM/YYYY')
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// surface en m2 à partir d'une liste de points {lat, lng}
function calculSurface(points) {
  if (!points || points.length < 3) return 0
  const lat0 = points[0].lat
  const pts = points.map((p) => {
    return {
      x: p.lng * 111320 * Math.cos((lat0 * Math.PI) / 180),
      y: p.lat * 111320,
    }
  })
  let total = 0
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length
    total += pts[i].x * pts[j].y - pts[j].x * pts[i].y
  }
  return Math.abs(total / 2)
}

// ancienne version, à supprimer quand la v2 sera validée
function calculSurfaceOld(points) {
  let total = 0
  for (let i = 0; i < points.length - 1; i++) {
    total += points[i].lng * points[i + 1].lat - points[i + 1].lng * points[i].lat
  }
  return Math.abs(total / 2) * 111320 * 111320
}

function toHectares(m2) {
  return m2 / 10000
}

function rowToDrawing(row) {
  return {
    id: row.id,
    title: row.title,
    points: JSON.parse(row.points),
    surface: row.surface,
    color: row.color,
    createdAt: row.created_at,
  }
}

module.exports = {
  isValidEmail,
  formatDate,
  capitalize,
  sleep,
  calculSurface,
  calculSurfaceOld,
  toHectares,
  rowToDrawing,
}
