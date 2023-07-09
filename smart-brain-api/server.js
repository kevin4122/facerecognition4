import express from "express"
// import bodyParser from "body-parser"
// import Clarifai from "clarifai"
import bcrypt from "bcrypt-nodejs"
import cors from "cors"
import knex from "knex"
import { TYPES } from "tedious"
import handleRegister from "./controllers/register.js"
import handleSignin from "./controllers/signin.js"
import handleProfileGet from "./controllers/profile.js"
import handleImage from "./controllers/image.js"

const db = knex({
  client: "pg",
  version: "7.2",
  connection: {
    host: "127.0.0.1",
    port: 5432,
    user: "postgres",
    password: "test",
    database: "test",
  },
})

console.log("New ******************************")

const app = express()

app.use(express.json())
// app.use(cors)

// This is equivalent to app.use(cors) because app.use(cors) doesn't work in my setup due to Access-Control
app.use((request, response, next) => {
  response.setHeader("Access-Control-Allow-Origin", "*")
  response.setHeader("Access-Control-Allow-Credentials", "true")
  response.setHeader(
    "Access-Control-Allow-Methods",
    "GET,HEAD,OPTIONS,POST,PUT"
  )
  response.setHeader(
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
  )
  next()
})

// const database = {
//   users: [
//     {
//       id: "123",
//       name: "John",
//       email: "john@gmail.com",
//       password: "cookies",
//       entries: 0,
//       joined: new Date(),
//     },
//     {
//       id: "124",
//       name: "Sally",
//       email: "sally@gmail.com",
//       password: "bananas",
//       entries: 0,
//       joined: new Date(),
//     },
//   ],
// }

app.get("/", (req, res) => {
  // res.send(database.users)
})

app.post("/signin", (req, res) => handleSignin(req, res, db, bcrypt))

app.post("/register", (req, res) => handleRegister(req, res, db, bcrypt))

app.get("/profile/:id", (req, res) => handleProfileGet(req, res, db))

app.put("/image", (req, res) => handleImage(req, res, db))

app.listen(3000, () => {
  console.log("app is running on port 3000")
})

/*

/ root  --> res = this is working
/signin --> POST = success/fail
/register --> POST = user
/profile/:userId --> GET = user
/image --> PUT --> user

*/
