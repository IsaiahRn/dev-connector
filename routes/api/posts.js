import express from 'express';
import Post from '../../models/Post';
import Profile from '../../models/Profile';
import mongoose from 'mongoose';
import passport from 'passport';
import validatePostInput from '../../validation/post';
// import User from '../../models/User';

const route = express.Router();

route.get('/test', (req, res) => res.json({msg: "posts"}));

route.get('/', (req, res) => {
    Post.find()
        .sort({date: -1})
        .then(post => res.json(post))
        .catch(err => res.status(404).json({nopostsfound: 'No posts found'}))
});

route.get('/:id', (req, res) => {
    Post.findById(req.params.id)
        .then(post => res.json(post))
        .catch(err => res.status(404).json({nopostfound: 'No post found with that ID'}))
});

route.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    if(!isValid) {
        return res.status(400).json(errors);
    }

    const { text, name, avatar } = req.body;
    const newPost = new Post({
        text,
        name,
        avatar,
        user: req.user.id
    });

    newPost.save().then(post => res.json(post));
});

route.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then(() => {
            Post.findById(req.params.id)
                .then(post => {
                    if(post.user.toString() !== req.user.id) {
                        return res.status(401).json({ notauthorized: 'User not authorized' });
                    }

                    post.remove().then(() => res.json({ success: true }));
                })
                .catch(err => res.status(404).json({ postnotfound: 'No post found' }))
        })
});

route.post('/like/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then(() => {
            Post.findById(req.params.id)
                .then(post => {
                    if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0){
                        return res.status(400).json({ alreadyliked:  'User already liked this post' });
                    }
                     // Add the user id to likes array
                     post.likes.unshift({ user: req.user.id });
                     post.save().then(post => res.json(post));
                })
                .catch(err => res.status(404).json({ postnotfound: 'No post found' }))
        })
});

route.post('/unlike/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then(() => {
            Post.findById(req.params.id)
                .then(post => {
                    if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0){
                        return res.status(400).json({ alreadyliked:  'You have not yet liked this post' });
                    }
                     // Get the removed index
                     const removeIndex = post.likes
                        .map(item => item.user.toString())
                        .indexOf(req.user.id)
                     post.likes.splice(removeIndex, 1);
                     post.save().then(post => res.json(post));
                })
                .catch(err => res.status(404).json({ postnotfound: 'No post found' }))
        })
});

route.post('/comment/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    if(!isValid) {
        return res.status(400).json(errors);
    }

    Post.findById(req.params.id)
        .then(post => {
            const { text, name, avatar } = req.body;
            const newComment = {
                text,
                name,
                avatar,
                user: req.user.id
            }

            //Add to comments array
            post.comments.unshift(newComment);
            post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
});

route.delete('/comment/:id/:comment_id', passport.authenticate('jwt', { session: false }), (req, res) => {

    Post.findById(req.params.id)
        .then(post => {
            // Check if comment exists
            if(post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
                return res.status(404).json({ commentnotexists: 'Comment does not exists' });
            }

            const removeIndex = post.comments
                .map(item => item.id.toString())
                .indexOf(req.params.comment_id)
            
            post.comments.splice(removeIndex, 1);
            post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
});


export default route;