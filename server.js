import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'

// --- Configuração ---
const app = express()
const PORT = process.env.PORT || 5000 // Usa a porta do ambiente ou 5000 como fallback
const MONGODB_URI = 'mongodb://localhost:27017/rpg'

// --- Middlewares ---
app.use(cors()) // Habilita o CORS para requisições de outras origens
app.use(express.json()) // Habilita o parsing de JSON no corpo das requisições

// --- Conexão com o MongoDB ---
mongoose.connect(MONGODB_URI) // As opções useNewUrlParser e useUnifiedTopology foram removidas.
  .then(() => console.log('✅ Conexão com MongoDB estabelecida com sucesso!'))
  .catch(err => {
    console.error('❌ Erro na conexão com o MongoDB:', err.message)
    // Em um ambiente de produção, você pode querer sair do processo aqui:
    // process.exit(1); 
  })

// --- Schema e Modelo do Mongoose ---
const characterSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // Adicionado `unique` e `required`
  nome: String,
  classe: String,
  origem: String,
  atributos: Object,
  recursos: Object,
  defesa: Object,
  pericias: Object,
  inventario: Array,
  armas: Array,
  inventarioMaxPeso: Number
}, {
  timestamps: true // Adiciona automaticamente campos `createdAt` e `updatedAt`
})

const Character = mongoose.model('Character', characterSchema)

// --- Rotas da API ---

/**
 * Rota GET /characters
 * Retorna todos os personagens.
 */
app.get('/characters', async (req, res) => {
  try {
    const characters = await Character.find()
    res.json(characters)
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar personagens', error: error.message })
  }
})

/**
 * Rota GET /characters/:id
 * Retorna um personagem específico pelo ID.
 */
app.get('/characters/:id', async (req, res) => {
  try {
    const character = await Character.findOne({ id: req.params.id })
    if (!character) {
      return res.status(404).json({ message: 'Personagem não encontrado' })
    }
    res.json(character)
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar personagem', error: error.message })
  }
})

/**
 * Rota PUT /characters/:id
 * Atualiza um personagem específico pelo ID.
 */
app.put('/characters/:id', async (req, res) => {
  try {
    const updated = await Character.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true } // `new: true` retorna o documento atualizado; `runValidators: true` garante a validação do Schema.
    )

    if (!updated) {
      return res.status(404).json({ message: 'Personagem não encontrado para atualização' })
    }
    
    res.json(updated)
  } catch (error) {
    res.status(400).json({ message: 'Erro ao atualizar personagem', error: error.message })
  }
})

// --- Inicialização do Servidor ---
app.listen(PORT, () => {
  console.log(`📡 Servidor rodando em http://localhost:${PORT}`)
})