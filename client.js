const ws = new WebSocket('ws://localhost:3000/memory')
ws.onmessage = function (msg) {
    console.log(msg.data);
}