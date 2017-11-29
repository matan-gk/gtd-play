var google = require('googleapis');

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listLabels(auth) {
  var gmail = google.gmail('v1');
  gmail.users.labels.list({
    auth: auth,
    userId: 'me',
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var labels = response.labels;
    if (labels.length == 0) {
      console.log('No labels found.');
    } else {
      console.log('Labels:');
      for (var i = 0; i < labels.length; i++) {
        var label = labels[i];
        console.log('- %s', label.name);
      }
    }
  });
}

var getMessageIdList = (auth) => {
  return new Promise((resolve, reject) => {

    var gmail = google.gmail('v1');
    gmail.users.messages.list({
      auth: auth,
      userId: 'me',
    }, (err, response) => {
      if (err) {
        reject(err);
      } else {
        resolve({auth, response});
      }
    });
  }); 
}

function listEmails(auth) {
  return getMessageIdList(auth)
  .then((response) => {
    var messages = response.response.messages;
    if (messages === undefined) {
      console.log('could not get messages from response. Printing response:');
      console.log(response);
    }
    if (messages.length == 0) {
      console.log('No messages found.');
      resolve([]);
    } else {
      //console.log(JSON.stringify(messages, undefined, 2));
      return loopOverEmails(auth, messages);
    }
  },rejectedPromise);

}

function rejectedPromise(err) {
  console.log('the API returned an error:',err);
  return Promise.reject(err);
}
    
function loopOverEmails(auth, messages) {
  return new Promise((resolve, reject) => {
    var gmail = google.gmail('v1');    

    // Get all the messages, using individual API calls, and creating a promise array with the async calls
    var getMessagePromiseArray = messages.map((message) => {
      return new Promise((singleResolve, singleReject) => {
        gmail.users.messages.get({
          auth: auth,
          userId: 'me',
          id: message.id,
          format: 'full'
        }, (err, response) => {
          if (err) {
            singleReject(err);
          } else singleResolve(response);
        })
      }); // closing getMessagePromise
    });
    
    // Get the results of the async calls
    Promise.all(getMessagePromiseArray).then((getMessageResponses) => {
      console.log('finished retrieving all messages');
      var messagesList = [];
      
      // Retrieving the details from all messages
      getMessageResponses.map((response) => {
        console.log(JSON.stringify(response, null, 2))
        // for each message:
        // Filter the headers to find the subject and sender
        var messageSubject = response.payload.headers.filter((header) => header.name.toLowerCase() === 'subject');
        var messageFrom = response.payload.headers.filter((header) => header.name.toLowerCase() === 'from');
        if (messageSubject !== [] && messageFrom !== []) {
          messageSubject = messageSubject[0].value;
          messageFrom = messageFrom[0].value;
        }
        
        // build the message display object, then push it into the array
        var messageObject = {
          //id: message.id,
          subject: messageSubject,
          from: messageFrom
        };  
        messagesList.push(messageObject);
        //console.log(messageObject);
      });

      resolve(messagesList); // resolve the top promise, signaling that all messages were received.
    }, (err) => {
      console.log('some messages could not be retrieved');
      reject(err);
    });
        
  });
      
}
  

module.exports = {
    listLabels,
    listEmails
}