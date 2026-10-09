export default class BaseMapProvider {
  getName() {
    throw new Error('Not implemented')
  }

  getTileUrl() {
    throw new Error('Not implemented')
  }

  getAttribution() {
    throw new Error('Not implemented')
  }

  getMaxZoom() {
    return 18
  }

  supportsSatellite() {
    return false
  }

  supports3D() {
    return false
  }
}
