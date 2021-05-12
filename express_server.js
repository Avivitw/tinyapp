const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");//set ejs as the view engine
var cookieParser = require('cookie-parser');
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




app.use(express.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//*********Routes***********
app.get("/", (req, res) => {
  res.send("Hello!");
});

//Login Routes
app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect("/urls");
 });

//Logout Routes
 app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
 });

//URLS Routes
app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase, username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});

//URLS handler
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  // console.log(`urlDB`, urlDatabase);
  res.redirect(`/urls/${shortURL}`);

});

//URLS/new Routes
app.get("/urls/new", (req, res) => {
  const templateVars = {username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});

//URLS
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"]};
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
   urlDatabase[req.params.shortURL] = req.body.newUrl;
  res.redirect("/urls");
});

//URL delete Route
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});


///////////
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});





app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`The app listening on port ${PORT}!`);
});

