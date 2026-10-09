import LeafletProvider from './LeafletProvider'

export function getMapProvider(name) {
  switch (name) {
    case 'leaflet':
      return new LeafletProvider()
    case 'google':
      throw new Error('Google Maps provider not implemented yet')
    case 'mapbox':
      throw new Error('Mapbox provider not implemented yet')
    default:
      return new LeafletProvider()
  }
}
