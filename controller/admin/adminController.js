
const User = require("../../model/user")
// 1. get users

exports.getAllUsers = async (req, res) =>{
    try {
        const users = await  User.find({}).select('-password')
        return res.status(200).json({
            success: true,
            message:"Users Fetched",
            data: users
        })

    } catch (e) {
        return res.status(500).json({
            success: false,
            message:"server error",
        })


    }
}

// 2. get user by id
exports.getUserById=async (req, res)=>{
    const userId=req.params.id;
    try{
        const user=await User.findById(userId).select('-password');
        if(!user){
            return res.status(404).json(
                {
                    success:false,
                    message:"user not found"
                }
            );
        }
        return res.status(200).json({
            success:true,
            message:"User fetched successfully",
            data:user
        });
    }catch (err){
        return  res.status(500).json(
            {"success":false, "message":"Server error"}
        )

    }
}
// 3. add user
exports.createUser=async(req, res)=>{
    const {username, email, password, role}=req.body;
    if(!username || !email || !password || !role){
        return res.status(400).json(
            {"success":false,
            "message":"Missing feild"
            }
        )
    }
    try{
        const existingUser= await User.findOne(
            {
                $or:[{username: username},{email: email}]
            }
        )
        if(existingUser){
            return  res.status(400).json({"success":"false", "message":"user exists"})
        }
        //hashing the password
        const hashedPassword=await bcrypt.hash(
            password,10
        )
        const newUser=new User(
            {
                username,
                email,
                password:hashedPassword

            }
        )
        await newUser.save()
        return  res.status(201).json({"success":true, "message":"User Registered"})
    }
    catch (e){
        return  res.status(500).json(
            {"success":false, "message":"Server error"}
        )
    }
}
// 4. delete
exports.deleteOneUser = async (req, res) => {
    try{
        const _id = req.params.id
        const user = await User.deleteOne(
            {
                "_id": _id
            }
        )
        return res.status(200).json(
            {"success": true, "message": "User deleted"}
        )
    }catch(err){
        return res.status(500).json(
            {"succss": false, "message": "Server Error"}
        )
    }
}
// 5. update -> not for password
exports.updateUser=async (req, res)=>{
    const userId=re.params.id;
    const {username, email, role}=req.body
    try{
        const user=await User.findById(userId);
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found"
            });
        }
        if(username) user.username=username;
        if(email) user.email=email;
        if(role) user.role=role;

        await user.save();

        return res.status(200).json({
            success:true,
            message:"User Updated Successfully",
            data:{
                _id:user._id,
                username:user.username,
                email:user.email,
                role:user.role
            }
        });
    }
    catch (err){
        return res.status(500).json({
            success:false,
            message:"server error"
        });
    }
}