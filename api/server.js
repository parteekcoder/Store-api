const express=require('express');
const cors=require('cors');
const mongoose=require('mongoose')
const path=require('path')
const fs=require('fs');
const { getProduct, addProduct, updateProduct, deleteProduct } = require('./controller/product');
const { getUser, addUser, updateUser, deleteUser} = require('./controller/user');
const Users = require('./models/Users');
const Products = require('./models/Products');
const app=express();
const admin=express();
const MAX_LOG_SIZE = 3000000; // 3MB
const routeConfigure = JSON.parse(fs.readFileSync('./routes.config.json', 'utf8'));
const truffleConfigure = JSON.parse(fs.readFileSync('./truffle.config.json', 'utf8'));
const readLastLines = require('read-last-lines');
const controllerObject={
    "usersget":getUser,
    "userspost":addUser,
    "usersput":updateUser,
    "usersdelete":deleteUser,
    "productsget":getProduct,
    "productspost":addProduct,
    "productsput":updateProduct,
    "productsdelete":deleteProduct
}


app.use(express.urlencoded({extended:true}));
app.use(express.json())
if(truffleConfigure.cors) app.use(cors());

app.use((req, res, next) => {
    const path=req.url.split('/')[1];
    const log = `[${new Date().toISOString()}] ${req.url} - ${req.method}`;
    if(path==='users' || path==='products') {

        fs.appendFile(path==="users" ?'userRequests.log':'productRequests.log', log + '\n',(err) => { 
            if (err) console.error(err);
        fs.stat('userRequests.log', (err, stats) => {
            if (err) console.error(err);
            if (stats.size > MAX_LOG_SIZE) {
                fs.writeFile('userRequests.log', '', (err) => {
                    if (err) console.error(err);
                    console.log('Log file cleaned');
                });
            }
        });
        fs.stat('productRequests.log', (err, stats) => {
            if (err) console.error(err);
            if (stats.size > MAX_LOG_SIZE) {
                fs.writeFile('productRequests.log', '', (err) => {
                    if (err) console.error(err);
                    console.log('Log file cleaned');
                });
            }
        });
    }); 
}
    next();
});

routeConfigure.forEach((route,i) => {
    route.options.methods.forEach((method,j)=>{
        
        app[method](route.path, (req,res,next)=>{
            req.sort= route.options.sort;
            req.filter=route.options.filter
            next();
        },controllerObject[route.path.split('/')[1]+method]);
    })
});
admin.get('/dashboard/:file',(req,res)=>{
    res.sendFile(path.join(__dirname+"/.."+`/admin/${req.params.file}`))
})
app.get('/logs/:path',(req,res)=>{
    if(req.params.path==='users'){
        
        res.sendFile(path.join(__dirname+'/'+'userRequests.log'),(err)=>{
            if(err){
             console.log(err)
            }
        })
        
    }
    else if(req.params.path==='products'){
        res.sendFile(path.join(__dirname+'/productRequests.log'));
    }
    else
    res.status(404).json({data:"invalid route"});
})

app.get('/document/:path',async(req,res)=>{
    if(req.params.path==="users"){
        const count=await Users.countDocuments();
        res.status(200).send({count}); 
    }
    else if(req.params.path==="products"){
        const count=await Products.countDocuments();
        res.status(200).send({count});    
    }
    else{
        res.status(404).json({data:"invalid route"});
        
    }
    
})

app.get('/active/:path',(req,res)=>{
    if(req.params.path==="users"){
        readLastLines.read('userRequests.log', 1)
	    .then((lines) =>  res.status(200).json(lines.slice(1,11)));
        
    }else if(req.params.path==="products"){
        readLastLines.read('productRequests.log', 1)
	    .then((lines) => {
            res.status(200).json(lines.slice(1,11))
        });
        
    }else{
        res.status(404).json({data:"invalid route"});

    }
})
app.get('/server/port',(req,res)=>{
    res.status(200).json({port:truffleConfigure.port})
})
app.get('/*',(req,res)=>{
    res.status(404).json({data:"invalid route"})
})
const connectDb=()=>{
    try {
        
         mongoose.connect(`mongodb://${truffleConfigure.store.mongoDb.host}:27017`,{
            useNewUrlParser: true
        })
    } catch (error) {
        console.log(error)
    }
}

connectDb();
app.listen(truffleConfigure.port,()=>{
    console.log(`server started at PORT ${truffleConfigure.port}...`)
})

admin.listen(truffleConfigure.port+2,()=>{
    console.log('admin server started')
})