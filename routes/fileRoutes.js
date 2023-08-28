import { Router } from "express"
import { auth } from "../middleware/auth.middleware.js"
import fileController from "../controllers/fileController.js"
const router = new Router()

router.post("", auth, fileController.createDir)
router.post("/upload", auth, fileController.uploadFile)
router.post('/avatar', auth, fileController.uploadAvatar)
router.get('', auth, fileController.getFiles)
router.get('/download', auth, fileController.downloadFile)
router.get('/search', auth, fileController.searchFile)
router.delete('/', auth, fileController.deleteFile)
router.delete('/avatar', auth, fileController.deleteAvatar)

export default router
