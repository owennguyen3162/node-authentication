const express = require('express');
const dotenv = require('dotenv');
const db = require("./src/config/db");

dotenv.config();
db.connect();

const authRouter = require('./src/auth/auth.routers');
const userRouter = require('./src/users/users.router');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
	res.send('APP IS RUNNING');
});
app.use('/auth', authRouter);
app.use('/users', userRouter);

const server = app.listen(3030, () => {
	console.log(`Express running → PORT ${server.address().port}`);
});