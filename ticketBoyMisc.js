const crypto = require('crypto');


var createHash = function(mongooseId) {
	var hash = crypto.createHash('sha1');
	hash.update(mongooseId.toString());
	return hash.digest('hex').toString();
};



module.exports = {
	createHash: createHash
}