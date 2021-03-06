const express = require('express');
const bodyParser = require('body-parser');
const cors = require('./utils/cors');
const mongoose = require("mongoose");

const app = express();
const Schema = mongoose.Schema;

const userScheme = new Schema({name: String, age: Number}, {versionKey: false});
const User = mongoose.model("User", userScheme);

const jsonParser = bodyParser.json();

app.use(express.static(__dirname + '/public'));
app.use(cors);

// подключение
mongoose.connect("mongodb://localhost:27017/usersdb", {useNewUrlParser: true, useFindAndModify: false}, (err) => {
    if (err) return console.log(err);
    app.listen(4000, function () {
        console.log("Сервер ожидает подключения на 4000 порту ...");
    });
});

// получение списка данных
app.get('/api/users', (req, res) => {
    User.find({}, (err, users) => {
        if (err) return console.log(err);
        res.send(users)
    });
});

// получение одного пользователя по id
app.get('/api/users/:id', (req, res) => {
    const id = req.params.id;
    User.findOne({_id: id}, (err, user) => {
        if (err) return console.log(err);
        res.send(user);
    });
});

// добавление нового пользователя
app.post('/api/users', jsonParser, (req, res) => {
    if (!req.body.name || !req.body.age) return res.sendStatus(400);

    const userName = req.body.name;
    const userAge = req.body.age;
    const user = new User({name: userName, age: userAge});

    user.save((err) => {
        if (err) return console.log(err);
        res.send(user);
    });
});

// удаление пользователя по id
app.delete('/api/users/:id', (req, res) => {
    const id = req.params.id;
    User.findByIdAndDelete(id, (err, user) => {

        if (err) return console.log(err);
        res.send(user);
    });
});

// изменение пользователя
app.put('/api/users', jsonParser, (req, res) => {
    if (!req.body.name || !req.body.age) return res.sendStatus(400);

    const id = req.body.id;
    const userName = req.body.name;
    const userAge = req.body.age;
    const newUser = {age: userAge, name: userName};

    User.findByIdAndUpdate(id, newUser, {new: true}, (err, user) => {
        if (err) return console.log(err);
        res.send(user);
    });
});