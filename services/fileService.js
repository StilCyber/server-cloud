import fs from 'fs'
import File from '../models/File.js'
import config from "config"
import path from 'path'



class FileService {

    createDir(file) {
        const __dirname = path.resolve()
        const filePath = path.resolve(__dirname, 'files', `${file.user}`, `${file.path}` )
        return new Promise(((resolve, reject) => {
            try {
                if (!fs.existsSync(filePath)) {
                    fs.mkdirSync(filePath)
                    return resolve({message: 'File was created'})
                } else {
                    return reject({message: "File already exist"})
                }
            } catch (e) {
                return reject({message: 'File error'})
            }
        }))
    }

    deleteFile(file) {
        const __dirname = path.resolve()
        const pathDelete = path.resolve(__dirname, 'files', `${file.user}`, `${file.path}` )
        if (file.type === 'dir') {
            fs.rmdirSync(pathDelete)
        } else {
            fs.unlinkSync(pathDelete)
        }
    }

  
}

export default new FileService()