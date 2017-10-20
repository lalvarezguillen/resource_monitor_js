const os = require('os');
const WebSocket = require('ws');
const wsServer = new WebSocket.Server({port: 8080});


function run () {
  getMetrics().then(metrics => broadcastMetrics(metrics, wsServer))
  setTimeout(run, 2000);
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

interface Metrics {
  cpuUsage: number,
  freeMem: number,
  totalMem: number
}

function getMetrics (): Promise<Metrics> {
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

function broadcastMetrics (metrics: Metrics, wss) {
  console.log(metrics);
  for (let client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(metrics));
    }
  }
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
exports.run = run;