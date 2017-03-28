const mongoose 		= require("mongoose");
const miscFunctions = require("./ticketBoyMisc");
mongoose.Promise = global.Promise;

// Mongoose **Ticket** Schema.
const ticketSchema = mongoose.Schema({
	__tag__: 	String,
	start: {
		type: 		Date,
		default: 	Date.now
	},
	end: {
		type: 		Date,
		default: 	null
	},
	__object__: mongoose.Schema.Types.Mixed,
	created: {
		type: 		Date,
		default: 	Date.now()
	}
});

// **ticket** model.
const MongooseTicket = mongoose.model("Ticket", ticketSchema);

// CREATE
// ====

/**
 * TicketBoy Constructor function.
 *
 * @param { String | Date } start	The start of a booking.
 * @param { String | Date } end 	The end of a booking.
 * @param { object } 				An additional object tosave on a ticket.
 */
const Ticket = function() {
	this.__tag__ 	= null;
	this.start 		= null;
	this.start 		= null;
	this.__object__	= null;
};

/** ==== LEADER FUNCTIONS ==== **/

// CREATE
// ====
/**
 * Add a new ticket to the database.
 *
 * @param 	{ String | Date } start	The start of a booking.
 * @param 	{ String | Date } end 	The end of a booking.
 * @param 	{ object } 				An additional object tosave on a ticket. 
 * returns 	{ promise }				Resolves if new ticket can be created successfully.
 */
Ticket.prototype.createTicket = function(tag, start, end, object) {
	return new Promise((resolve, reject) => {
		this.__tag__ 	= tag || null;
		// If not entered before or now 
		if (
			(!start && this.start === null)
			|| (!end && this.end === null) ) 
			reject("TicketBoy is missing some crucial values");
		// Time to process those time values if they are not already in the
		// time format.
		try {
			this.start 	= Date.parse(start);
			this.end 	= Date.parse(end);
		} catch (err) {
			reject(err);
		}

		// all these strings passed in should be from **new Date().toString()** 
		// or a similar format.
		if (this.__object__ == null && !object)
			this.__object__ = {};
		else if (this.__object__ == null && object)
			this.__object__ = object;	

		// If we have all the required values.
		MongooseTicket.create({	
			__tag__    :    this.__tag__,	
			start 	   : 	start,
			end        : 	end,
			__object__ : 	object
		}, function(err, createdTicket) {
			if (err)
				reject(err);
			// Create a new hash if no hash
			if (createdTicket.__tag__ == null) {
				createdTicket.__tag__ = miscFunctions.createHash(createdTicket._id);
				createdTicket.save(function(err) {
					if (err) 
						reject(err);
					else {
						resolve(createdTicket);
					}
				});
			} else if (createdTicket.__tag__.length > 0) {
				resolve(createdTicket);
			}							
		});

		
	});
};




module.exports = {
	Ticket 			: Ticket,
	MongooseTicket	: MongooseTicket
}