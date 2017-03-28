// var ticketBoy = require("./").TicketBoy();

// ticketBoy.config({
// 	mongoUrl: "mongodb://localhost/shopDB"
// });

// let someTimeAgo = new Date();
// someTimeAgo.setFullYear(2013);

// let now = new Date();
// now.setFullYear(2019);

// ticketBoy.createTicket("d52f40eef8e4ac0616c77cc9a95299df8db8882b", someTimeAgo, now)
// 	.then((obj) => {
// 		console.log(JSON.stringify(obj));
// 	});

// ticketBoy.findAll("d52f40eef8e4ac0616c77cc9a95299df8db8882b")
// 	.then((obj) => {
// 		console.log(JSON.stringify(obj));
// 	});


// ticketBoy.removeAllExpired()
// 	.then((obj) => {
// 		console.log(JSON.stringify(obj));
// 	});

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
	 	ticketBoy.getPeriod(testObj._id)
	 	.then((obj) => {
	 		console.log( Number.parseInt(JSON.stringify(obj), 10)/(1000*60*60*24) );
	 	})
	 	.catch(err => {
	 	    console.log(err)
	 	});

 	})
 	.catch(err => {
        console.log(err);
 	});
 	
