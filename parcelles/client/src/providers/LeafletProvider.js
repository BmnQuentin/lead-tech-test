import BaseMapProvider from './BaseMapProvider'

export default class LeafletProvider extends BaseMapProvider {
  getName() {
    return 'leaflet'
  }

  getTileUrl() {
    return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  }

  getAttribution() {
    return '&copy; OpenStreetMap contributors'
  }

  getMaxZoom() {
    return 19
  }
}
