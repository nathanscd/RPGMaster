import mongoose from 'mongoose'

const DiceSchema = new mongoose.Schema({
  nome: String,
  roll: String
})

const ItemSchema = new mongoose.Schema({
  id: String,
  nome: String,
  peso: Number,
  tipo: String,
  roll: String
})

const CharacterSchema = new mongoose.Schema({
  nome: String,
  recursos: Object,
  atributos: Object,
  defesa: Object,
  pericias: Object,
  habilidades: [DiceSchema],
  armas: [DiceSchema],
  inventario: [ItemSchema],
  inventarioMaxPeso: Number
})

export default mongoose.model('Character', CharacterSchema)
