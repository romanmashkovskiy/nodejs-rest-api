const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const uuidv = require('uuid/v1');

const app = express();
const jsonParser = bodyParser.json();

app.use(express.static(__dirname + '/public'));

// получение списка данных
app.get('/api/users', (req, res) => {

    const content = fs.readFileSync('users.json', 'utf8');
    const users = JSON.parse(content);
    res.send(users);
});

// получение одного пользователя по id
app.get('/api/users/:id', (req, res) => {

    const id = req.params.id; // получаем id
    const content = fs.readFileSync('users.json', 'utf8');
    const users = JSON.parse(content);
    let user = null;

    // находим в массиве пользователя по id
    for (let i = 0; i < users.length; i++) {
        if (users[i].id === id) {
            user = users[i];
            break;
        }
    }

    // отправляем пользователя
    if (user) {
        res.send(user);
    } else {
        res.status(404).send();
    }
});

// добавление нового пользователя
app.post('/api/users', jsonParser, (req, res) => {

    if (!req.body.name || !req.body.age) return res.sendStatus(400);

    const userName = req.body.name;
    const userAge = req.body.age;
    const user = {name: userName, age: userAge};

    let data = fs.readFileSync('users.json', 'utf8');
    const users = JSON.parse(data);

    // находим максимальный displayId
    const displayId = Math.max.apply(Math, users.map((o) => {
        return o.displayId;
    }));

    // увеличиваем его на единицу
    user.displayId = displayId + 1;

    //генерируем уникальный id
    user.id = uuidv();

    // добавляем пользователя в массив
    users.push(user);

    data = JSON.stringify(users);

    // перезаписываем файл с новыми данными
    fs.writeFileSync('users.json', data);
    res.send(user);
});

// удаление пользователя по id
app.delete('/api/users/:id', (req, res) => {

    const id = req.params.id;
    let data = fs.readFileSync('users.json', 'utf8');
    const users = JSON.parse(data);
    let index = -1;

    // находим индекс пользователя в массиве
    for (let i = 0; i < users.length; i++) {
        if (users[i].id === id) {
            index = i;
            break;
        }
    }
    if (index > -1) {
        // удаляем пользователя из массива по индексу
        const user = users.splice(index, 1)[0];
        data = JSON.stringify(users);
        fs.writeFileSync('users.json', data);

        // отправляем удаленного пользователя
        res.send(user);
    }
    else {
        res.status(404).send();
    }
});

// изменение пользователя
app.put('/api/users', jsonParser, (req, res) => {

    if (!req.body) return res.sendStatus(400);

    const userId = req.body.id;
    const userName = req.body.name;
    const userAge = req.body.age;

    const data = fs.readFileSync('users.json', 'utf8');
    const users = JSON.parse(data);
    let user;
    for (let i = 0; i < users.length; i++) {
        if (users[i].id === userId) {
            user = users[i];
            break;
        }
    }

    // изменяем данные у пользователя
    if (user) {
        user.age = userAge;
        user.name = userName;
        const data = JSON.stringify(users);
        fs.writeFileSync('users.json', data);
        res.send(user);
    } else {
        res.status(404).send(user);
    }
});

app.listen(3000, () => {
    console.log('Сервер ожидает подключения...');
});