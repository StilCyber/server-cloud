import { Router } from "express"
import User from "../models/User.js"
import bcrypt from 'bcryptjs'
import { check, validationResult } from "express-validator"
import jwt from 'jsonwebtoken'
import config from "config"

const router = new Router()

router.post('/registration', [
    check("email", "Uncorrect email").isEmail(),
    check("password", "Password must be longer than 5 and shorter than 12").isLength({min: 5, max: 12})
], async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({message: "Uncorrect request", errors})
        }
        const {email, password} = req.body
        const candidate = await User.findOne({email})
        if (candidate) {
            res.status(400).json({message: `User with email ${email} already exist`})
        } else {
            const hashPassword = await bcrypt.hash(password, 5)
            const user = new User({email, password: hashPassword})
            await user.save()
            console.log(email, password)
            return res.json({message: "User was created"})
        }
   
    } catch (e) {
        console.log(e)
        res.send({message: "Server error"})
    }
})


router.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body
        const user = await User.findOne({email})
        if (!user) {
            return res.status(404).json({message: "User not found"})
        }
        const isPassValid = bcrypt.compareSync(password, user.password)
        if (!isPassValid) {
            return res.status(400).json({message: "Invalid password"})
        }
        const token = jwt.sign({id: user.id}, config.get("secretKey"), { expiresIn: '1h' })
        return res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                diskSpace: user.diskSpace,
                usedSpace: user.usedSpace,
                avatar: user.avatar
            }
        })
   
    } catch (e) {
        console.log(e)
        res.send({message: "Server error"})
    }
})


export default router