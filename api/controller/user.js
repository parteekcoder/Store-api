const User = require('../models/Users');
const uuid = require('uuid')

const getUser = async (req, res) => {
    let filter = {};
    let sort;
    if (req.params && req.params.id) {
        filter = { id: req.params.id }
    }
    
    if (req.query) {
        if (req.query.age)
            filter = { ...filter, age: req.query.age };
        if (req.query.name)
            filter = { ...filter, name: req.query.name };
        if (req.query._k){
            sort = { [req.query._k]: req.query._o === 'asc'?1:-1 };
        }
    }
   
    if(!req.filter){
        filter={};
    }
    if(!req.sort){
        sort={};
    }

    try {
        const result = await User.find(filter).sort(sort);
        res.status(200).json({ data: result })
    } catch (error) {
        res.status(500).json({ status: false, data: null, message: "Some error occured" });

    }
}
const addUser = async (req, res) => {
    const newuser=new User({
        id:uuid.v4(),
        name:req.body?.name,
        age:req.body?.age
    })
    
    try {
        await newuser.save();
        res.status(200).json({ data: newuser })
    } catch (error) {
        res.status(500).json({ status: false, data: null, message: "Some error occured" });
    }
}

const updateUser = async (req, res) => {
    if (!req.params?.id) res.status(404).json({ error: "Unable to serve this route" });
    try {
        const user= await User.find({id:req.params.id})
            try {
                
                
                const updateduser= await User.updateOne(user._id, {
                name: req.body?.name ? user.name : req.body.name,
                age: req.body?.age ? user.age : req.body.age
            },{new:true});
            res.status(200).json({data:updateduser})
            } catch (error) {
                console.log(error)
                res.status(500).json({ status: false, data: null, message: "Some error occured" });
                
            }
        } catch (error) {
        console.log(error)
        
        res.status(500).json({ status: false, data: null, message: "Some error occured" });
    }
}

const deleteUser = async (req, res) => {
    if (!req.params?.id) res.status(400).json({ error: "Unable to serve this route" });
    try {
        await User.deleteOne({ id: req.params.id })
        res.status(200).json({ status: true })
    } catch (error) {

        res.status(500).json({ status: false, data: null, message: "Some error occured" });
    }
}

module.exports = { getUser, updateUser, deleteUser, addUser };