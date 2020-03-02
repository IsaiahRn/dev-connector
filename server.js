import express from "express";
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import passport from 'passport';
import users from './routes/api/users';
import profile from './routes/api/profile';
import posts from './routes/api/posts';

const path = require('path');

const db = require('./config/keys').mongoURI;

dotenv.config();

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose.set('useFindAndModify', false);

mongoose
    .connect(db, { useUnifiedTopology: true, useNewUrlParser: true })
    .then(() => console.log('DB connected'))
    .catch(err => console.log(err))

app.use(passport.initialize()); // passport middleware

// Passport Config
require('./config/passport')(passport)

app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);

// Serve static assets if we are in production
if(process.env.NODE_ENV === 'production') {
    // Set a static folder
    app.use(express.static('client/build'));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {console.log(`Listening ${PORT}`)});