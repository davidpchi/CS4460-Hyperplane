/**
THIS FUNCTION IS CALLED WHEN THE WEB PAGE LOADS. PLACE YOUR CODE TO LOAD THE 
DATA AND DRAW YOUR VISUALIZATION HERE. THE VIS SHOULD BE DRAWN INTO THE "VIS" 
DIV ON THE PAGE.

This function is passed the variables to initially draw on the x and y axes.
**/
var margin = {top: 80, right: 30, bottom: 30, left: 30}; //this is an object aht has been created
var width = 930 - margin.left - margin.right;
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
var view = "Map";
var histSort = "nameAscending";

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

//run this at start
function init(){
	//load the bills data
	loadBillsData();
	
	//load legislator data
    d3.csv('data/113/legislators.csv', function(err,data){        
        rawLegislatorData = data;
        if (isDataOkay()) {
            draw();
        }
    });
	
	document.getElementById("histSorter").style.visibility="hidden";
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
	//clear the visualizatino
	d3.select("svg").remove();
	
	createData();
	
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
		
			//encode the total number of legislators with the color red of each state
			var totalLegis = stateData[state].representativeCount + stateData[state].senatorCount;
            d3.selectAll('#' + stateData[state].name)
                .attr('fill', function() {
                    return ("rgb(" + totalLegis * 4 + ",0,0)");
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
			var dif = (b.representativeCount+b.senatorCount)-(a.representativeCount+a.senatorCount);
			if (dif == 0)
			{
				var nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase()
				if (nameA < nameB) //sort string ascending
					return -1 
				if (nameA > nameB)
					return 1
				return 0 //default return value (no sorting)
			}
			else
			{
				return dif;
			}
		});
	}
	else if (histSort == "Number Ascending")
	{
		stateArray.sort(function(a, b){
			var dif = (a.representativeCount+a.senatorCount)-(b.representativeCount+b.senatorCount);
			if (dif == 0)
			{
				var nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase()
				if (nameA < nameB) //sort string ascending
					return -1 
				if (nameA > nameB)
					return 1
				return 0 //default return value (no sorting)
			}
			else
			{
				return dif;
			}
		});
	}
	else if (histSort == "Name Descending")
	{
		stateArray.sort(function(a, b){
			var nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase()
			if (nameA > nameB) //sort string ascending
				return -1 
			if (nameA < nameB)
				return 1
			return 0 //default return value (no sorting)
		});
	}
	else //if (histSort == "Name Ascending")
	{
		stateArray.sort(function(a, b){
			var nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase()
			if (nameA < nameB) //sort string ascending
				return -1 
			if (nameA > nameB)
				return 1
			return 0 //default return value (no sorting)
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
			.attr("x", offset)
			.attr("width", barWidth-1)
			.attr("height", height - histScale(numLeg))
			.attr("y", histScale(numLeg))
			.attr("fill", "#000080")
			.on("mouseover", function() {
				d3.select(this)
					.attr("fill", "#008000")
				})
			.on("mouseout", function() {
				d3.select(this)
					.attr("fill", "#000080")
				})
			.on("click", function() {histClick(this)});
			
		if (histScale(numLeg)<=height-12)
		{
			svg.append("text")
				.text(numLeg)
				.attr("x", offset+(barWidth/2)-1)
				.attr("y", histScale(numLeg)+10)
				.attr("font-family", "sans-serif")
				.attr("font-size", "10px")
				.attr("fill", "white")
				.attr("text-anchor", "middle");
		}
		else
		{
			svg.append("text")
				.text(numLeg)
				.attr("x", offset+(barWidth/2)-1)
				.attr("y", histScale(numLeg)-2)
				.attr("font-family", "sans-serif")
				.attr("font-size", "10px")
				.attr("fill", "black")
				.attr("text-anchor", "middle");
		}
		
		svg.append("text")
			.text(stateData[state].name)
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
	//to get the state, simply pull the ID of the object
}

function mapOnHoverEnter(object) {
	resetMapFill();
	d3.select(object).attr('fill', 'yellow')
				   .attr('stroke-width', 2);
	//to get the state, simply pull the ID of the object
}

//TODO: mapOnHoverExit is broken
function mapOnHoverExit(object) {
	resetMapFill();
	var state = stateData[object.id];
	var color = computeColorByValue("legislatorCount", state);
	d3.select(object)
		.attr('fill', color)
		.attr('stroke-width', 2);
	//d3.select(object).attr('fill', 'black')
	//			   .attr('stroke-width', 2);
	//to get the state, simply pull the ID of the object
}

function computeColorByValue(val, stateObj) {
	if (val === "legislatorCount") {
		var totalLegis = stateObj.representativeCount + stateObj.senatorCount;
		return ("rgb(" + totalLegis * 4 + ",0,0)");
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
}

function resetMapOutlines() {
	//reset all of map outlines to black 
    for (var state in stateData) {
		d3.selectAll('#' + stateData[state].name)
			.attr('stroke', "black")
			.attr('stroke-width', 1);

	}
}

function resetMapFill() {
	//reset all of the map fills to their proper colors
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
    var viewSelect = document.getElementById("viewSelect");
	view = viewSelect.options[viewSelect.selectedIndex].text;
	
	d3.select('svg').remove();
	console.log(view);
	
	if (view == "Histogram")
	{
		document.getElementById("histSorter").style.visibility="visible";
	}
	else
	{
		document.getElementById("histSorter").style.visibility="hidden";
	}
	
	draw();
	
}

function changeHistSort()
{
	var sortSelect = document.getElementById("histSorter");
	histSort = sortSelect.options[sortSelect.selectedIndex].text;
	
	d3.select('svg').remove();
	console.log(histSort);
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
				senatorCount: 0
			}
		}
	}
	
	//loop through our legislator data to finalize our state data
	for (var legislator in legislatorData) {
		if (legislatorData[legislator].title === "Rep") 
			stateData[legislatorData[legislator].state].representativeCount++;
		else if (legislatorData[legislator].title === "Sen") 
			stateData[legislatorData[legislator].state].senatorCount++;
	}
	
	//loop through our bills and associate them with legislators
	for (var bill in billData) {
		if (legislatorData[billData[bill].sponsor.bioguideid] != null) {
			legislatorData[billData[bill].sponsor.bioguideid].bills.push(billData[bill]);
		}
	}
	
	console.log(legislatorData);
}

function histClick() //add stuff here
{
	console.log("histClick");
}
