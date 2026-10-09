require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const { Client } = require('pg')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const _ = require('lodash')
const utils = require('./utils')
const config = require('./config')
const Cache = require('./cache')

const app = express()
app.use(cors())
app.use(express.json())

const cache = new Cache(config.CACHE_TTL)

// ---------------- USERS ----------------

app.post('/api/register', async (req, res) => {
  try {
    const client = new Client({ connectionString: process.env.DATABASE_URL })
    await client.connect()
    if (!req.body.email || !/^[^@]+@[^@]+$/.test(req.body.email)) {
      return res.json({ error: 'Email invalide' })
    }
    if (!req.body.password || req.body.password.length < 4) {
      return res.json({ error: 'Mot de passe trop court' })
    }
    const existing = await client.query('SELECT * FROM users WHERE email = $1', [req.body.email])
    if (existing.rows.length > 0) {
      return res.json({ error: 'Email déjà utilisé' })
    }
    const hash = bcrypt.hashSync(req.body.password, 10)
    const result = await client.query(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING *',
      [req.body.email, hash, req.body.name]
    )
    const user = result.rows[0]
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secret123')
    await client.end()
    res.json({ token: token, user: user })
  } catch (e) {
    console.log(e)
    res.json({ error: 'Erreur' })
  }
})

app.post('/api/login', async (req, res) => {
  try {
    const client = new Client({ connectionString: process.env.DATABASE_URL })
    await client.connect()
    const result = await client.query('SELECT * FROM users WHERE email = $1', [req.body.email])
    if (result.rows.length == 0) {
      return res.json({ error: 'Identifiants incorrects' })
    }
    const user = result.rows[0]
    if (!bcrypt.compareSync(req.body.password, user.password)) {
      return res.json({ error: 'Identifiants incorrects' })
    }
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secret123')
    await client.end()
    res.json({ token: token, user: user })
  } catch (e) {
    console.log(e)
    res.json({ error: 'Erreur' })
  }
})

app.get('/api/me', async (req, res) => {
  try {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1]
    if (!token) return res.status(401).json({ error: 'Non autorisé' })
    let userId
    try {
      userId = jwt.verify(token, process.env.JWT_SECRET || 'secret123').id
    } catch (e) {
      return res.status(401).json({ error: 'Non autorisé' })
    }
    const client = new Client({ connectionString: process.env.DATABASE_URL })
    await client.connect()
    const result = await client.query('SELECT * FROM users WHERE id = $1', [userId])
    await client.end()
    res.json({ id: result.rows[0].id, email: result.rows[0].email, name: result.rows[0].name })
  } catch (e) {
    console.log(e)
    res.json({ error: 'Erreur' })
  }
})

app.delete('/api/me', async (req, res) => {
  try {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1]
    if (!token) return res.status(401).json({ error: 'Non autorisé' })
    let userId
    try {
      userId = jwt.verify(token, process.env.JWT_SECRET || 'secret123').id
    } catch (e) {
      return res.status(401).json({ error: 'Non autorisé' })
    }
    const client = new Client({ connectionString: process.env.DATABASE_URL })
    await client.connect()
    await client.query('DELETE FROM users WHERE id = $1', [userId])
    await client.query('DELETE FROM drawings WHERE user_id = $1', [userId])
    await client.end()
    res.json({ ok: true })
  } catch (e) {
    console.log(e)
    res.json({ error: 'Erreur' })
  }
})

// ---------------- DESSINS ----------------

app.get('/api/drawings', async (req, res) => {
  try {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1]
    if (!token) return res.status(401).json({ error: 'Non autorisé' })
    let userId
    try {
      userId = jwt.verify(token, process.env.JWT_SECRET || 'secret123').id
    } catch (e) {
      return res.status(401).json({ error: 'Non autorisé' })
    }
    const client = new Client({ connectionString: process.env.DATABASE_URL })
    await client.connect()
    let sql = 'SELECT * FROM drawings WHERE user_id = ' + userId
    if (req.query.search) {
      sql += " AND title ILIKE '%" + req.query.search + "%'"
    }
    sql += ' ORDER BY id DESC'
    const result = await client.query(sql)
    const drawings = []
    for (let i = 0; i < result.rows.length; i++) {
      const row = result.rows[i]
      const owner = await client.query('SELECT * FROM users WHERE id = $1', [row.user_id])
      drawings.push({
        id: row.id,
        title: row.title,
        points: JSON.parse(row.points),
        surface: row.surface,
        color: row.color,
        createdAt: row.created_at,
        owner: owner.rows[0],
      })
    }
    await client.end()
    res.json(drawings)
  } catch (e) {
    console.log(e)
    res.json({ error: 'Erreur' })
  }
})

