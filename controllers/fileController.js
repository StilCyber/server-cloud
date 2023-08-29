import fileService from "../services/fileService.js";
import User from "../models/User.js";
import File from "../models/File.js";
import config from "config";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from 'uuid'



class FileController {
  async createDir(req, res) {
    try {
      const __dirname = path.resolve();
      const { name, type, parent } = req.body;
      const file = new File({ name, type, parent, user: req.user.id });
      const parentFile = await File.findOne({ _id: parent });
      if (!parentFile) {
        file.path = name;
        await fileService.createDir(file);
      } else {
        file.path = path.join(`${parentFile.path}`, `${file.name}`)
        await fileService.createDir(file);
        parentFile.childs.push(file._id);
        await parentFile.save();
      }
      await file.save();
      return res.json(file);
    } catch (e) {
      console.log(e);
      return res.status(400).json(e);
    }
  }

  async getFiles(req, res) {
    try {
      const { sort } = req.query;
      let files;
      switch (sort) {
        case "name":
          files = await File.find({
            user: req.user.id,
            parent: req.query.parent,
          }).sort({ name: 1 });
          break;
        case "type":
          files = await File.find({
            user: req.user.id,
            parent: req.query.parent,
          }).sort({ type: 1 });
          break;
        case "date":
          files = await File.find({
            user: req.user.id,
            parent: req.query.parent,
          }).sort({ date: 1 });
          break;
        default:
          files = await File.find({
            user: req.user.id,
            parent: req.query.parent,
          });
          break;
      }
      return res.json(files);
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Can not get files" });
    }
  }

  async uploadFile(req, res) {
    const __dirname = path.resolve()
    try {
      
      const file = req.files.file;

      const parent = await File.findOne({
        user: req.user.id,
        _id: req.body.parent,
      });

     
      const user = await User.findOne({ _id: req.user.id });

      if (user.usedSpace + file.size > user.diskSpace) {
        return res.status(400).json({ message: "There no space on the disk" });
      }
      user.usedSpace = user.usedSpace + file.size;


      
      let pathFile;
      if (parent) {
        pathFile = path.resolve(
          __dirname,
          "files",
          `${user._id}`,
          `${parent.path}`,
          `${file.name}`
        );
        console.log(pathFile)
      } else {
        pathFile = path.resolve(
          __dirname,
          "files",
          `${user._id}`,
          `${file.name}`
        );
      }

      if (fs.existsSync(pathFile)) {
        return res.status(400).json({ message: "File already exist" });
      }
      file.mv(pathFile);

      const type = file.name.split(".").pop();
      let filePath = file.name;
      if (parent) {
        filePath = path.resolve(__dirname, 'files', `${user._id}`,`${parent.path}`, `${file.name}`);
      }
      const dbFile = new File({
        name: file.name,
        type,
        size: file.size,
        path: filePath,
        parent: parent?._id,
        user: user._id,
      });
      console.log(filePath)
      await dbFile.save();
      await user.save();
      res.json(dbFile);
    } catch (e) {
      console.log(e);
      return res.status(500).json({ mesage: "Upload error" });
    }
  }

  async downloadFile(req, res) {
    const __dirname = path.resolve()
    try {
      const file = await File.findOne({ _id: req.query.id, user: req.user.id });
      const pathDownload = path.resolve(__dirname, 'files', `${req.user.id}`, `${file.path}`)
      if (fs.existsSync(pathDownload)) {
        return res.download(pathDownload, file.name);
      }
      return res.status(400).json({ message: "Download error" });
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Download error" });
    }
  }

  async deleteFile(req, res) {
    try {
      const file = await File.findOne({ _id: req.query.id, user: req.user.id });
      if (!file) {
        return res.status(400).json({ message: "file not found" });
      }
      fileService.deleteFile(file)
      await File.deleteOne({ _id: file._id });
      return res.json({ message: "File was deleted" });
    } catch (e) {
      console.log(e);
      return res.status(400).json({ message: "Dir is not empty" });
    }
  }

  async searchFile(req, res) {
    try {
        const searchName = req.query.search
        let files = await File.find({user: req.user.id})
        files = files.filter(file => file.name.includes(searchName))
        return res.json(files)
    } catch (e) {
        console.log(e)
        return res.status(400).json({message: 'Search error'})
    }
}

  async uploadAvatar(req, res) {
    try {
      const __dirname = path.resolve()
      const file = req.files.file
      console.log(file)
      const user = await User.findById(req.user.id)
      const avatarName = uuidv4() + '.jpg'
      file.mv(path.resolve(__dirname, 'static', avatarName))
      user.avatar = avatarName
      await user.save()
      return res.json(user)
      
    } catch (e) {
        console.log(e)
        return res.status(400).json({message: 'Upload avatar error'})
    }
  }

  async deleteAvatar(req, res) {
    try {
      const __dirname = path.resolve()
      const user = await User.findById(req.user.id)  
      fs.unlinkSync(path.resolve(__dirname, 'static', user.avatar))
      user.avatar = null   
      await user.save()
      return res.json(user)
      
    } catch (e) {
        console.log(e)
        return res.status(400).json({message: 'Delete avatar error'})
    }
  }
}

export default new FileController();
