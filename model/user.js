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
            unique:true
        },
        role:{
            type:String,
            default:"patient",
            enum:["patient", "donor", "admin"]
        },
        phone:{
            type:String,
            required:true,
            unique:true
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