const mongoose 		= require("mongoose");
const crypto		= require("crypto");
const TicketModule	= require("./ticket.js")
const Ticket 		= TicketModule.Ticket;
const MongooseTicket = TicketModule.MongooseTicket;
const TicketBoyFunctions = require("./ticketBoyMisc");


mongoose.Promise = global.Promise;

/**
 * TicketBoy constructor function.
 */
const TicketBoy = function() {
	this.mongoDBUrl = null;
};

/**
 * Configuring the module with mongoose database url.
 * 
 * @param {object} config - Configuration for mongo url.
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
 * Creates a new ticket.
 *
 * @param   { String } 			[tag] 	-	The hash tag to be put on an object.
 * @param 	{ String | Date } 	start 	- 	The start of a booking.
 * @param 	{ String | Date } 	end 	- 	The end of a booking.
 * @param 	{ object } 			[object]  -	An additional object to save on a ticket. 
 * returns 	{ promise }						Resolves if new ticket can be created successfully with newly created object.
 */
TicketBoy.prototype.createTicket = function(tag, start, end, object) {
	var ticket = new Ticket();
	return ticket.createTicket(tag, start, end, object);
};

/**
 * Creates a new tag to use for further new ticket creations, in case you'd like to tag a lot of tickets together under one tag.
 *
 * returs 	{string} A new hash string.
 */
TicketBoy.prototype.createTag = function() {
	return TicketBoyFunctions.createHash();
};

// READ 
// ====

/**
 * Checks if a given ticket is expired.
 *
 * @param 	{ mongoose.Schema.Types.ObjectId } mongooseId - Mongoose _id of the ticket.
 * returns 	{ promise }										Resolves with true if 'end' date object is of a higher date than now.
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
 * Gets the timeperiod between the start and the end of a Ticket Object.
 *
 * @param 	{ mongoose.Schema.Types.ObjectId } mongooseId - Mongoose _id of the ticket.
 * returns 	{ promise }										Difference between start and end in milliseconds.
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
 * Given a tag, searches through the whole database for that tag, finds all the 
 * Tickets with that tag and returns true if booked.
 * Warning: This will return the first object that contains the given time instance.
 *
 * @param	{ string }	tag 	-	Tag on which elements will be searched.
 * @param	{ date }	time 	-	Time object, we'll check if it is booked for this time instance.
 * returns	{ promise }				Returns an object with booked: true with the whole found ticket if something is found. Else it passes in booked: false.
 */
TicketBoy.prototype.isBooked = function(tag, time) {
	return new Promise((resolve, reject) => {
		// Find all mongoose objects with given tag.
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
 * Finds all Ticket objects having the given tag.
 *
 * @param	{ string } 		tag 	- 	Tag on which elements will be found.
 * returns  { promise }		 			Resolves with found Tickets.
 */
TicketBoy.prototype.findAll = function(tag) {
	return new Promise((resolve, reject) => {
		// Find all mongoose objects with given tag.
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
 * Extends a Ticket's end time.
 *
 * @param 	{ mongoose.Schema.Types.ObjectId } mongooseId - Mongoose _id of the object to extend.
 * @param 	{ String | Date } 				   [end]      - The end of a booking.
 * returns 	{ promise }										Resolves with extended Ticket.
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
 * Updates a Ticket with some new data.
 *
 * @param   { mongoose.Schema.Types.ObjectId } 	mongooseId - Mongoose _id of the object to extend.
 * @param   { String } 							[tag] 	   - The hash tag to be put on an object. 
 * @param 	{ String | Date } 					[start]    - The start of a booking.
 * @param 	{ String | Date } 					[end] 	   - The end of a booking.
 * @param 	{ object } 							[object]   - An additional object to save on a ticket. 
 * returns 	{ promise }										 Resolves with extended ticket.
 */
TicketBoy.prototype.updateTicket = function(mongooseId, tag, start, end, obj) {
	return new Promise((resolve, reject) => {
		MongooseTicket.findById(mongooseId, (err, foundTicket) => {
			if (err)
				reject(err);

			foundTicket.start 		= start || foundTicket.start;
			foundTicket.end 		= end 	|| foundTicket.end;
			foundTicket.__object__ 	= obj 	|| foundTicket.__object__;
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
 * Adds a given 'tag' to the ticket object.
 *
 * @param 	{ mongoose.Schema.Types.ObjectId } mongooseId 	- Mongoose _id of Ticket object to add tag to.
 * @param 	{ string }						   tag 			- Tag to add to Ticket object.
 * returns  { promise }									  	  Resolves with updated Ticket.
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
 * Removes tag parameter on Ticket object.
 *
 * @param 	{ mongoose.Schema.Types.ObjectId } mongooseId - Mongoose _id of Ticket object to remove tag from.
 * returns 													Resolves with updated Ticket.
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
 * Deletes a Ticket object.
 *
 * @param { mongoose.Schema.Types.ObjectId } mongooseId - Mongoose _id of Ticket object to remove.
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
 * Deletes all objects with given tagname.
 *
 * @param 	{ string } tag - We'll use this as reference to remove files.
 * returns 	{ promise }		 Returns true incase remove was successful.
 */
TicketBoy.prototype.removeAllWithTag = function(tag) {
	return new Promise((resolve, reject) => {
		// Find all mongoose objects with given tag.
		MongooseTicket.remove({ __tag__ : tag }, function(err) {
			if (err)
				reject(err);
			resolve(true);
		});
	});
};

/**
 * Removes a Ticket if it is expired.
 *
 * @param  { mongoose.Schema.Types.ObjectId } mongooseId - Mongoose _id of Ticket object to check. 
 * returns { promise }									   Resolves with true if this ticket is expired. Else resolves with false.
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
 * Removes All expired tickets.
 *
 * returns {promise} 	Returns true in case the removal was successful.
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