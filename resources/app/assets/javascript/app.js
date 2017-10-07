//Firebase
var config = {
    apiKey: "AIzaSyDLRMhBc5n3Zlm4dBqg6BRIY-C64oCboSk",
    authDomain: "project90percent.firebaseapp.com",
    databaseURL: "https://project90percent.firebaseio.com",
    projectId: "project90percent",
    storageBucket: "project90percent.appspot.com",
    messagingSenderId: "995661683537"
  };

firebase.initializeApp(config);

var database = firebase.database();

//TDEE Object
var tdeeCalcObject = {
	isImperialChecked: false,
	gender: "",
	weight: 0,
	age: 0,
	activityLevel: "",
	tdeeRec: 0,
	height: 0,
	height_inches: 0,
	height_feet: 0,
	//Calculates Basal Metabolic Rate
	BMRCalulcator: function (gender, height, weight, age) {
		if (gender === 'female'){
			return parseInt(655 + (9.6 * weight) + (1.8 * height) - (4.7 * age));
		}
		else if (gender === 'male') {	
			return parseInt(66 + (13.7 * weight) + (5 * height) - (6.8 * age));
		}
	},
	// Returns activity factor
	activityFactor: function (activityLevel) {
		if (activityLevel === "sedentary"){
			return 1.2;
		}
		else if (activityLevel === "lightly_active"){
			return 1.375;
		}
		else if (activityLevel === "moderately_active"){
			return 1.55;
		}
		else if (activityLevel === "very_active"){
			return 1.725;
		}
		else if (activityLevel === "extremely_active"){
			return 1.9;
		}
	},
	//Calculates TDEE with activity factor and BMR
	tdeeCalculator: function(gender, height, weight, age, activityLevel) {
		if(gender === "male"){
			var firebaseRef = database.ref("/male");
		}
		else if(gender === "female"){
			var firebaseRef = database.ref("/female");
		}
		//Sending to Firebase
		firebaseRef.push({
				'Height(cm)': Math.round(height),
				'Weight(kg)': Math.round(weight), 
				'Age': age,
				'ActivityLevel': activityLevel,
				'dateAdded': firebase.database.ServerValue.TIMESTAMP
		});		

		var tdeeReccomendation = (tdeeCalcObject.BMRCalulcator(gender, height, weight, age)) * (tdeeCalcObject.activityFactor(activityLevel));
		return parseInt(tdeeReccomendation.toFixed(0));
	}
};


//Numeric conversions
var conversionBetweenMetricAndImperial = {
	//Converts weight in pounds to kilograms
	imperialToMetricConverter_Weight: function(weightInPounds) {
		return parseInt(weightInPounds * 0.45359237);
	},
	//Calculates full height in total inches
	totalInches_Height: function (feet, inches) {
		//Must parseInt on these or we are merging strings
		feet = parseInt(feet);
		inches = parseInt(inches);
		return parseInt((feet * 12) + inches);
	},
	//Converts height in inches to cm
	imperialToMetric_Converter_Height: function(heightInInches) {
	 	heightInInches = parseInt(heightInInches);
	 	return parseInt(heightInInches * 2.54);
	 }
};

var manipulationDOM = {
	//Returns a table row with option to add class, and also appends two columns to the row itself
	appendRow: function(rowClass , weightText , calorieText){
		return $("<tr>")
					.append(
						$("<th>")
							.html(weightText)
							.addClass(rowClass)
					)
					.append(
						$("<th>")
							.html(calorieText)
						.addClass(rowClass)
					)
	}

};

var errorChecking = {
	removeDanger: function(){
	    $(".form-group").removeClass("has-error has-danger");
	    $(".list-unstyled").html("");
	    $("#user-heightMetric").val("");
	    $("#user-weight").val("");
	    $("#user-age").val("");
	}
}



