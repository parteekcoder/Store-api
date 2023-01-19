const mongoose=require('mongoose');

const userSchema=new mongoose.Schema({
    id:{
        type:String
    },
    name:{
        type:String,
        required:true
    },
    age:{
        type:String,

    }
},{timestamps:true})

module.exports= mongoose.model("users",userSchema);