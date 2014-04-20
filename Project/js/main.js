/**
THIS FUNCTION IS CALLED WHEN THE WEB PAGE LOADS. PLACE YOUR CODE TO LOAD THE 
DATA AND DRAW YOUR VISUALIZATION HERE. THE VIS SHOULD BE DRAWN INTO THE "VIS" 
DIV ON THE PAGE.

This function is passed the variables to initially draw on the x and y axes.
**/
var margin = {top: 80, right: 50, bottom: 30, left: 30}; //this is an object aht has been created
var width = 950 - margin.left - margin.right;
var height = 550 - margin.top - margin.bottom;
var navBackStack = new Array();
var navForwardStack = new Array();

var legPanel = "<div id=\"IMG\"><img id=\"legislator_img_src\" width=\"300\" src=\"\"></div >"+
				"<div id=\"LegName\"> <B>Legislator Name: </B></div>"+
				"<div id=\"Website\"><B>Website: </B></div>"+
				"<div id= \"Party\"> <B>Party: </B></div>"+
				"<div id=\"LegTitle\"><B>Title: </B></div>"+
				"<div id=\"District\"><B>District: </B></div>"+
				"<div id=\"indiBillCount\" onC> <B>Number of Bills: </B> </div>"+
				"<div id=\"legBills\">"+
				"<SELECT NAME=\"BillSelect\" id=\"bot_selectBill\"onchange=\"bot_selectBill() \" SIZE=\"7\"  width=\"300px\" style=\"width: 300px\"></SELECT></div>"+
				"<div><button id=\"backButton\" onclick=\"clickBack()\" type=\"button\">Back</button>"+
				"<button id=\"forwardButton\" onclick=\"clickForward()\" type=\"button\">Forward</button></div>";

var bilPanel = "<div id = \"Bill\"> </div>"+
				"<div id = \"Title\"> </div>"+
				"<div><br><b>Sponsor: </b><a id = \"Sponsor\" onclick = \"clickLeg()\" => </a></div>"+
				"<div id = \"Date\"> </div>"+
				"<div id = \"BillStatus\"> </div>"+
				"<div id = \"Active\"> </div>"+
				"<div><button id=\"backButton\" onclick=\"clickBack()\" type=\"button\">Back</button></div>"+
				"<button id=\"forwardButton\" onclick=\"clickForward()\" type=\"button\">Forward</button></div>";

