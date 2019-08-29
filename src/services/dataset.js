//db setup
const db = require('../database').getInstance();
let Crawler = require('../utils/crawler');
const {
	CRAWL_InitRange
} = require('../config');
const getRandomInt = require('../utils/randomInt');

async function addHrefToDB(href, source_href = '', filename = '', filetype = '') {
	let url = new URL(href);
	let resp = {};
	let dataset = null;

	try {

		dataset = await new db.dataset({
			url: url,
			'meta.filename': filename,
			'meta.filetype': filetype,
			'crawlingInfo.crawlInterval': getRandomInt(CRAWL_InitRange, CRAWL_InitRange * 4),
			'crawlingInfo.host': url.hostname
		})

		if (source_href.length > 0) {
			dataset.meta.source.push(new URL(source_href))
		}

		await dataset.save()

		resp = {
			datasetstatus: 200,
			datasetmessage: 'dataset added',
			dataseturl: url.href
		};

	} catch (error) {
		if (error.name == 'ValidationError' || error.code == 11000) {
			if (source_href.length > 0) {
				let dataset = await db.dataset.findOne({
					url: url
				})
				let src = new URL(source_href)
				if (!dataset.meta.source.some(e => e.host === src.host)) {
					dataset.meta.source.push(src)
					await dataset.save();
					resp = {
						datasetstatus: 200,
						datasetmessage: 'src added to dataset',
						dataseturl: url.href
					};
				} else {
					resp = {
						datasetstatus: 400,
						datasetmessage: 'src and url already added',
						dataseturl: url.href
					};
				}
			} else {
				resp = {
					datasetstatus: 400,
					datasetmessage: 'url already added',
					dataseturl: url.href
				};
			}
		} else {
			throw error;
		}
	}

	try {
		if (dataset != null) {
			await db.host.updateOne({
				name: url.hostname
			}, {
				$push: {
					datasets: dataset._id
				}
			}, {
				upsert: true,
				setDefaultsOnInsert: true
			}).exec();

			resp.hoststatus = 200;
			resp.hostmessage = 'host added';
			resp.hosturl = url.hostname;
		} else {
			resp.hoststatus = 404;
			resp.hostmessage = 'host not added, no dataset created';
			resp.hosturl = url.hostname;

		}

	} catch (error) {
		resp.hoststatus = 404;
		resp.hostmessage = 'host not added';
		resp.hosturl = url.hostname;
	}

	return resp

}

async function deleteFromDB(href) {
	try {

		let url = new URL(href);

		let status = await db.dataset.deleteOne({
			url: url
		});

		if (status.deletedCount == 1) {
			return `Worker ${process.pid} deleted: ${url.href}`;
		} else {
			return new Error(`A Problem occured, maybe ${url.href} is not in our DB. If you want to add it, try /api/add?url=`);
		}
	} catch (error) {
		throw error
	}
}

async function crawlHref(href) {
	try {

		let url = new URL(href);
		let dataset = await db.host.find().getDatasetToCrawl(url)

		if (dataset) {
			new Crawler(dataset);
			return true;
		} else {
			return false;
		}
	} catch (error) {
		throw error
	}
}

async function crawlDataset(dataset) {
	try {
		new Crawler(dataset);
		let resp = `Worker ${process.pid} started to crawl: ${url.href}`;
		return resp;
	} catch (error) {
		throw error
	}
}

async function getDatasets() {
	try {

		let datasets = await db.dataset.find({})
		if (datasets) {
			return datasets;
		} else {
			return new Error(`no datasets`);
		}
	} catch (error) {
		throw error
	}

}

async function getAllVersionsOfDatasetAsStream(href) {
	try {
		let url = new URL(href);
		let dataset = await db.dataset.findOne({
			url: url
		})
		let versions = []
		for (let version of dataset.versions) {
			let downloadStream = db.bucket.openDownloadStream(version)
			versions.push(downloadStream)
		}
		return versions
	} catch (error) {
		throw error
	}

}

async function addManyHrefsToDB(hrefs) {

	let datasets = [];

	for (let i = 0; i < hrefs.length; i++) {

		try {
			let url = new URL(hrefs[i].url)

			let dataset = await new db.dataset({
				url: url,
				'meta.filetype': '',
				'meta.filename': '',
				'meta.source': [],
				'crawlingInfo.crawlInterval': getRandomInt(CRAWL_InitRange, CRAWL_InitRange * 4),
				'crawlingInfo.host': url.hostname
			});

			if (hrefs[i].format) {
				dataset.meta.filetype = hrefs[i].format
			}

			if (hrefs[i].dataset) {
				dataset.meta.source.push(new URL(hrefs[i].dataset))
			}

			datasets.push(dataset)

		} catch (error) {
			console.error(error.message)
		}

	}

	let response = await db.dataset.insertMany(datasets, {
		ordered: false
	})
	return response

}

module.exports = {
	addHrefToDB,
	deleteFromDB,
	crawlHref,
	getDatasets,
	crawlDataset,
	getAllVersionsOfDatasetAsStream,
	addManyHrefsToDB
}