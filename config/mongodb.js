
import mongoose from 'mongoose'

const connectdb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL)
    console.log("Connected to MongoDB")
  } catch (err) {
    console.error("MongoDB Connection Failed:", err.message)
  }
}

export default connectdb
