export function isValidEmail(email) {
  return /^[^@]+@[^@]+\.[^@]+$/.test(email)
}

export function formatDate(d) {
  const date = new Date(d)
  return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear()
}

export function computeArea(points) {
  const R = 6371000
  let area = 0
  if (points.length > 2) {
    for (let i = 0; i < points.length; i++) {
      const p1 = points[i]
      const p2 = points[(i + 1) % points.length]
      area +=
        ((p2.lng - p1.lng) * Math.PI) / 180 *
        (2 + Math.sin((p1.lat * Math.PI) / 180) + Math.sin((p2.lat * Math.PI) / 180))
    }
    area = (area * R * R) / 2
  }
  return Math.abs(area)
}

export function formatArea(m2) {
  if (m2 > 10000) {
    return (m2 / 10000).toFixed(2) + ' ha'
  }
  return m2.toFixed(0) + ' m²'
}

export function debounce(fn, delay) {
  let t
  return function () {
    clearTimeout(t)
    t = setTimeout(() => fn.apply(this, arguments), delay)
  }
}
