const Donor=require("../model/donor")
export registerDonor=async(req, res)=>{
    const {username, email, password}=req.body
    try{
        const exisitngUser=await Donor.findOne(
            {
                $or:[{username:username}, {email:email}]
            }
        )
        if(exisitngUser){
            return res.status(400).json({message:"User already exists"})
        }
        const newDonor=new Donor({
            username,
            email,
            password
        })
        await newDonor.save()
        res.status(201).json({message:"User registered successfully"})
    }
    catch(error){
        console.log(error)
        res.status(500).json({message:"Something went wrong"})
    }
}