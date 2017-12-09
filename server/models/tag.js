var mongoose = require('mongoose');

var Tag = mongoose.model('Tag', {
    title: {
        type: String,
        required: true,
        minlength: 1,
        unique: true,
        trim: true
    },
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
});

module.exports = {
    Tag
};
