const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const getBooks = new Promise((resolve, reject) => {
  try {
    let bookList = [];
    for (let book in books) {
      bookList.push({
        author: books[book].author,
        isbn: book,
        title: books[book].title,
        reviews: books[book].reviews,
      });
    }
    // Resolve the promise with the result
    resolve(bookList);
  } catch (error) {
    // Reject the promise with the error
    reject(error);
  }
});

const getBooksByISBN = (isbn) => {
  return new Promise((resolve, reject) => {
    try {
      let book = books[isbn];
      resolve(book)
    } catch (error) {
      reject(error);
    }
  });
};

const getBooksByAuthor = (author) => {
  return new Promise((resolve, reject) => {
    try {
      let bookList = [];
      for (let book in books) {
        if (books[book].author == author) {
          bookList.push({
            author: books[book].author,
            isbn: book,
            title: books[book].title,
            reviews: books[book].reviews,
          });
        }
      }
      resolve(bookList);
    } catch (error) {
      reject(error);
    }
  });
};

getBooksByTitle = (title) => {
  return new Promise((resolve, reject) => {
    try {
      let bookList = [];
      for (let book in books) {
        if (books[book].title == title) {
          bookList.push({
            author: books[book].author,
            isbn: book,
            title: books[book].title,
            reviews: books[book].reviews,
          });
        }
      }
      resolve(bookList);
    } catch (error) {
      reject(error);
    }
  });
}

public_users.post("/register", (req, res) => {
  //Write your code here
  username = req.body.username;
  password = req.body.password;

  if (!username || !password) {
    return res.status(400).send("Username and password are required");
  }

  if (isValid(username)) {
    users.push({
      id: users.length + 1,
      username: username,
      password: password,
      token: "",
    });
    return res
      .status(200)
      .send({ username: username, message: "User created successfully" });
  }
  return res.status(400).send("Username already exists");
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  getBooks
    .then((bookList) => {
      return res.status(200).send({ books: bookList });
    })
    .catch((error) => {
      console.log(error);
    });
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  getBooksByISBN(req.params.isbn)
    .then((book) => {
      return res.status(200).send({
              author: book.author,
              isbn: req.params.isbn,
              title: book.title,
              reviews: book.reviews,
            });
    }).catch((error) => {
      console.log(error);
      return res.status(400).send("Book not found");
    })
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;
  getBooksByAuthor(author).then((bookList) => {
    if (bookList.length > 0) {
      return res.status(200).send({ books: bookList });
    }
    return res.status(400).send("Book not found");
  }).catch((error) => {
    console.log(error);
    return res.status(400).send("Book not found");
  })
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;
  getBooksByTitle(title).then((bookList) => {
    if (bookList.length > 0) {
      return res.status(200).send({ books: bookList });
    }
    return res.status(400).send("Book not found");
  }).catch((error) => {
    console.log(error);
    return res.status(400).send("Book not found");
  })
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  let book = books[isbn];
  if (book) {
    return res.status(200).send({ reviews: book.reviews });
  }
  return res.status(400).send("Book not found");
});

module.exports.general = public_users;
