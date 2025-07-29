const User=require("../model/user")
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")
const { OAuth2Client } = require('google-auth-library');
const fetch = require('node-fetch');
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';
const client = new OAuth2Client(GOOGLE_CLIENT_ID);


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
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    console.log("Backend: Login attempt for email:", email); // Added
    try {
        const user = await User.findOne({ email: email });
        console.log("Backend: User found (or null):", user); // Added

        if (!user) {
            console.log("Backend: User not found for email:", email); // Added
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log("Backend: Password match result:", isMatch); // Added
        if (!isMatch) {
            console.log("Backend: Invalid credentials for user:", email); // Added
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        // --- FIX: Include user.name/user.email in JWT payload for display on backend ---
        const token = jwt.sign(
            {
                id: user._id,
                role: "user",
                name: user.name,
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );
        console.log("Backend: Generated JWT token (first few chars):", token.substring(0, 50) + "..."); // Added, for security don't log full token

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                contact: user.contact,
                email: user.email
            }
        });
        console.log("Backend: User data sent in response:", {
            id: user._id,
            name: user.name,
            contact: user.contact,
            email: user.email
        }); // Added

    } catch (error) {
        console.error("Backend: Server error during login:", error); // Changed to error, Added
        res.status(500).json({ success: false, message: "Server error" });
    }
};


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
exports.getMe = async (req, res) => {
    try {
        // req.user.id is added by the authorizeToken middleware
        const user = await User.findById(req.user.id).select('-password'); // '-password' excludes the password from the result

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, data: user });

    } catch (error) {
        console.error("Error in getMe controller:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.updateMe = async (req, res) => {
    // Add photoUrl to destructure
    const { name, description, contact, disease, photoUrl } = req.body;

    try {
        // Add photoUrl to update object
        const updateData = { name, description, contact, disease };
        if (photoUrl) updateData.photoUrl = photoUrl;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, message: 'Profile updated successfully!', data: user });

    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(400).json({ success: false, message: `An account with this ${field} already exists.` });
        }
        console.error("Error updating profile:", error);
        res.status(500).json({ success: false, message: 'Server error while updating profile' });
    }
};
// ✅ NEW FUNCTION: Change User Password
exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        // Find user and get their password hash
        const user = await User.findById(req.user.id).select('+password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if the current password is correct
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Incorrect current password' });
        }

        // Hash the new password and save it
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({ success: true, message: 'Password changed successfully' });

    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({ success: false, message: 'Server error while changing password' });
    }
};

exports.socialLogin = async (req, res) => {
    const { provider, token } = req.body;
    let email, name;
    try {
        if (provider === 'google') {
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            email = payload.email;
            name = payload.name;
        } else if (provider === 'facebook') {
            const fbRes = await fetch(`https://graph.facebook.com/me?fields=id,name,email&access_token=${token}`);
            const fbData = await fbRes.json();
            email = fbData.email;
            name = fbData.name;
        } else {
            return res.status(400).json({ error: 'Unsupported provider' });
        }
        let user = await User.findOne({ email });
        if (!user) {
            user = new User({ email, name });
            await user.save();
        }
        const appToken = jwt.sign({ id: user._id, name: user.name, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token: appToken, user });
    } catch (err) {
        res.status(401).json({ error: 'Invalid social login' });
    }
};
