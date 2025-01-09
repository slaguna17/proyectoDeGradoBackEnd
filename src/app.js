const express = require("express");
const bcrypt = require("bcrypt");
const pg = require("pg");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const bodyParser = require('body-parser');
const cors = require('cors');
const router = require('./routes');

//Configs
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const pool = new pg.Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
})

app.use(express.json())
app.use(router);
app.use(cors());
app.use(bodyParser.json());


//Get all Users, GET
app.get('/users', async (req, res) => {
    const result = await pool.query('SELECT * FROM "user"');
    res.json(result.rows);
});

//Register POST
app.post("/register", async (req, res) => {
    try {
        const {username, email, password, full_name, date_of_birth, phone, status, last_access, avatar } = req.body;
        const hashedPassword = await bcrypt.hash(password,10);

        const result = await pool.query(
            'INSERT INTO "user" (username, email, password, full_name, date_of_birth, phone, status, last_access, avatar) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING * '
            ,[username, email, hashedPassword, full_name, date_of_birth, phone, status, last_access, avatar] 
        );
        
        res.status(201).json(result.rows[0]);
        console.log("Created User")
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error")
    }

})  

//Login POST
app.post("/login", async (req, res) => {
    try {
        const {email, password} = req.body;
 
        const result = await pool.query(
            'SELECT * FROM "user" WHERE email = $1'
            ,[email] 
        );

        //Check User credetials
        const user = result.rows[0]
        if (!user){
            return res.status(400).json({message: "Invalid Credentials"});
        }

        const isPassword = await bcrypt.compare(password, user.password)
        if (!isPassword){
            return res.status(400).json({message: "Invalid Credentials"});
        }
        //Check token
        const token = jwt.sign({userId: user.id}, process.env.SECRET_KEY,{
            expiresIn: "5m"
        });

        res.json({token});

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error")
    }

});

//Middleware
//Verify JWT Token
function verifyToken (req, res, next){
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

    if (!token){
        return res.status(401).json({message:"Missing token"})
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Token Verification failed:", error.message);
        res.status(401).send("Invalid Token")
    }

}

//PROTECTED ROUTE GET
app.get("/userinfo", verifyToken, (req, res) =>{
    res.json({user: req.user});
})

module.exports = app;