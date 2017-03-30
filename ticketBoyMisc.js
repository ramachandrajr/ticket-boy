const crypto = require('crypto');
const mongo  = require('mongodb');

/**
 * Creates a new hash.
 */
var createHash = function() {
	var hash = crypto.createHash('sha1');
	var mongooseId = new mongo.ObjectId();
	hash.update(mongooseId.toString());
	return hash.digest('hex').toString();
};



module.exports = {
	createHash: createHash
}