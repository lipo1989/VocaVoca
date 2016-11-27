define(["sugar-web/activity/activity"], function (activity) {

	// Manipulate the DOM only when it is ready.
	require(['domReady!'], function (doc) {

		// Initialize the activity.
		activity.setup();

        // Load data from previous game and start
		var datastoreObject = activity.getDatastoreObject();
        datastoreObject.loadAsText(function(error, metadata, data){
        	previousData = JSON.parse(data);
            app.init(previousData);
        });

        // Save data of this game on leave
		var stopButton = document.getElementById("stop-button");
        stopButton.addEventListener('click', function (event) {
            console.log("writing...");
            var jsonData = JSON.stringify({points: app.points}); // Save points
            activity.getDatastoreObject().setDataAsText(jsonData);
            activity.getDatastoreObject().save(function (error) {
                if (error === null) {
                    console.log("write done.");
                }
                else {
                    console.log("write failed.");
                }
            });
        });

	});

});


// Define app object as the representation of the game.
// App is comprised of lists of cards and supports learning
// and testing modes.

var app = {
	allLists: [],
	currentListName: "",
	currentList: [],
	currentMode: "",
	currentCard: "",
	currentCardIndex: null,
	points: 0,

	// These functions are only for internal use.
	// Not to be called outside the class

	init: function(previousData){
		for (var key in vocabulary){
			this.allLists.push(key);
		}

		this.currentListName = this.allLists[0];
		if ('points' in previousData){
			this.points = previousData.points;
		}

		this.renderListCtrl();
		this.renderPoints();

		this.setList(this.allLists[0]); // defaultly from the first list
		this.setMode("learning"); // defaultly in learning mode

		this.renderCard();

	},

	setList: function(listName){
		this.currentListName = listName;
		this.currentList = vocabulary[this.currentListName];
		this.currentCardIndex = 0; // defaultly from the first word
    	this.currentCard = this.currentList[this.currentCardIndex];
	},

	setMode: function(mode){
		this.currentMode = mode;
	},

	renderListCtrl: function(){
		$("#currentList").html(this.currentListName.toUpperCase());
		var allListsHtml = "";
		for(var i =0 ; i < this.allLists.length; i++){
			allListsHtml += '<a class="dropdown-item" href="#">' + this.allLists[i] + '</a>';
		}
		$("#allLists").html(allListsHtml);
	},

	renderPoints: function(){
		$("#points").html(this.points);
	},

	renderCard: function(){
		if (this.currentMode == "learning"){
			$("#learningPanel").show();
			$("#testingPanel").hide();
	    	$("#itemnum1").html((this.currentCardIndex+1).toString() + '/' + this.currentList.length.toString());
		    $("#cardpic1").attr("src", "pics/"+this.currentCard+".jpg");
		    $("#engword").html(this.currentCard);
	    } else if (this.currentMode == "testing"){
			$("#learningPanel").hide();
			$("#testingPanel").show();
	    	$("#itemnum2").html((this.currentCardIndex+1).toString() + '/' + this.currentList.length.toString());
		    var testMode = Math.floor(Math.random()*2);
		    if (testMode === 0){ // pic
    		    $("#cardpic2").show().attr("src", "pics/"+this.currentCard+".jpg");
    		    $("#testingPanel .playWord").hide();
		    } else { // audio
		    	$("#cardpic2").hide();
		    	$("#testingPanel .playWord").show();
		    	playAudio(); // BAD design!!!!
		    }
		    $("#ansArea").val("").focus();
		    $("#correctSign").hide();
		    $("#wrongSign").hide();
	    }
	},

};


// These are event handlers binded to the 
// buttons in UI.

function prevCard() {
	if(app.currentCardIndex>0 ){
		app.currentCard = app.currentList[--app.currentCardIndex];
	}
	app.renderCard();
}

function nextCard() {
	if(app.currentCardIndex < app.currentList.length-1 ){
		app.currentCard = app.currentList[++app.currentCardIndex];
	}
	app.renderCard();
}

function changeMode(){
	if ($('input[name=modeOptions]:checked').val() != app.currentMode){
		app.setMode($('input[name=modeOptions]:checked').val());
		app.renderCard();
	}
}

function changeList(){
	app.setList(event.target.text);
	app.renderListCtrl();
	app.renderCard();
}

function checkAns(){
	if ( $("#ansArea").val() == app.currentCard ){
	    $("#correctSign").show();
	    app.points += 5;
	    app.renderPoints();
    }
    else{
    	$("#wrongSign").show();
    }
    window.setTimeout(function(){
    	nextCard();
    }, 800);
}

function playAudio(){
	var audioFile = 'audio/' + app.currentCard + '.mp3';
    var audio = new Audio(audioFile);
    audio.play();
}

$("#prevCard").on("click", prevCard);
$("#nextCard").on("click", nextCard);
$("#allLists").on("click", changeList);
$("#modeBtn").on("click", changeMode); // BUG!!!!
$("#ansArea").keypress(function(e){
	if(e.which == 13){
		checkAns();
	}
});
$(".playWord").on("click", playAudio);