$(document).ready(function(){

	//Hide Metric on load
	$("#user-heightMetric").hide();
	$("#user-heightMetric").val("1");
	$("#weight-lbl").html("lbs");

	//Show Metric on Click
	$("#metric").on("click", function(){
		errorChecking.removeDanger();
		$("#user-heightMetric").val("");
		$("#feet-imperial").hide();
		$("#inches-imperial").hide();
		$("#user-heightMetric").show();
		$("#weight-lbl").html("kg");
		$("#height-lbl").html("cm");
		$("#height-lbl").show();
	});

	//Show Imperial on Click
	$("#imperial").on("click", function(){
		errorChecking.removeDanger();
		$("#user-heightMetric").hide();
		$("#user-heightMetric").val("1");
		$("#feet-imperial").show();
		$("#inches-imperial").show();
		$("#weight-lbl").html("lbs");
		$("#height-lbl").hide();
	});

	//Submit form on click
	$("#form-submit").on("click", function(){
		
		$("#user-result").empty();
		event.preventDefault();
		tdeeCalcObject.isImperialChecked = $("#imperial:checked").val();
		tdeeCalcObject.gender = $("#gender-option option:selected").val().trim().toLowerCase();
		tdeeCalcObject.weight = parseInt($("#user-weight").val().trim());
		tdeeCalcObject.age = parseInt($("#user-age").val().trim());
		tdeeCalcObject.activityLevel = $("#activity-option option:selected").attr("id").toLowerCase();

		if(tdeeCalcObject.isImperialChecked){
			tdeeCalcObject.height_feet = parseInt($("#feet-heightImperial option:selected").val().trim());
			tdeeCalcObject.height_inches = parseInt($("#inches-heightImperial option:selected").val().trim());
			var errorCheckWeight = tdeeCalcObject.weight;
			tdeeCalcObject.height = conversionBetweenMetricAndImperial.imperialToMetric_Converter_Height(conversionBetweenMetricAndImperial.totalInches_Height(tdeeCalcObject.height_feet, tdeeCalcObject.height_inches));
			tdeeCalcObject.weight = conversionBetweenMetricAndImperial.imperialToMetricConverter_Weight(tdeeCalcObject.weight);

		}
		else {
			 tdeeCalcObject.height = parseInt($("#user-heightMetric").val().trim());
		}

		if (tdeeCalcObject.isImperialChecked){//Imperial is checked
			tdeeCalcObject.tdeeRec = tdeeCalcObject.tdeeCalculator(tdeeCalcObject.gender, tdeeCalcObject.height, tdeeCalcObject.weight, tdeeCalcObject.age, tdeeCalcObject.activityLevel);
		}
		else {
			tdeeCalcObject.tdeeRec = tdeeCalcObject.tdeeCalculator(tdeeCalcObject.gender, tdeeCalcObject.height, tdeeCalcObject.weight, tdeeCalcObject.age, tdeeCalcObject.activityLevel);
		}

		$("<div>")
			.attr("id" , "generated_result")
			.html("Your recommended TDEE to maintain your current weight is: " + tdeeCalcObject.tdeeRec + " calories per day!")
			.addClass("panel-body text-center")
			.appendTo("#user-result");

		$("<table>")
			.attr("id" , "weight_maintenance_options")
			.addClass("table table-bordered table-hover table-css")
			.append(
				$("<thead>")
					.append(manipulationDOM.appendRow("text-center", "How much weight you would like to lose a week", "How many calories you need to consume per day throughout the week"))
			)
			.append(
				$("<tbody>")
					.append(manipulationDOM.appendRow("text-center", "2.0 LB", tdeeCalcObject.tdeeRec + 1000))
					.append(manipulationDOM.appendRow("text-center", "1.5 LB", tdeeCalcObject.tdeeRec + 750))
					.append(manipulationDOM.appendRow("text-center", "1.0 LB", tdeeCalcObject.tdeeRec + 500))
					.append(manipulationDOM.appendRow("text-center", "0.5 LB", tdeeCalcObject.tdeeRec + 250))
					.append(manipulationDOM.appendRow("text-center", "0.0 LB", tdeeCalcObject.tdeeRec))
					.append(manipulationDOM.appendRow("text-center", "-0.5 LB", tdeeCalcObject.tdeeRec - 250))
					.append(manipulationDOM.appendRow("text-center", "-1.0 LB", tdeeCalcObject.tdeeRec - 500))
					.append(manipulationDOM.appendRow("text-center", "-1.5 LB", tdeeCalcObject.tdeeRec - 750))
					.append(manipulationDOM.appendRow("text-center", "-2.0 LB", tdeeCalcObject.tdeeRec - 1000))
			)
			.appendTo("#user-result");
	});
});