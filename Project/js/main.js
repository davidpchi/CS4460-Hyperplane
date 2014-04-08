/**
THIS FUNCTION IS CALLED WHEN THE WEB PAGE LOADS. PLACE YOUR CODE TO LOAD THE 
DATA AND DRAW YOUR VISUALIZATION HERE. THE VIS SHOULD BE DRAWN INTO THE "VIS" 
DIV ON THE PAGE.

This function is passed the variables to initially draw on the x and y axes.
**/
var margin = {top: 80, right: 50, bottom: 30, left: 30}; //this is an object aht has been created
var width = 950 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;
var navStack = new Array();

var legPanel = "<div id=\"IMG\"><img id=\"legislator_img_src\" width=\"300\" src=\"\"></div >"+
				"<div id=\"LegName\"> <B>Legislator Name: </B></div>"+
				"<div id=\"District\"><B>District: </B></div>"+
				"<B>Bills:</B> <BR>"+
				"<div id=\"legBills\">"+
				"<SELECT NAME=\"BillSelect\" id=\"bot_selectBill\"onchange=\"bot_selectBill() \" SIZE=\"10\"  width=\"300px\" style=\"width: 300px\"></SELECT></div>"+
				"<div id=\"indiBillCount\" onC> <B>Number of Bills: </B> </div>"+
				"<div><button id=\"backButton\" onclick=\"clickBack()\" type=\"button\">Back</button></div>";

var bilPanel = "<div id = \"Bill\"> </div>"+
				"<div><button id=\"backButton\" onclick=\"clickBack()\" type=\"button\">Back</button></div>";

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
var scatterOption;

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

var filterName;
var maxValForColorScale;

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
	// menu = document.getElementById("scatterOptions");
	// scatterOptions = menu.options[menu.selectedIndex].text;
	
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
	else if (view == "Scatterplot")
	{
		drawScatterplot();
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

function drawHistogram()
{
	document.getElementById("details").innerHTML = "<h><b>Welcome to Team Hyperplane.<br>This is the Histogram View</b></h>";
	var svg = d3.select("#vis").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		
	var barWidth = (width)/50;
	
	var property;
	if (histOptions == "Legislators")
	{
		property = "legislatorCount";
	}
	else //if (histOptions == "Bills")
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
				.text(value)
				.attr("id","hist"+stateData[state].name+"value")
				.attr("x", offset+(barWidth/2)-1)
				.attr("y", histScale(value)-2)
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
	
	var property;
	if (histOptions == "Legislators")
	{
		property = "legislatorCount";
	}
	else //if (histOptions == "Bills")
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
	
	// svg.append("text")
		// .text("Number of Legislators")
		// .attr("x", width/2)
		// .attr("y", -10)
		// .attr("font-family", "serif")
		// .attr("font-size", "24px")
		// .attr("fill", "black")
		// .attr("text-anchor", "middle");
	
}

function drawScatterplot()
{
	document.getElementById("details").innerHTML = "<h><b>Welcome to Team Hyperplane.<br>This is the Scatterplot View</b></h>";
	var svg = d3.select("#vis").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		
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
	}
	console.log(stateArray);
	for (var legislator in legislatorData)
	{
		var value = legislatorData[legislator][property];
		var offset = stateArray.indexOf(stateData[legislatorData[legislator].state])*barWidth+10;
		
		var color;
		if (legislatorData[legislator].party == "D")
		{
			color = "#000080";
		}
		else if (legislatorData[legislator].party == "R")
		{
			color = "#800000";
		}
		else
		{
			color = "#008000";
		}
		svg.append("circle")
			.attr("id", "scatter"+stateData[state].name)
			.attr("cx", offset)
			.attr("cy", scatterScale(value))
			.attr("r", 5)
			.attr("fill", color)
	}
	
	svg.append("text")
		.text("Legislators Their Bill Counts")
		.attr("x", width/2)
		.attr("y", -10)
		.attr("font-family", "serif")
		.attr("font-size", "24px")
		.attr("fill", "black")
		.attr("text-anchor", "middle");
	
	
}

