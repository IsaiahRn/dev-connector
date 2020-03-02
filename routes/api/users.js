import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import passport from 'passport';
import User from '../../models/User';
import gravatar from 'gravatar';
import validateRegisterInput from '../../validation/register';
import validateLoginInput from '../../validation/login';
import Profile from '../../models/Profile';

const route = express.Router();

dotenv.config();

route.get('/test', (req, res) => res.json({msg: "Users"}));

route.post('/register', (req, res) => {
    const { errors, isValid } = validateRegisterInput(req.body);

    if(!isValid){
        return res.status(400).json(errors);
    }

    User.findOne({ email: req.body.email })
        .then(user => {
            if(user) {
                return res.status(400).json({email: 'Email already exists'});
            } else {
                const avatar = gravatar.url(req.body.email, {
                    s: '200',
                    r: 'pg',
                    d: 'mm'
                });

                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    avatar,
                    password: req.body.password
                });

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) throw err;
                        newUser.password = hash;
                        newUser
                            .save()
                            .then(user => res.json(user))
                            .catch(err => console.log(err));
                    })
                })
            }
        })
});

route.post('/login', (req, res) => {

    const { errors, isValid } = validateLoginInput(req.body);

    if(!isValid){
        return res.status(400).json(errors);
    }

    const {email, password} = req.body;

    User.findOne({email})
        .then(user => {
            if(!user){
                errors.email = 'User not found'
                return res.status(404).json(errors)
            }

            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if(isMatch){
                        const payload = { id: user.id, name: user.name, avatar: user.avatar } // Create JWT payload
                        jwt.sign(payload, process.env.secretOrKey, { expiresIn: '24h' }, (err, token) => {
                            res.json({
                                success: true,
                                token: `Bearer ${token}`
                            })
                        }) // sign token
                    }else{
                        errors.password = 'Password incorrect'
                        return res.status(400).json(errors)
                    }
                })
        });
});

route.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { id, name, email } = req.user
    res.json({
        id,
        name,
        email
    })
});

export default route;