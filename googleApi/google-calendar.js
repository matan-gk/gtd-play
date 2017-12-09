var google = require('googleapis');
const fs = require('fs');
const offlineEvents = require('./offlineDevData/events.json');
const offlineEventDetail = require('./offlineDevData/eventDetail.json');

/**
 * Lists the next 10 events on the user's primary calendar.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listEvents(auth) {

  if (process.env.ONLINE_ENV === 'false') {
    return Promise.resolve(offlineEvents);
  };

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
          fs.writeFileSync('eventSample.json',JSON.stringify(events, null, 2));
          //console.log("events: " + JSON.stringify(events, null, 2))
          //console.log('Upcoming 10 events:');
          var eventsList = [];
          for (var i = 0; i < events.length; i++) {
            var event = events[i];
            var start = event.start.dateTime || event.start.date;
            //console.log('%s - %s', start, event.summary);
          }
          resolve(events);
        }  
      }
    });

  });
}

function getEvent(auth, eventId) {
  if (process.env.ONLINE_ENV === 'false') {
    return Promise.resolve(offlineEventDetail);
  };

  return new Promise((resolve, reject) => {

    var calendar = google.calendar('v3');
    calendar.events.get({
      auth: auth,
      calendarId: 'primary',
      eventId
    }, function(err, response) {
      if (err) {
        console.log('The API returned an error: ' + err);
        reject(err);
      } else {
        var event = response;
        if (event.id !== eventId) {
          console.log('Error. Returned incorrect or malformed event');
          reject(response);
        } else {
          fs.writeFileSync('eventDetailSample.json',JSON.stringify(event, null, 2));
          resolve(event);
        }  
      }
    });

  });
}


module.exports = {
    listEvents,
    getEvent
}
