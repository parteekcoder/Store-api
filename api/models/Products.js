const mongoose=require('mongoose');

const productSchema=new mongoose.Schema({
    id:{
        type:String,
    },
    category:{
        type:String
    },
    title:{
        type:String
    },
    cost:{
        type:Number
    }
},{timestamps:true})

module.exports= mongoose.model("products",productSchema);