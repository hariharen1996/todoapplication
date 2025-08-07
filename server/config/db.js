const mongoose = require('mongoose')
require('dotenv').config()

const dbConnect = async () => {
    try{
        await mongoose.connect(process.env.MONGODB_URI,{
            useNewUrlParser: true,
            useUnifiedTopology: true 
        })
        console.log('Mongodb connected')
    }catch(err){
        console.error('mongodb connection error',err)
        process.exit(1)
    }
}

module.exports = dbConnect
