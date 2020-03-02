import express from 'express';
import mongoose from 'mongoose';
import passport from 'passport';
import Profile from '../../models/Profile';
import User from '../../models/User';
import validateProfileInput from '../../validation/profile';
import validateExperienceInput from '../../validation/experience';
import validateEducationInput from '../../validation/education';

const route = express.Router();

route.get('/test', (req, res) => res.json({msg: "profile"}));

route.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.user.id })
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if(!profile) {
                errors.noprofile = 'There is no profile for this user';
                return res.status(404).json(errors);
            }
            res.json(profile)
        })
        .catch(err => res.status(404).json(err));
});

route.get('/all', (req, res) => {
    Profile.find()
        .populate('user', ['name', 'avatar'])
        .then(profiles => {
            if(!profiles){
                errors.noprofile = 'There are no profiles';
                res.status(404).json(errors)
            }
            res.json(profiles);
        })
        .catch(err => res.status(404).json({profile: 'There are no profiles'}));
});

route.get('/handle/:handle', (req, res) => {
    Profile.findOne({ handle: req.params.handle })
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if(!profile){
                errors.noprofile = 'There is no profile for this user';
                res.status(404).json(errors)
            }
            res.json(profile);
        })
        .catch(err => res.status(404).json(err));
});

route.get('/user/:user_id', (req, res) => {
    Profile.findOne({ user: req.params.user_id })
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if(!profile){
                errors.noprofile = 'There is no profile for this user';
                res.status(404).json(errors)
            }
            res.json(profile);
        })
        .catch(err => res.status(404).json({profile: 'There is no profile for this user'}));
});

route.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);

    if(!isValid) {
        return res.status(400).json(errors);
    }

    const profileFields = {};
    const { 
        handle, 
        company, 
        website, 
        location, 
        bio, 
        status, 
        githubusername, 
        skills, 
        youtube, 
        twitter, 
        facebook, 
        linkedin, 
        instagram
    } = req.body;

    profileFields.user = req.user.id;
    if(handle) profileFields.handle = handle;
    if(company) profileFields.company = company;
    if(website) profileFields.website = website;
    if(location) profileFields.location = location;
    if(bio) profileFields.bio = bio;
    if(status) profileFields.status = status;
    if(githubusername) profileFields.githubusername = githubusername;
    if(typeof skills !== 'undefined') {
        profileFields.skills = skills.split(',');
    }
    profileFields.social = {};
    if(youtube) profileFields.social.youtube = youtube;
    if(twitter) profileFields.social.twitter = twitter;
    if(facebook) profileFields.social.facebook = facebook;
    if(linkedin) profileFields.social.linkedin = linkedin;
    if(instagram) profileFields.social.instagram = instagram;

    Profile.findOne({ user: req.user.id }).then(profile => {
        if(profile){
            Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true }
            ).then(profile => res.json(profile));
        } else {
            Profile.findOne({ handle: profileFields.handle }).then(profile => {
                if(profile){
                    errors.handle = 'That profile already exists';
                    res.status(400).json(errors)
                }

                new Profile(profileFields).save().then(profile => res.json(profile));
            })
        }
    })
});

route.post('/experience', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = validateExperienceInput(req.body);

    if(!isValid) {
        return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id })
        .then(profile => {
            const { title, company, location, from, to, current, description } =  req.body;
            const newExp = { title, company, location, from, to, current, description };

            // Add to experience array
            profile.experience.unshift(newExp);
            profile.save().then(profile => res.json(profile))
        })
});

route.post('/education', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = validateEducationInput(req.body);

    if(!isValid) {
        return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id })
        .then(profile => {
            const { school, degree, fieldofstudy, from, to, current, description } =  req.body;
            const newEdu = { school, degree, fieldofstudy, from, to, current, description };

            // Add to education array
            profile.education.unshift(newEdu);
            profile.save().then(profile => res.json(profile))
        })
});

route.delete('/experience/:exp_id', passport.authenticate('jwt', { session: false }), (req, res) => {

    Profile.findOne({ user: req.user.id })
        .then(profile => {
           const removeIndex = profile.experience
                .map(item => item.id)
                .indexOf(req.params.exp_id);

            profile.experience.splice(removeIndex, 1);
            profile.save().then(profile => res.json(profile))
        })
        .catch(err => res.json(err))
});

route.delete('/education/:edu_id', passport.authenticate('jwt', { session: false }), (req, res) => {

    Profile.findOne({ user: req.user.id })
        .then(profile => {
           const removeIndex = profile.education
                .map(item => item.id)
                .indexOf(req.params.exp_id);

            profile.education.splice(removeIndex, 1);
            profile.save().then(profile => res.json(profile))
        })
        .catch(err => res.json(err))
});

route.delete('/', passport.authenticate('jwt', { session: false }), (req, res) => {

    Profile.findOneAndRemove({ user: req.user.id })
        .then(() => {
           User.findOneAndRemove({ _id: req.user.id })
                .then(() => res.json({ success: true }))
        })
        .catch(err => res.json(err))
});

export default route;