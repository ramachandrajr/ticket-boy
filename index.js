const mongoose 		= require("mongoose");
const crypto		= require("crypto");
const TicketModule	= require("./ticket.js")
const Ticket 		= TicketModule.Ticket;
const MongooseTicket = TicketModule.MongooseTicket;
const TicketBoyFunctions = require("./ticketBoyMisc");


mongoose.Promise = global.Promise;

/**
 * @public
 * @namespace
 * @constructor
 *
 * TicketBoy constructor function.
 */
const TicketBoy = function() {
	this.mongoDBUrl = null;
};

/**
 * @public
 * @memberof TicketBoy
 * Configuring the module with mongoose database url.
 * 
 * @param {Object} config - Configuration for mongo url.
 */
TicketBoy.prototype.config = function(config) {
	try {
		this.mongoDBUrl = config.mongoUrl;
		mongoose.connect(this.mongoDBUrl);
	} catch (err) {
		throw err;
	}
};

// CREATE
// ====

/**
 * @public
 * @memberof TicketBoy
 * @method createTicket
 * Creates a new ticket.
 *
 * @param   { String } [tag] - The hash tag to be put on an Object.
 * @param 	{ String | Date } start	- The start of a booking.
 * @param 	{ String | Date } end -	The end of a booking.
 * @param 	{ Object } [Object] - An additional Object to save on a ticket. 
 * @returns 	{ Promise }	Resolves if new ticket can be created successfully with newly created Object.
 */
TicketBoy.prototype.createTicket = function(tag, start, end, Object) {
	var ticket = new Ticket();
	return ticket.createTicket(tag, start, end, Object);
};

/**
 * @public
 * @memberof TicketBoy
 * @method createTag
 * Creates a new tag to use for further new ticket creations, in case you'd like to tag a lot of tickets together under one tag.
 *
 * @returns 	{string} A new hash string.
 */
TicketBoy.prototype.createTag = function() {
	return TicketBoyFunctions.createHash();
};

// READ 
// ====

/**
 * @public
 * @memberof TicketBoy
 * @method isExpired
 * Checks if a given ticket is expired.
 *
 * @param 	{ mongoose.Schema.Types.ObjectId } mongooseId - Mongoose _id of the ticket.
 * @returns 	{ Promise }	Resolves with true if 'end' date Object is of a higher date than now.
 */
TicketBoy.prototype.isExpired = function(mongooseId) {
	return new Promise((resolve, reject) => {
		MongooseTicket.findById(mongooseId, function(err, foundTicket) {		
			if (err)
				reject(err);								
			resolve(
				Number.parseInt(Date.prototype.getTime.call(foundTicket.end), 10) <=
				Number.parseInt(Date.now(), 10) );
		});
	});
};

/**
 * @public
 * @memberof TicketBoy
 * @method getPeriod
 * Gets the timeperiod between the start and the end of a Ticket Object.
 *
 * @param 	{ mongoose.Schema.Types.ObjectId } mongooseId - Mongoose _id of the ticket.
 * @returns 	{ Promise }	Difference between start and end in milliseconds.
 */
TicketBoy.prototype.getPeriod = function(mongooseId) {
	return new Promise((resolve, reject) => {
		MongooseTicket.findById(mongooseId, function(err, foundTicket) {		
			if (err)
				reject(err);								
			resolve(
				Number.parseInt(Date.prototype.getTime.call(foundTicket.end), 10) -
				Number.parseInt(Date.prototype.getTime.call(foundTicket.start), 10) );
		});
	});
}

/**
 * @public
 * @memberof TicketBoy
 * @method isBooked
 * Given a tag, searches through the whole database for that tag, finds all the 
 * Tickets with that tag and returns true if booked.
 * Warning: This will return the first Object that contains the given time instance.
 *
 * @param { string } tag - Tag on which elements will be searched.
 * @param { date } time - Time Object, we'll check if it is booked for this time instance.
 * @returns { Promise } Returns an Object with booked: true with the whole found ticket if something is found. Else it passes in booked: false.
 */
TicketBoy.prototype.isBooked = function(tag, time) {
	return new Promise((resolve, reject) => {
		// Find all mongoose Objects with given tag.
		MongooseTicket.find({ __tag__ : tag }, function(err, foundTickets) {
			if (err)
				reject(err);
			foundTickets.forEach(function(t) {
				if (time >= t.start || time <= t.end)
					resolve({
						booked : true,
						ticket : t
					});
			});
			resolve({ booked : false });
		});		
	});
};

/**
 * @public
 * @memberof TicketBoy
 * @method findAll
 * Finds all Ticket Objects having the given tag.
 *
 * @param { string } tag - Tag on which elements will be found.
 * @returns { Promise } Resolves with found Tickets.
 */
TicketBoy.prototype.findAll = function(tag) {
	return new Promise((resolve, reject) => {
		// Find all mongoose Objects with given tag.
		MongooseTicket.find({ __tag__ : tag }, function(err, foundTickets) {
			if (err)
				reject(err);
			else 
				// [change:] Resolve with something else incase foundTickets.length < 1.
				resolve(foundTickets);
		});
	});	
};


// UPDATE
// ====

/**
 * @public
 * @memberof TicketBoy
 * @method extendTicket
 * Extends a Ticket's end time.
 *
 * @param 	{ mongoose.Schema.Types.ObjectId } mongooseId - Mongoose _id of the Object to extend timeperiod on.
 * @param 	{ String | Date } [end] - The end of a booking.
 * @returns 	{ Promise }	Resolves with extended Ticket.
 */
