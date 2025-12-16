import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'

const app = express()

app.use(cors())
app.use(express.json())

mongoose
  .connect('mongodb://127.0.0.1:27017/rpgmaster')
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error(err))

app.get('/health', (req, res) => {
  res.json({ ok: true })
})

app.listen(3001, () => {
  console.log('Servidor rodando na porta 3001')
})
