const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const path = require('path');
const connectDB = require('./server/config/db');
const initPhase = require('./server/middleware/initializePhase');



const app = express();
const port = process.env.PORT;
//database connection

connectDB();
initPhase();
app.use(cookieParser());
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(bodyParser.json());

app.use(express.static('public'));
app.set('view engine','ejs');
app.set("views", path.join(__dirname, "views"));

// Serve Vite bundle
app.use(express.static(path.join(__dirname, "dist")));
app.use(express.static(__dirname));
app.use('/',require('./server/routes/route_pages'));
app.use('/api',require('./server/routes/api_routes'));


app.listen(port,()=>{

    console.log(`app listening to http://localhost:${port}`);

});


