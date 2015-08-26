/**
 * @author anna thieme
 *
 * Visualization of departure frequency (GFTS data)
 */
var s, FrequencyViz = {

	settings : {
		time : 1, // current time interval id

		threshold_1 : 520, //thresholds for frequency intervals
		threshold_2 : 2080,
		colorArray : ['#084081', '#2b8cbe', '#7bccc4', '#f7fcf0'], // colors for chart and points
		pathToJson : "output.geojson"

	},

	init : function() {
		s = this.settings;
		this.initMap();
		this.fetchData();
		this.initLegend();

	},
	/**
	 * Initalize the map
	 *
	 */
	initMap : function() {
		L.mapbox.accessToken = 'pk.eyJ1IjoicGlja25pY2siLCJhIjoiZzd0TGtaTSJ9.hebZvfMf_39MIV0w-iFfCg';
		s.map = L.mapbox.map('map', 'picknick.n6npi9pa').setView([19.396806, -98.984225], 11);

	},
	/**
	 * Initialize the legend
	 */
	initLegend : function() {

		var legend = $('#legend').children();

		$.each(legend, function(i, item) {// assigning colors
			$(item).css("background-color", s.colorArray[i]);
		})
		
		
	},
	/**
	 * Fetch geojson data and calls the functions for render map data and chart data
	 */
	fetchData : function() {

		d3.json(s.pathToJson, function(data) {

			FrequencyViz.renderMapData(data);
			FrequencyViz.renderChartData(data);
		});

	},
	/**
	 * Render data as svg elements on the map
	 * @param {array} geoShape :geoJSON format
	 */
	renderMapData : function(geoShape) {

		// Add an SVG element to overlay pane of the man
		var svgMap = d3.select(s.map.getPanes().overlayPane).append("svg");
		s.g = svgMap.append("g").attr("class", "leaflet-zoom-hide");
		//  create a d3.geo.path to convert GeoJSON to SVG
		var transform = d3.geo.transform({
			point : this.projectPoint
		}), path = d3.geo.path().projection(transform);

		s.map.on("viewreset", function() {
			reset(s.time)
		});
		// add data as circles to the svg element
		s.ptFeatures = s.g.selectAll("circle").data(geoShape.features).enter().append("circle").attr("r", 2)
		reset(s.time);

		// fit the SVG element to leaflet's map layer when panning or zooming
		function reset() {

			bounds = path.bounds(geoShape);

			var topLeft = bounds[0], bottomRight = bounds[1];

			svgMap.attr("width", bottomRight[0] - topLeft[0]).attr("height", bottomRight[1] - topLeft[1]).style("left", topLeft[0] + "px").style("top", topLeft[1] + "px");

			s.g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

			s.ptFeatures.attr("transform", function(d) {
				return "translate(" + FrequencyViz.toPixelCoordinates(d).x + "," + FrequencyViz.toPixelCoordinates(d).y + ")";
			}).on("mouseover", function(d) {//shows and populates the tooltip

				$('#tooltip-map').show()

				// highlighting the hovered point
				d3.select(this).style("stroke-width", '10px').style("stroke", "orange");

				// frequnecy value for the currently selected time interval
				var freqValue = d.properties.freq[s.time], freqColor;

				// checking which category the point belongs to and assigning the corresponding color code to the tool tip
				if (freqValue <= s.threshold_1) {
					freqColor = s.colorArray[0];
				} else if (freqValue > s.threshold_1 && freqValue <= s.threshold_2) {
					freqColor = s.colorArray[1];
				} else if (freqValue > s.threshold_2 && freqValue < 100000) {
					freqColor = s.colorArray[2];
				} else if (freqValue == 100000) {
					freqColor = s.colorArray[3];
					freqValue = "NO DEPARTURES"
				}
				$('#station-id').text(d.properties.id)
				$('#station-frequency').text(freqValue)
				$('#station-frequency-cat').css("background-color", freqColor)
				//positioning of the tooltip
				$('#tooltip-map').css({
					left : FrequencyViz.toolTipPixelCoordinates(d).x,
					top : FrequencyViz.toolTipPixelCoordinates(d).y - 75
				})

			}).on("mouseout", function(d) {// hide tooltip and un-highlight the point
				$('#tooltip-map').hide()
				d3.select(this).style("stroke-width", '0px').style("stroke", "white");
			});

			FrequencyViz.updatePoints(s.time);

		}

	},

	/**
	 * Render the chart
	 * @param {array} geoShape :geoJSON format
	 */
	renderChartData : function(geoShape) {
		
		$('#stops-nr').text(geoShape.features.length)
		
		// parsing the geojson data in order to fit the stacked bar chart
		var dataset = FrequencyViz.createBarChartArray(geoShape.features);
		var margins = {
			top : 10,
			left : 50,
			right : 25,
			bottom : 25
		}, width = 350 - margins.left - margins.right, height = 550 - margins.top - margins.bottom

		dataset = dataset.map(function(d) {
			return d.data.map(function(o, i) {
				// Structure it so that the numeric
				// axis (the stacked amount) is y
				return {
					y : o.count,
					x : o.category
				};
			});
		}), stack = d3.layout.stack();

		stack(dataset);

		var timeIntervals = ["00-01", "01-02", "02-03", "03-04", "04-05", "05-06", "06-07", "07-08", "08-09", "09-10", "10-11", "11-12", "12-13", "13-14", "14-15", "15-16", "16-17", "17-18", "18-19", "19-20", "20-21", "21-22", "22-23", "23-24"];
		var formatTime = function(d) {
			return timeIntervals[d];
		}
		var dataset = dataset.map(function(group) {
			return group.map(function(d) {
				// Invert the x and y values, and y0 becomes x0
				return {
					x : d.y,
					y : d.x,
					x0 : d.y0
				};
			});
		}), svg = d3.select('#graph').append('svg').attr('width', width + margins.left + margins.right).attr('height', height + margins.top + margins.bottom).append('g').attr('transform', 'translate(' + margins.left + ',' + margins.top + ')'), xMax = d3.max(dataset, function(group) {
			return d3.max(group, function(d) {
				return d.x + d.x0;
			});

		}), xScale = d3.scale.linear().domain([0, xMax]).range([0, width]), categorys = dataset[0].map(function(d) {
			return d.y;
		}), yScale = d3.scale.ordinal().domain(categorys).rangeRoundBands([0, height], .1), xAxis = d3.svg.axis().scale(xScale).orient('bottom'), yAxis = d3.svg.axis().scale(yScale).orient('left').tickFormat(formatTime), colours = d3.scale.category10(), groups = svg.selectAll('g').data(dataset).enter().append('g').style('fill', function(d, i) {

			return s.colorArray[i];
		}), rects = groups.selectAll('rect').data(function(d) {
			return d;
		}).enter().append('rect').attr('x', function(d) {
			return xScale(d.x0);
		}).attr('y', function(d, i) {
			return yScale(d.y);
		}).attr('height', function(d) {
			return yScale.rangeBand();
		}).attr('width', function(d) {
			return xScale(d.x);
		}).on('mousemove', function(d) {// displaying the tooltip of each category

			var xPos = parseFloat(d3.select(this).attr('x'));
			var yPos = parseFloat(d3.select(this).attr('y')) + yScale.rangeBand() / 2;

			d3.select('#tooltip').style('left', xPos + 70 + 'px').style('top', yPos + 95 + 'px').select('#value').text(d.x);

			d3.select('#tooltip').classed('hidden', false);
		}).on('mouseout', function() {
			d3.select('#tooltip').classed('hidden', true);
		}).on('click', function(d, i) {// updates the map and highlights the selected interval

			$('#timeinterval').text(timeIntervals[i])
			s.time = i;
			FrequencyViz.updatePoints(s.time);
			d3.selectAll('g.tick').selectAll('text').style("fill", "white").style("font-weight", "normal")

			d3.selectAll('g.tick').filter(function(d) {
				return d == i;
			}).selectAll('text').style("fill", "orange").style("font-weight", "bold")

		})

		svg.append('g').attr('class', 'axis').call(yAxis)

	},
	/**
	 * Projects point to pixel coordinates
	 * @param {Number} lat
	 * @param {Number} lon

	 */
	projectPoint : function(x, y) {

		var point = s.map.latLngToLayerPoint(new L.LatLng(y, x));
		this.stream.point(point.x, point.y);
	},
	/**
	 * Projects geometry of a feature to pixel coordinates relative to the svg element
	 * @param {Number} d.geometry.coordinates
	 * returns d{x: value, y:value)
	 */
	toPixelCoordinates : function(d) {

		var y = d.geometry.coordinates[1]
		var x = d.geometry.coordinates[0]
		return s.map.latLngToLayerPoint(new L.LatLng(y, x))
	},
	/**
	 * Projects geometry of a feature to pixel coordinates relative to the container
	 * @param {Number} d.geometry.coordinates
	 * returns d{x: value, y:value)
	 */
	toolTipPixelCoordinates : function(d) {
		var y = d.geometry.coordinates[1]
		var x = d.geometry.coordinates[0]
		return s.map.latLngToContainerPoint(new L.LatLng(y, x))
	},
	/**
	 * Updates the colors of the points on the map accrording to the currently selected time interval
	 * @param {Number} time
	 *
	 */
	updatePoints : function(time) {
		s.g.selectAll("circle").attr("transform", function(d) {
			return "translate(" + FrequencyViz.toPixelCoordinates(d).x + "," + FrequencyViz.toPixelCoordinates(d).y + ")";
		}).attr("fill", function(d) {

			var freq = d.properties.freq[time]
			// checking which category the point belongs to and assigning the corresponding color code to the point
			if (freq <= s.threshold_1) {
				return s.colorArray[0];
			} else if (freq > s.threshold_1 && freq <= s.threshold_2) {
				return s.colorArray[1];
			} else if (freq > s.threshold_2 && freq < 100000) {
				return s.colorArray[2];
			} else if (freq == 100000) {
				return s.colorArray[3];
			}
		})
	},
	/**
	 * Parses the geojson data and creates a new array with a structure that fits to the stacked bar chart
	 * @param {array} geoShape :geoJSON format
	 * returns {array} chartData
	 * Structure:
	 * chartData = [{
    	 data: [{
      	 category: '1',
      	 count: 123
    	 }, {
      	 category: '2',
      	 count: 234
    	 }, {
      	 category: '3',
      	 count: 345
    	 .
    	 .
    	 .
    	 }],
	 name: 'class1'
	 }, {
  	 data: [{
    	 category: '1',
    	 count: 235
  	 }, {
    	 category: '2',
    	 count: 267
  	 }, {
    	 category: '3',
    	 count: 573
  	 }],
  	 name: 'class2'
	 .
	 .
	 .
	 }
	 .
	 .
	 .

	 ]
	 *
	 */
	createBarChartArray : function(data) {

		var chartData = [];
		// building up the structure of the data array
		for ( i = 0; i < 4; i++) {
			chartData.push({
				data : [],
				name : 'class' + i
			});
		}

		for ( i = 0; i < chartData.length; i++) {
			for ( j = 0; j < 24; j++) {
				chartData[i].data.push({
					category : j,
					count : 0
				})
			}
		}
		
		$.each(data, function(i, item) {
			$.each(item.properties.freq, function(j, freq) {
			
				// counting the number of stops in each frequency category 
				if (freq <= s.threshold_1) {
					chartData[0].data[j].count = chartData[0].data[j].count + 1
				} else if (freq > s.threshold_1 && freq <= s.threshold_2) {
					chartData[1].data[j].count = chartData[1].data[j].count + 1
				} else if (freq > s.threshold_2 && freq < 100000) {
					chartData[2].data[j].count = chartData[2].data[j].count + 1
				} else if (freq == 100000) {
					chartData[3].data[j].count = chartData[3].data[j].count + 1
				}

			})
		});

		return chartData;
	}
};
(function() {

	FrequencyViz.init();

})();
