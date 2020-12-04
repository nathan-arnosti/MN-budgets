// https://observablehq.com/@mbostock/the-wealth-health-of-nations@179

// Changes:
//NA
// nations.json --> county5.json
// 2953... file --> county5 (no .json)
// all variable names should be the same
// update range start 1800 --> 2000
// update range end 2010 --> 2018.1

//MW
//file 450051d7f1174df8@252.js, which drives the animations
  //changed the following: delay = 200, autoplay = false, alternate = true
//file ee2086412849cb2d@179.js (this sheet)
  //changed time interval and looping:  Scrubber(d3.range(2000, 2018.1, 1), {format: Math.floor, loop: true})
  //changed x axes: d3.scaleLinear([0, 40]
  //changed y axes: d3.scaleLinear([0, 55] YUAN previously change scaleLog to scaleLinear
  //changed x ticks: .call(d3.axisBottom(x).ticks(11, ",")) used to be ticks(width / 80, ",")
  //changed pop-up text (but not updating): .text(d => ["County: "+d.name,"Region: "+ d.region,"BIPOC: "+d.income+"%", "Police: "+ d.lifeExpectancy + "%"].join("\n")));
  //understand whats going on with the data/years changing by the 10ths, 2000.1...2000.9 shouldn't show changes over time, but could be going back to a previous year (hence the drops)
  //changed colors of categories, i.e. regions from blue, orange, and green
// YET TO DO:
 //figure out where and how to insert the map, then make interactions via mouse-hovers


import define1 from "./450051d7f1174df8@252.js"; //controls the animation settings

