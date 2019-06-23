const express = require('express');
const bodyParser = require('body-parser');
const cors = require('./utils/cors');
const MongoClient = require("mongodb").MongoClient;
const objectId = require("mongodb").ObjectID;

const mongoClient = new MongoClient("mongodb://localhost:27017/", { useNewUrlParser: true });

let dbClient;

const app = express();
const jsonParser = bodyParser.json();

app.use(express.static(__dirname + '/public'));
app.use(cors);

mongoClient.connect((err, client) => {
    if(err) return console.log(err);
    dbClient = client;
    app.locals.collection = client.db("usersdb").collection("users");
    app.listen(4000, function(){
        console.log("Сервер ожидает подключения...");
    });
});

// получение списка данных
app.get('/api/users', (req, res) => {
    const collection = req.app.locals.collection;
    collection.find({}).toArray(function(err, users){

        if(err) return console.log(err);
        res.send(users)
    });
});

// получение одного пользователя по id
app.get('/api/users/:id', (req, res) => {
    const id = new objectId(req.params.id);
    const collection = req.app.locals.collection;
    collection.findOne({_id: id}, function(err, user){

        if(err) return console.log(err);
        res.send(user);
    });
});

// добавление нового пользователя
app.post('/api/users', jsonParser, (req, res) => {
    if (!req.body.name || !req.body.age) return res.sendStatus(400);

    const userName = req.body.name;
    const userAge = req.body.age;
    const user = {name: userName, age: userAge};

    const collection = req.app.locals.collection;
    collection.insertOne(user, function(err, result){

        if(err) return console.log(err);
        res.send(user);
    });
});

// удаление пользователя по id
app.delete('/api/users/:id', (req, res) => {
    const id = new objectId(req.params.id);
    const collection = req.app.locals.collection;
    collection.findOneAndDelete({_id: id}, function(err, result){

        if(err) return console.log(err);
        let user = result.value;
        res.send(user);
    });
});

// изменение пользователя
app.put('/api/users', jsonParser, (req, res) => {
    if (!req.body.name || !req.body.age) return res.sendStatus(400);

    const id = new objectId(req.body.id);
    const userName = req.body.name;
    const userAge = req.body.age;

    const collection = req.app.locals.collection;
    collection.findOneAndUpdate({_id: id}, { $set: {age: userAge, name: userName}},
        {returnOriginal: false },function(err, result){

            if(err) return console.log(err);
            const user = result.value;
            res.send(user);
        });
});