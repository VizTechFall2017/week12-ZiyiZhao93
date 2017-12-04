var width = document.getElementById('svg1').clientWidth;
var height = document.getElementById('svg1').clientHeight;

var width2 = document.getElementById('svg2').clientWidth;
var height2 = document.getElementById('svg2').clientHeight;

var width3 = document.getElementById('svg3').clientWidth;
var height3 = document.getElementById('svg3').clientHeight;

var width4 = document.getElementById('svg4').clientWidth;
var height4 = document.getElementById('svg4').clientHeight;

var marginLeft = 0;
var marginTop = 0;

var marginLeft3 = 100;
var marginTop3 = 100;

var nestedData = [];

var sexData = [];

var clicked = true;

var womenData;
var menData;

var svg = d3.select('#svg1')
    .append('g')
    .attr('transform', 'translate(' + marginLeft + ',' + marginTop + ')');

var svg2 = d3.select('#svg2')
    .append('g')
    .attr('transform', 'translate(' + marginLeft + ',' + marginTop + ')');

var svg3 = d3.select('#svg3')
    .append('g')
    .attr('transform', 'translate(' + marginLeft3 + ',' + marginTop3 + ')');

var svg4 = d3.select('#svg4')
    .append('g')
    .attr('transform', 'translate(' + marginLeft + ',' + marginTop + ')');


var albersProjection = d3.geoAlbers()
    .scale(150000)//tell it how big the map should be
    .rotate( [71.057,0] )
    .center( [0, 42.313] ) //FIND CENTER POINT LAT/LONG VALUE OF MASSACHUSETTS
    .translate([(width/2), (height/2)]);  //set the center of the map to show up in the center of the screen

//set up the path generator function to draw the map outlines
path = d3.geoPath()
    .projection(albersProjection);        //tell it to use the projection that we just made to convert lat/long to pixels


var scaleX1 = d3.scaleBand().rangeRound([0, width3-2*marginLeft3]).padding(0.1);
var scaleY1 = d3.scaleLinear().range([height3-2*marginTop3, 0]);

var scaleX2 = d3.scaleBand().rangeRound([0, width4-2*marginLeft]).padding(0.1);
var scaleY2 = d3.scaleLinear().range([height4-2*marginTop, 0]);


queue()
    .defer(d3.json, "./Boston.json")
    .defer(d3.json, "./Orange.json")
    .defer(d3.csv, "./subway.csv")
    .defer(d3.csv, "./subway2.csv")
    .defer(d3.csv, "./circle.csv")
    .await(function(err, mapData,lineData, populationData,peopleData,circleData){


        svg.selectAll("path")               //make empty selection
            .data(mapData.features)          //bind to the features array in the map data
            .enter()
            .append("path")                 //add the paths to the DOM
            .attr("d", path)                //actually draw them
            .attr("class", "feature")
            .attr('fill','white')
            .attr('stroke','black')
            .attr('stroke-width',.1);


        svg2.background = 'none';

        svg2.selectAll("path")               //make empty selection
            .data(lineData.features)          //bind to the features array in the map data
            .enter()
            .append("path")                 //add the paths to the DOM
            .attr("d", path)                //actually draw them
            .attr("class", "feature")
            .attr('stroke', 'orange')
            .attr('stroke-width', 2)
            .attr('fill','none');

        svg2.selectAll('circle')
            .data(circleData)
            .enter()
            .append("circle")
            .attr('cx', function (d) {return d.cx})
            .attr('cy',function (d) {return d.cy})
            .attr('r', 5)
            .attr('fill', 'orange')
            .on('mouseover', function (d) {
                d3.select(this).attr('r', 8).attr('fill', 'red');
            })
            .on('mouseout', function (d) {
                d3.select(this).attr('r', 5).attr('fill', 'orange');
            });

        nestedData = d3.nest()
            .key(function(d){return d.gender})
            .entries(populationData);


        var loadData = nestedData.filter(function(d){return d.key == 'total'})[0].values;


        svg3.append("g")
            .attr('class','xaxis')
            .attr('transform','translate(0,'+ (height3-2*marginTop3) +')')
            .call(d3.axisBottom(scaleX1));

        svg3.append("g")
            .attr('class', 'yaxis')
            .call(d3.axisLeft(scaleY1));

        svg3.append('text')
            .text('Total')
            .attr('transform','translate(160, 150)')
            .attr('font-size', 15);

        svg3.append('text')
            .text('Male')
            .attr('transform','translate(230, 150)')
            .attr('font-size', 15);

        svg3.append('text')
            .text('Female')
            .attr('transform','translate(290, 150)')
            .attr('font-size', 15);


        /*
        sexData = d3.nest()
            .key(function (d) {return d.sex})
            .entries(peopleData);

        console.log(sexData);

        womenData = peopleData.filter(function(d){
            return d.sex == women;
        });

        menData = peopleData.filter(function(d){
            return d.sex == men;
        });


        svg4.append("g")
            .attr('class','xaxis1')
            .attr('transform','translate(0,'+ (height4-2*marginTop) +')')
            .call(d3.axisBottom(scaleX2));

        svg4.append("g")
            .attr('class', 'yaxis1')
            .call(d3.axisLeft(scaleY2));

        svg4.selectAll('circles')
            .data(womenData)
            .enter()
            .append('circle')
            .attr('class','w_dataPoints')
            .attr('r', 5)
            .attr('fill', "palevioletred");

        svg4.selectAll('circles')
            .data(menData)
            .enter()
            .append('circle')
            .attr('class','m_dataPoints')
            .attr('r', 5)
            .attr('fill', "mediumturquoise");

*/

        drawPoints(loadData,'total');

    });


