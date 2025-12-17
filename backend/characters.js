import express from 'express'
import { db } from './server.js'

const router = express.Router()

router.get('/', (req, res) => {
  res.json(db.data.characters || [])
})

router.put('/:id', async (req, res) => {
  const { id } = req.params
  const index = db.data.characters.findIndex(c => c.id === id || c._id === id)
  if (index !== -1) {
    db.data.characters[index] = { ...req.body, id }
    await db.write()
    res.json(db.data.characters[index])
  } else {
    res.status(404).json({ message: 'Não encontrado' })
  }
})

router.delete('/:id', async (req, res) => {
  const { id } = req.params
  db.data.characters = db.data.characters.filter(c => c.id !== id && c._id !== id)
  await db.write()
  res.json({ message: 'Agente removido com sucesso' })
})

export default router