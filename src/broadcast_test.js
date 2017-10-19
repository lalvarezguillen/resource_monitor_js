const Influx = require('influx');

const db = new Influx.InfluxDB({
  host: 'localhost',
  database: 'resource_monitor',
  schema: [
    {
      measurement: 'resources',
      fields: {
        timestamp: Influx.FieldType.INTEGER,
        memory_total: Influx.FieldType.INTEGER,
        memory_used: Influx.FieldType.INTEGER,
        cpu_used: Influx.FieldType.FLOAT
      },
      tags: []
    }
  ]
})

const now = new Date().valueOf();
db.writePoints([
  {
    timestamp: now,
    memory_total: 8*1024*1024,
    memory_used: 1024*1024,
    cpu_used: 20.5
  }
])