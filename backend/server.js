import express from 'express'
import cors from 'cors'
import { JSONFilePreset } from 'lowdb/node'
import characterRoutes from './characters.js'
import { v4 as uuidv4 } from 'uuid' 

const app = express()
app.use(cors())
app.use(express.json())

const defaultData = { characters: [], items: [] }
export const db = await JSONFilePreset('db.json', defaultData)

console.log('Banco de dados Local (JSON) pronto')

app.get('/health', (req, res) => {
  res.json({ ok: true, storage: 'local-json' })
})

app.use('/api/characters', characterRoutes)

app.get('/api/items', (req, res) => {
  const items = db.data.items || []
  res.json(items)
})

app.post('/api/items', async (req, res) => {
  const newItem = {
    id: uuidv4(),
    ...req.body
  }
  db.data.items.push(newItem)
  await db.write()
  res.json(newItem)
})

const port = 3001
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`)
})