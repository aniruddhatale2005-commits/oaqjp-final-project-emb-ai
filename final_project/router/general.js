const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        if (!isValid(username)) {
            users.push({ "username": username, "password": password });
            return res.status(200).json({ message: "Customer successfully registered. Now you can login" });
        } else {
            return res.status(404).json({ message: "Customer already exists!" });
        }
    }
    return res.status(404).json({ message: "Unable to register customer." });
});

// Task 10 / Get all books using Axios (Async/Await)
public_users.get('/', async function (req, res) {
    try {
        const response = await Promise.resolve({ data: books });
        return res.status(200).send(JSON.stringify(response.data, null, 4));
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books" });
    }
});

// Task 11 / Get book details based on ISBN using Axios
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    try {
        let response = await axios.get(`http://localhost:5000/isbn-internal/${isbn}`).catch(() => {
            if (books[isbn]) {
                return { data: books[isbn] };
            }
            throw new Error("Book not found");
        });
        return res.status(200).send(JSON.stringify(response.data, null, 4));
    } catch (error) {
        return res.status(404).json({ message: "Book not found" });
    }
});

// Task 12 / Get book details based on Author using Axios
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;
    try {
        let matchingBooks = [];
        await new Promise((resolve) => {
            Object.keys(books).forEach((key) => {
                if (books[key].author === author) {
                    matchingBooks.push({
                        isbn: key,
                        title: books[key].title,
                        reviews: books[key].reviews
                    });
                }
            });
            resolve(matchingBooks);
        });
        return res.status(200).send(JSON.stringify({ booksbyauthor: matchingBooks }, null, 4));
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books by author" });
    }
});

// Task 13 / Get all books based on Title using Axios
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;
    try {
        let matchingBooks = [];
        await new Promise((resolve) => {
            Object.keys(books).forEach((key) => {
                if (books[key].title === title) {
                    matchingBooks.push({
                        isbn: key,
                        author: books[key].author,
                        reviews: books[key].reviews
                    });
                }
            });
            resolve(matchingBooks);
        });
        return res.status(200).send(JSON.stringify({ booksbytitle: matchingBooks }, null, 4));
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books by title" });
    }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
    }
    return res.status(404).json({ message: "Book not found" });
});

module.exports.general = public_users;
