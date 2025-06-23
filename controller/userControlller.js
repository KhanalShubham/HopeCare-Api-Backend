const User = require("../model/user")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
exports.registerUser = async (req, res) => {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
        return res.status(400).json({ message: "Please provide all required fields" })
    }
    try {
        const exisitngUser = await User.findOne(
            {
                $or: [{ username: username }, { email: email }]
            }
        )
        if (exisitngUser) {
            return res.status(400).json({ message: "User already exists" })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        })
        await newUser.save()
        res.status(201).json({ message: "User registered successfully" })
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something went wrong" })
    }

}
exports.loginUser = async (req, res) => {
    const { email, password } = req.body
    // Check if email and password are provided
    // If not, return a 400 Bad Request response
    // If email or password is missing, return a 400 Bad Request response
    // If user is not found, return a 404 Not Found response
    // If user is found, return a 200 OK response with user data
    // If an error occurs, return a 500 Internal Server Error response
    // Check if email and password are provided
    // If not, return a 400 Bad Request response


    if (!email || !password) {
        return res.status(400).json({ "succes": false, "message": "Please provide email and password" })
    }
    try {
        const getUser = await User.findOne(
            {
                email: email
            }
        )
        if (!getUser) {
            return res.status(404).json({ "succes": false, "message": "User not found" })
        }
        const isPasswordValid = await bcrypt.compare(password, getUser.password)
        if (!isPasswordValid) {
            return res.status(400).json({ "succes": false, "message": "Invalid password" })
        }

        const payload = {
            "_id": getUser._id,
            "email": getUser.email,
            "username": getUser.username
        }
        const token = jwt.sign(payload, process.env.SECRET, { expiresIn: '7d' })
        console.log(getUser.role)
        return res.status(200).json(
            {
                "success": true,
                "message": "Login successfull",
                "data": {
                    "_id": getUser._id,
                    "email": getUser.email,
                    "username": getUser.username,
                    "filepath": getUser.filepath
                },
                "token": token,

            }
        )
        // If password is valid, return user data (excluding password)
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ "succes": false, "message": "Something went wrong" })
    }
}