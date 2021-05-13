const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const morgan = require(`morgan`);
const bcrypt = require('bcrypt');
app.set("view engine", "ejs");//set ejs as the view engine
let cookieSession = require('cookie-session');
app.use(morgan(`dev`));
app.use(cookieSession({
  name: 'session',
  keys: ['userId']
}));

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
  //convert users to array using obj.values, returns a user object
  let arrayValues = Object.values(users);
  return arrayValues.find(user => email === user.email);
};

//check if the user logedin if not redirect him to login page
const isLogedIn = function(req) {
  let user = users[req.session.userId];
  if (!user) {
    
    return false;
  }
  return true;
};

const urlsForUser = function(userId) {
  let arrayUrls = Object.entries(urlDatabase);
  arrayUrls = arrayUrls.filter(url => userId === url[1].userID);
  let objUrls = {};
  for (const url of arrayUrls) {
    objUrls[url[0]] = url[1];
  }
  return objUrls;
};

app.use(express.urlencoded({extended: true}));

//*******Data*************
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "jhgjg" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "bboop" }
};

// console.log(`urlsforusers`, urlsForUser('jhgjg'));
// console.log(`obj.entries`, Object.entries(urlDatabase));


const users = {
  "jhgjg": {
    id: "jhgjg",
    email: "wavivit@gmail.com",
    password: "$2b$10$QvHh8fiExRZwJST2pR19teDMKHydjYfiLEbLBWattCs8er2vMd6c6"
  },
  "bboop": {
    id: "bboop",
    email: "vivi@example.com",
    password: "qwert"
  }
};

//*********Routes***********
app.get("/", (req, res) => {
  res.send("Hello!");
});

//Login Route
app.get("/login", (req, res) => {
  const templateVars = { user: undefined };
  res.render("login", templateVars);
});



//Login submit handler
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  //checking if the email already exists
  if (!emailLookup(email) || bcrypt.compareSync(password, emailLookup(email).password)) {
    res.status(403).send("Email or passowrd are not valid");
    return;
  }
  const userId = emailLookup(email).id;
  req.session.userId = userId;
  res.redirect("/urls");
});

//Logout Routes
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//Register Routes
app.get("/register", (req, res) => {
  const templateVars = { user: undefined };
  res.render("register", templateVars);
});

//Register submit handler
app.post("/register", (req, res) => {
  let randomId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  //checking if the email or password is am empty strings
  if (password.length === 0 || email.length === 0) {
    res.status(400).send("Email or Password is invalid! ");
    return;
  }
  //checking if the email already exists
  if (emailLookup(email)) {
    res.status(400).send("Email already exists! ");
    return;
  }


  users[randomId] = {id: randomId,
    email: email,
    password: hashedPassword
  };
  console.log(`after`, JSON.stringify(users));
  req.session.userId = randomId;
  res.redirect('/urls');
});

//URLS Routes
app.get("/urls", (req, res) => {
  //check if the user logedin with isLogedIn
  let user = users[req.session.userId];
  let urls = urlsForUser(req.session.userId);
  console.log(`users`, users);
  let templateVars = {urls: urls, user: user, message: undefined};
  if (!isLogedIn(req)) {
    templateVars = {urls: {}, user: user, message: "Please log in..."};
  }
  // console.log(`vars`, templateVars);
  res.render("urls_index", templateVars);
});

//URLS handler
app.post("/urls", (req, res) => {
  //check if the user logedin with isLogedIn
  if (!isLogedIn(req)) {
    res.redirect("/login");
    return;
  }
  console.log(req.body);  // Log the POST request body to the console
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session.userId};
  // console.log(`urlDB`, urlDatabase);
  res.redirect(`/urls/${shortURL}`);

});

//URLS/new Routes
app.get("/urls/new", (req, res) => {
  //check if the user logedin with isLogedIn
  if (!isLogedIn(req)) {
    res.redirect("/login");
    return;
  }
  let user = users[req.session.userId];
  const templateVars = {user: user};
  res.render("urls_new", templateVars);
});

//Display single URL
app.get("/urls/:shortURL", (req, res) => {
  //check if the user logedin with isLogedIn
  if (!isLogedIn(req)) {
    res.render("message", {message: "Please log in...", user: undefined});
    return;
  }
  let user = users[req.session.userId];
  //check if the user has this url
  if (!urlsForUser(req.session.userId)[req.params.shortURL]) {
    res.render("message", {message: "The requested URL does not exist or does not belong to you", user: user});
    return;
  }
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: user};
  res.render("urls_show", templateVars);
});

//URLS update submit handler
app.post("/urls/:shortURL", (req, res) => {
  //check if the user logedin with isLogedIn
  if (!isLogedIn(req)) {
    res.render("message", {message: "Please log in...", user: undefined});
    return;
  }
  //check if the user has this url
  if (!urlsForUser(req.session.userId)[req.params.shortURL]) {
    let user = users[req.session.userId];
    res.render("message", {message: "The requested URL does not exist or does not belong to you", user: user});
    return;
  }
  urlDatabase[req.params.shortURL].longURL = req.body.newUrl;
  res.redirect("/urls");
});

//URL delete Route
app.post("/urls/:shortURL/delete", (req, res) => {
  //check if the user logedin with isLogedIn
  if (!isLogedIn(req)) {
    res.render("message", {message: "Please log in...", user: undefined});
    return;
  }
  //check if the user has this url
  if (!urlsForUser(req.session.userId)[req.params.shortURL]) {
    let user = users[req.session.userId];
    res.render("message", {message: "The requested URL does not exist or does not belong to you", user: user});
    return;
  }
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

