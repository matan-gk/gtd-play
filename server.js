
const express = require('express');
const hbs = require('hbs');

const googleInit = require('./google-init');
const gmail = require('./gmail');
const googleCalendar = require('./google-calendar');
const taskList = require('./tasklist');
  
var app = express();
    
hbs.registerPartials(__dirname + '/views/partials');
app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/wwwroot'));


app.get('/listemails', (req, res) => {
    
    var listEmailsPromise = gmail.listEmails(googleAuth);

    //console.log(listEmailsPromise);

    listEmailsPromise.then((messagesList) => {
        res.send(messagesList);
    });
    listEmailsPromise.catch(err => {
        //console.log('Unexpected error');
        res.send('Unexpected error');
    });
});


app.get('/listEvents', (req, res) => {
    
    var listEventsPromise = googleCalendar.listEvents(googleAuth);

    listEventsPromise.then((eventsList) => {
        res.send(eventsList);
    });
    listEventsPromise.catch(err => {
        res.send('Unexpected error');
    });
});


app.get('/listTasks', (req, res) => {
    
    taskList.addTask('task 1', 'details for task 1');
    taskList.addTask('task 2', 'details for task 2');
    taskList.addTask('task 3', 'details for task 3');
    taskList.addTask('task 4', 'details for task 4');
    taskList.deleteTask(3);
    
    res.render('tasklist.hbs', {
        pageTitle: 'testing handlebars',
        tasklist: taskList.getTasklist()
    })
    
    });

app.get('/test', (req,res) => {
    res.render('test.hbs', {
        pageTitle: 'testing handlebars',
        currentYear: new Date().getFullYear()
    });
});

var googleAuth = undefined;

googleInit.init((auth) => {
    googleAuth = auth;
});

console.log('loading...')

app.listen(3000, () => {
    console.log('Server is up.');
});
