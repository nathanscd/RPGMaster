import mongoose from 'mongoose'

export function connectDB() {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB conectado'))
    .catch(err => {
      console.error(err)
      process.exit(1)
    })
}