function drawPoints(pointData,incomeData){


    scaleX1.domain(pointData.map(function(d){return d.things;}));
    scaleY1.domain([0, d3.max(pointData.map(function(d){return +d.number}))]);

    /*
    scaleX2.domain(incomeData.map(function(d){return d.week;}));
    scaleY2.domain([0, d3.max(incomeData.map(function(d){return +d.people}))]);
*/

    d3.selectAll('.xaxis')
        .call(d3.axisBottom(scaleX1));

    d3.selectAll('.yaxis')
        .call(d3.axisLeft(scaleY1));

    var rects = svg3.selectAll('.bars')
        .data(pointData, function(d){return d.things;});

    rects
        .transition()
        .duration(100)
        .attr('x',function(d){
            return scaleX1(d.things);
        })
        .attr('y',function(d){
            return scaleY1(+d.number);
        })
        .attr('width',function(d){
            return scaleX1.bandwidth();
        })
        .attr('height',function(d){
            return height3-2*marginTop3 - scaleY1(+d.number);
        })
        .attr('fill',function(d){
            if (gender == 'total'){return "mediumslateblue"}
            if (gender == 'male'){return "mediumturquoise"}
            if (gender == 'female'){return "palevioletred"}
        });

    rects
        .enter()
        .append('rect')
        .attr('class','bars')
        .attr('fill',function(d){
            if (gender == 'total'){return "mediumslateblue"}
            if (gender == 'male'){return "lightblue"}
            if (gender == 'female'){return "pink"}
        })
        .attr('id',function (d) {return d.things})
        .attr('x',function(d){
            return scaleX1(d.things);
        })
        .attr('y',function(d){
            return scaleY1(+d.number);
        })
        .attr('width',function(d){
            return scaleX1.bandwidth();
        })
        .attr('height',function(d){
            return height3-2*marginTop3 - scaleY1(+d.number);
        });
/*
    d3.selectAll('.xaxis1')
        .call(d3.axisBottom(scaleX2));

    d3.selectAll('.yaxis1')
        .call(d3.axisLeft(scaleY2));

    d3.selectAll('w_dataPoints')
        .data(incomeData)
        .attr('cx',function(d){return scaleX2(d.week);})
        .attr('cy',function(d){return scaleY2(d.women)});

    d3.selectAll('m_dataPoints')
        .data(incomeData)
        .attr('cx',function(d){return scaleX2(d.week);})
        .attr('cy',function(d){return scaleY2(d.men)});
*/

}

function updateData(selectedGender){



    return nestedData.filter(function(d){return d.key == selectedGender})[0].values;
}


function sliderMoved(value){

    if(value == 0){
        newData = updateData('total');
        drawPoints(newData,'total');
    }

    if(value == 1){
        newData = updateData('male');
        drawPoints(newData,'male');
    }

    if(value == 2){
        newData = updateData('female');
        drawPoints(newData,'female');
    }


}
