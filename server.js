
const express = require('express');
const hbs = require('hbs');

const gmail = require('./gmail');
const taskList = require('./tasklist');
const googleCalendar = require('./google-calendar');
  
var app = express();
    
hbs.registerPartials(__dirname + '/views/partials');
app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/wwwroot'));


app.get('/listemails', (req, res) => {
    
        var listEmailsPromise = gmail.listEmails(gmailAuth);
    
        //console.log(listEmailsPromise);
    
        listEmailsPromise.then((messagesList) => {
            res.send(messagesList);
        });
        listEmailsPromise.catch(err => {
            //console.log('Unexpected error');
            res.send('Unexpected error');
        });
    
    });
    
app.get('/taskTest', (req, res) => {
    
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

var gmailAuth = undefined;

gmail.init((auth) => {
    gmailAuth = auth;
});

console.log('loading...')

app.listen(3000, () => {
    console.log('Server is up.');
});
googleCalendar.init();
