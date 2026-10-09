import React, { useEffect, useState } from 'react'
import Map from './Map'
import { computeArea, formatArea, formatDate } from './utils'

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(null)
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [drawings, setDrawings] = useState([])
  const [stats, setStats] = useState(null)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingTitle, setEditingTitle] = useState('')

  useEffect(() => {
    if (token) {
      fetch('http://localhost:3000/api/me', { headers: { Authorization: 'Bearer ' + token } })
        .then((r) => r.json())
        .then((data) => setUser(data))
      fetch('http://localhost:3000/api/drawings', { headers: { Authorization: 'Bearer ' + token } })
        .then((r) => r.json())
        .then((data) => setDrawings(data))
      fetch('http://localhost:3000/api/stats', { headers: { Authorization: 'Bearer ' + token } })
        .then((r) => r.json())
        .then((data) => setStats(data))
    }
  }, [token])

  function login() {
    fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error)
        } else {
          localStorage.setItem('token', data.token)
          setToken(data.token)
          setError('')
        }
      })
  }

  function register() {
    fetch('http://localhost:3000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password, name: name }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error)
        } else {
          localStorage.setItem('token', data.token)
          setToken(data.token)
          setError('')
        }
      })
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  function reload(s) {
    fetch('http://localhost:3000/api/drawings?search=' + (s || ''), { headers: { Authorization: 'Bearer ' + token } })
      .then((r) => r.json())
      .then((data) => setDrawings(data))
    fetch('http://localhost:3000/api/stats', { headers: { Authorization: 'Bearer ' + token } })
      .then((r) => r.json())
      .then((data) => setStats(data))
  }

  function saveDrawing(d) {
    fetch('http://localhost:3000/api/drawings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify(d),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          alert(data.error)
        } else {
          reload(search)
        }
      })
  }

  function deleteDrawing(id) {
    fetch('http://localhost:3000/api/drawings/' + id, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + token },
    }).then(() => reload(search))
  }

  function renameDrawing(id) {
    fetch('http://localhost:3000/api/drawings/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ title: editingTitle }),
    }).then(() => {
      setEditingId(null)
      reload(search)
    })
  }

  if (!token) {
    return (
      <div className="relative h-screen w-screen overflow-hidden">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="/video.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative flex h-full flex-col items-center justify-center gap-6">
          <h1 className="text-5xl font-bold text-white">Parcelles</h1>
          <p className="text-lg text-white">Dessinez vos terrains, mesurez leur surface.</p>
          <div className="w-80 rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-semibold">{mode == 'login' ? 'Connexion' : 'Inscription'}</h2>
            {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
            {mode == 'register' && (
              <input
                className="mb-2 w-full rounded border border-gray-300 px-3 py-2"
                placeholder="Nom"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}
            <input
              className="mb-2 w-full rounded border border-gray-300 px-3 py-2"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="mb-2 w-full rounded border border-gray-300 px-3 py-2"
              placeholder="Mot de passe"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {mode == 'login' ? (
              <div>
                <button className="mb-2 w-full rounded bg-emerald-600 px-3 py-2 text-white" onClick={login}>
                  Se connecter
                </button>
                <a className="text-sm text-emerald-700 underline" href="#" onClick={() => setMode('register')}>
                  Créer un compte
                </a>
              </div>
            ) : (
              <div>
                <button className="mb-2 w-full rounded bg-emerald-600 px-3 py-2 text-white" onClick={register}>
                  S'inscrire
                </button>
                <a className="text-sm text-emerald-700 underline" href="#" onClick={() => setMode('login')}>
                  J'ai déjà un compte
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-4 bg-emerald-700 px-4 py-3 text-white">
        <b className="text-lg">Parcelles</b>
        <span>{user && user.name}</span>
        <button className="rounded bg-white px-3 py-1 text-sm text-emerald-700" onClick={logout}>
          Déconnexion
        </button>
        {stats && (
          <span style={{ marginLeft: 20 }}>
            {stats.count} dessin(s), {formatArea(stats.totalSurface)} au total
          </span>
        )}
      </div>
      <Map drawings={drawings} onSave={saveDrawing} />
      <div style={{ padding: 10 }}>
        <input
          placeholder="Rechercher"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            reload(e.target.value)
          }}
        />
        <table>
          <tbody>
            {drawings.map((d) => (
              <tr key={d.id}>
                <td>
                  {editingId == d.id ? (
                    <span>
                      <input value={editingTitle} onChange={(e) => setEditingTitle(e.target.value)} />
                      <button onClick={() => renameDrawing(d.id)}>OK</button>
                    </span>
                  ) : (
                    d.title
                  )}
                </td>
                <td>{formatArea(computeArea(d.points))}</td>
                <td>{formatDate(d.createdAt)}</td>
                <td>
                  <button
                    onClick={() => {
                      setEditingId(d.id)
                      setEditingTitle(d.title)
                    }}
                  >
                    Renommer
                  </button>
                  <button onClick={() => deleteDrawing(d.id)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