function drawCircles()
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
TODO: Sanat and Ching, update the UI here
*/
function mapOnClick(object) {
	resetMapOutlines();
	d3.select(object).attr('stroke', 'yellow')
				   .attr('stroke-width', 2);
	state = stateData[object.id];
	//document.getElementById("details").innerHTML = legPanel;
	document.getElementById("StateName").innerHTML= "<b>State Name:</b> " + state.name;
	document.getElementById("RepCount").innerHTML= "<b>Rep Count:</b> " + state.representativeCount;
	document.getElementById("SenatorCount").innerHTML= "<b>Senator Count:</b> " + state.senatorCount;
	document.getElementById("BillCount").innerHTML= "<b>Bill Count:</b> " + state.billCount;
	document.getElementById("StateIMG").innerHTML = "<img src=\"data/resize/"+ state.name +".gif\" style=\" margin-left: 2px; margin-top: 2px;\">";


	
	var stateLegHTML = "<B>Legislator List:</B> <BR><SELECT  id=\"bot_legSelect\"  onchange=\"bot_legSelect()\" NAME=\"LegSelect\" SIZE=\"7\"  style=\"width: 200px\">";
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
  	navStack.push(["Leg", legislator]);
  	 //var legislator = legislatorData[1];

  	document.getElementById("details").innerHTML = legPanel;
	document.getElementById("legislator_img_src").src = getLegislatorImageURL(legislator.bioguide_id);
	
	//Update right pane
	//<div id="LegName"> <B>Legislator Name: </B></div>
	document.getElementById("LegName").innerHTML= "<b>Name: </b> " + legislator.firstname + " " + legislator.lastname;
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
	var legBillHTML = "<SELECT NAME=\"BillSelect\" id=\"right_selectBill\"onchange=\"right_selectBill()  \"SIZE=\"10\" width=\"300px\" style=\"width: 300px\">";
	for(var i=0; i<legislator.bills.length; i++){
		legBillHTML += "<option> " + legislator.bills[i]["display_number"];
	}
	legBillHTML += "</select>";
	document.getElementById("legBills").innerHTML= legBillHTML;
}

function bot_selectBill(){
	var selects = document.getElementById("bot_selectBill");
  	var selectedText = selects.options[selects.selectedIndex].text;// gives u value2
  	console.log(selectedText);
  	navStack.push(["Bill", selectedText]);
  	document.getElementById("details").innerHTML = bilPanel;
  	document.getElementById("Bill").innerHTML = "Bill: "+selectedText;
}

function right_selectBill(){
	var selects = document.getElementById("right_selectBill");
  	var selectedText = selects.options[selects.selectedIndex].text;// gives u value2
  	console.log(selectedText);
  	navStack.push(["Bill", selectedText]);
  	document.getElementById("details").innerHTML = bilPanel;
  	document.getElementById("Bill").innerHTML = "Bill: "+selectedText;
}

function clickBack()
{
	var popedFirst = navStack.pop();
	var poped = navStack.pop();
	if(poped != undefined)
	{
		if(poped[0] == "Bill")
		{
			document.getElementById("details").innerHTML = bilPanel;
	  		document.getElementById("Bill").innerHTML = "Bill: "+poped[1];
	  		navStack.push(["Bill", poped[1]]);
		}
		else
		{
			var legislator = poped[1];
			document.getElementById("details").innerHTML = legPanel;
			document.getElementById("legislator_img_src").src = getLegislatorImageURL(legislator.bioguide_id);

			document.getElementById("LegName").innerHTML= "<b>Name: </b> " + legislator.firstname + " " + legislator.lastname;
			document.getElementById("indiBillCount").innerHTML= "<b>Bill Count:</b> " + legislator.bills.length;

			var legBillHTML = "<SELECT NAME=\"BillSelect\" id=\"right_selectBill\"onchange=\"right_selectBill()  \"SIZE=\"10\"  width=\"300px\" style=\"width: 300px\">";
			for(var i=0; i<legislator.bills.length; i++){
				legBillHTML += "<option> " + legislator.bills[i]["display_number"];
			}
			legBillHTML += "</select>";
			document.getElementById("legBills").innerHTML= legBillHTML;
			navStack.push(["Leg", legislator]);
		}
	}
	else
	{
		navStack.push(popedFirst);
	}
}