export default function define(runtime, observer) {
  const main = runtime.module();
  const fileAttachments = new Map([["county5.json",new URL("./files/county5",import.meta.url)]]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], function(md){return(
md`# Police budgets and racial demographics of Minnesota counties

This is a NEW recreation of a [Gapminder visualization](http://gapminder.org/world/) made famous by [Hans Rosling](https://www.ted.com/talks/hans_rosling_the_best_stats_you_ve_ever_seen). It shows per-capita income (BIPOC) (*x*), life expectancy (POLICE) (*y*) and population (*area*) of 86 counties over 18 years (2000-2018), colored by region.

(OLD DATA NOTES: Data prior to 1950 is sparse, so this chart uses [bisection](https://en.wikipedia.org/wiki/Binary_search_algorithm) and [linear interpolation](https://en.wikipedia.org/wiki/Linear_interpolation) to fill in missing data points.)`
)});
  main.variable(observer("viewof year")).define("viewof year", ["Scrubber","d3"], function(Scrubber,d3){return(
Scrubber(d3.range(2000, 2018.1, 1), {format: Math.floor, loop: true})
)});
  main.variable(observer("year")).define("year", ["Generators", "viewof year"], (G, _) => G.input(_));
  main.variable(observer("legend")).define("legend", ["DOM","html","margin","color"], function(DOM,html,margin,color)
{
  const id = DOM.uid().id;
  return html`<style>

.${id} {
  display: inline-flex;
  align-items: center;
  margin-right: 1em;
}

.${id}::before {
  content: "";
  width: 1em;
  height: 1em;
  margin-right: 0.5em;
  background: var(--color);

}

</style>
<div style="display: flex; align-items: center; min-height: 33px; font: 10px sans-serif; margin-left: ${margin.left}px;"><div>${color.domain().map(region => html`<span class="${id}" style="--color: ${color(region)}">${document.createTextNode(region)}</span>`)}`;
}
);
  main.variable(observer("chart")).define("chart", ["d3","width","height","xAxis","yAxis","grid","dataAt","x","y","radius","color"], function(d3,width,height,xAxis,yAxis,grid,dataAt,x,y,radius,color)
{
  var county_name = null; //global county_name variable

  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height]);

  svg.append("g")
      .call(xAxis);

  svg.append("g")
      .call(yAxis);

  svg.append("g")
      .call(grid);

  function map_plot(data){
    svg.selectAll("path")
      .data(topojson.feature(bosNeighbor, bosNeighbor.objects.boston_neigh).features)
      .transition().transition().duration(1000)
      .attr("fill", function(d) {
        if (d.properties.Name == neighborhood_name)
          return "#3caea3"
        else
                return "gray";})
}

  const circle = svg.append("g")
      .attr("stroke", "black")
    .selectAll("circle")
    .data(dataAt(2000), d => d.name) //used to be dataAt(2000)
    .join("circle")
      .sort((a, b) => d3.descending(a.population, b.population))
      .attr("cx", d => x(d.income))
      .attr("cy", d => y(d.lifeExpectancy))
      .attr("r", d => radius(d.population)) //size of circles based on population
      .attr("fill", d => color(d.region))
      .call(circle => circle.append("title") // hover pop-up
        .text(d => ["County: "+ d.name,"Region: "+ d.region,"BIPOC: "+d.income+"%", "Police: "+ d.lifeExpectancy + "%"].join("\n")))
          //where we add the interaction with the map via mouse actions
          //need to create a variable representing the county we are hovering on
          .on("mouseover", function(d) {
         					 d3.select("#tooltip") //selects tooltip, need to add above
         					 .style("left", d3.event.pageX + "px")
         					 .style("top", d3.event.pageY + "px")
         					 .select("#value") // look up what this was?
         					 .html("<p>" + String(d.name) + " has " + String(d[1]) +"</p>") //how to add a string
                   console.log(d.name) //need to save d.name as a variable outside of this function
               d3.select("#tooltip").classed("hidden", false); //selects tooltip
         			 })
        	 .on("mouseout", function() {
        		 d3.select("#tooltip").classed("hidden", true); //selects tooltip
           }); //pop-up text

  return Object.assign(svg.node(), {
    update(currentData) { //update(data)
      circle.data(currentData, d => d.name)
          .sort((a, b) => d3.descending(a.population, b.population))
          .attr("cx", d => x(d.income))
          .attr("cy", d => y(d.lifeExpectancy))
          .attr("r", d => radius(d.population))
          .attr("fill", d => color(d.region))
          .call(circle => circle.append("title") // hover pop-up
            .text(d => ["County: "+ d.name,"Region: "+ d.region,"BIPOC: "+d.income+"%", "Police: "+ d.lifeExpectancy + "%"].join("\n")));
              //where we add the interaction with the map via mouse actions
              //need to create a variable representing the county we are hovering on
              // .on("mouseover", function(d) {
             	// 				 d3.select("#tooltip") //selects tooltip, need to add above
             	// 				 .style("left", d3.event.pageX + "px")
             	// 				 .style("top", d3.event.pageY + "px")
             	// 				 .select("#value") // look up what this was?
             	// 				 .html("<p>" + String(d.name) + " has " + String(d[1]) +"</p>") //how to add a string
              //          console.log(d.name) //need to save d.name as a variable outside of this function
              //      d3.select("#tooltip").classed("hidden", false); //selects tooltip
             	// 		 })
            	//  .on("mouseout", function() {
            	// 	 d3.select("#tooltip").classed("hidden", true); //selects tooltip
              //  }); //pop-up text
    }
  });
}
);
  main.variable(observer("update")).define("update", ["chart","currentData"], function(chart,currentData){return(
chart.update(currentData)
)});
  main.variable(observer("currentData")).define("currentData", ["dataAt","year"], function(dataAt,year){return(
dataAt(year)
)});
  main.variable(observer("x")).define("x", ["d3","margin","width"], function(d3,margin,width){return(
d3.scaleLinear([0, 55], [margin.left, width - margin.right]) // change scaleLog to scaleLinear
)});
  main.variable(observer("y")).define("y", ["d3","height","margin"], function(d3,height,margin){return(
d3.scaleLinear([0, 40], [height - margin.bottom, margin.top])
)});
  main.variable(observer("radius")).define("radius", ["d3","width"], function(d3,width){return(
d3.scaleSqrt([0, 1e6], [0, width / 24]) //width /24
)});
  main.variable(observer("color")).define("color", ["d3","data"], function(d3,data){return(
d3.scaleOrdinal(data.map(d => d.region), [`red`, `blue`, 'silver']) //d3.schemeCategory10).unknown("black") //schemeCategory10
)});
  main.variable(observer("xAxis")).define("xAxis", ["height","margin","d3","x","width"], function(height,margin,d3,x,width){return(
g => g
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(11, ",")) //ticks(width / 80, ",")
    .call(g => g.select(".domain").remove())
    .call(g => g.append("text")
        .attr("x", width) //width
        .attr("y", margin.bottom - 4)
        .attr("fill", "currentColor")
        .attr("text-anchor", "end")
        .text("Percent BIPOC residents →")) // changed text here
)});
  main.variable(observer("yAxis")).define("yAxis", ["margin","d3","y"], function(margin,d3,y){return(
g => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .call(g => g.select(".domain").remove())
    .call(g => g.append("text")
        .attr("x", -margin.left)
        .attr("y", 10) //10
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .text("↑ Percent of budget spent on policing")) // changed text here
)});
  main.variable(observer("grid")).define("grid", ["x","margin","height","y","width"], function(x,margin,height,y,width){return(
g => g
    .attr("stroke", "currentColor")
    .attr("stroke-opacity", 0.1)
    .call(g => g.append("g")
      .selectAll("line")
      .data(x.ticks())
      .join("line")
        .attr("x1", d => 0.5 + x(d)) //0.5
        .attr("x2", d => 0.5 + x(d))//0.5
        .attr("y1", margin.top)
        .attr("y2", height - margin.bottom))
    .call(g => g.append("g")
      .selectAll("line")
      .data(y.ticks())
      .join("line")
        .attr("y1", d => 0.5 + y(d))
        .attr("y2", d => 0.5 + y(d))
        .attr("x1", margin.left)
        .attr("x2", width - margin.right))
)});
  main.variable(observer("dataAt")).define("dataAt", ["data","valueAt"], function(data,valueAt){return(
function dataAt(year) {
  return data.map(d => ({
    name: d.name,
    region: d.region,
    income: valueAt(d.income, year),
    population: valueAt(d.population, year),
    lifeExpectancy: valueAt(d.lifeExpectancy, year)
  }));
}
)});
  main.variable(observer("valueAt")).define("valueAt", ["bisectYear"], function(bisectYear){return(
function valueAt(values, year) {
  const i = bisectYear(values, year, 0, values.length - 1);
  const a = values[i];
  if (i > 0) {
    const b = values[i - 1];
    const t = (year - a[0]) / (b[0] - a[0]);
    return a[1] * (1 - t) + b[1] * t;
  }
  return a[1]; //trying to disrupt the bisectYear function while maintaining "valueAt" function
  //return year;
}
)});
  main.variable(observer("data")).define("data", ["FileAttachment"], function(FileAttachment){return(
FileAttachment("county5.json").json()
)});
  main.variable(observer("bisectYear")).define("bisectYear", ["d3"], function(d3){return(
d3.bisector(([year]) => year).left
)});
  main.variable(observer("margin")).define("margin", function(){return(
{top: 20, right: 20, bottom: 35, left: 40}
)});
  main.variable(observer("height")).define("height", function(){return(
560
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@6")
)});
  const child1 = runtime.module(define1);
  main.import("Scrubber", child1);
  return main;
}

//MAP
//Append empty placeholder g element to the svg,
//where g will contain geometry elements
