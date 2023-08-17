import express from "express"
import mongoose from "mongoose"
import config from "config"
import authRouter from "./routes/authRoures.js"

const app = express()
const PORT = config.get('serverPort')

app.use(express.json())

app.use("/api/auth", authRouter)

const start = async () => {
    try {
        await mongoose.connect(config.get("DB_URL"))
        app.listen(PORT, () => {
            console.log("Server started on port ", PORT )
        })
    } catch (e) {
        console.log(e)
    }
}

start()