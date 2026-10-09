module.exports = {
  MAP_PROVIDER: process.env.MAP_PROVIDER || 'leaflet',
  ENABLE_CACHE: process.env.ENABLE_CACHE === 'true',
  CACHE_TTL: 60,
  ENABLE_TEAMS: false,
  ENABLE_EXPORT_PDF: false,
  MAX_POINTS: 500,
  DEFAULT_LANG: 'fr',
  SUPPORTED_LANGS: ['fr', 'en', 'es'],
}
