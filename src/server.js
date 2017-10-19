const express = require('express');
const app = express();
const expressWs = require('express-ws')(app);

const state = {
    broadcasting: false,
    broadcast_id: undefined
};

const memoryWs = expressWs.getWss('/memory')
app.ws('/memory', (ws, req) => {
    console.log('someone connected')
    console.log(`broadcasting: ${state.broadcasting}`)
    if (!state.broadcasting) {
        state.broadcasting = true;
        startBroadcasting()
    }
    ws.on('close', () => {
        console.log('Someone disconnected');
        if (!memoryWs.clients.size) {
            stopBroadcasting();
        }
    })
})

function startBroadcasting () {
    state.broadcast_id = setInterval(() =>{
        console.log('We are broadcasting now')
        for (let client of memoryWs.clients) {
            client.send('We are broadcasting now')
        }
    }, 1000)
}

function stopBroadcasting (conn) {
    clearInterval(state.broadcast_id);
    state.broadcasting = false;
}

app.listen(3000)