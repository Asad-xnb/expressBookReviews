const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  if (users.find((user) => user.username === username)) {
    return false;
  }
  return true;
  //write code to check is the username is valid
};

const authenticatedUser = (username, password) => {
  //returns boolean
  if (users.find((user) => user.username === username && user.password === password)) {
    return true;
  } 
  return false;
  //write code to check if username and password match the one we have in records.
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  //Write your code here
  username = req.body.username;
  password = req.body.password;
  
  if (!username || !password) {
    return res.status(400).send("Username and password are required");
  }
  if (authenticatedUser(username, password)) {
    const user = users.find((user) => user.username === username);
    const token = jwt.sign({ username: username }, "fingerprint_customer", { expiresIn: "1h" });
    user.token = token;
    req.session.user = user;  
    return res.status(200).send({ token: token, username: username, message: "User logged in successfully" });
  }
  return res.status(400).send("Username or password is incorrect");

});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const review = req.body.review;
  const user = req.session.user;
  if (!user) {
    return res.status(401).send("Unauthorized");
  }
  if (!review) {
    return res.status(400).send("Review is required");
  }
  if (!books[isbn]) {
    return res.status(400).send("Book not found");
  }
  books[isbn].reviews[user.username] = review;
  return res.status(200).send({ message: "Review added successfully" });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const user = req.session.user;
  if (!user) {
    return res.status(401).send("Unauthorized");
  }
  if (!books[isbn]) {
    return res.status(400).send("Book not found");
  }
  if (!books[isbn].reviews[user.username]) {
    return res.status(400).send("Review not found");
  }
  delete books[isbn].reviews[user.username];
  return res.status(200).send({ message: "Review deleted successfully" });
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
