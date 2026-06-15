//import express
import express from 'express'

//import cors
import cors from 'cors'

//import .env file
import 'dotenv/config'

//import mongodb connection
import connectdb from './config/mongodb.js'

//import cloudinary connection
import connectCloudinary from './config/cloudnary.js'
import adminRouter from './routes/adminRoute.js'
import doctorRouter from './routes/doctorRoute.js'
import userRouter from './routes/userRoute.js'

//??app config

const app = express()
const port = process.env.PORT || 5000

//connect to cloudinary
connectCloudinary()

//connect to db
connectdb()

//?middleware

app.use(express.json())
app.use(cors())

//?api endpoint
//localhost:4000/api/admin/add-doctor
app.use('/api/admin', adminRouter)
app.use('/api/doctor', doctorRouter)
app.use('/api/user', userRouter)

app.get('/', (req, res) => {
	res.send('API is working properly')
})


app.listen(port, () => console.log(`http://localhost:${port}`));