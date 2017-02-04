const common = require('./common');
const sendRequest = common.sendRequest;
const log = common.log;

module.exports = {
    directMessage: directMessage,
    delayedResponse: delayedResponse,
    catchError: catchError
};

/**
 * Send a direct message to a Slack user channel
 * @constructor 
 * @param {string} text - message content 
 * @param {string} slackRecipient - Slack recipient user, grouop or channel.
 */
function directMessage(text, slackRecipient) {
    var payload = {
        token: process.env.slackAccessToken,
        channel: slackUserRecipient,
        text: text,
        username: process.env.slackBotName,
        as_user: true,
    };

    var options = {
        uri: 'https://slack.com/api/chat.postMessage',
        method: 'POST',
        json: true,
        body: payload
    };

    return sendRequest(options);
}

/**
 * Send a message back to the response URI provided by the Slack command
 * @constructor
 * @param {object} options - JSON object with necessary parameters to complete the HTTP request 
 */
function delayedResponse(options) {
    var promise = sendRequest(options);
    promise.then(slackSucces, slackError);

    function slackSucces(result) {
        log.ok('Slack response message sent.');
    }

    function slackError(reason) {
        log.error('Slack response message request failed: ' + reason);
    }
}

function catchError(message, responseUri, returnException) {
    log.error('Server Error: ' + message);

    var options = {
        uri: responseUri,
        method: 'POST',
        json: true,
        body: {
            'response_type': 'in_channel',
            'mrkdwn': true,
            'attachments': [
                {
                    'mrkdwn_in': ['text'],
                    'color': 'danger',
                    'title': 'ERROR',
                    'text': 'An error occurred while processing your request' + (returnException === true ? ': ' + message : ''),
                    'ts': Math.floor(new Date() / 1000)
                }
            ]
        }
    };

    delayedResponse(options);
}