const EventEmitter = require('events');
const Crawler = require('../crawler.js');
const Crawlers = require('../crawlers.js');
const DatasetModel = require('../../models/dataset.js')

class UrlEmitter extends EventEmitter {};

const urlEmitter = new UrlEmitter();

urlEmitter.on('addUrl', (uri) => {
  console.log("add", uri);
  new DatasetModel({
    uri: uri
  }).save()
  .then(doc => {
    Crawlers[uri] = new Crawler(doc.uri);
    console.log(Crawlers[uri]);
  })
  .catch(err => {
    console.error(err)
  })
});

urlEmitter.on('quitUrl', (uri) => {
  console.log("quit", uri);
  console.log(Crawlers[uri]);
  Crawlers[uri].quit();
});

urlEmitter.on('startUrl', (uri) => {
  console.log("start", uri);
  if (Crawlers[uri]) {
    Crawlers[uri].start();
  } else {
    Crawlers[uri] = new Crawler(uri);
    console.log(Crawlers[uri]);
  }
});

module.exports = urlEmitter;