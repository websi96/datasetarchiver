const sleep = require('util').promisify(setTimeout);
const rp = require('request-promise-native');
const {
  host,
  port,
  protocol
} = require('./config');

//db setup
const db = require('./database.js').getInstance();

db.connect().then(() => {
  tick();
});

async function tick() {

  let datasets = await db.host.find().getDatasetsToCrawl();

  if (datasets) {
    for (let dataset of datasets) {
      crawl(dataset);
      await sleep(100);
    }
  }

  await sleep(500)

  tick();

}

async function crawl(dataset) {
  try {
    let res = await rp.get(`${protocol}//${host}:${port}/api/crawl?url=${dataset.url.href}`)
    console.log(res)
  } catch (error) {
    console.error(error.message)
  }
}