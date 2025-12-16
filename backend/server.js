import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import characterRoutes from './routes/characters.js'

const app = express()

app.use(cors())
app.use(express.json())

mongoose
  .connect('mongodb://127.0.0.1:27017/rpgmaster')
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error(err))

// Rota de saúde
app.get('/health', (req, res) => {
  res.json({ ok: true })
})

// Rota de personagens
app.use('/api/characters', characterRoutes)

const port = 3001
app.listen(port, () => {
  console.log('Servidor rodando na porta', port)
})
