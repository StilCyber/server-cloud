import express from "express"
import mongoose from "mongoose"
import config from "config"
import authRouter from "./routes/authRoures.js"
import { cors } from "./middleware/cors.middleware.js"
import fileRouter from "./routes/fileRoutes.js"
import fileUpload from "express-fileupload"

const app = express()
const PORT = config.get("serverPort")

app.use(cors)
app.use(express.json())
app.use(
  fileUpload({
    defCharset: "utf8",
    defParamCharset: "utf8",
  })
)

app.use("/api/auth", authRouter)
app.use("/api/files", fileRouter)

const start = async () => {
  try {
    await mongoose.connect(config.get("DB_URL"))
    app.listen(PORT, () => {
      console.log("Server started on port ", PORT)
    })
  } catch (e) {
    console.log(e)
  }
}

start()
