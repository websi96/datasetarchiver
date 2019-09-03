const sleep = require('util').promisify(setTimeout);
const rp = require('request-promise-native');
const {
  host,
  port,
  protocol,
  env,
  endpoint
} = require('./config');

//db setup
const db = require('./database.js').getInstance();

testConnection()

let flag = true;

db.conn.on('connected', () => {
  flag = true;
  tick();
})

db.conn.on('disconnected', () => {
  flag = false;
})

async function tick() {

  let datasets;
  if (flag) datasets = await db.dataset.find().getDatasetsToCrawl();

  console.log('crawling', datasets.length)

  if (datasets) {
    for (let dataset of datasets) {
      let crawlableDataset = await db.dataset.find().getDatasetToCrawl(dataset.url);
      if (crawlableDataset) {
        crawl(dataset);
      }
    }
  }

  await sleep(500)

  tick();

}

async function crawl(dataset) {
  try {
    let url;
    if (env == 'production') {
      url = `${protocol}//${host}:${port}/${endpoint}/api/crawl?url=${dataset.url.href}`
    } else {
      url = `${protocol}//${host}:${port}/api/crawl?url=${dataset.url.href}`
    }
    let resp = await rp.get({
      uri: url,
      insecure: true
    })
    console.log(resp)
  } catch (error) {
    console.error(error.message)
  }
}

async function testConnection() {
  try {
    let url;
    if (env == 'production') {
      url = `${protocol}//${host}:${port}/${endpoint}/api`
    } else {
      url = `${protocol}//${host}:${port}/api`
    }
    let resp = await rp.get({
      uri: url,
      insecure: true
    })
    console.log(resp)
  } catch (error) {
    console.error(error.message)
  }
}