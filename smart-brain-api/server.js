import express from "express"
// import bodyParser from "body-parser"
import bcrypt from "bcrypt-nodejs"
import cors from "cors"
import knex from "knex"
import { TYPES } from "tedious"

// const config = {
//   user: "test3",
//   password: "test3",
//   server: "localhost",
//   database: "127.0.0.1",
//   pool: {
//     max: 10,
//     min: 0,
//     idleTimeoutMillis: 30000,
//   },
// }

// const mssql = knex({
//   client: "mssql",
//   connection: {
//     options: {
//       mapBinding: (value) => {
//         // bind all strings to varchar instead of nvarchar
//         if (typeof value === "string") {
//           return {
//             type: TYPES.VarChar,
//             value,
//           }
//         }

//         // allow devs to pass tedious type at query time
//         if (value != null && value.type) {
//           return {
//             type: value.type,
//             value: value.value,
//           }
//         }

//         // undefined is returned; falling back to default mapping function
//       },
//     },
//   },
// })

// mssql
//   .select("*")
//   .from("users")
//   .then((data) => console.log(data))

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

// db.select("*")
//   .from("users")
//   .then((data) => console.log(data))

console.log("New ********************************************")
// console.log(
// db.select("*")
//   .from("dbo.users")
//   .then((data) => {
//     console.log(data)
//   })
//   .catch((err) => console.log(err))
// // )
// console.log("after ******************************")
// db.select("*")
//   .from("dbo.users")
//   .then((data) => console.log(data))
// .then((data) => console.log(data))

const app = express()

app.use(express.json())
// app.use(cors)

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

const database = {
  users: [
    {
      id: "123",
      name: "John",
      email: "john@gmail.com",
      password: "cookies",
      entries: 0,
      joined: new Date(),
    },
    {
      id: "124",
      name: "Sally",
      email: "sally@gmail.com",
      password: "bananas",
      entries: 0,
      joined: new Date(),
    },
  ],
}

app.get("/", (req, res) => {
  res.send(database.users)
})

app.post("/signin", (req, res) => {
  // bcrypt.compare(
  //   "bacon",
  //   "$2a$10$7o75xVsOyJ7PpNS8lcgNJuISp/I9iEfmIVtOjAWN2U9IaQHInF9GO",
  //   function (err, res) {
  //     console.log("first guess", res)
  //   }
  // )

  if (
    req.body.email === database.users[0].email &&
    req.body.password === database.users[0].password
  ) {
    // res.json("success")
    res.json(database.users[0])
  } else {
    res.status(400).json("error logging in")
  }
})

app.post("/register", (req, res) => {
  const { email, name, password } = req.body

  const hash = bcrypt.hashSync(password)

  db.transaction((trx) => {
    trx
      .insert({
        hash: hash,
        email: email,
      })
      .into("login")
      .returning("email")
      .then((loginemail) => {
        return trx("users")
          .returning("*")
          .insert({
            email: loginemail[0].email,
            name: name,
            password: hash,
            joined: new Date(),
          })
          .then((user) => {
            res.json(user[0])
          })
          .then(trx.commit)
          .catch(trx.rollback)
      })
  }).catch((err) => res.status(400).json("unable to register"))

  // res.json(database.users[database.users.length - 1])
})

app.get("/profile/:id", (req, res) => {
  const { id } = req.params
  // let found = false
  db.select("*")
    .from("users")
    .where({ id: id })
    .then((user) => {
      if (user.length) {
        res.json(user[0])
      } else {
        res.status(400).json("Not found")
      }
    })
    .catch((err) => res.status(400).json("error getting user"))

  // res.json(user[10])

  // database.users.forEach((user) => {
  //   if (user.id === id) {
  //     found = true
  //     return res.json(user)
  //   }
  // })
  // if (!found) {
  //   res.status(404).json("no such user")
  // }
})

app.put("/image", (req, res) => {
  const { id } = req.body

  db("users")
    .where("id", "=", id)
    .increment("entries", 1)
    .returning("entries")
    .then((entries) => res.json(entries[0].entries))
    .catch((err) => res.status(400).json("unable to get entries"))
  // let found = false
  // database.users.forEach((user) => {
  //   if (user.id === id) {
  //     found = true
  //     user.entries++
  //     return res.json(user.entries)
  //   }
  // })
  // if (!found) {
  //   res.status(404).json("no such user")
  // }
})

// bcrypt.hash("bacon", null, null, function(err, hash) {
//   // Store hash in your password DB.
// });

// // Load hash from your password DB.
// bcrypt.compare("bacon", hash, function(err, res) {
//   // res == true
// });
// bcrypt.compare("veggies", hash, function(err, res) {
//   // res = false
// });

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
