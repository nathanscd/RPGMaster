import express from 'express'
import Character from '../models/Character.js'

const router = express.Router()

router.get('/', async (req, res) => {
  const chars = await Character.find()
  res.json(chars)
})

router.get('/:id', async (req, res) => {
  const char = await Character.findById(req.params.id)
  res.json(char)
})

router.put('/:id', async (req, res) => {
  const updated = await Character.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  )
  res.json(updated)
})

export default router