TicketBoy.prototype.extendTicket = function(mongooseId, end) {
	return new Promise((resolve, reject) => {
		MongooseTicket.findById(mongooseId, (err, foundTicket) => {
			if (err)
				reject(err);
			foundTicket.end = end;
			foundTicket.save(err => {
				if (err) 
					reject(err);
				resolve(foundTicket);
			});
		});
	});
};

/**
 * @public
 * @memberof TicketBoy
 * @method updateTicket
 * Updates a Ticket with some new data.
 *
 * @param   { mongoose.Schema.Types.ObjectId } 	mongooseId - Mongoose _id of the Object to extend.
 * @param   { String } [tag] 	   - The hash tag to be put on an Object. 
 * @param 	{ String | Date } [start]    - The start of a booking.
 * @param 	{ String | Date } [end] 	   - The end of a booking.
 * @param 	{ Object } [Object]   - An additional Object to save on a ticket. 
 * @returns 	{ Promise }	Resolves with extended ticket.
 */
TicketBoy.prototype.updateTicket = function(mongooseId, tag, start, end, obj) {
	return new Promise((resolve, reject) => {
		MongooseTicket.findById(mongooseId, (err, foundTicket) => {
			if (err)
				reject(err);

			foundTicket.start 		= start || foundTicket.start;
			foundTicket.end 		= end 	|| foundTicket.end;
			foundTicket.__Object__ 	= obj 	|| foundTicket.__Object__;
			foundTicket.__tag__ 	= tag 	|| foundTicket.__tag__;

			foundTicket.save(err => {
				if (err) 
					reject(err);
				resolve(foundTicket);
			});
		});
	});
};


/**
 * @public
 * @memberof TicketBoy
 * @method addTag
 * Adds a given 'tag' to the ticket Object.
 *
 * @param 	{ mongoose.Schema.Types.ObjectId } mongooseId - Mongoose _id of Ticket Object to add tag to.
 * @param 	{ String } tag - Tag to add to Ticket Object.
 * @returns  { Promise } Resolves with updated Ticket.
 */
TicketBoy.prototype.addTag = function(mongooseId, tag) {
	return new Promise((resolve, reject) => {
		MongooseTicket.findById(mongooseId, (err, foundTicket) => {
			if (err)
				reject(err);

			foundTicket.__tag__ = tag;
			foundTicket.save(err => {
				if (err) 
					reject(err);
				resolve(foundTicket);
			});
		});
	});
};



// DESTROY
// ====

/**
 * @public
 * @memberof TicketBoy
 * @method removeTag
 * Removes tag parameter on Ticket Object.
 *
 * @param 	{ mongoose.Schema.Types.ObjectId } mongooseId - Mongoose _id of Ticket Object to remove tag from.
 * @returns 	{ Promise }
 */
TicketBoy.prototype.removeTag = function(mongooseId) {
	return new Promise((resolve, reject) => {
		MongooseTicket.findById(mongooseId, (err, foundTicket) => {
			if (err)
				reject(err);

			foundTicket.__tag__ = null;
			foundTicket.save(err => {
				if (err) 
					reject(err);
				resolve(foundTicket);
			});
		});
	});
};


/**
 * @public
 * @memberof TicketBoy
 * @method removeTicket
 * Deletes a Ticket Object.
 *
 * @param { mongoose.Schema.Types.ObjectId } mongooseId - Mongoose _id of Ticket Object to remove.
 */
TicketBoy.prototype.removeTicket = function(mongooseId) {
	return new Promise((resolve, reject) => {
		MongooseTicket.findByIdAndRemove(mongooseId, (err) => {
			if (err)
				reject(err);
			resolve(true);			
		});
	});
};


/**
 * @public
 * @memberof TicketBoy
 * @method removeAllWithTag
 * Deletes all Objects with given tagname.
 *
 * @param 	{ string } tag - We'll use this as reference to remove files.
 * @returns 	{ Promise }	Returns true incase remove was successful.
 */
TicketBoy.prototype.removeAllWithTag = function(tag) {
	return new Promise((resolve, reject) => {
		// Find all mongoose Objects with given tag.
		MongooseTicket.remove({ __tag__ : tag }, function(err) {
			if (err)
				reject(err);
			resolve(true);
		});
	});
};

/**
 * @public
 * @memberof TicketBoy
 * @method removeIfExpired
 * Removes a Ticket if it is expired.
 *
 * @param  { mongoose.Schema.Types.ObjectId } mongooseId - Mongoose _id of Ticket Object to check. 
 * @returns { Promise }  Resolves with true if this ticket is expired. Else resolves with false.
 */
TicketBoy.prototype.removeIfExpired = function(mongooseId) {
	return new Promise((resolve, reject) => {
		MongooseTicket.findById(mongooseId, function(err, foundTicket) {		
			if (err)
				reject(err);								
			if(
				Number.parseInt(Date.prototype.getTime.call(foundTicket.end), 10) <=
				Number.parseInt(Date.now(), 10) ) {
				MongooseTicket.remove({ _id : foundTicket._id }, function(err) {
					if (err) 
						reject(err);
					resolve(true);
				});
			}
			else 
				resolve(false);
		});
	});
};

/**
 * @public
 * @memberof TicketBoy
 * @method removeAllExpired
 * Removes All expired tickets.
 *
 * @returns { Promise } 	Resolves with 'true' in case the removal was successful.
 */
TicketBoy.prototype.removeAllExpired = function() {
	return new Promise((resolve, reject) => {
		MongooseTicket.find().where('end').lte(Date.now()).remove((err) => {
			if (err)
				reject(err);
			resolve(true);
		});
	});
};



module.exports = {
	TicketBoy: function() { return new TicketBoy(); }
}