import rp from 'request-promise-native'
const sleep = require('util').promisify(setTimeout);
import {
	CrawlerService,
	IResource
  } from './src/server/apps/api/services/crawler.service';

let main = async () => {
	let OFFSET = 0;
	let LIMIT = 10000
	let flag = true;
	while (flag == true) {
		let data;
		
		data = JSON.parse(await rp.get(`https://data.wu.ac.at/sparql/?default-graph-uri=&query=SELECT+%3Furl+%3Fformat+%3Fdataset+%3Fportal%0D%0AFROM+%3Chttps%3A%2F%2Fdata.wu.ac.at%2Fportalwatch%2Fld%2F1937%3E+%0D%0AWHERE+%7B+%0D%0A++%7B%3Fportal+dcat%3Adataset+%3Fdataset.+%3Fdataset+dcat%3Adistribution+%3Fdist.+%3Fdist+dcat%3AaccessURL+%3Furl.+%3Fdist+dct%3Aformat+%3Fformat+.+%7D+%0D%0AUNION+%0D%0A++%7B%3Fportal+dcat%3Adataset+%3Fdataset.+%3Fdataset+dcat%3Adistribution+%3Fdist.+%3Fdist+dcat%3AaccessURL+%3Furl.+%3Fdist+dct%3Aformat+%3Fb+.+%3Fb+rdfs%3Alabel+%3Fformat+.+%7D%0D%0A%7D%0D%0ALIMIT+${LIMIT}%0D%0AOFFSET+${OFFSET}&should-sponge=&format=json`))
		if (!data.results.bindings) {
			flag = false
			process.exit()
		} else if (data.results.bindings.length < 1) {
			flag = false
			process.exit()
		}

		let objects2insert: IResource[] = []

		for (let resource of data.results.bindings) {

			let object2insert: IResource = {
				href: undefined,
				source: undefined,
				format: undefined
			};

			try {
				let url = new URL(resource.url.value)
				//index key length max = 1024 bytes
				if (Buffer.byteLength(url.href, 'utf8') >= 1024 || url.href.length >= 1024) {
					console.log('url key too large:', url.href)
					continue;
				}

				object2insert.href = url.href

				if (resource.format) {
					object2insert.format = resource.format.type
				}

				if (resource.dataset) {
					let source: URL['href']
					try {
						source = new URL(resource.dataset.value).href
						object2insert.source = source
						if (Buffer.byteLength(source, 'utf8') >= 1024 || source.length >= 1024) {
							console.log('source key too large:', source)
							object2insert.source = undefined;
						}
					} catch (error) {
						object2insert.source = undefined
					}
				}

				objects2insert.push(object2insert)

			} catch (error) {
				console.error(error.message)
			}

		}

		console.log('inserted', await add(objects2insert))

		await sleep(1000)

		OFFSET += LIMIT;

	}
	process.exit()

}

main()


async function add(resources) {

	return CrawlerService.addResources(resources)

}