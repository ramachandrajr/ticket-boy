# Ticket Boy module

### Main objectives
1. Given two **date objects** this module should be able to create a booking for a given number.
2. This module should have a method that will return true if called on with a single or two date objects.

ticket = {
	_id:	MongooseId,
	__tag__:	hash,
	start:	DateObject,
	end:	DateObject,
	__obj__: Some Object that can be stored,
	expired: false,
	created: Timestamp of now
}

methods: 
	// Create
	// ====
	createTicket:
			Creates a new mongoose object, if hash is given sets __id__ to that hash else generates its own hash and returns 
			that hash and mongoose id. Sets expired to true if now is > created.

	// Read
	// ==== 
	-- ticket proto --
	hasExpired:
		Compares today's date with ticket.end and returns true if the ticket has expired.
	-- ticket proto	--
	isBooked:
		Compares if the given time object is within limits of start < datObj < end and returns true if it is.
	-- ticketboy proto --
	getRelated:
		Returns all mongoose objects that have the sane __id__.
	-- ticketboy proto --
	isTagBooked:
		Supply a hash and it will run through all files that have this hash and tell you if it contains that time.
	-- ticket proto --
	checkPeriod:
		Checks how much time is left until start from now.	
	

	// Update
	// ====
	-- ticket proto --
	extendTicket:
		Extends the ticket upto given timestamp.
	-- ticket proto --
	updateTicket:
		Updates the start and end of the ticket.
	-- ticket proto --
	addTag:
		Adds a tag.
	-- ticket proto --
	removeTag:
		Removes a tag.


	// Delete
	// ====
	-- ticket proto --
	deleteIfExpired:
		Deletes a mongoose object if it is expired.
	-- ticket boy proto --
	deleteAllExpired:
		Finds all objects that are expired and deletes them all.
	-- ticket proto --
	deleteTicket:
		Deletes a ticket with the given id.
	-- ticket boy proto --
	deleteTag:
		Deletes all Items with a given tag hash.