// var legSelPanel = "";
var x = d3.scale.linear().range([0, width]);
var y = d3.scale.linear().range([height,0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");
    
var yAxis = d3.svg.axis()
    .scale(y)
    .orient('left');

//main svg elements for drawing	
var circle;
var svg;

//secondary svg element for breadcrumb drawing
var breadCrumbsSvg;
var breadCrumbsHeight = 820;
var breadCrumbs = [];

//for drop down menus
var view;
var histSort;
var mapOptions;
var histOptions;
var circleOptions;
var scatterOption;

//arrays to keep track of full names vs abbreviations
var abbrToName = {};
var nameToAbbr = {};

//x and y labels for graph
var xLabel = "";
var yLabel = "";

var scatterList = {}; //used for creating/accessing scatterplot

//declare our data variables for each individual data set
var rawLegislatorData = null;

//this will be our whole data set
var legislatorData = {};
var stateData = {};
var billData = {};

//congress number
var selectedCongress = 113;

//maximum values used to calculate various values
var maxLegislatorCountForState;
var maxBillCountForState;
var maxBillCountForLegislator;

//name of filter to arrange data
var filterName;

//maximum color for color scale
var maxValForColorScale;

/**
## init()
This method is run at the start of the app
**/
function init(){

	$("body").fadeIn();

	//initialize the maximum values for each category to be displayed
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
	
	//map the dropdown box selections with functionality
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
	
	//create a look up table to match abbreviations to full state names
	makeAbbrTables();
	
	//add the breadcrumbs region to the screen
	breadCrumbsSvg = d3.select("#breadCrumbs").append("svg")
		.attr("width", 100)
		.attr("height", 840)
	
	var clipPath = breadCrumbsSvg.append("clipPath")
		.attr('id', 'cut-off-bottom');

	//construct our clipPath
	for (var i = breadCrumbsHeight-16; i > 0; i-=32) {
		breadCrumbsSvg	
			.append("circle")
			.attr('cx',	16)
			.attr('cy', i)
			.attr('r', 16)
			.attr('fill', "white");
	}
}

/**
	This method compiles all of the json files associated 
	with bill data into one array
*/
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

/**
	Draw a visualization to the screen based on what view is selected
*/
function draw()
{
	//clear the visualization
	d3.select("#vis").select("svg").remove();
	d3.select("#vis2").select("svg").remove();
	
	if (view == "Map")
	{
		drawMap("#vis");
		drawHistogram("#vis2");
	}
	else if (view == "Histogram")
	{
		drawMap("#vis");
		drawHistogram("#vis2");
	}
	else if (view == "Circles")
	{
		drawCircles("#vis");
	}
	else if (view == "Scatterplot")
	{
		drawMap("#vis");
		drawScatterplot("#vis2");
	}
}

/**
	Load the svgs, process data, and attach the data over to our vis.
*/
function drawMap(visId) {
	//load the map
	//this custom svg has an overlay of a separate on top to allow for hatches over heatmap
	document.getElementById("details").innerHTML = "<h><br><br><b>Welcome to Team Hyperplane.<br>This is the Map View</b><br><br>"+
													"Here, we show the data encoded by state.<br><br>"+
													"Click on a state to see more information on that particular state that includes the number of legislators, bills, etc.<br><br>"+
													"You can change what information is displayed on this graph (between number of legislators and number of bills from that state).</h>";
    
	d3.xml("data/custom.svg", "image/svg+xml", function(xml) {
		if (visId === "#vis") 
			document.getElementById("vis").appendChild(xml.documentElement);
		
		//grab what filter we are using:
		if (mapOptions === "Legislators") {
			filterName = "legislatorCount";
			maxValForColorScale = maxLegislatorCountForState;
		}
		else if (mapOptions === "Bills") {
			filterName = "billCount";
			maxValForColorScale = maxBillCountForState;
		}
		else if (mapOptions === "Population") {
			filterName = "populationCount";
			//TODO: will we provide support for population data? We currently do not
		}
		
        for (var state in stateData) {
			var color = computeColorByValue(filterName, maxValForColorScale, stateData[state]);
			
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
        }		
    });
}

/**
	Update the map with proper coloring based on what is selected
*/
function updateMap() {
	
	//grab what filter we are using:
	if (mapOptions === "Legislators") {
		filterName = "legislatorCount";
		maxValForColorScale = maxLegislatorCountForState;
	}
	else if (mapOptions === "Bills") {
		filterName = "billCount";
		maxValForColorScale = maxBillCountForState;
	}
	else if (mapOptions === "Population") {
		filterName = "populationCount";
		//TODO: will we provide support for population data? We currently do not
	}
	
	for (var state in stateData) {
		var color = computeColorByValue(filterName, maxValForColorScale, stateData[state]);
		
		d3.selectAll('#' + stateData[state].name)
			.transition()
			.attr('fill', function() {
				return (color);
			})
			};
}		

/**
	Draw the histogram visualization
*/
function drawHistogram(visId)
{
	document.getElementById("details").innerHTML = "<h><br><br><b>Welcome to Team Hyperplane.<br>This is the Histogram View</b><br><br>"+
													"The data is organized by state in a histogram bar chart visualization.<br><br>"+
													"Click a bar to see more information on that particular state that includes the number of legislators, bills, etc.<br><br>"+
													"You can change what information is displayed on this graph (between number of legislators and number of bills from that state).<br><br>"+
													" You can also reorganize the order in which these bars are displayed (by ascending state name, ascending legislator count, etc)</h>";
	var svg = d3.select(visId).append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		
	var barWidth = (width)/50;
	
	var property;
	if (mapOptions == "Legislators")
	{
		property = "legislatorCount";
	}
	else //if (mapOptions == "Bills")
	{
		property = "billCount";
	}
	
	var stateArray = $.map(stateData, function(value, index) {
		return [value];
		});
	
	if (histSort == "Legislators")
	{
		stateArray.sort(function(a, b){
			return histLegislatorSort(a,b);
		});
	}
	else if (histSort == "Alphabetical")
	{
		stateArray.sort(function(a, b){
			return histAlphabetSort(a,b);
		});
	}
	else //if (histSort == "Bills")
	{
		stateArray.sort(function(a, b){
			return histBillSort(a,b);
		});
	}
	console.log(stateArray);
	
	var histScale = d3.scale.linear()
		.domain([0, histMax(property)])
        .range([height, 0]);
	
	var histAxis = d3.svg.axis()
		.scale(histScale)
		.orient("left");
		
	svg.append("g")
		.attr("class", "axis")
		.attr("id", "histAxis")
		.call(histAxis);
	
	for (var state in stateData)
	{
		var value = stateData[state][property];
		var offset = stateArray.indexOf(stateData[state])*barWidth+10;
		svg.append("rect")
			.attr("id", "hist"+stateData[state].name)
			.attr("x", offset)
			.attr("width", barWidth-1)
			.attr("height", height - histScale(value))
			.attr("y", histScale(value))
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
			
		if (histScale(value)<=height-12)
		{
			svg.append("text")
				.text(value)
				.attr("id","hist"+stateData[state].name+"value")
				.attr("x", offset+(barWidth/2)-1)
				.attr("y", histScale(value)+10)
				.attr("font-family", "sans-serif")
				.attr("font-size", "8px")
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
				.text(value)
				.attr("id","hist"+stateData[state].name+"value")
				.attr("x", offset+(barWidth/2)-1)
				.attr("y", histScale(value)-2)
				.attr("font-family", "sans-serif")
				.attr("font-size", "8px")
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
	
	if (mapOptions == "Legislators")
	{
		svg.append("text")
			.attr("id","histTitle")
			.text("Number of Legislators")
			.attr("x", width/2)
			.attr("y", -10)
			.attr("font-family", "serif")
			.attr("font-size", "24px")
			.attr("fill", "black")
			.attr("text-anchor", "middle");
	}
	else // if (mapOptions == "Bills");
	{
		svg.append("text")
			.attr("id","histTitle")
			.text("Number of Bills")
			.attr("x", width/2)
			.attr("y", -10)
			.attr("font-family", "serif")
			.attr("font-size", "24px")
			.attr("fill", "black")
			.attr("text-anchor", "middle");
	}
}

/**
	Update the histogram visualization based on what is selected
*/
function updateHistogram()
{	
	var barWidth = (width)/50;
	
	var property;
	if (mapOptions == "Legislators")
	{
		property = "legislatorCount";
	}
	else //if (mapOptions == "Bills")
	{
		property = "billCount";
	}
	
	var stateArray = $.map(stateData, function(value, index) {
		return [value];
		});
	
	if (histSort == "Legislators")
	{
		stateArray.sort(function(a, b){
			return histLegislatorSort(a,b);
		});
	}
	else if (histSort == "Alphabetical")
	{
		stateArray.sort(function(a, b){
			return histAlphabetSort(a,b);
		});
	}
	else //if (histSort == "Bills")
	{
		stateArray.sort(function(a, b){
			return histBillSort(a,b);
		});
	}
	console.log(stateArray);
	
	var histScale = d3.scale.linear()
		.domain([0, histMax(property)])
        .range([height, 0]);
	
	var histAxis = d3.svg.axis()
		.scale(histScale)
		.orient("left");
		
	d3.select("#histAxis")
		.transition()
		.duration(1500)
		.call(histAxis);
		
		
	
	for (var state in stateData)
	{
		var value = stateData[state][property];
		var offset = stateArray.indexOf(stateData[state])*barWidth+10;
		d3.select("#hist"+stateData[state].name)
			.transition()
			.delay(((d3.select("#hist"+stateData[state].name).attr("x")-10)/barWidth)*10)
			.attr("x", offset)
			.attr("width", barWidth-1)
			.attr("height", height - histScale(value))
			.attr("y", histScale(value))
			.attr("fill", "#000080")
			.duration(1000);
			
		if (histScale(value)<=height-12)
		{
			d3.select("#hist"+stateData[state].name+"value")
				.transition()
				.text(value)
				.delay(((d3.select("#hist"+stateData[state].name+"value").attr("x")-10)/barWidth)*10)
				.attr("x", offset+(barWidth/2)-1)
				.attr("y", histScale(value)+10)
				.attr("fill", "white")
				.duration(1000);
		}
		else
		{
			d3.select("#hist"+stateData[state].name+"value")
				.transition()
				.text(value)
				.delay(((d3.select("#hist"+stateData[state].name+"value").attr("x")-10)/barWidth)*10)
				.attr("x", offset+(barWidth/2)-1)
				.attr("y", histScale(value)-2)
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
	
	if (mapOptions == "Legislators")
	{
		d3.select("#histTitle")
			.text("Number of Legislators")
	}
	else // if (mapOptions == "Bills");
	{
		d3.select("#histTitle")
			.text("Number of Bills")
	}
	
}

/**
	Draw the scatterplot visualization
*/
function drawScatterplot(visId)
{
	document.getElementById("details").innerHTML = "<h><br><br><b>Welcome to Team Hyperplane.<br>This is the Scatter Plot View</b><br><br>"+
													"Each mark represents legislator(s) for each state with the number of bills they have created.<br><br>"+
													"The color of these marks shows their political party.<br><br>"+
													"Note that several legislators may be represented at a particular point; click on the point to allow for selection of individual legislators.</h>";
	var svg = d3.select(visId).append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	navBackStack = [];
	clearBreadcrumbItems();
	var barWidth = (width)/50;
	
	var property;
	property = "billCount";
	
	var stateArray = $.map(stateData, function(value, index) {
		return [value];
	});
	
	stateArray.sort(function(a, b){
		return histAlphabetSort(a,b);
	});
	
	
	
	var scatterScale = d3.scale.linear()
		.domain([0, scatterMax(property)])
        .range([height, 0]);
	
	var scatterAxis = d3.svg.axis()
		.scale(scatterScale)
		.orient("left");
		
	svg.append("g")
		.attr("class", "axis")
		.attr("id", "histAxis")
		.call(scatterAxis);
		
	for (var state in stateData)
	{
		var offset = stateArray.indexOf(stateData[state])*barWidth+10;
		svg.append("text")
			.text(stateData[state].name)
			.attr("id","scatter"+stateData[state].name+"name")
			.attr("x", offset)
			.attr("y", height+15)
			.attr("font-family", "sans-serif")
			.attr("font-size", "10px")
			.attr("fill", "black")
			.attr("text-anchor", "middle");
		svg.append("rect")
			.attr("id", "scatter"+stateData[state].name)
			.attr("x", offset-(barWidth/2))
			.attr("width", barWidth-1)
			.attr("height", height+6)
			.attr("y", 0)
			.attr("fill", "#FFFFFF")
	}
	console.log(stateArray);
	
	createScatterList(property);
	
	var onHoverCircles = [];
	for (var node in scatterList)
	{
		var parse = node.split(",");
		var value = parse[1];
		var offset = stateArray.indexOf(stateData[parse[0]])*barWidth+10;
		
		var color = "#000000";

		if (scatterList[node].count == 1) {
			if (scatterList[node].rCount == 1) {
				var myCircle = svg.append("circle")
					.attr("id", node)
					.attr("cx", offset)
					.attr("cy", scatterScale(value))
					.attr("r", 0)
					.attr("fill", "#ef8a62")
					.on("click", function() {
						scatterOnClick(this);
					})
					.attr("title", function(d) { 					
						return scatterNodeString(node);	
					});
					// .tooltip({
					// 'container': 'body',
					// 'placement': 'top'
					// });
					
				onHoverCircles.push(myCircle);
			}
			else if (scatterList[node].dCount == 1) {
				var myCircle = svg.append("circle")
					.attr("id", node)
					.attr("cx", offset)
					.attr("cy", scatterScale(value))
					.attr("r", 5)
					.attr("fill", "#67a9cf")
					.on("click", function() {
						scatterOnClick(this);
					})
					.attr("title", function(d) { 					
						return scatterNodeString(node);	
					});
					// .tooltip({
					// 'container': 'body',
					// 'placement': 'top'
					// });
				
				onHoverCircles.push(myCircle);
			}
			else if (scatterList[node].iCount == 1) {
				var myCircle = svg.append("circle")
					.attr("id", node)
					.attr("cx", offset)
					.attr("cy", scatterScale(value))
					.attr("r", 5)
					.attr("fill", "#99d594")
					.on("click", function() {
						scatterOnClick(this);
					})
					.attr("title", function(d) { 					
						return scatterNodeString(node);	
					});
					// .tooltip({
					// 'container': 'body',
					// 'placement': 'top'
					// });
				
				onHoverCircles.push(myCircle);
			}
		}
		else if (scatterList[node].iCount >= 1 && scatterList[node].rCount == 0 && scatterList[node].dCount == 0)
		{
			var myCircle = svg.append("circle")
					.attr("id", node)
				.attr("cx", offset)
				.attr("cy", scatterScale(value))
				.attr("r", 5)
				.attr("fill", "#99d594")
				.on("click", function() {
					scatterOnClick(this);
				})
				.attr("title", function(d) { 					
					return scatterNodeString(node);	
				});
				// .tooltip({
				// 'container': 'body',
				// 'placement': 'top'
				// });
			onHoverCircles.push(myCircle);
		}
		else {
			var arc1 = d3.svg.arc()
				.innerRadius(0)
				.outerRadius(5)
				.startAngle(0)
				.endAngle(Math.PI);
			svg.append("path")
				.attr("d", arc1)
				.attr("transform", "translate(" + offset + "," + scatterScale(value) + ")")
				.style("fill", "#ef8a62");
			
			onHoverCircles.push(arc1);
			
			var arc2 = d3.svg.arc()
				.innerRadius(0)
				.outerRadius(5)
				.startAngle(Math.PI)
				.endAngle(Math.PI * 2);
			svg.append("path")
				.attr("d", arc2)
				.attr("transform", "translate(" + offset + "," + scatterScale(value) + ")")
				.style("fill", "#67a9cf");
			
			var myCircle = svg.append("circle")
					.attr("id", node)
					.attr("cx", offset)
					.attr("cy", scatterScale(value))
					.attr("r", 5)
					.attr("fill-opacity", 0.0)
					.on("click", function() {
						scatterOnClick(this);
					})
					.attr("title", function(d) { 					
						return scatterNodeString(node);	
					});
					// .tooltip({
					// 'container': 'body',
					// 'placement': 'top'
					// });
			onHoverCircles.push(myCircle);		
		}
	}
	
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
		
		//$(onHoverCircles[circle]).on('click', function() {circlesOnClick(this);});
	}
	
	svg.append("text")
		.text("Legislators and Their Bill Counts")
		.attr("x", width/2)
		.attr("y", -10)
		.attr("font-family", "serif")
		.attr("font-size", "24px")
		.attr("fill", "black")
		.attr("text-anchor", "middle");
	
	
}

/**
	Draw the circle visualization (DEPRECATED)
*/
function drawCircles(visId)
{
	document.getElementById("details").innerHTML = "<h><b>Welcome to Team Hyperplane.<br>This is the Circle View</b></h>";
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
	
	svg = d3.select(visId).append("svg")
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
		.attr("id", function(d) {
			if (d.bioguide_id != undefined)
			{
				return d.bioguide_id;
			}
			else 
			{
				return "circleRoot";
			}
			})
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
	
	d3.select("#circleRoot").call(function() {console.log("grabbed")});
}

/**
	Call the following function when a state on the map is clicked. 
*/
function mapOnClick(object) {
	//this is for the map
	resetMapOutlines();
	d3.select(object).attr('stroke', 'yellow')
				   .attr('stroke-width', 2);
	state = stateData[object.id];
	//document.getElementById("details").innerHTML = legPanel;
	document.getElementById("StateName").innerHTML= "<b>State Name:</b> " + state.name;
	document.getElementById("RepCount").innerHTML= "<b>Rep Count:</b> " + state.representativeCount;
	document.getElementById("SenatorCount").innerHTML= "<b>Senator Count:</b> " + state.senatorCount;
	document.getElementById("BillCount").innerHTML= "<b>Bill Count:</b> " + state.billCount;
	// document.getElementById("StateIMG").innerHTML = "<table width=\"100%\" height=\"100%\"  align=\"center\" valign=\"center\"><tr><td><img src=\"data/resize/"+ state.name +".gif\"></td></tr></table>";
	
	var stateLegHTML = "<B>Legislators:</B> <BR><SELECT  id=\"bot_legSelect\"  onchange=\"bot_legSelect()\" NAME=\"LegSelect\" SIZE=\"7\"  style=\"width: 200px\">";
 	for(var i=0; i<state.representativeCount; i++){
 		stateLegHTML += "<OPTION> " + state.representatives[i].firstname +" "+ state.representatives[i].lastname ;
 	}
 	for(var i=0; i<state.senatorCount; i++){
 		stateLegHTML += "<OPTION> " + state.senators[i].firstname +" "+ state.senators[i].lastname ;
 	}
 	stateLegHTML += "</SELECT>";
 	document.getElementById("LegSelect").innerHTML= stateLegHTML;

 	var stateBillHTML = "<B>Bills:</B> <BR> <SELECT NAME=\"BillSelect\" id=\"bot_selectBill\"onchange=\"bot_selectBill()\" SIZE=\"7\"  style=\"width: 200px\">";
 	for(var i=0; i<state.billCount; i++){
 		stateBillHTML += "<OPTION> " + state.bills[i]["display_number"];
 	}
 	stateBillHTML += "</SELECT>";
 	document.getElementById("BillSelect").innerHTML= stateBillHTML;
 	
	//this is for the histogram
	for (var state in stateData)
	{
		d3.select("#hist"+stateData[state].name)
			.attr("stroke-width",0);
	}
	d3.select("#hist" + object.id)
		.attr("stroke", "#00FFFF")
		.attr("stroke-width",2);
}

/**
	Call the following function with a legislator is clicked
*/
function clickLeg(){
	var selectedText = document.getElementById("Sponsor").innerHTML;
  	var leg;
  	var i = 0;
  	var legislator;
  	var leg2;
  	for(leg in legislatorData)
  	{
  		leg2 = legislatorData[leg];
  		if(selectedText.indexOf(leg2.firstname) != -1 && selectedText.indexOf(leg2.lastname) != -1)
  		{
  			legislator = leg2;
  			break;
  		}
  	}
  	navForwardStack = [];
  	navBackStack.push(["Leg", legislator]);
  	pushBreadgcrumbItem("legislator", getLegislatorImageURL(legislator.bioguide_id));
  	 //var legislator = legislatorData[1];

  	document.getElementById("details").innerHTML = legPanel;
	document.getElementById("legislator_img_src").src = getLegislatorImageURL(legislator.bioguide_id);
	
	//Update right pane
	//<div id="LegName"> <B>Legislator Name: </B></div>
	document.getElementById("LegName").innerHTML= "<b>Name: </b> " + legislator.firstname + " " + legislator.lastname;
	document.getElementById("District").innerHTML = "<b>District: </b>" + legislator.district;
	document.getElementById("Party").innerHTML = "<b>Party: </b>"+legislator.party;
	document.getElementById("Website").innerHTML = "<b>Website: </b><a href=\"" + legislator.website+"\" target=\"_blank\">"+ legislator.website+"</a>";
	document.getElementById("LegTitle").innerHTML = "<b>Title: </b>" + legislator.title;
	document.getElementById("indiBillCount").innerHTML= "<b>Bill Count:</b> " + legislator.bills.length;

	//Legislator bills in Right Pane
	// <SELECT NAME="BillSelect" SIZE="10" MULTIPLE width="300px" style="width: 300px">
	// 					<OPTION> Bill1
	// 					<OPTION> Bill2
	// 					<OPTION> Bill3
	// 					<OPTION> Bill4
	// 					<OPTION> Bill5
	// 					<OPTION> Bill6
	// 				</SELECT>
	var legBillHTML = "<SELECT NAME=\"BillSelect\" id=\"right_selectBill\"onchange=\"right_selectBill()  \"SIZE=\"7\" width=\"300px\" style=\"width: 300px\">";
	for(var i=0; i<legislator.bills.length; i++){
		legBillHTML += "<option> " + legislator.bills[i]["display_number"];
	}
	legBillHTML += "</select>";
	document.getElementById("legBills").innerHTML= legBillHTML;
}

/**
	Call the following when a legislator is selected from the listbox
*/
function bot_legSelect(){
	var selects = document.getElementById("bot_legSelect");
  	var selectedText = selects.options[selects.selectedIndex].text;// gives u value2
  	var leg;
  	var i = 0;
  	var legislator;
  	var leg2;
  	for(leg in legislatorData)
  	{
  		leg2 = legislatorData[leg];
  		if(selectedText.indexOf(leg2.firstname) != -1 && selectedText.indexOf(leg2.lastname) != -1)
  		{
  			legislator = leg2;
  			break;
  		}
  	}
  	navForwardStack = [];
  	navBackStack.push(["Leg", legislator]);
  	pushBreadgcrumbItem("legislator", getLegislatorImageURL(legislator.bioguide_id));

  	 //var legislator = legislatorData[1];

  	document.getElementById("details").innerHTML = legPanel;
	document.getElementById("legislator_img_src").src = getLegislatorImageURL(legislator.bioguide_id);
	
	//Update right pane
	//<div id="LegName"> <B>Legislator Name: </B></div>
	document.getElementById("LegName").innerHTML= "<b>Name: </b> " + legislator.firstname + " " + legislator.lastname;
	document.getElementById("District").innerHTML = "<b>District: </b>" + legislator.district;
	document.getElementById("Party").innerHTML = "<b>Party: </b>"+legislator.party;
	document.getElementById("Website").innerHTML = "<b>Website: </b><a href=\"" + legislator.website+"\" target=\"_blank\">"+ legislator.website+"</a>";
	document.getElementById("LegTitle").innerHTML = "<b>Title: </b>" + legislator.title;
	document.getElementById("indiBillCount").innerHTML= "<b>Bill Count:</b> " + legislator.bills.length;

	//Legislator bills in Right Pane
	// <SELECT NAME="BillSelect" SIZE="10" MULTIPLE width="300px" style="width: 300px">
	// 					<OPTION> Bill1
	// 					<OPTION> Bill2
	// 					<OPTION> Bill3
	// 					<OPTION> Bill4
	// 					<OPTION> Bill5
	// 					<OPTION> Bill6
	// 				</SELECT>
	var legBillHTML = "<SELECT NAME=\"BillSelect\" id=\"right_selectBill\"onchange=\"right_selectBill()  \"SIZE=\"7\" width=\"300px\" style=\"width: 300px\">";
	for(var i=0; i<legislator.bills.length; i++){
		legBillHTML += "<option> " + legislator.bills[i]["display_number"];
	}
	legBillHTML += "</select>";
	document.getElementById("legBills").innerHTML= legBillHTML;
}

/**
	Call the following when a legislator is selected in the details pane
*/
function right_selectLeg(){
	var selects = document.getElementById("right_selectLeg");
  	var selectedText = selects.options[selects.selectedIndex].text;// gives u value2
  	var leg;
  	var i = 0;
  	var legislator;
  	var leg2;
  	for(leg in legislatorData)
  	{
  		leg2 = legislatorData[leg];
  		if(selectedText.indexOf(leg2.firstname) != -1 && selectedText.indexOf(leg2.lastname) != -1)
  		{
  			legislator = leg2;
  			break;
  		}
  	}
  	navForwardStack = [];
  	navBackStack.push(["Leg", legislator]);
  	pushBreadgcrumbItem("legislator", getLegislatorImageURL(legislator.bioguide_id));


  	 //var legislator = legislatorData[1];

  	document.getElementById("details").innerHTML = legPanel;
	document.getElementById("legislator_img_src").src = getLegislatorImageURL(legislator.bioguide_id);
	
	//Update right pane
	//<div id="LegName"> <B>Legislator Name: </B></div>
	document.getElementById("LegName").innerHTML= "<b>Name: </b> " + legislator.firstname + " " + legislator.lastname;
	document.getElementById("District").innerHTML = "<b>District: </b>" + legislator.district;
	document.getElementById("Party").innerHTML = "<b>Party: </b>"+legislator.party;
	document.getElementById("Website").innerHTML = "<b>Website: </b><a href=\"" + legislator.website+"\" target=\"_blank\">"+ legislator.website+"</a>";
	document.getElementById("LegTitle").innerHTML = "<b>Title: </b>" + legislator.title;
	document.getElementById("indiBillCount").innerHTML= "<b>Bill Count:</b> " + legislator.bills.length;

	//Legislator bills in Right Pane
	// <SELECT NAME="BillSelect" SIZE="10" MULTIPLE width="300px" style="width: 300px">
	// 					<OPTION> Bill1
	// 					<OPTION> Bill2
	// 					<OPTION> Bill3
	// 					<OPTION> Bill4
	// 					<OPTION> Bill5
	// 					<OPTION> Bill6
	// 				</SELECT>
	var legBillHTML = "<SELECT NAME=\"BillSelect\" id=\"right_selectBill\"onchange=\"right_selectBill()  \"SIZE=\"7\" width=\"300px\" style=\"width: 300px\">";
	for(var i=0; i<legislator.bills.length; i++){
		legBillHTML += "<option> " + legislator.bills[i]["display_number"];
	}
	legBillHTML += "</select>";
	document.getElementById("legBills").innerHTML= legBillHTML;

	state = stateData[legislator.state];
	document.getElementById("StateName").innerHTML= "<b>State Name:</b> " + state.name;
	document.getElementById("RepCount").innerHTML= "<b>Rep Count:</b> " + state.representativeCount;
	document.getElementById("SenatorCount").innerHTML= "<b>Senator Count:</b> " + state.senatorCount;
	document.getElementById("BillCount").innerHTML= "<b>Bill Count:</b> " + state.billCount;
	// document.getElementById("StateIMG").innerHTML = "<table width=\"100%\" height=\"100%\"  align=\"center\" valign=\"center\"><tr><td><img src=\"data/resize/"+ state.name +".gif\"></td></tr></table>";


	
	var stateLegHTML = "<B>Legislators:</B> <BR><SELECT  id=\"bot_legSelect\"  onchange=\"bot_legSelect()\" NAME=\"LegSelect\" SIZE=\"7\"  style=\"width: 200px\">";
 	for(var i=0; i<state.representativeCount; i++){
 		stateLegHTML += "<OPTION> " + state.representatives[i].firstname +" "+ state.representatives[i].lastname ;
 	}
 	for(var i=0; i<state.senatorCount; i++){
 		stateLegHTML += "<OPTION> " + state.senators[i].firstname +" "+ state.senators[i].lastname ;
 	}
 	stateLegHTML += "</SELECT>";
 	document.getElementById("LegSelect").innerHTML= stateLegHTML;

 	var stateBillHTML = "<B>Bills:</B> <BR> <SELECT NAME=\"BillSelect\" id=\"bot_selectBill\"onchange=\"bot_selectBill()\" SIZE=\"7\"  style=\"width: 200px\">";
 	for(var i=0; i<state.billCount; i++){
 		stateBillHTML += "<OPTION> " + state.bills[i]["display_number"];
 	}
 	stateBillHTML += "</SELECT>";
 	document.getElementById("BillSelect").innerHTML= stateBillHTML;
}

/**
	Call the following when a bill is selected from the listbox
*/
function bot_selectBill(){
	var selects = document.getElementById("bot_selectBill");
  	var selectedText = selects.options[selects.selectedIndex].text;// gives u value2
  	
  	navBackStack.push(["Bill", selectedText]);
  	pushBreadgcrumbItem("bill", selectedText);

  	navForwardStack = [];
  	var bName = ""+ selectedText;
  	//console.log(bName);
  	document.getElementById("details").innerHTML = bilPanel;
  	document.getElementById("Bill").innerHTML = "<br><br><b>Bill: </b>"+selectedText;
  	for(var bil in billData)
  	{
  		 var bill = billData[bil];
  		if(bName == bill["display_number"])
  		{
  			document.getElementById("Title").innerHTML = "<br><b>Title: </b>"+bill.title_without_number;
  			document.getElementById("Sponsor").innerHTML = bill.sponsor.firstname + " " + bill.sponsor.lastname;
  			document.getElementById("Date").innerHTML = "<br><b>Date Introduced: </b>"+bill.introduced_date;
  			document.getElementById("BillStatus").innerHTML = "<br><b>Bill Status: </b>"+ bill.current_status_label;
  			var active;
  			if(bill.is_alive == true)
  				active = "Yes";
  			else
  				active = "No";
  			document.getElementById("Active").innerHTML = "<br><b>Active: </b>"+active;
  			break;
  		}
  		
  	}
  	 // console.log(billData[0]);
}

/**
	Call the following when a bill is selected from the specific details pane
*/
function right_selectBill(){
	var selects = document.getElementById("right_selectBill");
  	var selectedText = selects.options[selects.selectedIndex].text;// gives u value2
  	
  	navBackStack.push(["Bill", selectedText]);
  	pushBreadgcrumbItem("bill", selectedText);

  	navForwardStack = [];
  	document.getElementById("details").innerHTML = bilPanel;
  	document.getElementById("Bill").innerHTML = "<br><br><b>Bill: </b>"+selectedText;
  	var bName = ""+ selectedText;
  	//console.log(bName);
  	for(var bil in billData)
  	{
  		 var bill = billData[bil];
  		if(bName == bill["display_number"])
  		{
  			document.getElementById("Title").innerHTML = "<br><b>Title: </b>"+bill.title_without_number;
  			document.getElementById("Sponsor").innerHTML = bill.sponsor.firstname + " " + bill.sponsor.lastname;
  			document.getElementById("Date").innerHTML = "<br><b>Date Introduced: </b>"+bill.introduced_date;
  			document.getElementById("BillStatus").innerHTML = "<br><b>Bill Status: </b>"+ bill.current_status_label;
  			var active;
  			if(bill.is_alive == true)
  				active = "Yes";
  			else
  				active = "No";
  			document.getElementById("Active").innerHTML = "<br><b>Active: </b>"+active;
  			break;
  		}
  		
  	}
  	
}

/**
## clickBack()
Call the following when you hit back on the legislator list
**/
function clickBack()
{
	var popedFirst = navBackStack.pop();
	var poped = navBackStack.pop();
	popBreadcrumbItem();
	popBreadcrumbItem();
	if(poped != undefined)
	{
		navForwardStack.push(popedFirst);
		
		if(poped[0] == "Bill")
		{
			var selectedText = poped[1];
			var bName = ""+ selectedText;
		  	//console.log(bName);
		  	document.getElementById("details").innerHTML = bilPanel;
		  	document.getElementById("Bill").innerHTML = "<br><br><b>Bill: </b>"+selectedText;
		  	for(var bil in billData)
		  	{
		  		 var bill = billData[bil];
		  		if(bName == bill["display_number"])
		  		{
		  			document.getElementById("Title").innerHTML = "<br><b>Title: </b>"+bill.title_without_number;
		  			document.getElementById("Sponsor").innerHTML = bill.sponsor.firstname + " " + bill.sponsor.lastname;
		  			document.getElementById("Date").innerHTML = "<br><b>Date Introduced: </b>"+bill.introduced_date;
		  			document.getElementById("BillStatus").innerHTML = "<br><b>Bill Status: </b>"+ bill.current_status_label;
		  			var active;
		  			if(bill.is_alive == true)
		  				active = "Yes";
		  			else
		  				active = "No";
		  			document.getElementById("Active").innerHTML = "<br><b>Active: </b>"+active;
		  			break;
		  		}
		  		
		  	}
	  		navBackStack.push(["Bill", poped[1]]);
	  		pushBreadgcrumbItem("bill", poped[1]);
		}
		else if(poped[0] == "Leg")
		{
			var legislator = poped[1];
			document.getElementById("details").innerHTML = legPanel;
			document.getElementById("legislator_img_src").src = getLegislatorImageURL(legislator.bioguide_id);

			document.getElementById("LegName").innerHTML= "<b>Name: </b> " + legislator.firstname + " " + legislator.lastname;
			document.getElementById("indiBillCount").innerHTML= "<b>Bill Count:</b> " + legislator.bills.length;
			document.getElementById("Party").innerHTML = "<b>Party: </b>"+legislator.party;
			document.getElementById("Website").innerHTML = "<b>Website: </b><a href=\"" + legislator.website+"\" target=\"_blank\">"+ legislator.website+"</a>";
			document.getElementById("District").innerHTML = "<b>District: </b>" + legislator.district;
			document.getElementById("LegTitle").innerHTML = "<b>Title: </b>" + legislator.title;

			var legBillHTML = "<SELECT NAME=\"BillSelect\" id=\"right_selectBill\"onchange=\"right_selectBill()  \"SIZE=\"7\"  width=\"300px\" style=\"width: 300px\">";
			for(var i=0; i<legislator.bills.length; i++){
				legBillHTML += "<option> " + legislator.bills[i]["display_number"];
			}
			legBillHTML += "</select>";
			document.getElementById("legBills").innerHTML= legBillHTML;
			navBackStack.push(["Leg", legislator]);
			pushBreadgcrumbItem("legislator", getLegislatorImageURL(legislator.bioguide_id));

		}
		else
		{
			var legislators = poped;
			// console.log(poped);
			var legSelPanel = "<br><br><label>Legislators On that Point: </label><SELECT NAME=\"LegSelect2\" id=\"right_selectLeg\"onchange=\"right_selectLeg() \" SIZE=\"10\"  width=\"300px\" style=\"width: 300px\">"; 
			for(var i = 0; i < legislators.length; i++)
			{
				var leg= legislatorData[legislators[i]];
				// console.log(leg.firstname);
				legSelPanel += "<OPTION> " + leg.firstname + " " + leg.lastname ;
			}
			legSelPanel += "</SELECT>";
			document.getElementById("details").innerHTML = legSelPanel;
			navBackStack.push("LegSel", legislators);
			//pushBreadgcrumbItem("legislator", getLegislatorImageURL(legislator.bioguide_id));
		}
	}
	else
	{
		navBackStack.push(popedFirst);
		if(popedFirst[0] == "Bill")
			pushBreadgcrumbItem("bill", popedFirst[1]);
		else if(popedFirst[0] == "Leg")
			pushBreadgcrumbItem("legislator", getLegislatorImageURL(popedFirst[1].bioguide_id));

	}
}

/**
## clickForward
Call the following when you click forward
**/
function clickForward()
{
	// var popedFirst = navForwardStack.pop();
	var poped = navForwardStack.pop();
	if(poped != undefined)
	{
		navBackStack.push(poped);
		if(poped[0] == "Bill")
		{
			pushBreadgcrumbItem("bill", poped[1]);
			var selectedText = poped[1];
			var bName = ""+ selectedText;
		  	//console.log(bName);
		  	document.getElementById("details").innerHTML = bilPanel;
		  	document.getElementById("Bill").innerHTML = "<br><br><b>Bill: </b>"+selectedText;
		  	for(var bil in billData)
		  	{
		  		 var bill = billData[bil];
		  		if(bName == bill["display_number"])
		  		{
		  			document.getElementById("Title").innerHTML = "<br><b>Title: </b>"+bill.title_without_number;
		  			document.getElementById("Sponsor").innerHTML = bill.sponsor.firstname + " " + bill.sponsor.lastname;
		  			document.getElementById("Date").innerHTML = "<br><b>Date Introduced: </b>"+bill.introduced_date;
		  			document.getElementById("BillStatus").innerHTML = "<br><b>Bill Status: </b>"+ bill.current_status_label;
		  			var active;
		  			if(bill.is_alive == true)
		  				active = "Yes";
		  			else
		  				active = "No";
		  			document.getElementById("Active").innerHTML = "<br><b>Active: </b>"+active;
		  			break;
		  		}
		  		
		  	}
		}
		else if(poped[0] == "Leg")
		{

			var legislator = poped[1];
			pushBreadgcrumbItem("legislator", getLegislatorImageURL(legislator.bioguide_id));
			document.getElementById("details").innerHTML = legPanel;
			document.getElementById("legislator_img_src").src = getLegislatorImageURL(legislator.bioguide_id);

			document.getElementById("LegName").innerHTML= "<b>Name: </b> " + legislator.firstname + " " + legislator.lastname;
			document.getElementById("indiBillCount").innerHTML= "<b>Bill Count:</b> " + legislator.bills.length;
			document.getElementById("Party").innerHTML = "<b>Party: </b>"+legislator.party;
			document.getElementById("Website").innerHTML = "<b>Website: </b><a href=\"" + legislator.website+"\" target=\"_blank\">"+ legislator.website+"</a>";
			document.getElementById("District").innerHTML = "<b>District: </b>" + legislator.district;
			document.getElementById("LegTitle").innerHTML = "<b>Title: </b>" + legislator.title;

			var legBillHTML = "<SELECT NAME=\"BillSelect\" id=\"right_selectBill\"onchange=\"right_selectBill()  \"SIZE=\"7\"  width=\"300px\" style=\"width: 300px\">";
			for(var i=0; i<legislator.bills.length; i++){
				legBillHTML += "<option> " + legislator.bills[i]["display_number"];
			}
			legBillHTML += "</select>";
			document.getElementById("legBills").innerHTML= legBillHTML;
			// navForwardStack.push(["Leg", legislator]);
		}
		else
		{
			var legislators = poped[1];
			var legSelPanel = "<br><br><label>Legislators On that Point: </label><SELECT NAME=\"LegSelect2\" id=\"right_selectLeg\"onchange=\"right_selectLeg() \" SIZE=\"10\"  width=\"300px\" style=\"width: 300px\">"; 
			for(var i = 0; i < legislators.length; i++)
			{
				var leg= legislatorData[legislators[i]];
				// console.log(leg.firstname);
				legSelPanel += "<OPTION> " + leg.firstname + " " + leg.lastname ;
			}
			legSelPanel += "</SELECT>";
			document.getElementById("details").innerHTML = legSelPanel;
			navBackStack.push("LegSel", legislators);
		}
	}
	// else
	// {
	// 	navForwardStack.push(popedFirst);
	// }
}

/**
 ## pushBreadgcrumbItem(type, imgData)
 Pushes a breadcrumb item onto the display stack
**/
function pushBreadgcrumbItem(type, imgData) {
	//if the type is bill, we are just going to push a bill name onto the list
	//if the type is legislator, we are going to push a picture of the legislator onto there
	var imagetemp = imgData;
	//http://icdn.pro/images/en/d/o/document-icone-8253-128.png
	for (var i = 0; i < breadCrumbs.length; i++) {
		if (breadCrumbs[i].type === "legislator") {
			breadCrumbs[i].node
				.transition()
				.attr('y', breadCrumbsHeight - 32 - (32 * (breadCrumbs.length-i)))
				.delay(100)
				.duration(100);
		}
		else {
			breadCrumbs[i].node
				.transition()
				.attr('y', breadCrumbsHeight - 16 - (32 * (breadCrumbs.length-i)))
				.delay(100)
				.duration(100);
		}
	}
	
	var curBread;
	
	if (type === "legislator") {
		var curBreadNode = breadCrumbsSvg.append("image")
			.attr('x', 0)
			.attr('y', breadCrumbsHeight-32)
			.attr('xlink:href', imagetemp)
			.attr('height', 0)
			.attr('width', 0);
			//.attr('fill', "rgb(" + Math.floor((Math.random()*255)+1) + "," + Math.floor((Math.random()*255)+1) + "," + Math.floor((Math.random()*255)+1) + ")")
			//.attr('clip-path', "url(#cut-off-bottom)");
		
		curBread = {
			node: curBreadNode,
			type: "legislator"
		};
	}
	else {
		var curBreadNode = breadCrumbsSvg.append("text")
			.attr('x', 0)
			.attr('y', breadCrumbsHeight-16)
			.text(imgData)
			.style("font-size","10px");
			//.attr('fill', "rgb(" + Math.floor((Math.random()*255)+1) + "," + Math.floor((Math.random()*255)+1) + "," + Math.floor((Math.random()*255)+1) + ")")
			//.attr('clip-path', "url(#cut-off-bottom)");
		
		curBread = {
			node: curBreadNode,
			type: "bill"
		};
	}
	
	curBread.node
		.transition()
		.attr('height', 32)
		.attr('width', 32)
		.delay(200)
		.duration(100);
	
	breadCrumbs.push(curBread);
}

/**
## popBreadcrumbItem()
Pops a breadcrumb item off of the display stack
**/
function popBreadcrumbItem() {
	for (var i = 0; i < breadCrumbs.length; i++) {
		if (i == breadCrumbs.length-1) {
			breadCrumbs[i].node
				.transition()
				.attr('width', 0)
				.attr('height', 0)
				.delay(100)
				.duration(100)
				.each("end",function() { 
					d3.select(this).       // so far, as above
					  remove();            // we delete the object instead 
				  });
		}
		else {
			if (breadCrumbs[i].type === "legislator") {
				breadCrumbs[i].node
					.transition()
					.attr('y', breadCrumbsHeight - (32 * (breadCrumbs.length-(i+1))))
					.delay(100)
					.duration(100);
			}
			else {
				breadCrumbs[i].node
					.transition()
					.attr('y', breadCrumbsHeight + 16 - (32 * (breadCrumbs.length-(i+1))))
					.delay(100)
					.duration(100);
			}
		}
	}
	
	console.log("PRE", breadCrumbs);
	var newArray = [];
	for (var i = 0; i < breadCrumbs.length-1; i++) {
		newArray[i] = breadCrumbs[i];
	}
		
	breadCrumbs = newArray;
	console.log("POST", breadCrumbs);
}

/**
## clearBreadcrumbItems()
Clears all of the nodes in the breadcrumb display stack
**/
function clearBreadcrumbItems() {
	var startSize = breadCrumbs.length;
	for (var i = 0; i < startSize; i++) {
		popBreadcrumbItem();
	}
}

/**
	Call the following when you hover over a state on the map
*/
function mapOnHoverEnter(object) {
	d3.select(object).attr('fill', 'yellow');
	state = stateData[object.id];
	
	var histIdFun = "#hist" + object.id;
	d3.select(histIdFun)
		.attr("fill", "#008000");
	d3.select(histIdFun+"name")
		.attr("y",height+25)
		.attr("font-size", "16px")
		.attr("font-weight", "bold")
		.text(abbrToName[histIdFun.substring(histIdFun.length-2,histIdFun.length)]);
		
	var scatterIdFun = "#scatter" + object.id;
	d3.select(scatterIdFun)
		.attr("fill", "#00FFFF");
	d3.select(scatterIdFun+"name")
		.attr("y",height+30)
		.attr("font-size", "16px")
		.attr("font-weight", "bold")
		.text(abbrToName[scatterIdFun.substring(scatterIdFun.length-2,scatterIdFun.length)]);
}

/**
	Call the following when you leave hovering over a state
*/
function mapOnHoverExit(object) {
	var state = stateData[object.id];
	//TODO: need to provide a way to switch which maximum is being used to compute color
	//atm, it is just the maxLegilslatorCount
	var color = computeColorByValue(filterName, maxValForColorScale, state);
	d3.select(object)
		.attr('fill', color);
	
	var histIdFun = "#hist" + object.id;
	d3.select(histIdFun)
		.attr("fill", "#000080");
	d3.select(histIdFun+"name")
		.attr("y",height+10)
		.attr("font-size", "10px")
		.attr("font-weight", "normal")
		.text(histIdFun.substring(histIdFun.length-2,histIdFun.length));
	
	var scatterIdFun = "#scatter" + object.id;
	d3.select(scatterIdFun)
		.attr("fill", "#FFFFFF");
	d3.select(scatterIdFun+"name")
		.attr("y",height+15)
		.attr("font-size", "10px")
		.attr("font-weight", "normal")
		.text(scatterIdFun.substring(scatterIdFun.length-2,scatterIdFun.length));
}

/**
	Given a value and a maximum value, compute the proper color 
*/
function computeColorByValue(valType, maxVal, stateObj) {
	var colorScale = ['rgb(247,252,253)','rgb(229,245,249)','rgb(204,236,230)','rgb(153,216,201)','rgb(102,194,164)','rgb(65,174,118)','rgb(35,139,69)','rgb(0,88,36)'];
	
	if (valType === "legislatorCount") {
		var totalLegis = stateObj.representativeCount + stateObj.senatorCount;
		// console.log(maxVal);
		var colorIndex = Math.round(totalLegis/maxVal * (colorScale.length-1));
		return (colorScale[colorIndex]);
	}
	
	if (valType === "billCount") {
		var colorIndex = Math.round(stateObj.billCount/maxVal * (colorScale.length-1));
		return (colorScale[colorIndex]);
	}
	
	return ("black");
}

/**
	Call the following function when a legislator on the circle packing grid is clicked. (DEPRECATED)
*/
function circlesOnClick(object) {
	//to get the legislator, simply pull the ID of the object
	//this will be the same as the legislator's bioguide ID
	var legislator = legislatorData[object.id];
	console.log("id: " + object.id);
	//Updates bottom pane
	
	
	document.getElementById("StateName").innerHTML= "<b>State Name:</b> " + legislator.state;
	document.getElementById("RepCount").innerHTML= "<b>Rep Count:</b> " + stateData[legislator.state].representativeCount;
	document.getElementById("SenatorCount").innerHTML= "<b>Senator Count:</b> " + stateData[legislator.state].senatorCount;
	document.getElementById("BillCount").innerHTML= "<b>Bill Count:</b> " + stateData[legislator.state].billCount;
	// document.getElementById("StateIMG").innerHTML = "<table width=\"100%\" height=\"100%\"  align=\"center\" valign=\"center\"><tr><td><img src=\"data/resize/"+ stateData[legislator.state].name  +".gif\"></td></tr></table>";

	document.getElementById("details").innerHTML = legPanel;
	document.getElementById("legislator_img_src").src = getLegislatorImageURL(legislator.bioguide_id);
	
	//Update right pane
	document.getElementById("LegName").innerHTML= "<b>Name: </b> " + legislator.firstname + " " + legislator.lastname;
	document.getElementById("indiBillCount").innerHTML= "<b>Bill Count:</b> " + legislator.bills.length;
	document.getElementById("Party").innerHTML = "<b>Party: </b>"+legislator.party;
	document.getElementById("Website").innerHTML = "<b>Website: </b><a href=\"" + legislator.website+"\" target=\"_blank\">"+ legislator.website+"</a>";
	document.getElementById("District").innerHTML = "<b>District: </b>" + legislator.district;
			document.getElementById("LegTitle").innerHTML = "<b>Title: </b>" + legislator.title;

	var legBillHTML = "<SELECT NAME=\"BillSelect\" id=\"right_selectBill\"onchange=\"right_selectBill() \"SIZE=\"7\"  width=\"300px\" style=\"width: 300px\">";
	for(var i=0; i<legislator.bills.length; i++){
		legBillHTML += "<option> " + legislator.bills[i]["display_number"];
	}
	legBillHTML += "</select>";
	document.getElementById("legBills").innerHTML= legBillHTML;

	var state = stateData[legislator.state];

	var stateLegHTML = "<B>Legislators:</B> <BR><SELECT  id=\"bot_legSelect\"  onchange=\"bot_legSelect()\" NAME=\"LegSelect\" SIZE=\"7\"  style=\"width: 200px\">";
 	for(var i=0; i<state.representativeCount; i++){
 		stateLegHTML += "<OPTION> " + state.representatives[i].firstname +" "+ state.representatives[i].lastname ;
 	}
 	for(var i=0; i<state.senatorCount; i++){
 		stateLegHTML += "<OPTION> " + state.senators[i].firstname +" "+ state.senators[i].lastname ;
 	}
 	stateLegHTML += "</SELECT>";
 	document.getElementById("LegSelect").innerHTML= stateLegHTML;

 	var stateBillHTML = "<B>Bills:</B> <BR> <SELECT NAME=\"BillSelect\" id=\"bot_selectBill\"onchange=\"bot_selectBill() \"SIZE=\"7\" style=\"width: 200px\">";
 	for(var i=0; i<state.billCount; i++){
 		stateBillHTML += "<OPTION> " + state.bills[i]["display_number"];
 	}
 	stateBillHTML += "</SELECT>";
 	document.getElementById("BillSelect").innerHTML= stateBillHTML;


}

/**
##getLegislatorImageURL(gov_id)
Get the legislator image ULR based on gov_id
*/
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

/**
## selectView()
Allow the user to select which view they want to use
**/
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
		document.getElementById("mapOptions").style.display="inline";
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
	
	// d3.select('svg').remove();
	console.log(mapOptions);
	updateMap();
	if (view == "Histogram")
	{
		updateHistogram();
	}
}

function changeHistOptions()
{
	var menu = document.getElementById("histOptions");
	histOptions = menu.options[menu.selectedIndex].text;
	
	// d3.select('svg').remove();
	console.log(histOptions);
	updateHistogram();
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
			party: rawLegislatorData[i].party,
			title: rawLegislatorData[i].title,
			website: rawLegislatorData[i].website,
			imageURL: rawLegislatorData[i].imageURL,
			bills: [],
			billCount: 0,
			district: rawLegislatorData[i].district
		};
		
		//init our state data
		if (rawLegislatorData[i].title=="Rep"||rawLegislatorData[i].title=="Sen")
		{
			stateData[rawLegislatorData[i].state] = {
				name: rawLegislatorData[i].state,
				legislatorCount: 0,
				representativeCount: 0,
				representatives: [],
				senatorCount: 0,
				senators: [], 
				billCount: 0,
				bills: []
			}
		}
	}
	
	//loop through our bills and associate them with legislators
	for (var bill in billData) {
		if (legislatorData[billData[bill].sponsor.bioguideid] != null) {
			legislatorData[billData[bill].sponsor.bioguideid].bills.push(billData[bill]);
			legislatorData[billData[bill].sponsor.bioguideid].billCount++;
		}
	}
	
	//loop through our legislator data to finalize our state data
	for (var legislator in legislatorData) {
		if (legislatorData[legislator].title === "Rep") {
			stateData[legislatorData[legislator].state].representativeCount++;
			stateData[legislatorData[legislator].state].legislatorCount++;
			stateData[legislatorData[legislator].state].representatives.push(legislatorData[legislator]);
		}
		else if (legislatorData[legislator].title === "Sen") {
			stateData[legislatorData[legislator].state].senatorCount++;
			stateData[legislatorData[legislator].state].legislatorCount++;
			stateData[legislatorData[legislator].state].senators.push(legislatorData[legislator]);
		}
		if (stateData[legislatorData[legislator].state] != null) {
			stateData[legislatorData[legislator].state].billCount += legislatorData[legislator].bills.length;
			var legislatorBills = legislatorData[legislator].bills;
			for (var bill in legislatorBills) {
				stateData[legislatorData[legislator].state].bills.push(legislatorBills[bill]);
			}
		}
	}
	
	//calculate maximums
	for (var state in stateData) {
		//calculate the total number of legislators for each state
		var totalLegis = stateData[state].representativeCount + stateData[state].senatorCount;
		//keep a running track of what the highest legislatorCount is
		if (totalLegis > maxLegislatorCountForState) 
			maxLegislatorCountForState = totalLegis;
		//calculate the max bill count for the states
		if (stateData[state].billCount > maxBillCountForState) {
			maxBillCountForState = stateData[state].billCount;
		}
	}	
	//TODO: NEED TO CALCULATE MAX BILL COUNT FOR LEGISLATORS
}

function histOnClick(object) //add stuff here
{
	//this is to handle the histogram
	for (var state in stateData)
	{
		d3.select("#hist"+stateData[state].name)
			.attr("stroke-width",0);
	}
	d3.select(object)
		.attr("stroke", "#00FFFF")
		.attr("stroke-width",2);
	
	//this is to handle the map
	var idFun = object.id.substring(4,6);
	resetMapOutlines();
	d3.select("#" + idFun).attr('stroke', 'yellow')
				   .attr('stroke-width', 2);
	state = stateData[idFun];

	
	stateID = ""+ object.id[4] + object.id[5];
	// console.log(stateID);
	stateChosen = stateData[stateID];
	document.getElementById("StateName").innerHTML= "<b>State Name:</b> " + stateChosen.name;
	document.getElementById("RepCount").innerHTML= "<b>Rep Count:</b> " + stateChosen.representativeCount;
	document.getElementById("SenatorCount").innerHTML= "<b>Senator Count:</b> " + stateChosen.senatorCount;
	document.getElementById("BillCount").innerHTML= "<b>Bill Count:</b> " + stateChosen.billCount;
	// document.getElementById("StateIMG").innerHTML = "<table width=\"100%\" height=\"100%\"  align=\"center\" valign=\"center\"><tr><td><img src=\"data/resize/"+ stateChosen.name +".gif\"></td></tr></table>";


	var stateLegHTML = "<B>Legislators:</B> <BR><SELECT  id=\"bot_legSelect\"  onchange=\"bot_legSelect()\"  NAME=\"LegSelect\" SIZE=\"7\"  style=\"width: 200px\">";
 	for(var i=0; i<stateChosen.representativeCount; i++){
 		stateLegHTML += "<OPTION> " + stateChosen.representatives[i].firstname + " " + stateChosen.representatives[i].lastname ;
 	}
 	for(var i=0; i<stateChosen.senatorCount; i++){
 		stateLegHTML += "<OPTION> " + stateChosen.senators[i].firstname +" "+ stateChosen.senators[i].lastname ;
 	}
 	stateLegHTML += "</SELECT>";
 	document.getElementById("LegSelect").innerHTML= stateLegHTML;

 	var stateBillHTML = "<B>Bills:</B> <BR> <SELECT id=\"bot_selectBill\"onchange=\"bot_selectBill() \"NAME=\"BillSelect\" SIZE=\"7\" style=\"width: 200px\">";
 	for(var i=0; i<stateChosen.billCount; i++){
 		stateBillHTML += "<OPTION> " + stateChosen.bills[i]["display_number"];
 	}
 	stateBillHTML += "</SELECT>";
 	document.getElementById("BillSelect").innerHTML= stateBillHTML;

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
	
	var idFun = object.id.substring(4,6);
	d3.select("#" + idFun).attr('fill', 'yellow');
	state = stateData[idFun];
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
		
	var idFun = object.id.substring(4,6);
	var state = stateData[idFun];
	var color = computeColorByValue(filterName, maxValForColorScale, state);
	d3.select("#" + idFun)
		.attr('fill', color);
}

function histAlphabetSort(a,b) //if b is later, return -1
{
	var nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase()
	if (nameA < nameB) //sort string ascending
		return -1 
	if (nameA > nameB)
		return 1
	return 0 //default return value (no sorting)
}

function histLegislatorSort(a,b) //if a is greater, return 1
{
	var dif = b.legislatorCount-a.legislatorCount;
	if (dif == 0)
	{
		return histAlphabetSort(a,b)
	}
	else
	{
		return dif;
	}
}

function histBillSort(a,b) //if a is greater, return 1
{
	var dif = b.billCount-a.billCount;
	if (dif == 0)
	{
		return histAlphabetSort(a,b)
	}
	else
	{
		return dif;
	}
}

function histMax(str)
{
	var max = 0;
	for (var state in stateData)
	{
		if (stateData[state][str]>max)
		{
			max = stateData[state][str];
		}
	}
	return max;
}
function scatterMax(str)
{
	var max = 0;
	for (var legislator in legislatorData)
	{
		if (legislatorData[legislator][str]>max)
		{
			max = legislatorData[legislator][str];
		}
	}
	return max;
}

function createScatterList(property)
{
	scatterList = {};
	for (var legislator in legislatorData)
	{
		var state = legislatorData[legislator].state;
		
		if (abbrToName[state] != undefined)
		{
			var value = legislatorData[legislator][property];
			
			var str = state+","+value;
			
			if (scatterList[str] == undefined)
			{
				scatterList[str]={};
				scatterList[str].legislators = [legislator];
				scatterList[str].count = 0;
				scatterList[str].rCount = 0;
				scatterList[str].dCount = 0;
				scatterList[str].iCount = 0;
			}
			else
			{
				scatterList[str].legislators.push(legislator);
			}
			
			scatterList[str].count++;
			if (legislatorData[legislator].party == "R")
			{
				scatterList[str].rCount++;
			}
			else if (legislatorData[legislator].party == "D")
			{
				scatterList[str].dCount++;
			}
			else
			{
				scatterList[str].iCount
			}
		}
	}
}

function scatterOnClick(obj)
{
	
	var legislators = scatterList[obj.id].legislators;
	navBackStack = [];
	clearBreadcrumbItems();
	navBackStack.push("LegSel", legislators);
	//console.log(legislators[0]);
	var legSelPanel = "<br><br><label>Legislators On that Point: </label><SELECT NAME=\"LegSelect2\" id=\"right_selectLeg\"onchange=\"right_selectLeg() \" SIZE=\"10\"  width=\"300px\" style=\"width: 300px\">"; 
	for(var i = 0; i < legislators.length; i++)
	{
		var leg= legislatorData[legislators[i]];
		// console.log(leg.firstname);
		legSelPanel += "<OPTION> " + leg.firstname + " " + leg.lastname ;
	}
	legSelPanel += "</SELECT>";
	document.getElementById("details").innerHTML = legSelPanel;
	// document.getElementById()
}

function scatterNodeString(obj)
{
	var str = scatterList[obj].count + " legislators";
	// var str = "bills: " + obj.split(",")[1];
	// for (var legislator in scatterList[obj].legislators)
	// {
		// str += "\n";
		// if (legislatorData[scatterList[obj].legislators[legislator]].party == "R")
			// {
				// str += "<span style='color:red'>";
			// }
			// else if (legislatorData[scatterList[obj].legislators[legislator]].party == "D")
			// {
				// str += "<span style='color:blue'>";
			// }
			// else
			// {
				// str += "<span style='color:green'>";
			// }
		// str += legislatorData[scatterList[obj].legislators[legislator]].firstname + " " + legislatorData[scatterList[obj].legislators[legislator]].lastname;// + "</span>";
	// }
	return str;
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