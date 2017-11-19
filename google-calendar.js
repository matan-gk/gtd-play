var google = require('googleapis');

/**
 * Lists the next 10 events on the user's primary calendar.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listEvents(auth) {
  return new Promise((resolve, reject) => {

    var calendar = google.calendar('v3');
    calendar.events.list({
      auth: auth,
      calendarId: 'primary',
      timeMin: (new Date()).toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime'
    }, function(err, response) {
      if (err) {
        console.log('The API returned an error: ' + err);
        reject(err);
      } else {
        var events = response.items;
        if (events.length == 0) {
          console.log('No upcoming events found.');
          resolve([]);
        } else {
          //console.log('Upcoming 10 events:');
          var eventsList = [];
          for (var i = 0; i < events.length; i++) {
            var event = events[i];
            var start = event.start.dateTime || event.start.date;
            console.log('%s - %s', start, event.summary);
          }
          resolve(events);
        }  
      }
    });

  });
}


module.exports = {
    listEvents
}
