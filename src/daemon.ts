const os = require('os');
const WebSocket = require('ws');
const wsServer = new WebSocket.Server({port: 8080});


function getMetrics () {
  return new Promise((resolve, reject) => {
    const metrics = {
      cpuUsage: calculateCPUUsage(mergeCoresMetrics(os.cpus()).times),
      freeMem: os.freemem(),
      totalMem: os.totalmem()
    }
    resolve(metrics);
  })
}

/**
 * Stores a metrics object in DB
 * @param metrics 
 */
function storeMetrics (metrics: Metrics) {
  // Store in Influx
}

interface Metrics {
  cpuUsage: number,
  freeMem: number,
  totalMem: number
}

function broadcastMetrics (metrics: Metrics, wss) {
  for (let client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(metrics));
    }
  }
}

interface CPUTimes {
  user: number,
  nice: number,
  sys: number,
  idle: number
}
interface CPUInfo {
  times: CPUTimes
}

function mergeCoresMetrics (coresMetrics: Array<CPUInfo>) {
  return coresMetrics.reduce(function (core, merged) {
    merged.times.user += core.times.user;
    merged.times.nice += core.times.nice;
    merged.times.sys += core.times.sys;
    merged.times.idle += core.times.idle;
    return merged;
  })
}

function calculateCPUUsage (cpuTimes: CPUTimes) {
  let total = 0;
  for (let key in cpuTimes) {
    total += cpuTimes[key];
  }
  const used = total - cpuTimes.idle;
  const used_percent_float = Math.round(used * 100 / total * 100);
  return used_percent_float / 100;
}

exports.storeMetrics = storeMetrics;
exports.getMetrics = getMetrics;
exports.calculateCPUUsage = calculateCPUUsage;
exports.mergeCoresMetrics = mergeCoresMetrics;