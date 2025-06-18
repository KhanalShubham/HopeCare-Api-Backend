const mongoose=require("mongoose")

const UserSchema=new mongoose.Schema(
    {
        username:{
            type:String,
            required:true,
        },
        email:{
            type:String,
            required: true, 
            unique:true
        },
        password:{
            type:String,
            required: true,
        },
        role:{
            type:String,
            default:"donor",
            enum:["patient", "donor", "admin"]
        },
        filepath:{
            type:String,
            default:""
        },
    
        
    }
)
module.exports=mongoose.model(
    "User", UserSchema
)