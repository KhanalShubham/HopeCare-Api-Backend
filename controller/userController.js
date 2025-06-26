const User=require("../model/user")
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")


// Create user (register)
exports.registerUser=async(req, res) =>{
    const { name,email, disease, description, contact, password } = req.body;
    try {
        const existingEmail = await User.findOne( {
            email: email
        });
        if (existingEmail) {
            return res.status(400).json({ success: false, message: "User with this email already exists" });
        }

        const existingContact = await User.findOne( {
            contact: contact
        });
        if (existingContact) {
            return res.status(400).json({ success: false, message: "User with this contact already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            disease,
            description,
            contact,
            password: hashedPassword // store hashed password
        });

        await newUser.save();
        res.status(201).json({ success: true, message: "User registered", data: newUser });

    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: "Server error" });
    }
}

// Login user
exports.loginUser=async(req, res) =>{
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email:email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: "user" },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                contact: user.contact,
                email:user.email
            }
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: "Server error" });
    }
}


// Get all approved users (for donor dashboard)
exports.getApprovedUser=async(req, res)=> {
    const users = await find({ isApproved: true });
    res.status(200).json({ success: true, data: users });
}

// Admin: Approve user
exports.approveUser=async(req, res) =>{
    const user = await findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    user.isApproved = true;
    await user.save();
    res.json({ success: true, message: "User approved" });
}

// Admin: Delete user
exports.deleteUser=async(req, res) =>{
    await findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User deleted" });
}
