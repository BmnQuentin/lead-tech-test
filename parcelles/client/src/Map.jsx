import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { getMapProvider } from './providers'

export default function Map(props) {
  const mapRef = useRef(null)
  const layerRef = useRef(null)
  const savedLayerRef = useRef(null)
  const [points, setPoints] = useState([])
  const [surface, setSurface] = useState(0)
  const [title, setTitle] = useState('')

  useEffect(() => {
    const provider = getMapProvider('leaflet')
    const map = L.map('map').setView([46.6, 2.5], 6)
    L.tileLayer(provider.getTileUrl(), {
      attribution: provider.getAttribution(),
      maxZoom: provider.getMaxZoom(),
    }).addTo(map)
    map.on('click', (e) => {
      setPoints((prev) => [...prev, { lat: e.latlng.lat, lng: e.latlng.lng }])
    })
    mapRef.current = map
    layerRef.current = L.polygon([], { color: 'red' }).addTo(map)
    savedLayerRef.current = L.layerGroup().addTo(map)
  }, [])

  useEffect(() => {
    if (!layerRef.current) return
    layerRef.current.setLatLngs(points.map((p) => [p.lat, p.lng]))

    // calcul de la surface
    let a = 0
    if (points.length > 2) {
      for (let i = 0; i < points.length; i++) {
        const p1 = points[i]
        const p2 = points[(i + 1) % points.length]
        a +=
          ((p2.lng - p1.lng) * Math.PI) / 180 *
          (2 + Math.sin((p1.lat * Math.PI) / 180) + Math.sin((p2.lat * Math.PI) / 180))
      }
      a = Math.abs((a * 6378137 * 6378137) / 2)
    }
    setSurface(a)
  }, [points])

  useEffect(() => {
    if (!savedLayerRef.current) return
    savedLayerRef.current.clearLayers()
    props.drawings.forEach((d) => {
      L.polygon(
        d.points.map((p) => [p.lat, p.lng]),
        { color: d.color }
      ).addTo(savedLayerRef.current)
    })
  }, [props.drawings])

  function save() {
    if (title == '') {
      alert('Titre obligatoire')
      return
    }
    if (points.length < 3) {
      alert('Il faut au moins 3 points')
      return
    }
    props.onSave({ title: title, points: points, surface: surface })
    setPoints([])
    setTitle('')
  }

  return (
    <div>
      <div id="map" style={{ height: 500 }}></div>
      <div style={{ padding: 10 }}>
        <input placeholder="Titre" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button onClick={save}>Enregistrer</button>
        <button onClick={() => setPoints([])}>Effacer</button>
        <span style={{ marginLeft: 10 }}>
          Surface : {surface > 10000 ? (surface / 10000).toFixed(2) + ' ha' : surface.toFixed(0) + ' m²'}
        </span>
      </div>
    </div>
  )
}
