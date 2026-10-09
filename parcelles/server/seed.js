require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { Client } = require('pg')
const bcrypt = require('bcryptjs')
const utils = require('./utils')

const users = [
  { email: 'alice@example.com', password: 'password', name: 'Alice Martin' },
  { email: 'bob@example.com', password: 'password', name: 'Bob Durand' },
]

const drawings = [
  {
    user: 0,
    title: 'Champ de la Loire',
    points: [
      { lat: 47.3941, lng: 0.6848 },
      { lat: 47.3941, lng: 0.6912 },
      { lat: 47.3902, lng: 0.6912 },
      { lat: 47.3902, lng: 0.6848 },
    ],
  },
  {
    user: 0,
    title: 'Parcelle forêt',
    points: [
      { lat: 48.4047, lng: 2.6921 },
      { lat: 48.4101, lng: 2.7015 },
      { lat: 48.4012, lng: 2.7102 },
      { lat: 48.3968, lng: 2.6987 },
    ],
  },
  {
    user: 0,
    title: 'Terrain constructible',
    points: [
      { lat: 45.7601, lng: 4.8401 },
      { lat: 45.7604, lng: 4.8409 },
      { lat: 45.7598, lng: 4.8411 },
    ],
  },
  {
    user: 1,
    title: 'Vignes',
    points: [
      { lat: 44.8412, lng: -0.5801 },
      { lat: 44.8431, lng: -0.5762 },
      { lat: 44.8405, lng: -0.5741 },
      { lat: 44.8389, lng: -0.5779 },
    ],
  },
]

async function seed() {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  await client.query('DROP TABLE IF EXISTS drawings')
  await client.query('DROP TABLE IF EXISTS users')
  await client.query(fs.readFileSync(path.join(__dirname, '../schema.sql')).toString())

  const ids = []
  for (let i = 0; i < users.length; i++) {
    const result = await client.query(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING *',
      [users[i].email, bcrypt.hashSync(users[i].password, 10), users[i].name]
    )
    ids.push(result.rows[0].id)
  }
  for (let i = 0; i < drawings.length; i++) {
    await client.query('INSERT INTO drawings (user_id, title, points, surface) VALUES ($1, $2, $3, $4)', [
      ids[drawings[i].user],
      drawings[i].title,
      JSON.stringify(drawings[i].points),
      utils.calculSurface(drawings[i].points),
    ])
  }
  await client.end()
  console.log('Seed OK')
  console.log('Comptes : alice@example.com / password, bob@example.com / password')
}

seed()