function mapOnHoverEnter(object) {
	d3.select(object).attr('fill', 'yellow');
	state = stateData[object.id];
}

function mapOnHoverExit(object) {
	var state = stateData[object.id];
	//TODO: need to provide a way to switch which maximum is being used to compute color
	//atm, it is just the maxLegilslatorCount
	var color = computeColorByValue(filterName, maxValForColorScale, state);
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
	
	if (valType === "billCount") {
		var colorIndex = Math.round(stateObj.billCount/maxVal * (colorScale.length-1));
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
	console.log("id: " + object.id);
	//Updates bottom pane
	
	
	document.getElementById("StateName").innerHTML= "<b>State Name:</b> " + legislator.state;
	document.getElementById("RepCount").innerHTML= "<b>Rep Count:</b> " + stateData[legislator.state].representativeCount;
	document.getElementById("SenatorCount").innerHTML= "<b>Senator Count:</b> " + stateData[legislator.state].senatorCount;
	document.getElementById("BillCount").innerHTML= "<b>Bill Count:</b> " + stateData[legislator.state].billCount;
	document.getElementById("StateIMG").innerHTML = "<img src=\"data/resize/"+ stateData[legislator.state].name +".gif\" style=\" margin-left: 2px; margin-top: 2px;\">";

	document.getElementById("details").innerHTML = legPanel;
	document.getElementById("legislator_img_src").src = getLegislatorImageURL(legislator.bioguide_id);
	//Update right pane
	//<div id="LegName"> <B>Legislator Name: </B></div>
	document.getElementById("LegName").innerHTML= "<b>Name: </b> " + legislator.firstname + " " + legislator.lastname;
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
	var legBillHTML = "<SELECT NAME=\"BillSelect\" id=\"right_selectBill\"onchange=\"right_selectBill() \"SIZE=\"10\"  width=\"300px\" style=\"width: 300px\">";
	for(var i=0; i<legislator.bills.length; i++){
		legBillHTML += "<option> " + legislator.bills[i]["display_number"];
	}
	legBillHTML += "</select>";
	document.getElementById("legBills").innerHTML= legBillHTML;

	var state = stateData[legislator.state];

	var stateLegHTML = "<B>Legislator List:</B> <BR><SELECT  id=\"bot_legSelect\"  onchange=\"bot_legSelect()\" NAME=\"LegSelect\" SIZE=\"7\"  style=\"width: 200px\">";
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
	
	// d3.select('svg').remove();
	console.log(mapOptions);
	updateMap();
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
			billCount: 0
			//TODO: NEED TO ADD BILLS
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
	for (var state in stateData)
	{
		d3.select("#hist"+stateData[state].name)
			.attr("stroke-width",0);
	}
	d3.select(object)
		.attr("stroke", "#00FFFF")
		.attr("stroke-width",2);

	
	stateID = ""+ object.id[4] + object.id[5];
	// console.log(stateID);
	stateChosen = stateData[stateID];
	document.getElementById("StateName").innerHTML= "<b>State Name:</b> " + stateChosen.name;
	document.getElementById("RepCount").innerHTML= "<b>Rep Count:</b> " + stateChosen.representativeCount;
	document.getElementById("SenatorCount").innerHTML= "<b>Senator Count:</b> " + stateChosen.senatorCount;
	document.getElementById("BillCount").innerHTML= "<b>Bill Count:</b> " + stateChosen.billCount;
	document.getElementById("StateIMG").innerHTML = "<img src=\"data/resize/"+ stateChosen.name +".gif\" style=\"width: margin-left: 2px; margin-top: 2px;\">";

	var stateLegHTML = "<B>Legislator List:</B> <BR><SELECT  id=\"bot_legSelect\"  onchange=\"bot_legSelect()\"  NAME=\"LegSelect\" SIZE=\"7\"  style=\"width: 200px\">";
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