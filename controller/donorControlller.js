const Donor=require("../model/user")
exports.registerUser=async(req, res)=>{
    const {username, email, password, phone}=req.body
    try{
        const exisitngUser=await Donor.findOne(
            {
                $or:[{username:username}, {email:email}]
            }
        )
        if(exisitngUser){
            return res.status(400).json({message:"User already exists"})
        }
        const newUser=new User({
            username,
            email,
            password,
            phone,
            role,
        })
        await newUser.save()
        res.status(201).json({message:"User registered successfully"})
    }
    catch(error){
        console.log(error)
        res.status(500).json({message:"Something went wrong"})
    }

}
exports.loginUser=async(req, res)=>{
    const {email, password}=req.body
    
    if(!email || !password){
        return res.status(400).json({"succes":false,"message":"Please provide email and password"})
    }
    try{
        const getUser=await User.findOne(
            {
                email:email
            }
        )
        if(!getUser){
            return res.status(404).json({"succes":false,"message":"User not found"})
        }
    }
    catch(error){
        console.log(error)
        return res.status(500).json({"succes":false,"message":"Something went wrong"})
    }
}