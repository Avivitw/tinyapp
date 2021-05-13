const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");//set ejs as the view engine
let cookieParser = require('cookie-parser');
app.use(cookieParser());

const generateRandomString = function() {
  //returns a string of 6 random alphanumeric characters
  let result = [];
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i <= 5; i++) {
    result.push(characters.charAt(Math.floor(Math.random() * characters.length)));
  }
  return result.join('');
};

const emailLookup = function(email) {
  //convert users to array using obj.values
  let arrayValues = Object.values(users);
  return arrayValues.find(user => email === user.email);
};

//check if the user logedin if not redirect him to login page
const isLogedIn = function(req, res) {
  let user = users[req.cookies[`user_id`]]
  if (!user) {
    res.redirect("/login");
    return false;
  };
  return true;
};


app.use(express.urlencoded({extended: true}));
//*******Data*************
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "jhgjg" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "jhgjg" }
};

const users = { 
  "jhgjg": {
    id: "jhgjg", 
    email: "user@example.com", 
    password: "12345"
  },
  "bboop": {
    id: "bboop", 
    email: "vivi@example.com", 
    password: "qwert"
  }
}

//*********Routes***********
app.get("/", (req, res) => {
  res.send("Hello!");
});

//Login Route
app.get("/login", (req, res) => {
  let user = users[req.cookies[`user_id`]];
  const templateVars = { user: undefined };
  res.render("login", templateVars);
});



//Login submit handler
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
//checking if the email already exists
  if (!emailLookup(email) || password !== emailLookup(email).password) {
    res.status(403).send("Email or passowrd are not valid");
    return;
  };
  const user_id = emailLookup(email).id;
  res.cookie("user_id",user_id);
  res.redirect("/urls");
});

//Logout Routes
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

//Register Routes
app.get("/register", (req, res) => {
  let user = users[req.cookies[`user_id`]];
  const templateVars = { user: undefined };
  res.render("register", templateVars);
});

//Register submit handler
app.post("/register", (req, res) => {
  let randomId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  //checking if the email or password is am empty strings
  if (password.length === 0 || email.length === 0){
    res.status(400).send("Email or Password is invalid! ");
    return;
  };
  //checking if the email already exists
  if (emailLookup(email)) {
    res.status(400).send("Email already exists! ");
    return;
  }
  users[randomId] = {id: randomId,
    email: email,
    password: password
  };
  console.log(`after`, JSON.stringify(users));
  res.cookie("user_id",randomId);
  res.redirect('/urls');
});

//URLS Routes
app.get("/urls", (req, res) => {
    //check if the user logedin with isLogedIn
    if (!isLogedIn(req, res)){
      return;
    };
  let user = users[req.cookies[`user_id`]];
  console.log(`users`, users);
  const templateVars = {urls: urlDatabase, user: user};
  // console.log(`vars`, templateVars);
  res.render("urls_index", templateVars);
});

//URLS handler
app.post("/urls", (req, res) => {
    //check if the user logedin with isLogedIn
    if (!isLogedIn(req, res)){
      return;
    };
  console.log(req.body);  // Log the POST request body to the console
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.cookies[`user_id`]};
  // console.log(`urlDB`, urlDatabase);
  res.redirect(`/urls/${shortURL}`);

});

//URLS/new Routes
app.get("/urls/new", (req, res) => {
  //check if the user logedin with isLogedIn
  if (!isLogedIn(req, res)){
    return;
  }
  let user = users[req.cookies[`user_id`]];
  const templateVars = {user: user};
  res.render("urls_new", templateVars);
});

//URLS
app.get("/urls/:shortURL", (req, res) => {
  //check if the user logedin with isLogedIn
  if (!isLogedIn(req, res)){
    return;
  };
  let user = users[req.cookies[`user_id`]]
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: user};
  res.render("urls_show", templateVars);
});

//URLS update submit handler
app.post("/urls/:shortURL", (req, res) => {
  //check if the user logedin with isLogedIn
  if (!isLogedIn(req, res)){
    return;
  };
  urlDatabase[req.params.shortURL].longURL = req.body.newUrl;
  res.redirect("/urls");
});

//URL delete Route
app.post("/urls/:shortURL/delete", (req, res) => {
    //check if the user logedin with isLogedIn
    if (!isLogedIn(req, res)){
      return;
    };
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});


///////////Redirecting to the long url
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});





app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`The app listening on port ${PORT}!`);
});

