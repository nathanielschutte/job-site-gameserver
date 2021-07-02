const rooms = {
    CHAT_ALL: 'chat_all',
    STREAM_ALL: 'stream_all'
}

const events = {
    CONNECT: 'connection',
    DISCONNECT: 'disconnect',
    ERROR: 'error',
    ERROR_MSG: 'errormessage',
    CHAT_MESSAGE: 'chatmessage'
}

const error = {
    UNAUTH_EVENT: 'unauthorized-event',
    BAD_TOKEN: 'bad-token'
}

const sprite = {
    WIDTH: 100,
    HEIGHT: 100
}

module.exports = {
    rooms,
    events,
    error,
    sprite
}