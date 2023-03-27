const mongoose = require ('mongoose');

const sauceSchema = mongoose.Schema ({
    
    userId: {type: String, required: true},
    name: {type: String, required: true},
    manufacturer: {type: String, required: true},
    description: {type: String, required: true},
    mainPepper: {type: String, required: true},
    imageUrl: {type: String, required: true},
    heat: {type: Number, required: true},
    likes: {type: Number, required: true, default: 0, nim:0 , max:1},
    dislikes: {type: Number, required: true, default: 0, nim:0 , max:1},
    usersLiked: {type: Array, required: true},
    usersDisliked: {type: Array, required: true},
});

module.exports = mongoose.model('Sauce', sauceSchema);
