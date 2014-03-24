/**
THIS FUNCTION IS CALLED WHEN THE WEB PAGE LOADS. PLACE YOUR CODE TO LOAD THE 
DATA AND DRAW YOUR VISUALIZATION HERE. THE VIS SHOULD BE DRAWN INTO THE "VIS" 
DIV ON THE PAGE.

This function is passed the variables to initially draw on the x and y axes.
**/
var margin = {top: 80, right: 50, bottom: 30, left: 30}; //this is an object aht has been created
var width = 950 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;

var x = d3.scale.linear().range([0, width]);
var y = d3.scale.linear().range([height,0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");
    
var yAxis = d3.svg.axis()
    .scale(y)
    .orient('left');
	
var circle;
var svg;

//for drop down menus
var view;
var histSort;
var mapOptions;
var histOptions;
var circleOptions;

var abbrToName = {};
var nameToAbbr = {};

var xLabel = "kernelLength";
var yLabel = "kernelWidth";

//declare our data variables for each individual data set
var rawLegislatorData = null;

//this will be our whole data set
var legislatorData = {};
var stateData = {};
var billData = {};

//congress number
//TODO: Implement a way to switch between congresses
var selectedCongress = 113;
var maxLegislatorCountForState;
var maxBillCountForState;
var maxBillCountForLegislator;

//run this at start
function init(){

	maxLegislatorCountForState = 0;
	maxBillCountForState = 0;
	maxBillCountForLegislator = 0;
	
	//load the bills data
	loadBillsData();
	
	//load legislator data
    d3.csv('data/113/legislators.csv', function(err,data){        
        rawLegislatorData = data;
        if (isDataOkay()) {
			//create our finalized data sets
			createData();
			//finally, kick off the first draw
			draw();
        }
    });
	
	var menu = document.getElementById("viewSelect");
	view = menu.options[menu.selectedIndex].text;
	menu = document.getElementById("histSort");
	histSort = menu.options[menu.selectedIndex].text;
	menu = document.getElementById("mapOptions");
	mapOptions = menu.options[menu.selectedIndex].text;
	menu = document.getElementById("histOptions");
	histOptions = menu.options[menu.selectedIndex].text;
	menu = document.getElementById("circleOptions");
	circleOptions = menu.options[menu.selectedIndex].text;
	
	makeAbbrTables();
}

function loadBillsData() {
	var curIndex = 0; 
	for (var n = 0; n < bills1[0].objects.length; n++) {
		billData[curIndex] = bills1[0].objects[n];
		curIndex++;
	};
	for (var n = 0; n < bills2[0].objects.length; n++) {
		billData[curIndex] = bills2[0].objects[n];
		curIndex++;
	};
	for (var n = 0; n < bills3[0].objects.length; n++) {
		billData[curIndex] = bills3[0].objects[n];
		curIndex++;
	};
	for (var n = 0; n < bills4[0].objects.length; n++) {
		billData[curIndex] = bills4[0].objects[n];
		curIndex++;
	};
	for (var n = 0; n < bills5[0].objects.length; n++) {
		billData[curIndex] = bills5[0].objects[n];
		curIndex++;
	};
	for (var n = 0; n < bills6[0].objects.length; n++) {
		billData[curIndex] = bills6[0].objects[n];
		curIndex++;
	};
	for (var n = 0; n < bills7[0].objects.length; n++) {
		billData[curIndex] = bills7[0].objects[n];
		curIndex++;
	};
	for (var n = 0; n < bills8[0].objects.length; n++) {
		billData[curIndex] = bills8[0].objects[n];
		curIndex++;
	};
	for (var n = 0; n < bills9[0].objects.length; n++) {
		billData[curIndex] = bills9[0].objects[n];
		curIndex++;
	};
	for (var n = 0; n < bills10[0].objects.length; n++) {
		billData[curIndex] = bills10[0].objects[n];
		curIndex++;
	};
	for (var n = 0; n < bills11[0].objects.length; n++) {
		billData[curIndex] = bills11[0].objects[n];
		curIndex++;
	};
	for (var n = 0; n < bills12[0].objects.length; n++) {
		billData[curIndex] = bills12[0].objects[n];
		curIndex++;
	};
	for (var n = 0; n < bills13[0].objects.length; n++) {
		billData[curIndex] = bills13[0].objects[n];
		curIndex++;
	};
	console.log("bills13 done");
	console.log(curIndex);
}

/**
	Check to see if all the data has been loaded properly
	This call is necessary for async loaded data
*/
function isDataOkay() {
    return (rawLegislatorData != null);
}


function draw()
{
	//clear the visualization
	d3.select("svg").remove();
		
	if (view == "Map")
	{
		drawMap();
	}
	else if (view == "Histogram")
	{
		drawHistogram();
	}
	else if (view == "Circles")
	{
		drawCircles();
	}
}

/**
	Load the svgs, process data, and attach the data over to our vis.
*/
function drawMap() {
	//load the map
	//this custom svg has an overlay of a separate on top to allow for hatches over heatmap
    d3.xml("data/custom.svg", "image/svg+xml", function(xml) {
        document.getElementById('vis').appendChild(xml.documentElement);
        
        for (var state in stateData) {
			//TODO: need to provide a way to switch which maximum is being used to compute color
			//atm, it is just the maxLegilslatorCount
			var color = computeColorByValue("legislatorCount", maxLegislatorCountForState, stateData[state]);
			
            d3.selectAll('#' + stateData[state].name)
                .attr('fill', function() {
                    return (color);
                })
                .attr('stroke-width', function() {
                    return (1);
                })
				.attr('stroke', "black")
				.on('click', function() {
					mapOnClick(this);
				})
				.on('mouseover', function() {
					mapOnHoverEnter(this);
				})
				.on('mouseout', function() {
					mapOnHoverExit(this);
				});
				
			//for now, remove the overlay
			d3.selectAll('#overlay_' + stateData[state].name).remove();
            
			//label each state with the abv
            var statePath = document.getElementById(stateData[state].name)
            if (statePath != null) {
                var stateBBox = statePath.getBBox()

                var svgMap = document.getElementsByTagName('svg')[0];
                
                var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'text'); //Create a path in SVG's namespace
                newElement.setAttribute("y", stateBBox.y + stateBBox.height/2); 
                newElement.setAttribute("x", stateBBox.x + stateBBox.width/2); 
                newElement.setAttribute("fill", "blue"); 
                newElement.textContent = stateData[state].name;
                svgMap.appendChild(newElement);
            }
        }		
    });
}

function drawHistogram()
{
	var svg = d3.select("#vis").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		
	var barWidth = (width)/50;
	var scaling = 5;
	
	var stateArray = $.map(stateData, function(value, index) {
		return [value];
		});
	
	if (histSort == "Number Descending")
	{
		stateArray.sort(function(a, b){
			return histNumSortRev(a,b);
		});
	}
	else if (histSort == "Number Ascending")
	{
		stateArray.sort(function(a, b){
			return histNumSort(a,b);
		});
	}
	else if (histSort == "Name Descending")
	{
		stateArray.sort(function(a, b){
			return histAlphaSort(b,a);
		});
	}
	else //if (histSort == "Name Ascending")
	{
		stateArray.sort(function(a, b){
			return histAlphaSort(a,b);
		});
	}
	console.log(stateArray);
	
	var histScale = d3.scale.linear()
		.domain([0, 80])
        .range([height, 0]);
	
	var histAxis = d3.svg.axis()
		.scale(histScale)
		.orient("left");
		
	svg.append("g")
		.attr("class", "axis")
		.call(histAxis);
	
	for (var state in stateData)
	{
		var numLeg = stateData[state].representativeCount+stateData[state].senatorCount;
		var offset = stateArray.indexOf(stateData[state])*barWidth+10;
		svg.append("rect")
			.attr("id", "hist"+stateData[state].name)
			.attr("x", offset)
			.attr("width", barWidth-1)
			.attr("height", height - histScale(numLeg))
			.attr("y", histScale(numLeg))
			.attr("fill", "#000080")
			.on("mouseover", function() {
				histOnHoverEnter(this);
				})
			.on("mouseout", function() {
				histOnHoverExit(this);
				})
			.on("click", function() {
				histOnClick(this);
				});
			
		if (histScale(numLeg)<=height-12)
		{
			svg.append("text")
				.text(numLeg)
				.attr("id","hist"+stateData[state].name+"value")
				.attr("x", offset+(barWidth/2)-1)
				.attr("y", histScale(numLeg)+10)
				.attr("font-family", "sans-serif")
				.attr("font-size", "10px")
				.attr("fill", "white")
				.attr("text-anchor", "middle")
				.on("mouseover", function() {
					histOnHoverEnter(d3.select("#"+this.id.substring(0,this.id.length-5)).node());
					})
				.on("mouseout", function() {
					histOnHoverExit(d3.select("#"+this.id.substring(0,this.id.length-5)).node());
					});
		}
		else
		{
			svg.append("text")
				.text(numLeg)
				.attr("id","hist"+stateData[state].name+"value")
				.attr("x", offset+(barWidth/2)-1)
				.attr("y", histScale(numLeg)-2)
				.attr("font-family", "sans-serif")
				.attr("font-size", "10px")
				.attr("fill", "black")
				.attr("text-anchor", "middle")
				.on("mouseover", function() {
					histOnHoverEnter(d3.select("#"+this.id.substring(0,this.id.length-5)).node());
					})
				.on("mouseout", function() {
					histOnHoverExit(d3.select("#"+this.id.substring(0,this.id.length-5)).node());
					});
		}
		
		svg.append("text")
			.text(stateData[state].name)
			.attr("id","hist"+stateData[state].name+"name")
			.attr("x", offset+(barWidth/2)-1)
			.attr("y", height+10)
			.attr("font-family", "sans-serif")
			.attr("font-size", "10px")
			.attr("fill", "black")
			.attr("text-anchor", "middle");
	}
	
	svg.append("text")
		.text("Number of Legislators")
		.attr("x", width/2)
		.attr("y", -10)
		.attr("font-family", "serif")
		.attr("font-size", "24px")
		.attr("fill", "black")
		.attr("text-anchor", "middle");
	
	
}

function updateHistogram()
{	
	var barWidth = (width)/50;
	var scaling = 5;
	
	var stateArray = $.map(stateData, function(value, index) {
		return [value];
		});
	
	if (histSort == "Number Descending")
	{
		stateArray.sort(function(a, b){
			return histNumSortRev(a,b);
		});
	}
	else if (histSort == "Number Ascending")
	{
		stateArray.sort(function(a, b){
			return histNumSort(a,b);
		});
	}
	else if (histSort == "Name Descending")
	{
		stateArray.sort(function(a, b){
			return histAlphaSort(b,a);
		});
	}
	else //if (histSort == "Name Ascending")
	{
		stateArray.sort(function(a, b){
			return histAlphaSort(a,b);
		});
	}
	console.log(stateArray);
	
	var histScale = d3.scale.linear()
		.domain([0, 80])
        .range([height, 0]);
	
	// var histAxis = d3.svg.axis()
		// .scale(histScale)
		// .orient("left");
		
	// svg.append("g")
		// .attr("class", "axis")
		// .call(histAxis);
	
	for (var state in stateData)
	{
		var numLeg = stateData[state].representativeCount+stateData[state].senatorCount;
		var offset = stateArray.indexOf(stateData[state])*barWidth+10;
		d3.select("#hist"+stateData[state].name)
			.transition()
			.delay(((d3.select("#hist"+stateData[state].name).attr("x")-10)/barWidth)*10)
			.attr("x", offset)
			.attr("width", barWidth-1)
			.attr("height", height - histScale(numLeg))
			.attr("y", histScale(numLeg))
			.attr("fill", "#000080")
			.duration(1000);
			
		if (histScale(numLeg)<=height-12)
		{
			d3.select("#hist"+stateData[state].name+"value")
				.transition()
				// .text(numLeg)
				.delay(((d3.select("#hist"+stateData[state].name+"value").attr("x")-10)/barWidth)*10)
				.attr("x", offset+(barWidth/2)-1)
				.attr("y", histScale(numLeg)+10)
				.attr("fill", "white")
				.duration(1000);
		}
		else
		{
			d3.select("#hist"+stateData[state].name+"value")
				.transition()
				// .text(numLeg)
				.delay(((d3.select("#hist"+stateData[state].name+"value").attr("x")-10)/barWidth)*10)
				.attr("x", offset+(barWidth/2)-1)
				.attr("y", histScale(numLeg)-2)
				.attr("fill", "black")
				.duration(1000);
		}
		
		d3.select("#hist"+stateData[state].name+"name")
			.transition()
			.delay(((d3.select("#hist"+stateData[state].name+"name").attr("x")-10)/barWidth)*10)
			// .text(stateData[state].name)
			.attr("x", offset+(barWidth/2)-1)
			.attr("y", height+10)
			.attr("fill", "black")
			.duration(1000);
	}
	
	// svg.append("text")
		// .text("Number of Legislators")
		// .attr("x", width/2)
		// .attr("y", -10)
		// .attr("font-family", "serif")
		// .attr("font-size", "24px")
		// .attr("fill", "black")
		// .attr("text-anchor", "middle");
	
}

function drawCircles()
{
	var root = {
		firstname: "113th",
		lastname: "Congress", 
		imageURL: "",
		children: [],
		bills: []
	};
	//create a flattened one-level tree of legislators
	for (var legislator in legislatorData) {
		var legislator = legislatorData[legislator];
		root.children.push(legislator);
		root.bills.push("1");
	}
	
	//DEBUG CODE HERE: 
	//DO NOT UNCOMMENT THIS UNLESS YOU KNOW WHAT YOU ARE DOING
	//genImageData();
	//END DEBUG CODE
	
	console.log('root children', root.children);
	
	var diameter = 960,
		format = d3.format(",d"),
		color = d3.scale.category20c();
	
	//959
	//700
	
	svg = d3.select("#vis").append("svg")
		.attr("width", 959)
		.attr("height", 600)
		.attr("class", "bubble");

	svg.append("g").append("clipPath")
		.attr('id', 'cut-off-bottom')
		.append("circle")
			.attr('cx', 100)
			.attr('cy', 100)
			.attr('r', 50);		
	
	var bubble = d3.layout.pack()
		.value(function(d){return d.bills.length})
		//.children(function(d){return null;})
		.size([959, 600])
		.padding(1.5);

		console.log('root', root);
		console.log('we are here', bubble.nodes(root));

	var vis = svg.datum(root).selectAll(".node")
		.data(bubble.nodes)
		.enter()
		.append("g");

	//http://stackoverflow.com/questions/18587107/how-to-add-image-into-center-of-svg-circle	
				
	var circles = vis.append("circle")
		.attr("stroke", "black")
		.style("fill", function(d) { return "white"})
		.attr("cx", function(d) { return d.x;})
		.attr("cy", function(d) { return d.y; })
		.attr("r", function(d) { return d.r; });
		
		//.attr("data-toggle", "tooltip")

	var imagePortraits = vis.append("image")
		.attr("stroke", "black")
		.style("fill", function(d) { return "white"})
		.attr("x", function(d) { return d.x - d.r/2;})
		.attr("y", function(d) { return d.y - d.r/2; })
		.attr("xlink:href", function(d) {return "https://cdn3.iconfinder.com/data/icons/pictofoundry-pro-vector-set/512/Avatar-512.png";})
		.attr('height', function(d) { return d.r;})
		.attr('width', function(d) { return d.r;});
		//.attr('clip-path', "url(#cut-off-bottom)")
		//.attr("data-toggle", "tooltip")
	
	var onHoverCircles = vis.append("circle")
		.attr("stroke", "black")
		.attr("id", function(d) {return d.bioguide_id})
		.style("fill-opacity", 0.0)
		.attr("cx", function(d) { return d.x;})
		.attr("cy", function(d) { return d.y; })
		.attr("r", function(d) { return d.r; })
		.attr("title", function(d) { 					
			return d.firstname + " " + (d.lastname + ": " + format(d.bills.length));	
		});
	
	//add functionality to the onHover of the circles
	for (var circle in onHoverCircles) {
		$(onHoverCircles[circle]).tooltip({
			'container': 'body',
			'placement': 'bottom'
		});	
		
		$(onHoverCircles[circle]).hover(function(){
			$(this).css("stroke","red");
		},function(){
			$(this).css("stroke","black");
		});
		
		$(onHoverCircles[circle]).on('click', function() {circlesOnClick(this);});
	}
}

/**
Call the following function when a state on the map is clicked. 
TODO: Sanat and Ching, update the UI here
*/
function mapOnClick(object) {
	resetMapOutlines();
	d3.select(object).attr('stroke', 'yellow')
				   .attr('stroke-width', 2);
	state = stateData[object.id];
	document.getElementById("StateName").innerHTML= "<b>State Name:</b> " + state.name;
	document.getElementById("RepCount").innerHTML= "<b>Rep Count:</b> " + state.representativeCount;
	document.getElementById("SenatorCount").innerHTML= "<b>Senator Count:</b> " + state.senatorCount;
	document.getElementById("BillCount").innerHTML= "<b>Bill Count:</b> " + state.billCount;
}

function mapOnHoverEnter(object) {
	d3.select(object).attr('fill', 'yellow');
	state = stateData[object.id];
}

//TODO: mapOnHoverExit is broken
function mapOnHoverExit(object) {
	var state = stateData[object.id];
	//TODO: need to provide a way to switch which maximum is being used to compute color
	//atm, it is just the maxLegilslatorCount
	var color = computeColorByValue("legislatorCount", maxLegislatorCountForState, state);
	d3.select(object)
		.attr('fill', color);
}

function computeColorByValue(valType, maxVal, stateObj) {
	var colorScale = ['rgb(247,252,253)','rgb(229,245,249)','rgb(204,236,230)','rgb(153,216,201)','rgb(102,194,164)','rgb(65,174,118)','rgb(35,139,69)','rgb(0,88,36)'];
	
	if (valType === "legislatorCount") {
		var totalLegis = stateObj.representativeCount + stateObj.senatorCount;
		console.log(maxVal);
		var colorIndex = Math.round(totalLegis/maxVal * (colorScale.length-1));
		return (colorScale[colorIndex]);
	}
	
	return ("black");
}

/**
Call the following functino when a legislator on the circle packing grid is clicked.
TODO: Sanat and Ching, update the UI here
*/
function circlesOnClick(object) {
	//to get the legislator, simply pull the ID of the object
	//this will be the same as the legislator's bioguide ID
	var legislator = legislatorData[object.id];
	document.getElementById("legislator_img_src").src = getLegislatorImageURL(legislator.bioguide_id);
}

function getLegislatorImageURL(gov_id) {
	return ("http://theunitedstates.io/images/congress/450x550/" + gov_id +".jpg");
}

function resetMapOutlines() {
	//reset all of map outlines to black 
    for (var state in stateData) {
		d3.selectAll('#' + stateData[state].name)
			.attr('stroke', "black")
			.attr('stroke-width', 1);

	}
}

/**
## onXAxisChange(value)
This function is called whenever the menu for the variable to display on the
x axis changes. It is passed the variable name that has been selected, such as
"compactness". Populate this function to update the scatterplot accordingly.
**/
function onXAxisChange(value){
    d3.select("svg").remove();
    selectedYear = value;
    draw();
}


/**
## onYAxisChange(value)
This function is called whenever the menu for the variable to display on the
y axis changes. It is passed the variable name that has been selected, such as
"Asymmetry Coefficient". Populate this function to update the scatterplot 
accordingly.
**/
function onYAxisChange(value){

}

/**
## showDetails(string)
This function will display details in the "details" box on the page. Pass in 
a string and it will be displayed. For example, 
    showDetails("Variety: " + item.variety);
**/
function showDetails(string){
    d3.select('#details').html(string);
}

function selectView()
{
    var menu = document.getElementById("viewSelect");
	view = menu.options[menu.selectedIndex].text;
	
	d3.select('svg').remove();
	console.log(view);
	
	
	if (view == "Map")
	{
		document.getElementById("mapOptions").style.display="inline";
	}
	else
	{
		document.getElementById("mapOptions").style.display="none";
	}
	
	if (view == "Histogram")
	{
		document.getElementById("histOptions").style.display="inline";
		document.getElementById("histSort").style.display="inline";
	}
	else
	{
		document.getElementById("histOptions").style.display="none";
		document.getElementById("histSort").style.display="none";
	}
	
	if (view == "Circles")
	{
		document.getElementById("circleOptions").style.display="inline";
	}
	else
	{
		document.getElementById("circleOptions").style.display="none";
	}
	
	draw();
	
}

function changeHistSort()
{
	var menu = document.getElementById("histSort");
	histSort = menu.options[menu.selectedIndex].text;
	
	// d3.select('svg').remove();
	console.log(histSort);
	updateHistogram();
}

function changeMapOptions()
{
	var menu = document.getElementById("mapOptions");
	mapOptions = menu.options[menu.selectedIndex].text;
	
	d3.select('svg').remove();
	console.log(mapOptions);
	draw();
}

function changeHistOptions()
{
	var menu = document.getElementById("histOptions");
	histOptions = menu.options[menu.selectedIndex].text;
	
	d3.select('svg').remove();
	console.log(histOptions);
	draw();
}

function changeCircleOptions()
{
	var menu = document.getElementById("circleOptions");
	circleOptions = menu.options[menu.selectedIndex].text;
	
	d3.select('svg').remove();
	console.log(circleOptions);
	draw();
}

/**
## genImageData()
This is a admin function that will use google images to grab all the images 
of the senators and save it to an array. IT SHOULD NOT GET RUN UNDER NORMAL 
CIRCUMSTANCES AND WILL BE REMOVED IN PRODUCTION.
**/
function genImageData() {

	var myArr = [];

	var returnArray = [];
	
	for (var legislator in legislatorData) {
		(function(legislator, legislatorData){myArr.push(function(done) {
			var person = legislatorData[legislator];
			var firstName = person.firstname;
			var lastName = person.lastname;
			var imageSearch = new google.search.ImageSearch();
			var dumbFunction = function() {
				var myRes = null;
				if (imageSearch.results.length != 0) {
					myRes = imageSearch.results[0].url;
					returnArray[firstName + lastName] = myRes;
				}
				done(null, myRes);
			}
			imageSearch.setSearchCompleteCallback(this, dumbFunction, null);
			imageSearch.execute(legislatorData[legislator].firstname + " " 
				+ legislatorData[legislator].lastname);
		})})(legislator, legislatorData);
	}
	
	async.parallel(myArr, function(err,result) {
		console.log(returnArray);
	});
}

/**
## genImageData()
This is a admin function that will use google images to grab all the images 
of the senators and save it to an array. IT SHOULD NOT GET RUN UNDER NORMAL 
CIRCUMSTANCES AND WILL BE REMOVED IN PRODUCTION.
**/
function genImageData() {

	var myArr = [];

	var returnArray = [];
	
	for (var legislator in legislatorData) {
		(function(legislator, legislatorData){myArr.push(function(done) {
			var person = legislatorData[legislator];
			var firstName = person.firstname;
			var lastName = person.lastname;
			var imageSearch = new google.search.ImageSearch();
			var dumbFunction = function() {
				var myRes = null;
				if (imageSearch.results.length != 0) {
					myRes = imageSearch.results[0].url;
					returnArray[firstName + lastName] = myRes;
				}
				done(null, myRes);
			}
			imageSearch.setSearchCompleteCallback(this, dumbFunction, null);
			imageSearch.execute(legislatorData[legislator].firstname + " " 
				+ legislatorData[legislator].lastname);
		})})(legislator, legislatorData);
	}
	
	async.parallel(myArr, function(err,result) {
		console.log(returnArray);
	});
}

function createData()
{
    //loop through all the legislators in our raw data
	for (var i = 0; i < rawLegislatorData.length; i++) {
		//in our legislatorData, use bill_id as the key
		legislatorData[rawLegislatorData[i].bioguide_id] = {
			bioguide_id: rawLegislatorData[i].bioguide_id,
			firstname: rawLegislatorData[i].firstname,
			lastname: rawLegislatorData[i].lastname,
			gender: rawLegislatorData[i].gender,
			lastname: rawLegislatorData[i].lastname,
			state: rawLegislatorData[i].state,
			title: rawLegislatorData[i].title,
			website: rawLegislatorData[i].website,
			imageURL: rawLegislatorData[i].imageURL,
			bills: []
			//TODO: NEED TO ADD BILLS
		};
		
		//init our state data
		if (rawLegislatorData[i].title=="Rep"||rawLegislatorData[i].title=="Sen")
		{
			stateData[rawLegislatorData[i].state] = {
				name: rawLegislatorData[i].state,
				representativeCount: 0,
				senatorCount: 0,
				billCount: 0
			}
		}
	}
	
	//loop through our bills and associate them with legislators
	for (var bill in billData) {
		if (legislatorData[billData[bill].sponsor.bioguideid] != null) {
			legislatorData[billData[bill].sponsor.bioguideid].bills.push(billData[bill]);
		}
	}
	
	//loop through our legislator data to finalize our state data
	for (var legislator in legislatorData) {
		if (legislatorData[legislator].title === "Rep") 
			stateData[legislatorData[legislator].state].representativeCount++;
		else if (legislatorData[legislator].title === "Sen") 
			stateData[legislatorData[legislator].state].senatorCount++;
		
		if (stateData[legislatorData[legislator].state] != null) {
			stateData[legislatorData[legislator].state].billCount += legislatorData[legislator].bills.length;
		}
	}
	
	//calculate maximums
	for (var state in stateData) {
		//calculate the total number of legislators for each state
		var totalLegis = stateData[state].representativeCount + stateData[state].senatorCount;
		//keep a running track of what the highest legislatorCount is
		if (totalLegis > maxLegislatorCountForState) 
			maxLegislatorCountForState = totalLegis;
		//TODO: NEED TO CALCULATE MAX BILL COUNT FOR STATES
	}	
	//TODO: NEED TO CALCULATE MAX BILL COUNT FOR LEGISLATORS
}

function histOnClick(object) //add stuff here
{
	for (var state in stateData)
	{
		d3.select("#hist"+stateData[state].name)
			.attr("stroke-width",0);
	}
	d3.select(object)
		.attr("stroke", "#00FFFF")
		.attr("stroke-width",2);
}

function histOnHoverEnter(object)
{
	d3.select(object)
		.attr("fill", "#008000");
	d3.select("#"+object.id+"name")
		.attr("y",height+25)
		.attr("font-size", "16px")
		.attr("font-weight", "bold")
		.text(abbrToName[object.id.substring(object.id.length-2,object.id.length)]);
}

function histOnHoverExit(object)
{
	d3.select(object)
		.attr("fill", "#000080");
	d3.select("#"+object.id+"name")
		.attr("y",height+10)
		.attr("font-size", "10px")
		.attr("font-weight", "normal")
		.text(object.id.substring(object.id.length-2,object.id.length));
}

function histAlphaSort(a,b) //if b is later, return -1
{
	var nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase()
	if (nameA < nameB) //sort string ascending
		return -1 
	if (nameA > nameB)
		return 1
	return 0 //default return value (no sorting)
}

function histNumSort(a,b) //if a is greater, return 1
{
	var dif = (a.representativeCount+a.senatorCount)-(b.representativeCount+b.senatorCount);
	if (dif == 0)
	{
		return histAlphaSort(a,b)
	}
	else
	{
		return dif;
	}
}

function histNumSortRev(a,b) //if b is greater, return 1
{
	var dif = (b.representativeCount+b.senatorCount)-(a.representativeCount+a.senatorCount);
	if (dif == 0)
	{
		return histAlphaSort(a,b)
	}
	else
	{
		return dif;
	}
}

function makeAbbrTables()
{
	nameToAbbr = {
	"Alabama":"AL",
	"Alaska":"AK",
	"Arizona":"AZ",
	"Arkansas":"AR",
	"California":"CA",
	"Colorado":"CO",
	"Connecticut":"CT",
	"Delaware":"DE",
	"Florida":"FL",
	"Georgia":"GA",
	"Hawaii":"HI",
	"Idaho":"ID",
	"Illinois":"IL",
	"Indiana":"IN",
	"Iowa":"IA",
	"Kansas":"KS",
	"Kentucky":"KY",
	"Louisiana":"LA",
	"Maine":"ME",
	"Maryland":"MD",
	"Massachusetts":"MA",
	"Michigan":"MI",
	"Minnesota":"MN",
	"Mississippi":"MS",
	"Missouri":"MO",
	"Montana":"MT",
	"Nebraska":"NE",
	"Nevada":"NV",
	"New Hampshire":"NH",
	"New Jersey":"NJ",
	"New Mexico":"NM",
	"New York":"NY",
	"North Carolina":"NC",
	"North Dakota":"ND",
	"Ohio":"OH",
	"Oklahoma":"OK",
	"Oregon":"OR",
	"Pennsylvania":"PA",
	"Rhode Island":"RI",
	"South Carolina":"SC",
	"South Dakota":"SD",
	"Tennessee":"TN",
	"Texas":"TX",
	"Utah":"UT",
	"Vermont":"VT",
	"Virginia":"VA",
	"Washington":"WA",
	"West Virginia":"WV",
	"Wisconsin":"WI",
	"Wyoming":"WY"
	}
	
	for (var name in nameToAbbr)
	{
		abbrToName[nameToAbbr[name]] = name;
	}

}