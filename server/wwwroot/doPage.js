function taskClicked(taskId) {

    $('.eventlistRow').removeClass('active');
    $('.tasklistRow').removeClass('active');
    $('#tasklistRow-' + taskId).addClass('active');
    $.ajax('/api/tasks/' + taskId).done((res) => {
        if (!res.task) console.log('error. Trying to get task ID ' + taskId + ' and getting empty or malformed response. The response: ' + res);
        else {
            var taskHtml = `<p>ID: ${res.task._id}</p>`;
            taskHtml += `<p>Title: ${res.task.title}</p>`;
            taskHtml += `<p>Creator: ${res.task._creator}</p>`;
            taskHtml += `<p>Notes: ${res.task.notes}</p>`;
            taskHtml += `<p>Completed: ${res.task.completed}</p>`;
            taskHtml += `<p>Completed At: ${res.task.completedAt}</p>`;
        }
        $('#detailCardTitle').html('Task')
        $('#detailCardText').html(taskHtml);
    });

};

function eventClicked(eventId) {
    
    $('.eventlistRow').removeClass('active');
    $('.tasklistRow').removeClass('active');
    $('#eventlistRow-' + eventId).addClass('active');
    $.ajax('/api/calendar/events/' + eventId).done((res) => {
        if (!res.event) console.log('error. Trying to get event ID ' + taskId + ' and getting empty or malformed response. The response: ' + res);
        else {
            var eventHtml = `<p>ID: ${res.event.id}</p>`;
            eventHtml += `<p>Summary: ${res.event.summary}</p>`;
            eventHtml += `<p>Organizer: <a href='mailto:${res.event.organizer.email}'>${res.event.organizer.displayName}</a></p>`;
            eventHtml += `<p>Start time: ${res.event.start.dateTime}</p>`;
            eventHtml += `<p>End time: ${res.event.end.dateTime}</p>`;
        }
        $('#detailCardTitle').html('Calendar event')
        $('#detailCardText').html(eventHtml);
    });
    
};