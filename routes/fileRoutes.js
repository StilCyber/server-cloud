import { Router } from "express"
import { auth } from "../middleware/auth.middleware.js"
import fileController from "../controllers/fileController.js"
const router = new Router()

router.post("", auth, fileController.createDir)
router.post("/upload", auth, fileController.uploadFile)
router.get('', auth, fileController.getFiles)
router.get('/download', auth, fileController.downloadFile)
router.delete('/', auth, fileController.deleteFile)

export default router
