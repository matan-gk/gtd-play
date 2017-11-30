require('./config/config');

console.log('loading...')

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const hbs = require('hbs');
const fs = require('fs');

var {mongoose} = require('./db/mongoose');
var {Task} = require('./models/task');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');
const googleInit = require('./../googleApi/google-init');
const gmail = require('./../googleApi/gmail');
const googleCalendar = require('./../googleApi/google-calendar');

var app = express();
hbs.registerPartials(__dirname + '/views/partials');

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/wwwroot'));
console.log(__dirname);
const listenPort = process.env.PORT;

app.use(bodyParser.json());

// Add a new task
app.post('/api/tasks', authenticate, (req, res) => {
    var newTask = new Task ({
        title: req.body.title,
        _creator: req.user._id
    });

    newTask.save().then((doc) => {
        res.send(doc);
    },(err) => {
        res.status(400).send(err);
    });
});

app.get('/api/tasks', authenticate, (req, res) => {
    Task.find({
        _creator: req.user._id
    }).then((tasks) => {
        res.send({tasks});
    }, (err) => {
        res.status(400).send(err);
    });
});

app.get('/api/tasks/:taskId', authenticate, (req, res) => {
    var taskId = req.params.taskId;

    if (!ObjectID.isValid(taskId)) {
        return res.status(404).send();
    }

    Task.findOne({
        _id: taskId,
        _creator: req.user._id
    }).then((selectedTask) => {
        if (!selectedTask) return res.status(404).send();
        
        res.send({task: selectedTask});

    }).catch((err) => {
        res.status(400).send();
    });
});

app.delete('/api/tasks/:taskId', authenticate, (req, res) => {
    var taskId = req.params.taskId;
    console.log('task ID:', taskId)
    if (!ObjectID.isValid(taskId)) {
        console.log('task ID is not valid');
        res.status(404).send();
    } else {
        Task.findOneAndRemove({
            _id: taskId,
            _creator: req.user._id
        }).then((selectedTask) => {
            if (!selectedTask) res.status(404).send();
            else res.status(200).send({task: selectedTask});
        }, (err) => {
            res.status(400);
        })
    }
})

// Update an individual task
app.patch('/api/tasks/:taskId', authenticate, (req, res) => {
    var taskId = req.params.taskId;
    var body = _.pick(req.body, ['title', 'completed']);

    if (!ObjectID.isValid(taskId)) {
        res.status(404).send();
    }

    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime(); 
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    Task.findOneAndUpdate({
        _id: taskId,
        _creator: req.user._id
    }, { $set: body }, {new: true})
    .then((selectedTask) => {
        if (!selectedTask) res.status(404).send();
        else res.status(200).send({task: selectedTask});
    }, (err) => {
        res.status(400);
    });
});

// Add a new user
app.post('/api/users', (req, res) => {
    var newUser = new User ({
        email: req.body.email,
        password: req.body.password
    });

    newUser.save().then(() => {
        return newUser.generateAuthToken();
    }).then((token) => {
        res.header('x-auth', token).send(newUser);
    }).catch((err) => {
        res.status(400).send(err);
    });
});

app.get('/api/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

app.post('/api/users/login', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    
    User.findByCredentials(body.email, body.password).then((user) => {
        return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send({user});
        });
    }).catch((err) => {
        res.status(400).send();
    });

});

app.delete('/api/users/me/token', authenticate, (req,res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }).catch(() => {
        res.status(400).send();
    });
});

app.get('/api/calendar/:eventId', (req, res) => {
    var eventId = req.params.eventId;

    return googleCalendar.getEvent(googleAuth, eventId)
    .then((event) => {
        res.status(200).send({event});
    }).catch(err => {
        res.status(400).send('Unexpected error' + err);
    });

});

app.get('/api/email/messages/:messageId', (req, res) => {
    var messageId = req.params.messageId;

    return gmail.getMessageById(googleAuth, messageId).then((message) => {
        res.status(200).send({message});
    }).catch(err => {
        res.status(400).send('Unexpected error' + err);
    });

});

app.get('/listTasks', authenticate, (req, res) => {

    Task.find({
        _creator: req.user._id
    }).then((tasks) => {
        res.render('tasklist.hbs', {
            tasklist: tasks
        })
    }, (err) => {
        res.status(400).send(err);
    });

});

app.get('/listEvents', (req, res) => {
    
    var listEventsPromise = googleCalendar.listEvents(googleAuth);

    listEventsPromise.then((eventsList) => {
        res.render('viewCalendar.hbs', {
            pageTitle: 'Event list',
            eventsList
        })
    });
    listEventsPromise.catch(err => {
        res.send('Unexpected error');
    });
});

app.get('/do', authenticate, (req, res) => {
    
    var listEventsPromise = googleCalendar.listEvents(googleAuth);

        listEventsPromise.then((eventList) => {

            return Task.find({
                _creator: req.user._id
            }).then((taskList) => {
                res.render('do.hbs', {
                    taskList,
                    eventList
                })
            }, (err) => {
                res.status(400).send(err);
            });
        
        }).catch(err => {
        res.status(400).send('Unexpected error' + err);
    });

});

app.get('/process', authenticate, (req, res) => {
    
    gmail.listEmails(googleAuth)
    .then((emaillist) => {
        fs.writeFileSync('emailSample.json', JSON.stringify(emaillist));
        res.render('process.hbs', {
            emaillist
        })
    }).catch(err => {
        res.send('Unexpected error:' + err);
    });

});

app.get('/listEmails', (req, res) => {
    
    var listEmailsPromise = gmail.listEmails(googleAuth);
    
        //console.log(listEmailsPromise);
    
        listEmailsPromise.then((emailsList) => {
            res.render('viewEmailList.hbs', {
                pageTitle: 'Email list',
                emailsList
            })
        });
        listEmailsPromise.catch(err => {
            //console.log('Unexpected error');
            res.send('Unexpected error');
        });

});

var googleAuth = undefined;

googleInit.init((auth) => {
    googleAuth = auth;
});

app.listen(listenPort, () => {
    console.log(`app started on port ${listenPort}`);
});

module.exports = {app};
