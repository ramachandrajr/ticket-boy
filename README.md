# Ticket-Boy(ticket-boy) 
A package I use for creating time based tickets and subscriptions. Now you no longer need to kill time for creating code based on time based ticketing. I built this to use for a hotel management systems, which has a lot of checkin's and checkouts different dates, days years and stuff and we need to check if a user's time is expired(prepaid style hotels) for what he paid for.

## Usage
To get started start with the following code:

``` javascript

	var ticketBoy = require("./").TicketBoy();
    var testObj = {};

    // This is an absolute requirement.
    ticketBoy.config({
	    mongoUrl: "mongodb://localhost/shopDB"
    });

    var someTimeAgo = new Date();
    someTimeAgo.setFullYear(2013);

    var someTimeLater = new Date();
    someTimeLater.setFullYear(2019);
    
    // ticketBoy.createTicket([tag], start, end, [object])
    ticketBoy.createTicket(null, someTimeAgo, someTimeLater)
 	.then((obj) => {
     	testObj = obj;
 		console.log(JSON.stringify(obj));
 		
	 	// ticketBoy.findAll(tag)
	 	ticketBoy.findAll(testObj.__tag__)
	 	.then((obj) => {
	 		obj.forEach((o) => {
	 		    console.log("Found Object: " + o.id);
	 		});
	 	})
	 	.catch(err => {
	 	    console.log(err)
	 	});

 	})
 	.catch(err => {
        console.log(err);
 	});
 	


```




