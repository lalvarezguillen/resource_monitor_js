const os = require('os');
const WebSocket = require('ws');
const wsServer = new WebSocket.Server({port: 8080});


function getMetrics3 () {
  new Promise((reject, resolve) => {
    const metrics = {
      cpuUsage: calculateCPUUsage(mergeCoresMetrics(os.cpus())),
      freeMem: os.freemem(),
      totalMem: os.totalmem()
    }
    resolve(metrics);
  })
}

function storeMetrics (metrics) {
  // Store in Influx
}

function broadcastMetrics (metrics) {
  for (let client of wsServer.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(metrics));
    }
  }
}

function mergeCoresMetrics (coresMetrics) {
  return coresMetrics.reduce(function (core, merged) {
    merged.times.user += core.times.user;
    merged.times.nice += core.times.nice;
    merged.times.sys += core.times.sys;
    merged.times.idle += core.times.idle;
    return merged;
  })
}

function calculateCPUUsage (cpuInfo) {
  let total = 0;
  for (let key in cpuInfo) {
    total += cpuInfo[key];
  }
  const used = total - cpuInfo.idle;
  const used_percent_float = Math.round(used * 100 / total * 100);
  return used_percent_float / 100;
}
