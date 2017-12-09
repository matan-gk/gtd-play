var mongoose = require('mongoose');

const {Tag} = require('./tag');

taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    notes: {
        type: String,
        default: ''
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Number,
        default: null
    },
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    _project: {
        type: mongoose.Schema.Types.ObjectId,
    },
    tags: [{
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        title: {
            type: String,
            required: true
        }
    }]
});

taskSchema.methods.toJSON = function () {
    var task = this;

    tagTitles = task.tags.map((tag) => tag.title);

    var taskToReturn = {
        _id: task._id,
        title: task.title,
        notes: task.notes,
        completed: task.completed,
        completedAt: task.completedAt,
        _project: task._project,
        tags: tagTitles
    };

    return taskToReturn;    

};


var Task = mongoose.model('Task', taskSchema);

module.exports = {
    Task
};