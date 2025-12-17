import express from 'express'
import { db } from './server.js' 
import { v4 as uuidv4 } from 'uuid' 

const router = express.Router()

router.get('/', (req, res) => {
  const list = db.data.characters || []
  res.json(list)
})

router.get('/:id', (req, res) => {
  const list = db.data.characters || []
  const char = list.find(c => c._id === req.params.id)
  res.json(char)
})

router.put('/:id', async (req, res) => {
  const list = db.data.characters || []
  const index = list.findIndex(c => c._id === req.params.id)
  
  if (index !== -1) {
    const updatedChar = { 
      ...list[index], 
      ...req.body, 
      _id: req.params.id
    }
    
    db.data.characters[index] = updatedChar
    await db.write() 
    res.json(updatedChar)
  } else {
    res.status(404).send('Personagem não encontrado')
  }
})

router.post('/', async (req, res) => {
  const newChar = {
    _id: uuidv4(),
    ...req.body
  }
  db.data.characters.push(newChar)
  await db.write()
  res.json(newChar)
})

export default router