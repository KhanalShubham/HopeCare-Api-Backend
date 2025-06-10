const mongoose=require("mongoose")

const DonorSchema=new mongoose.Schema(
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
            default:"patient"
        },
        filepath:{
            type:String,
            default:""
        },
        
    }
)