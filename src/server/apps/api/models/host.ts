import mongoose, {
	Document,
	DocumentQuery,
	Model
} from 'mongoose';
import config from '../../../config';
import {
	ObjectId
} from "bson";

export interface IHost extends Document {
	name: string,
	currentlyCrawled: boolean,
	nextCrawl: Date,
	datasets: number[]
}

export interface IHostModel extends Model < IHost, typeof hostQueryHelpers > {
	lockHost: (hostname: String) => any,
	releaseHostByDsID: (id: ObjectId) => any,
	releaseHost: (hostname: String) => any,
	releaseHosts: () => any
}

let hostSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true,
		index: true
	},
	currentlyCrawled: {
		type: Boolean,
		default: false,
		index: true
	},
	nextCrawl: {
		type: Date,
		default: new Date(),
		index: true
	}
})

let hostQueryHelpers = {
	getHostToCrawl(this: DocumentQuery < any, IHost > , hostname: String) {
		return this.findOne({
			$and: [{
				name: hostname
			}, {
				nextCrawl: {
					$lt: new Date()
				}
			}, {
				currentlyCrawled: false
			}]
		})
	},
	getHostsToCrawl(this: DocumentQuery < any, IHost >) {
		return this.find({
			$and: [{
				nextCrawl: {
					$lt: new Date()
				}
			}, {
				currentlyCrawled: false
			}]
		}).select({ "name": 1, "_id": 0});
	}
};

hostSchema.query = hostQueryHelpers

hostSchema.statics.lockHost = function (hostname: String) {
	return this.findOneAndUpdate({
		$and: [{
			name: hostname
		}, {
			nextCrawl: {
				$lt: new Date()
			}
		}, {
			currentlyCrawled: false
		}]
	}, {
		$set: {
			currentlyCrawled: true
		}
	}, {
		new: true
	}).select({ "_id": 1});
};

hostSchema.statics.releaseHosts = function () {
	return this.updateMany({
		currentlyCrawled: true
	}, {
		$set: {
			currentlyCrawled: false,
			nextCrawl: new Date(new Date().getTime() + config.CRAWL_HostInterval * 1000)
		}
	});
};

hostSchema.statics.releaseHost = function (hostname) {
	return this.updateOne({
		name: hostname
	}, {
		$set: {
			currentlyCrawled: false,
			nextCrawl: new Date(new Date().getTime() + config.CRAWL_HostInterval * 1000)
		}
	}).select({ "_id": 1});;
};

hostSchema.statics.releaseHostByDsID = function (id: ObjectId) {
	return this.updateOne({
		datasets: id
	}, {
		$set: {
			currentlyCrawled: false,
			nextCrawl: new Date(new Date().getTime() + config.CRAWL_HostInterval * 1000)
		}
	}).select({ "_id": 1});;
};

export default mongoose.model < IHost, IHostModel > ('hosts', hostSchema)