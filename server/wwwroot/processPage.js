function messageClicked(messageId) {

    $('.messagelistRow').removeClass('active');
    $('#messagelistRow-' + messageId).addClass('active');
    $.ajax('/api/email/messages/' + messageId).done((res) => {
        if (!res.message) {
            alert('no message in response')
            console.log('error. Trying to get message ID ' + messageId + ' and getting empty or malformed response. The response: ' + JSON.stringify(res, null, 2));
        } else {
            var emailHtml = `<p>ID: ${res.message.id}</p>`;
            emailHtml += `<p>Subject: ${res.message.subject}</p>`;
            emailHtml += `<p>Received At: ${res.message.receivedAt}</p>`;
            emailHtml += `<p>From: ${res.message.from}</p>`;
            emailHtml += `<p>Thread ID: ${res.message.threadId}</p>`;
            emailHtml += `<p>Body: ${res.message.body}</p>`;
        }
        $('#detailCardTitle').html('Email')
        $('#detailCardText').html(emailHtml);
    });

};
