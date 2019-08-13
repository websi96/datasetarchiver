let mongoose = require('mongoose')

let fileSchema = new mongoose.Schema({
	length: Number,
	chunkSize: Number,
	uploadDate: Date,
	filename: String,
	md5: String,
	metadata: {
		dataset_ref_id: mongoose.SchemaTypes.ObjectId,
		version: Number
	},
})

fileSchema.query.getFiles = function () {
	return this.find({})
}

fileSchema.query.getFileById = function (id) {
	return this.where({
		'_id': id
	});
}

fileSchema.query.getFileByVersion = async function (dataset_ref_id, version) {
	return this.where({
		'metadata.dataset_ref_id': dataset_ref_id
	}).where({
		'metadata.version': version
	});
}

fileSchema.query.getFilesByNameAndVersions = async function (dataset_ref_id, version1, version2) {
	return this.where({
		'metadata.dataset_ref_id': dataset_ref_id
	}).or([{
		'metadata.version': version1
	}, {
		'metadata.version': version2
	}]);
}

module.exports = mongoose.model('datasets.files', fileSchema)