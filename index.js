const express = require("express");
const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const app = express();
const path = require("path");
const { v4: uuidv4 } = require('uuid');           //-------------->      uuidv4()
const methodOverride = require('method-override');
const alert = require('alert');
const port = 8080;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride('_method'));      //-------------->    action="/resource?_method=DELETE">

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'DB_prac',
    password: 'shreyas'
});

getRandomUser = ()=> {
  return [
    faker.string.uuid(),
    faker.internet.userName(),
    faker.internet.email(),
    faker.internet.password()
];
}

app.listen(port, ()=>{
  console.log('app is listening at', port);
});



app.get('/', (req,res) =>{
  let q = `SELECT count(*) FROM users`;
  try{
    connection.query(q,(err,result)=>{
      if(err) throw err;
      let count = result[0]['count(*)'];
      res.render("home.ejs", {count});
    });
  }catch(err){
    console.log(err);
    res.send(`DB not Working`);
  }
});


app.get('/users', (req, res)=>{
  let q = `Select id,username,email From users Order By username ASC`;
  try{
    connection.query(q,(err, result)=>{
      if(err) throw err;
      res.render("view.ejs", {users : result});
    })
  }catch(err){
    console.log(err);
    res.send("DB not working");
  }
});


app.get('/users/:id/edit', (req,res)=>{
  let {id} = req.params;
  let q = `Select id,username,email From users Where id='${id}'`;
  try{
    connection.query(q,(err,user)=>{
      if(err) throw err;
      res.render('editUser.ejs', {user});
    });
  }catch(err){
    console.log(err);
    res.send("Some issue occured!");
  }
});

app.get('/users/:id/delete', (req,res)=>{
  let {id} = req.params;
  let q = `Select id,username,email From users Where id = '${id}'`;
  try{
    connection.query(q, (err,result)=>{
      if(err) throw err;
      res.render('delete.ejs',{user : result[0]});
    });
  }catch(err){
    res.send('Some error with DB');
    console.log(err);
  }
});

app.get('/users/new', (req,res)=>{
  res.render('newUSer.ejs');
});


app.patch('/users/:id/edit', (req,res)=>{
  let {id} = req.params;
  let {username: formUser, password: formPass} = req.body;
  let q = `Select * From users Where id = '${id}'`;
  connection.query(q,(err,result)=>{
    let user = result[0];
    if(user.password != formPass){
      res.redirect(`/users/${id}/edit`);
    }else{
      q = `Update users Set username = '${formUser}' Where id = '${id}'`;
      connection.query(q,(err,result)=>{
        res.redirect('/users');
      });
    }
  });
});


app.delete('/users/:id/delete', (req, res) =>{
  let {id} = req.params;
  let {password : formPass} = req.body;

  let q = `Select password From users Where id = '${id}'`;

  connection.query(q,(err,result)=>{
    if(err) throw err;
    let password = result[0].password;
    if(password != formPass){
      res.redirect(`/users/${id}/delete`);
    }else{
      q = `Delete From users Where id = '${id}'`;

      connection.query(q,(err,result)=>{
        if(err) throw err;
        res.redirect('/');
      })
    }
  });
  
});

app.post('/users/new', (req,res)=>{
  let {username, email, password} = req.body;
  let id = uuidv4();
  let data = [id,username,email,password];

  let q = `Insert Into users(id,username,email,password) Values (?)`;

  try{
    connection.query(q,[data],(err,result)=>{
      if(err) throw err;
      res.redirect('/');
    });
  }catch(err){
    console.log(err);
  }
});


// -------------BELOW CODE FOR INSERT RANDOM DATA IN DATABASE---------------
// let q = `INSERT INTO users VALUES ?`;
// let data = [];

// for(i=1; i<100; i++){
//   data.push(getRandomUser());
// };

// connection.query(q,[data],(err, result)=>{
//   try{
//     if(err){
//       throw err;
//     }
//     console.log(result);
//   }catch(err){
//     console.log(err);
//   }
// });

// connection.end();

