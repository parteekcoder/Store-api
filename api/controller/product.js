const Product=require('../models/Products')
const uuid=require('uuid')
const getProduct=async(req,res)=>{
    const {title,category,cost,_k,_o}=req.query
    let queryObject={};
    let sortObject={};
    if(title){
        queryObject={...queryObject,title:title}
    }
    if(category){
        queryObject={...queryObject,category:category};
    }
    if(cost){
        queryObject={...queryObject,cost:cost}
    }
    if(req.params?.id){
        queryObject={...queryObject,id:req.params.id}

    }
    if(_k){
        sortObject={...sortObject,[_k]: _o==='asc'?1:-1};
    }
    if(!req.sort){
        sortObject={};
    }
    if(!req.filter){
        queryObject={}
    }
    try {
        const result=await Product.find(queryObject).sort(sortObject);
        res.status(200).json({data:result});
    } catch (error) {
        res.status(500).json({status:false,data:null,message:"Some error occured"});
    }
    
}

const updateProduct=async(req,res)=>{
    if(!req.params?.id) res.status(400).json({error:"Unable to serve this route"});
    const updates={};
    let {category,title,cost}=req.body;
    if(category){
        updates={...updates,category:category};
    }
    if(title){
        updates={...updates,title:title};
    }
    if(cost){
        updates={...updates,cost:cost};
    }
    try {
       const result= await Product.findByIdAndUpdate({id:req.params.id},updates);

    } catch (error) {
        res.status(500).json({status:false,data:null,message:"Some error occured"});
        
    }
}

const addProduct=async(req,res)=>{
    let features={};
    let {category,title,cost}=req.body;
    if(category){
        features={...features,category:category};
    }
    if(title){
        features={...features,title:title};
    }
    if(cost){
        features={...features,cost:cost};
    }
    features={...features,id:uuid.v4()};
    const product=new Product(features);
    try {
       const result=await product.save();
       res.status(200).json({data:result})
    } catch (error) {
        console.log(error)
        res.status(500).json({status:false,data:null,message:"Some error occured"});
    }
}

const deleteProduct=async(req,res)=>{
    if(!req.params?.id) res.status(400).json({error:"Unable to serve this route"});
    try {
        await Product.deleteOne({id:req.params.id});
        res.status(200).json({status:true})
    } catch (error) {
        res.status(500).json({status:false,data:null,message:"Some error occured"});
    }
}

module.exports={deleteProduct,addProduct,updateProduct,getProduct}