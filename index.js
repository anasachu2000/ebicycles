const env = require('dotenv')
env.config();


//=========================== DATA BASE CONNECTING SECTION START ===========================//
const mongoose = require('mongoose');
mongoose.connect(process.env.mongo);


const express = require('express');
const app = express();
const nocache = require('nocache');
const session = require('express-session');
const path = require('path');
const cronjon = require('./configuration/cronJob')


//=========================== PUBLIC FILES CONNECTING SECTION START ===========================//

const publicPath = path.join(__dirname,'public');
app.use(express.static(publicPath));



app.use(session({
    secret: process.env.sessionSecret,
    resave: false,
    saveUninitialized: true
  }));


app.use(nocache());


app.use(express.urlencoded({extended:true}));
app.use(express.json());


//=========================== IF HAVE ANY ERROR IN GET AND POST METHODE MORGAN IS SHOWING THAT ERROR  ===========================//

const morgan = require('morgan');
// app.use(morgan('tiny'));


//=========================== USER ROUTE SECTION ===========================//

const userRoutes  = require('./routes/userRoutes')
app.use('/',userRoutes);



//=========================== ADMIN ROUTE SECTION ===========================//

const adminRoutes = require('./routes/adminRoutes')
app.use('/admin',adminRoutes);



app.listen(process.env.port,()=>{
    console.log('server is running')
});