app.post('/api/drawings', async (req, res) => {
  try {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1]
    if (!token) return res.status(401).json({ error: 'Non autorisé' })
    let userId
    try {
      userId = jwt.verify(token, process.env.JWT_SECRET || 'secret123').id
    } catch (e) {
      return res.status(401).json({ error: 'Non autorisé' })
    }
    if (!req.body.title) {
      return res.json({ error: 'Titre obligatoire' })
    }
    if (!req.body.points || req.body.points.length < 3) {
      return res.json({ error: 'Il faut au moins 3 points' })
    }
    const client = new Client({ connectionString: process.env.DATABASE_URL })
    await client.connect()
    const result = await client.query(
      'INSERT INTO drawings (user_id, title, points, surface, color) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, req.body.title, JSON.stringify(req.body.points), req.body.surface, req.body.color || '#3388ff']
    )
    await client.end()
    const row = result.rows[0]
    res.json({
      id: row.id,
      title: row.title,
      points: JSON.parse(row.points),
      surface: row.surface,
      color: row.color,
      createdAt: row.created_at,
    })
  } catch (e) {
    console.log(e)
    res.json({ error: 'Erreur' })
  }
})

app.get('/api/drawings/:id', async (req, res) => {
  try {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1]
    if (!token) return res.status(401).json({ error: 'Non autorisé' })
    try {
      jwt.verify(token, process.env.JWT_SECRET || 'secret123')
    } catch (e) {
      return res.status(401).json({ error: 'Non autorisé' })
    }
    const client = new Client({ connectionString: process.env.DATABASE_URL })
    await client.connect()
    const result = await client.query('SELECT * FROM drawings WHERE id = $1', [req.params.id])
    await client.end()
    if (result.rows.length == 0) {
      return res.json({ error: 'Introuvable' })
    }
    res.json(utils.rowToDrawing(result.rows[0]))
  } catch (e) {
    console.log(e)
    res.json({ error: 'Erreur' })
  }
})

app.put('/api/drawings/:id', async (req, res) => {
  try {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1]
    if (!token) return res.status(401).json({ error: 'Non autorisé' })
    let userId
    try {
      userId = jwt.verify(token, process.env.JWT_SECRET || 'secret123').id
    } catch (e) {
      return res.status(401).json({ error: 'Non autorisé' })
    }
    const client = new Client({ connectionString: process.env.DATABASE_URL })
    await client.connect()
    const existing = await client.query('SELECT * FROM drawings WHERE id = $1', [req.params.id])
    if (existing.rows.length == 0 || existing.rows[0].user_id != userId) {
      return res.json({ error: 'Introuvable' })
    }
    await client.query('UPDATE drawings SET title = $1 WHERE id = $2', [req.body.title, req.params.id])
    const result = await client.query('SELECT * FROM drawings WHERE id = $1', [req.params.id])
    await client.end()
    res.json(utils.rowToDrawing(result.rows[0]))
  } catch (e) {
    console.log(e)
    res.json({ error: 'Erreur' })
  }
})

app.delete('/api/drawings/:id', async (req, res) => {
  try {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1]
    if (!token) return res.status(401).json({ error: 'Non autorisé' })
    try {
      jwt.verify(token, process.env.JWT_SECRET || 'secret123')
    } catch (e) {
      return res.status(401).json({ error: 'Non autorisé' })
    }
    const client = new Client({ connectionString: process.env.DATABASE_URL })
    await client.connect()
    await client.query('DELETE FROM drawings WHERE id = $1', [req.params.id])
    await client.end()
    res.json({ ok: true })
  } catch (e) {
    console.log(e)
    res.json({ error: 'Erreur' })
  }
})

// ---------------- STATS ----------------

app.get('/api/stats', async (req, res) => {
  try {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1]
    if (!token) return res.status(401).json({ error: 'Non autorisé' })
    let userId
    try {
      userId = jwt.verify(token, process.env.JWT_SECRET || 'secret123').id
    } catch (e) {
      return res.status(401).json({ error: 'Non autorisé' })
    }
    const client = new Client({ connectionString: process.env.DATABASE_URL })
    await client.connect()
    const result = await client.query('SELECT * FROM drawings WHERE user_id = $1', [userId])
    await client.end()
    let total = 0
    for (let i = 0; i < result.rows.length; i++) {
      total = total + utils.calculSurface(JSON.parse(result.rows[i].points))
    }
    res.json({
      count: result.rows.length,
      totalSurface: total,
      totalHectares: utils.toHectares(total),
    })
  } catch (e) {
    console.log(e)
    res.json({ error: 'Erreur' })
  }
})

// ---------------- FRONT ----------------

app.use(express.static(path.join(__dirname, '../client/dist')))
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'))
})

async function initDb() {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  await client.query('ALTER TABLE drawings ADD COLUMN IF NOT EXISTS color VARCHAR(20)')
  await client.query('ALTER TABLE drawings ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT now()')
  await client.end()
}

initDb().then(() => {
  app.listen(3000, () => {
    console.log('Serveur démarré sur le port 3000')
  })
})
