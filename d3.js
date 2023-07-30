async function init() {
    const data = await d3.csv("https://raw.githubusercontent.com/rfordatascience/tidytuesday/master/data/2020/2020-09-22/members.csv")
    const dataToWorkWith = data.filter(function(d){return d.peak_name === "Everest"}) //only get the data related to 'Everest'

    const allSeason = d3.map(dataToWorkWith, function(d){return d.season}).keys() //get different seasons
    const allHired = d3.map(dataToWorkWith, function(d){return d.hired}).keys() //gets TRUE or FALSE

    //group the data based on 1 key
    const nestedData1 = d3.nest()
                        .key(function(d) {return d.year})
                        .entries(dataToWorkWith)

    //create map from the nested data
    const dataStream1 = nestedData1.map((group) => ({
        year: +group.key,
        attempt: group.values.length,
        success: group.values.filter((d) => d.success === "TRUE").length,
        failure: group.values.filter((d) => d.success === "FALSE").length,
        injuryTruecount: group.values.filter((d) => d.injured === "TRUE").length,
        injuryFalsecount: group.values.filter((d) => d.injured === "FALSE").length
    }))

    sortedDataStream1 = dataStream1.slice().sort((a,b) => d3.ascending(a.year, b.year))
    console.log(sortedDataStream1)

     //group the data based on 2 different keys
   const nestedData2 = d3.nest()
                        .key(d => d.year)
                        .key(d => d.success)
                        .rollup(values => ({
                            injuredTrueCount: values.filter(d => d.injured === "TRUE").length,
                            injuredFalseCount: values.filter(d => d.injured === "FALSE").length
                        }))
                        .entries(dataToWorkWith)

    //create map from the nested data
    const dataStream2 = [];
    nestedData2.forEach(col1 => { 
                col1.values.forEach(col2 => {
                        const {injuredTrueCount, injuredFalseCount} = col2.value
                        dataStream2.push({
                            year: +col1.key,
                            success: col2.key,
                            injuredTrueCount,
                            injuredFalseCount,
                        })
                    })
    })

    sortedDataStream2 = dataStream2.slice().sort((a,b) => d3.ascending(a.year, b.year))
    console.log(sortedDataStream2)


    //group the data based on 4 different keys
   const nestedData3 = d3.nest()
                        .key(d => d.year)
                        .key(d => d.season)
                        .key(d => d.success)
                        .key(d => d.hired)                        
                        .rollup(values => ({
                            injuredTrueCount: values.filter(d => d.injured === "TRUE").length, 
                            injuredFalseCount: values.filter(d => d.injured === "FALSE").length,
                            deathTrueCount: values.filter(d => d.died === "TRUE").length,
                            deathFalseCount: values.filter(d => d.died === "FALSE").length,
                            o2TrueCount: values.filter(d => d.oxygen_used === "TRUE").length,
                            o2FalseCount: values.filter(d => d.oxygen_used === "FALSE").length,                                                
                            minAge: d3.min(values.filter(d => +d.age !== "NA" || d.age !== "NaN"), d=> d.age),
                            maxAge: d3.max(values.filter(d => +d.age !== "NA" || d.age !== "NaN"), d=> d.age)
                        }))
                        .entries(dataToWorkWith)

    //create map from the nested data
   const dataStream3 = [];
   nestedData3.forEach(col1 => { 
        col1.values.forEach(col2 => {
            col2.values.forEach(col3 => {
                col3.values.forEach(col4 => {
                    const {injuredTrueCount, injuredFalseCount, deathTrueCount, deathFalseCount, o2TrueCount, o2FalseCount, 
                            minAge, maxAge} = col4.value
                    dataStream3.push({
                        year: +col1.key,
                        season: col2.key,
                        success: col3.key,
                        hired: col4.key,
                        injuredTrueCount,
                        injuredFalseCount,
                        deathTrueCount,
                        deathFalseCount,
                        o2TrueCount,
                        o2FalseCount,                   
                        minAge: +minAge,
                        maxAge: +maxAge
                    })
                    })
            })
        })
    })

    sortedDataStream3 = dataStream3.slice().sort((a,b) => d3.ascending(a.year, b.year))
    console.log(sortedDataStream3)

    //Populate the drop-down menus with options
    const seasonDropDown = d3.select("#season")
    seasonDropDown.selectAll("option")
                    .data(allSeason)
                    .enter()
                    .append("option")
                    .text(d => d)
                    .attr("value", d => d)
                    .attr("width", 10)
                    .attr("height", 10);

    const hiredDropDown = d3.select("#hired")
    hiredDropDown.selectAll("option")
                    .data(allHired)
                    .enter()
                    .append("option")
                    .text(d => d)
                    .attr("value", d => d)
                    .attr("width", 10)
                    .attr("height", 10);


    createLineChart1()
    createLineChart2()
    //createLineChart3SuccessFalse()

    /* Function def begins here.
        1. createLineChart()
        2. CreatePieChart()
        3. createBarChart()
    */
   
    function createLineChart1() {
        const width = d3.select("#lineChart1").attr("width")
        const height = d3.select("#lineChart1").attr("height")
        const margin = {top:50, right:50, bottom:50, left:50}

        xs = d3.scaleLinear().domain([1921, 2019]).range([0, width - margin.left - margin.right])
        ys = d3.scaleLinear().domain([0, 1100]).range([height - margin.top - margin.bottom, 0])

        x_axis = d3.axisBottom(xs).ticks(10).tickFormat(d3.format("")) //create bottom x-axis
        y_axis = d3.axisLeft(ys).ticks(10) //create left y-axis

        d3.select("#lineChart1") //draw the line
            .append("path")
            .attr("transform", "translate("+margin.left+", "+margin.top+")")
            .datum(sortedDataStream1) 
            .attr("d", d3.line()
            .x(function(d) {return xs(d.year); }) 
            .y(function(d) { return ys(d.attempt) }))
            .style("fill", "none")
            .style("stroke", "#1f77b4")
            .style("stroke-width", "2");

        d3.select("#lineChart1") //x-axis
            .append("g")
            .attr("transform", "translate("+margin.left+", "+(height-margin.bottom)+")")
            .call(x_axis)

        d3.select("#lineChart1") //text for x-axis
            .append("text")
            .attr("x", width/2)
            .attr("y", height-(margin.bottom)/3)
            .attr("text-anchor", "middle")
            .style("font-family", "Helvetica")
            .style("font-size", 13)
            .text("Climbing Year")

        d3.select("#lineChart1") //y-axis
            .append("g")
            .attr("transform", "translate("+margin.left+", "+margin.top+")")
            .call(y_axis)

        d3.select("#lineChart1") //text for y-axis
            .append("text")
            .attr("transform", "translate("+margin.left/3+", "+height/2+")rotate(-90)")
            .attr("text-anchor", "middle")
            .style("font-family", "Helvetica")
            .style("font-size", 13)
            .text("# of attempts")

        //Add annotation
        const annotations = [
                                {
                                    note: {label: "1953: First ascent", align: "middle"},
                                    x: xs(1953),
                                    y: height - margin.top,
                                    dx: 0,
                                    dy: -90,
                                    type: d3.annotationCalloutElbow,
                                    connector: {end: "arrow"}
                                },
                                {
                                    note: {label: "1980: First winter ascent"},
                                    x: xs(1980),
                                    y: height - margin.top,
                                    dx: 20,
                                    dy: -20,
                                    type: d3.annotationCalloutElbow,
                                    connector: {end: "arrow"}
                                },
                                {
                                    note: {label: "1980: First solo ascent"},
                                    x: xs(1980),
                                    y: height - margin.top,
                                    dx: -30,
                                    dy: -200,
                                    type: d3.annotationCalloutElbow,
                                    connector: {end: "arrow"}
                                },
                            ]

        const makeAnnotations = d3.annotation().annotations(annotations)

        d3.select("#lineChart1") //text for y-axis
            .append("g")
            .attr("transform", "translate("+margin.left+", "+0+")")
           // .style("stroke", "#ff7f0e")
            .call(makeAnnotations)

        const annotationTrend1 = d3.select("#lineChart1")
                                    .append("text")
                                    .attr("id", "annotationTrend1")
                                    .attr("x", xs(1985))
                                    .attr("y", 250)
                                    .attr("font-size", "18")
                                    .text("Surge in attempts after 1980");

        // Add the rectangle element as underline (to show the trend)
        const box1 = annotationTrend1.node().getBBox();
        console.log("box1" + box1)
        const underLine1 = d3.select("#lineChart1")
                                .append("rect")
                                .attr("id", "underLine1")
                                .attr("x", box1.x)
                                .attr("y", box1.y + box1.height + 10) 
                                .attr("width", box1.width)
                                .attr("height", 2)
                                .attr("fill", "#7f7f7f");

        // Arrow for the underline to show the trend
        const arrowheadSize = 10;
        const arrowXPos = box1.x + box1.width;
        const arrowYPos = box1.y + box1.height + 10;
        const arrowPath = `M ${arrowXPos} ${arrowYPos} L ${arrowXPos - arrowheadSize} ${arrowYPos - arrowheadSize / 2} L ${arrowXPos - arrowheadSize} ${arrowYPos + arrowheadSize / 2} Z`;
    
        d3.select("#lineChart1")
            .append("path")
            .attr("id", "arrow1")
            .attr("d", arrowPath)
            .attr("fill", "#7f7f7f");

        const centerXPos = box1.x + box1.width / 2 ;
        const centerYPos = box1.y + box1.height / 2;
        const rotationAngle = -45; //Rotate as per the orientation of the graph

        d3.select("#annotationTrend1").attr("transform", `rotate(${rotationAngle}, ${centerXPos}, ${centerYPos})`);
        d3.select("#underLine1").attr("transform", `rotate(${rotationAngle}, ${centerXPos}, ${centerYPos})`);
        d3.select("#arrow1").attr("transform", `rotate(${rotationAngle}, ${centerXPos}, ${centerYPos})`);

        

        d3.select("#lineChart1") //vertical dotted line 1980 is not working
            .append("line")
            .attr("x1", xs(1987))
            .attr("y1", height - margin.top)
            .attr("x2", xs(1987))
            .attr("y2", margin.top)
            .attr("stroke", "#7f7f7f")
            .attr("stroke-dasharray", "3,3")

    }//end of createLineChart1 function

    function createLineChart2() {
        const width = d3.select("#lineChart2").attr("width")
        const height = d3.select("#lineChart2").attr("height")
        const margin = {top:50, right:50, bottom:50, left:50}

        xs = d3.scaleLinear().domain([1921, 2019]).range([0, width - margin.left - margin.right])
        ys = d3.scaleLinear().domain([0, 1100]).range([height - margin.top - margin.bottom, 0])

        x_axis = d3.axisBottom(xs).ticks(10).tickFormat(d3.format("")) //create bottom x-axis
        y_axis = d3.axisLeft(ys).ticks(10) //create left y-axis

        d3.select("#lineChart2") //draw the success line
            .append("path")
            .attr("transform", "translate("+margin.left+", "+margin.top+")")
            .datum(sortedDataStream1) 
            .attr("d", d3.line()
            .x(function(d) {return xs(d.year); }) 
            .y(function(d) { return ys(d.success) }))
            .style("fill", "none")
            .style("stroke", "#2ca02c")
            .style("stroke-width", "2");

        d3.select("#lineChart2") //draw the failure line
            .append("path")
            .attr("transform", "translate("+margin.left+", "+margin.top+")")
            .datum(sortedDataStream1) 
            .attr("d", d3.line()
            .x(function(d) {return xs(d.year); }) 
            .y(function(d) { return ys(d.failure) }))
            .style("fill", "none")
            .style("stroke", "#d62728")
            .style("stroke-width", "2");

        d3.select("#lineChart2") //x-axis
            .append("g")
            .attr("transform", "translate("+margin.left+", "+(height-margin.bottom)+")")
            .call(x_axis)

        d3.select("#lineChart2") //text for x-axis
            .append("text")
            .attr("x", width/2)
            .attr("y", height-(margin.bottom)/3)
            .attr("text-anchor", "middle")
            .style("font-family", "Helvetica")
            .style("font-size", 13)
            .text("Climbing Year")

        d3.select("#lineChart2") //y-axis
            .append("g")
            .attr("transform", "translate("+margin.left+", "+margin.top+")")
            .call(y_axis)

        d3.select("#lineChart2") //text for y-axis
            .append("text")
            .attr("transform", "translate("+margin.left/3+", "+height/2+")rotate(-90)")
            .attr("text-anchor", "middle")
            .style("font-family", "Helvetica")
            .style("font-size", 13)
            .text("# of success/failure")

        movingText1 = d3.select("#lineChart2")
            .append("g")
            .append("text")
            .attr("x", margin.left * 2)
            .attr("y", margin.top * 8)
            .style("opacity", 1)
            .style("stroke", "#2ca02c")
            .style("font-family", "Helvetica")
            .attr("text-anchor", "right")
            .text("Success")

        movingText2 = d3.select("#lineChart2")
            .append("g")
            .append("text")
            .attr("x", margin.left * 2)
            .attr("y", margin.top * 8.5)
            .style("opacity", 1)
            .style("stroke", "#d62728")
            .style("font-family", "Helvetica")
            .attr("text-anchor", "right")
            .text("Failure")

        //Add annotation
        const annotations = [
                                {
                                    note: {label: "2001: 16 yrs. old ascends", align: "middle"},
                                    x: xs(2001),
                                    y: height - margin.top,
                                    dx: -100,
                                    dy: -200,
                                    nx: xs(1975),
                                    type: d3.annotationCalloutElbow,
                                    connector: {end: "arrow"}
                                },
                                {
                                    note: {label: "2006: Double leg amputee ascends"},
                                    x: xs(2006),
                                    y: height - margin.top,
                                    dx: -150,
                                    dy: -250,
                                    nx: xs(1975),
                                    type: d3.annotationCalloutElbow,
                                    connector: {end: "arrow"}
                                },
                                {
                                    note: {label: "2015: Earthquake in Nepal"},
                                    x: xs(2015),
                                    y: height - margin.top,
                                    dx: -100,
                                    dy: -50,
                                    nx: xs(2000),
                                    type: d3.annotationCalloutElbow,
                                    connector: {end: "arrow"}
                                }, 
                            ]

        const makeAnnotations = d3.annotation().annotations(annotations)

        d3.select("#lineChart2") //text for y-axis
            .append("g")
            .attr("transform", "translate("+margin.left+", "+0+")")
            //.style("stroke", "#ff7f0e")
            .call(makeAnnotations)

        const annotationTrend2_2 = d3.select("#lineChart2")
                                    .append("text")
                                    .attr("id", "annotationTrend2_2")
                                    .attr("x", xs(1945))
                                    .attr("y", 500)
                                    .attr("font-size", "18")
                                    .text("Failure outweights success until 2004");

        // Add the rectangle element as underline (to show the trend)
        //const box2_2 = d3.select("#annotationTrend2_2").node().getBBox();              //CHECK HERE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        //console.log (box2)
        const box2_2_x = xs(1945)
        const box2_2_y = 500
        const box2_2_width = 270 //change this one as per the length of the text
        const box2_2_height = 3
        
        const underLine2_2 = d3.select("#lineChart2")
                                .append("rect")
                                .attr("id", "underLine2_2")
                                .attr("x", box2_2_x)
                                .attr("y", box2_2_y + box2_2_height + 10) 
                                .attr("width", box2_2_width)
                                .attr("height", 2)
                                .attr("fill", "#7f7f7f");

        // Arrow for the underline to show the trend
        const arrowheadSize = 10;
        const arrowXPos = box2_2_x + box2_2_width;
        const arrowYPos = box2_2_y + box2_2_height + 10;
        const arrowPath = `M ${arrowXPos} ${arrowYPos} L ${arrowXPos - arrowheadSize} ${arrowYPos - arrowheadSize / 2} L ${arrowXPos - arrowheadSize} ${arrowYPos + arrowheadSize / 2} Z`;
    
        d3.select("#lineChart2")
            .append("path")
            .attr("id", "arrow2_2")
            .attr("d", arrowPath)
            .attr("fill", "#7f7f7f");

        const centerXPos = box2_2_x + box2_2_width / 2 ;
        const centerYPos = box2_2_y + box2_2_height / 2;
        const rotationAngle = -10; //Rotate as per the orientation of the graph

        d3.select("#annotationTrend2_2").attr("transform", `rotate(${rotationAngle}, ${centerXPos}, ${centerYPos})`);
        d3.select("#underLine2_2").attr("transform", `rotate(${rotationAngle}, ${centerXPos}, ${centerYPos})`);
        d3.select("#arrow2_2").attr("transform", `rotate(${rotationAngle}, ${centerXPos}, ${centerYPos})`);

        d3.select("#lineChart2") //vertical dotted line 1980 is not working
            .append("line")
            .attr("x1", xs(2011))
            .attr("y1", height - margin.top)
            .attr("x2", xs(2011))
            .attr("y2", margin.top)
            .attr("stroke", "#7f7f7f")
            .attr("stroke-dasharray", "3,3")

    } //end of createLineChart2 function

    function createLineChart3SuccessTrue() { //displays the injury data where success===TRUE
        const width = d3.select("#lineChart2").attr("width") //get the pixel from the previous svg
        const height = d3.select("#lineChart2").attr("height")
        const margin = {top:50, right:50, bottom:50, left:50}

        const injuryWithSucessTrueData = sortedDataStream2.filter(function(d){return d.success == "TRUE"})

        xs = d3.scaleLinear().domain([1921, 2019]).range([0, width - margin.left - margin.right])
        ys = d3.scaleLinear().domain([0, 1100]).range([height - margin.top - margin.bottom, 0])

        x_axis = d3.axisBottom(xs).ticks(10).tickFormat(d3.format("")) //create bottom x-axis
        y_axis = d3.axisLeft(ys).ticks(10) //create left y-axis

        svg = d3.selectAll("#lineChart3Primary") //create an dynamic svg element
                .append("svg")
                .attr("id", "#lineChart3Success")
                .attr("width", width)
                .attr("height", height)

         //draw the injured true count lie
           svg.append("path")
            .attr("transform", "translate("+margin.left+", "+margin.top+")")
            .datum(injuryWithSucessTrueData) 
            .attr("d", d3.line()
                .x(function(d) {return xs(d.year); }) 
                .y(function(d) { return ys(d.injuredTrueCount) }))
            .style("fill", "none")
            .style("stroke", "#e377c2")  
            .style("stroke-width", "2");

         //draw the injured false count line
           svg.append("path")
            .attr("transform", "translate("+margin.left+", "+margin.top+")")
            .datum(injuryWithSucessTrueData) 
            .attr("d", d3.line()
                .x(function(d) {return xs(d.year); }) 
                .y(function(d) { return ys(d.injuredFalseCount) }))
            .style("fill", "none")
            .style("stroke", "#bcbd22")
            .style("stroke-width", "2");

         //x-axis
            svg.append("g")
            .attr("transform", "translate("+margin.left+", "+(height-margin.bottom)+")")
            .call(x_axis)

         //text for x-axis
            svg.append("text")
            .attr("x", width/2)
            .attr("y", height-(margin.bottom)/3)
            .attr("text-anchor", "middle")
            .style("font-family", "Helvetica")
            .style("font-size", 13)
            .text("Climbing Year")

         //y-axis
            svg.append("g")
            .attr("transform", "translate("+margin.left+", "+margin.top+")")
            .call(y_axis)

         //text for y-axis
            svg.append("text")
            .attr("transform", "translate("+margin.left/3+", "+height/2+")rotate(-90)")
            .attr("text-anchor", "middle")
            .style("font-family", "Helvetica")
            .style("font-size", 13)
            .text("Injury count")

        
        //following code will create a moving circle with mouse pointer
        bisect = d3.bisector(d => d.year).left

        overlayRect = svg.append("rect")
                        .attr("x", margin.left)
                        .attr("y", margin.top)
                        .attr("width", width - margin.left - margin.right)
                        .attr("height", height - margin.top - margin.bottom)
                        .style("fill", "none")
                        .style("pointer-events", "all")
                        .on("mouseout", mouseOut)
                        .on("mouseover", mouseOver)
                        .on("mousemove", mouseMove)
                        .on("click", mouseClick)

        movingCircle1 = svg.append("g")
                        .append("circle")
                        .attr("transform", "translate("+margin.left+", "+margin.top+")")
                        .style("opacity", 1)
                        .style("stroke", "#e377c2")
                        .style("fill", "none")
                        .style("stroke-width", "3")
                        .attr("r", 7)

        movingText1 = svg.append("g")
                        .append("text")
                        .attr("x", margin.left * 2)
                        .attr("y", margin.top * 7.5)
                        .style("opacity", 1)
                        .style("stroke", "#e377c2")
                        .style("font-family", "Helvetica")
                        .attr("text-anchor", "right")
                        .text("InjuredTrue")

        movingCircle2 = svg.append("g")
                        .append("circle")
                        .attr("transform", "translate("+margin.left+", "+margin.top+")")
                        .style("opacity", 1)
                        .style("stroke", "#bcbd22")
                        .style("fill", "none")
                        .style("stroke-width", "3")
                        .attr("r", 7)

        movingText2 = svg.append("g")
                        .append("text")
                        .attr("x", margin.left * 2)
                        .attr("y", margin.top * 7)
                        .style("opacity", 1)
                        .style("stroke", "#bcbd22")
                        .style("font-family", "Helvetica")
                        .attr("text-anchor", "right")
                        .text("InjuredFalse")

        function mouseOut() {
            movingCircle1.style("opacity", 1)
            movingCircle1.style("fill", "none")
            movingText1.style("opacity", 1)

            movingCircle2.style("opacity", 1)
            movingCircle2.style("fill", "none")
            movingText2.style("opacity", 1)
        }

        function mouseOver() {
            movingCircle1.style("opacity", 1)
            movingText1.style("opacity", 1)

            movingCircle2.style("opacity", 1)
            movingText2.style("opacity", 1)
        }

        function mouseMove() {
            mxPos = Math.round(xs.invert(d3.mouse(this)[0] - margin.left))
            //console.log(mxPos)
            index = bisect(injuryWithSucessTrueData, mxPos)
            //console.log(index)

            currentLocation = injuryWithSucessTrueData[index]
            //console.log(currentData)
            movingCircle1.attr("cx", xs(currentLocation.year))
                        .attr("cy", ys(currentLocation.injuredTrueCount))
                        .style("fill", "none")

            movingText1.html("Year: " + currentLocation.year + " , " + "InjuredTrueCount: " + currentLocation.injuredTrueCount)

            movingCircle2.attr("cx", xs(currentLocation.year))
                        .attr("cy", ys(currentLocation.injuredFalseCount))
                        .style("fill", "none")

            movingText2.html("Year: " + currentLocation.year + " , " + "InjuredFalseCount: " + currentLocation.injuredFalseCount)

        }

        function mouseClick() {
            movingCircle1.style("fill", "red")
            movingCircle2.style("fill", "red")

           mxPos = Math.round(xs.invert(d3.mouse(this)[0] - margin.left))
           //console.log(mxPos)
           index = bisect(injuryWithSucessTrueData, mxPos)
           //console.log(index)

           selectedYear = injuryWithSucessTrueData[index].year
           //console.log(selectedYear)
           //createPieChart(currentLocation.year)
           d3.select("#year").property("value", selectedYear)
           d3.select("#year").dispatch("change") //simulate the change event
        }

        const annotations = [
            {
                note: {label: "1953: First ascent", align: "middle"},
                x: xs(1953),
                y: height - margin.top,
                dx: 0,
                dy: -90,
                type: d3.annotationCalloutElbow,
                connector: {end: "arrow"}
            },
        ]

        const makeAnnotations = d3.annotation().annotations(annotations)

        svg.append("g")
            .attr("transform", "translate("+margin.left+", "+0+")")
           // .style("stroke", "#ff7f0e")
            .call(makeAnnotations)

        const annotationTrendSuccess1 = svg.append("text")
                                    .attr("id", "annotationTrendSuccess1")
                                    .attr("x", xs(1980))
                                    .attr("y", 450)
                                    .attr("font-size", "18")
                                    .text("Injury reported even for success");

        // Add the rectangle element as underline (to show the trend)
        //const box2_2 = d3.select("#annotationTrend2_2").node().getBBox();              //CHECK HERE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        //console.log (box2)
        const box3Success1_x = xs(1980)
        const box3Success1_y = 450
        const box3Success1_width = 240 //change this one as per the length of the text
        const box3Success1_height = 3
        
        const underLine3Success1 = svg.append("rect")
                                .attr("id", "underLine3Success1")
                                .attr("x", box3Success1_x)
                                .attr("y", box3Success1_y + box3Success1_height + 10) 
                                .attr("width", box3Success1_width)
                                .attr("height", 2)
                                .attr("fill", "#7f7f7f");

        // Arrow for the underline to show the trend
        const arrowheadSize = 10;
        const arrowXPos = box3Success1_x + box3Success1_width;
        const arrowYPos = box3Success1_y + box3Success1_height + 10;
        const arrowPath = `M ${arrowXPos} ${arrowYPos} L ${arrowXPos - arrowheadSize} ${arrowYPos - arrowheadSize / 2} L ${arrowXPos - arrowheadSize} ${arrowYPos + arrowheadSize / 2} Z`;
    
        svg.append("path")
            .attr("id", "arrowSuccess1")
            .attr("d", arrowPath)
            .attr("fill", "#7f7f7f");

        const centerXPos = box3Success1_x + box3Success1_width / 2 ;
        const centerYPos = box3Success1_y + box3Success1_height / 2;
        const rotationAngle = 0; //Rotate as per the orientation of the graph

        d3.select("#annotationTrendSuccess1").attr("transform", `rotate(${rotationAngle}, ${centerXPos}, ${centerYPos})`);
        d3.select("#underLine3Success1").attr("transform", `rotate(${rotationAngle}, ${centerXPos}, ${centerYPos})`);
        d3.select("#arrowSuccess1").attr("transform", `rotate(${rotationAngle}, ${centerXPos}, ${centerYPos})`);


    } //end of createLineChart3SuccessTrue function

    function createLineChart3SuccessFalse() { //displays the injury data where success===False
        const width = d3.select("#lineChart2").attr("width")
        const height = d3.select("#lineChart2").attr("height")
        const margin = {top:50, right:50, bottom:50, left:50}

        const injuryWithSucessTrueData = sortedDataStream2.filter(function(d){return d.success == "FALSE"})

        xs = d3.scaleLinear().domain([1921, 2019]).range([0, width - margin.left - margin.right])
        ys = d3.scaleLinear().domain([0, 1100]).range([height - margin.top - margin.bottom, 0])

        x_axis = d3.axisBottom(xs).ticks(10).tickFormat(d3.format("")) //create bottom x-axis
        y_axis = d3.axisLeft(ys).ticks(10) //create left y-axis

        svg = d3.selectAll("#lineChart3Primary") //create an dynamic svg element
                .append("svg")
                .attr("id", "#lineChart3Failure")
                .attr("width", width)
                .attr("height", height)

         //draw the injured true count lie
           svg.append("path")
            .attr("transform", "translate("+margin.left+", "+margin.top+")")
            .datum(injuryWithSucessTrueData) 
            .attr("d", d3.line()
                .x(function(d) {return xs(d.year); }) 
                .y(function(d) { return ys(d.injuredTrueCount) }))
            .style("fill", "none")
            .style("stroke", "#e377c2")  
            .style("stroke-width", "2");

         //draw the injured false count line
           svg.append("path")
            .attr("transform", "translate("+margin.left+", "+margin.top+")")
            .datum(injuryWithSucessTrueData) 
            .attr("d", d3.line()
                .x(function(d) {return xs(d.year); }) 
                .y(function(d) { return ys(d.injuredFalseCount) }))
            .style("fill", "none")
            .style("stroke", "#bcbd22")
            .style("stroke-width", "2");

         //x-axis
            svg.append("g")
            .attr("transform", "translate("+margin.left+", "+(height-margin.bottom)+")")
            .call(x_axis)

         //text for x-axis
            svg.append("text")
            .attr("x", width/2)
            .attr("y", height-(margin.bottom)/3)
            .attr("text-anchor", "middle")
            .style("font-family", "Helvetica")
            .style("font-size", 13)
            .text("Climbing Year")

         //y-axis
            svg.append("g")
            .attr("transform", "translate("+margin.left+", "+margin.top+")")
            .call(y_axis)

         //text for y-axis
            svg.append("text")
            .attr("transform", "translate("+margin.left/3+", "+height/2+")rotate(-90)")
            .attr("text-anchor", "middle")
            .style("font-family", "Helvetica")
            .style("font-size", 13)
            .text("Injury count")

        
        //following code will create a moving circle with mouse pointer
        bisect = d3.bisector(d => d.year).left

        overlayRect = svg.append("rect")
                        .attr("x", margin.left)
                        .attr("y", margin.top)
                        .attr("width", width - margin.left - margin.right)
                        .attr("height", height - margin.top - margin.bottom)
                        .style("fill", "none")
                        .style("pointer-events", "all")
                        .on("mouseout", mouseOut)
                        .on("mouseover", mouseOver)
                        .on("mousemove", mouseMove)
                        .on("click", mouseClick)

        movingCircle1 = svg.append("g")
                        .append("circle")
                        .attr("transform", "translate("+margin.left+", "+margin.top+")")
                        .style("opacity", 1)
                        .style("stroke", "#e377c2")
                        .style("fill", "none")
                        .style("stroke-width", "3")
                        .attr("r", 7)

        movingText1 = svg.append("g")
                        .append("text")
                        .attr("x", margin.left * 2)
                        .attr("y", margin.top * 7.5)
                        .style("opacity", 1)
                        .style("stroke", "#e377c2")
                        .style("font-family", "Helvetica")
                        .attr("text-anchor", "right")
                        .text("InjuredTrue")

        movingCircle2 = svg.append("g")
                        .append("circle")
                        .attr("transform", "translate("+margin.left+", "+margin.top+")")
                        .style("opacity", 1)
                        .style("stroke", "#bcbd22")
                        .style("fill", "none")
                        .style("stroke-width", "3")
                        .attr("r", 7)

        movingText2 = svg.append("g")
                        .append("text")
                        .attr("x", margin.left * 2)
                        .attr("y", margin.top * 7)
                        .style("opacity", 1)
                        .style("stroke", "#bcbd22")
                        .style("font-family", "Helvetica")
                        .attr("text-anchor", "right")
                        .text("InjuredFalse")

        function mouseOut() {
            movingCircle1.style("opacity", 1)
            movingCircle1.style("fill", "none")
            movingText1.style("opacity", 1)

            movingCircle2.style("opacity", 1)
            movingCircle2.style("fill", "none")
            movingText2.style("opacity", 1)
        }

        function mouseOver() {
            movingCircle1.style("opacity", 1)
            movingText1.style("opacity", 1)

            movingCircle2.style("opacity", 1)
            movingText2.style("opacity", 1)
        }

        function mouseMove() {
            mxPos = Math.round(xs.invert(d3.mouse(this)[0] - margin.left))
            //console.log(mxPos)
            index = bisect(injuryWithSucessTrueData, mxPos)
            //console.log(index)

            currentLocation = injuryWithSucessTrueData[index]
            //console.log(currentData)
            movingCircle1.attr("cx", xs(currentLocation.year))
                        .attr("cy", ys(currentLocation.injuredTrueCount))
                        .style("fill", "none")

            movingText1.html("Year: " + currentLocation.year + " , " + "InjuredTrueCount: " + currentLocation.injuredTrueCount)

            movingCircle2.attr("cx", xs(currentLocation.year))
                        .attr("cy", ys(currentLocation.injuredFalseCount))
                        .style("fill", "none")

            movingText2.html("Year: " + currentLocation.year + " , " + "InjuredFalseCount: " + currentLocation.injuredFalseCount)

        }

        function mouseClick() {
            movingCircle1.style("fill", "red")
            movingCircle2.style("fill", "red")

           mxPos = Math.round(xs.invert(d3.mouse(this)[0] - margin.left))
           //console.log(mxPos)
           index = bisect(injuryWithSucessTrueData, mxPos)
           //console.log(index)

           selectedYear = injuryWithSucessTrueData[index].year
           //console.log(selectedYear)
           //createPieChart(currentLocation.year)
           d3.select("#year").property("value", selectedYear)
           d3.select("#year").dispatch("change") //simulate the change event
        }
        

        const annotationTrendFailure1 = svg.append("text")
                                    .attr("id", "annotationTrendFailure1")
                                    .attr("x", xs(1970))
                                    .attr("y", 340)
                                    .attr("font-size", "18")
                                    .text("InjuredFalse closely follows failure graph pattern");

        // Add the rectangle element as underline (to show the trend)
        //const box2_2 = d3.select("#annotationTrend2_2").node().getBBox();              //CHECK HERE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        //console.log (box2)
        const box3Failure1_x = xs(1970)
        const box3Failure1_y = 340
        const box3Failure1_width = 350 //change this one as per the length of the text
        const box3Failure1_height = 3
        
        const underLine3Failure1 = svg.append("rect")
                                .attr("id", "underLine3Failure1")
                                .attr("x", box3Failure1_x)
                                .attr("y", box3Failure1_y + box3Failure1_height + 10) 
                                .attr("width", box3Failure1_width)
                                .attr("height", 2)
                                .attr("fill", "#7f7f7f");

        // Arrow for the underline to show the trend
        const arrowheadSize = 10;
        const arrowXPos = box3Failure1_x + box3Failure1_width;
        const arrowYPos = box3Failure1_y + box3Failure1_height + 10;
        const arrowPath = `M ${arrowXPos} ${arrowYPos} L ${arrowXPos - arrowheadSize} ${arrowYPos - arrowheadSize / 2} L ${arrowXPos - arrowheadSize} ${arrowYPos + arrowheadSize / 2} Z`;
    
        svg.append("path")
            .attr("id", "arrowFailure1")
            .attr("d", arrowPath)
            .attr("fill", "#7f7f7f");

        const centerXPos = box3Failure1_x + box3Failure1_width / 2 ;
        const centerYPos = box3Failure1_y + box3Failure1_height / 2;
        const rotationAngle = -45; //Rotate as per the orientation of the graph

        d3.select("#annotationTrendFailure1").attr("transform", `rotate(${rotationAngle}, ${centerXPos}, ${centerYPos})`);
        d3.select("#underLine3Failure1").attr("transform", `rotate(${rotationAngle}, ${centerXPos}, ${centerYPos})`);
        d3.select("#arrowFailure1").attr("transform", `rotate(${rotationAngle}, ${centerXPos}, ${centerYPos})`);


        const annotationTrendFailure2 = svg.append("text")
                                            .attr("id", "annotationTrendFailure2")
                                            .attr("x", xs(1930))
                                            .attr("y", 500)
                                            .attr("font-size", "18")
                                            .text("InjuredTure consistently low");

        // Add the rectangle element as underline (to show the trend)
        //const box2_2 = d3.select("#annotationTrend2_2").node().getBBox();              //CHECK HERE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        //console.log (box2)
        const box3Failure2_x = xs(1930)
        const box3Failure2_y = 500
        const box3Failure2_width = 200 //change this one as per the length of the text
        const box3Failure2_height = 3

        const underLine3Failure2 = svg.append("rect")
                                        .attr("id", "underLine3Failure2")
                                        .attr("x", box3Failure2_x)
                                        .attr("y", box3Failure2_y + box3Failure2_height + 10) 
                                        .attr("width", box3Failure2_width)
                                        .attr("height", 2)
                                        .attr("fill", "#7f7f7f");

// Arrow for the underline to show the trend
        const arrowheadSize2 = 10;
        const arrowXPos2 = box3Failure2_x + box3Failure2_width;
        const arrowYPos2 = box3Failure2_y + box3Failure2_height + 10;
        const arrowPath2 = `M ${arrowXPos2} ${arrowYPos2} L ${arrowXPos2 - arrowheadSize2} ${arrowYPos2 - arrowheadSize2 / 2} L ${arrowXPos2 - arrowheadSize2} ${arrowYPos2 + arrowheadSize2 / 2} Z`;

        svg.append("path")
            .attr("id", "arrowFailure2")
            .attr("d", arrowPath)
            .attr("fill", "#7f7f7f");

        const centerXPos2 = box3Failure2_x + box3Failure2_width / 2 ;
        const centerYPos2 = box3Failure2_y + box3Failure2_height / 2;
        const rotationAngle2 = 0; //Rotate as per the orientation of the graph

        d3.select("#annotationTrendFailure2").attr("transform", `rotate(${rotationAngle2}, ${centerXPos2}, ${centerYPos2})`);
        d3.select("#underLine3Failure2").attr("transform", `rotate(${rotationAngle2}, ${centerXPos2}, ${centerYPos2})`);
        d3.select("#arrowFailure2").attr("transform", `rotate(${rotationAngle2}, ${centerXPos2}, ${centerYPos2})`);

    } //end of createLineChart3SuccessFalse function

    var filteredSortedDataStream3 = null //Global variable to hold the filtered data for chart3SecondaryPie charts
    function lineChart3EventListener(){
        const drillDown = document.getElementById("drillDown");
        const clear = document.getElementById("clear");
        const drillDownMenu = document.getElementById("drillDownMenu"); 
        const lineChart3Secondary = document.getElementById("lineChart3Secondary");
    
        drillDown.style.background = "#7f7f7f" //display the initial drillDown menu as depressed
    
        //add eventListeners for the button
        drillDown.addEventListener("click", handleClick);
        clear.addEventListener("click", handleClick);
      
        function handleClick(event) {
          // Get the id of the clicked button
          const clickedId = event.target.id;
    
          // Call a function to show the corresponding drop-down menu and hide others
          showMenu(clickedId);
        }
    
        // Function to show the corresponding drop-down menu and hide others
        function showMenu(clickedId) {
          if (clickedId === "drillDown") {
            drillDownMenu.style.display = "block";
            drillDown.style.background = "#7f7f7f" //show that the button is depresed
            clear.style.background = "none"
            lineChart3Secondary.style.opacity = "1"
          } else if (clickedId === "clear") {
            drillDownMenu.style.display = "none";
            clear.style.background = "#7f7f7f" //Show that the button is depressed
            drillDown.style.background = "none"
            lineChart3Secondary.style.opacity = "0" // If "clear" is selected, hide the secondary pie charts

            //---> add code to hide the secondary chart here
          }
        }
    
      var selectedRadioButtonVal = null //Global variable to hold the radio value

        function getSelectedRadioButton(){
          const allRadioButton = document.querySelectorAll('input[type="radio"]');  
          initialCheckedButton = null;
    
          allRadioButton.forEach(function(radioButton) {
            if (radioButton.checked) {
              initialCheckedButton = radioButton; 
              selectedRadioButtonVal = initialCheckedButton.value         
              //console.log("Initial checked option: " + initialCheckedButton.value);
            }
          })
      
          // Add event listener
          allRadioButton.forEach(function(radioButton) {
            radioButton.addEventListener("change", function() {
              const selectedButtonValue = this.value;
              selectedRadioButtonVal = selectedButtonValue    //Change the global val      
              //console.log("Selected option: " + selectedButtonValue);
              updatePrimaryChart3(selectedRadioButtonVal)
              updateChart3WithSelection() //Call to update the value
            });
          });      
    
        }

        //Update the primary line chart
        function updatePrimaryChart3(selectedRadioButtonVal){
            if (selectedRadioButtonVal === "TRUE"){
                d3.selectAll("#lineChart3Primary").selectAll("*").remove()
                createLineChart3SuccessTrue()
    
              } else if (selectedRadioButtonVal === "FALSE"){
                d3.selectAll("#lineChart3Primary").selectAll("*").remove()
                createLineChart3SuccessFalse()
    
              }
        }
    
        const yearTextBox = d3.select("#year") //define at the top of mouseClick()
        // Function to update data based on drop down selection
        function updateChart3WithSelection() {
          const selectedSeason = seasonDropDown.property("value");
          const selectedHired = hiredDropDown.property("value");
          const selectedYear = yearTextBox.property("value")
          selectedSuccessFailure = selectedRadioButtonVal;
         
          console.log(selectedSeason)
          console.log(selectedHired) 
          console.log(selectedSuccessFailure)
          console.log(selectedYear)

          filteredSortedDataStream3 = sortedDataStream3.filter(function(d){ return (d.season === selectedSeason && d.hired === selectedHired
                                            && d.success === selectedSuccessFailure && d.year === +selectedYear)}) //update the global variable

            //console.log(filteredSortedDataStream3) //print the global variable
            //createPieChart3_1() //Calling function to create the pie chart 3_1
            if (filteredSortedDataStream3.length ===0){
                d3.select("#lineChart3Secondary1").selectAll("*").remove()
                d3.select("#lineChart3Secondary1").append("g")
                    .append("text")                    
                    .text("No injury data. Select different combination")
                    
                d3.select("#lineChart3Secondary2").selectAll("*").remove()
                d3.select("#lineChart3Secondary2").append("g")
                    .append("text")                    
                    .text("No death data. Select different combination") 

                d3.select("#lineChart3Secondary3").selectAll("*").remove()
                d3.select("#lineChart3Secondary3").append("g")
                    .append("text")                    
                    .text("No O2 data. Select different combination") 

            } else {
                createPieChart3_1() //Calling function to create the pie chart 3_1
                createPieChart3_2() //Calling function to create the pie chart 3_2
                createPieChart3_3() //Calling function to create the pie chart 3_2
            }
               
        }
           
        getSelectedRadioButton() //First call of the function to initalize the value
        updateChart3WithSelection() //First call of the function to initalize the value
        createLineChart3SuccessFalse() //First call to the success false line graph because it is the first value for radio button
    
        // Add event listner to update the data
        seasonDropDown.on("change", updateChart3WithSelection);
        hiredDropDown.on("change", updateChart3WithSelection);
        yearTextBox.on("change", updateChart3WithSelection)

    } // End of lineChart3EventListener()

    lineChart3EventListener()

    console.log(filteredSortedDataStream3) //print the global variable

    function createPieChart3_1() {
        const width = 250
        const height = 200
        const margin = {top:10, right:10, bottom:10, left:10}
        const pieColorArray = ["#bcbd22", "#e377c2"]

        const radius = Math.min(width, height) / 3

        const data = filteredSortedDataStream3
        //console.log(data)
        //console.log(data[0].injuredTrueCount)

        const injuredNonInjuredArray = [data[0].injuredFalseCount, data[0].injuredTrueCount]
        const totalCount = data[0].injuredFalseCount + data[0].injuredTrueCount
        //console.log(injuryNonInjuryArray)

        const pieData = injuredNonInjuredArray.map((value, index) => ({label: index === 0 ? "injuredFalse" : "injuredTrue", value: value})) //first=injuredFalseCount; second=injuredTrueCount
        console.log(pieData)

        //d3.select("#pieChart3_1").html("") //clear the previous "pie-chart" element if any exist
        d3.selectAll("#lineChart3Secondary1").selectAll("*").remove()
        d3.selectAll("#lineChart3Secondary1").append("svg").attr("id", "pieChart3_1")

        

        const pieChart = d3.select("#pieChart3_1")
                            .attr("width", width)
                            .attr("height", height)
                            .append("g")
                            .attr("transform", "translate("+(width/3)+", "+(height/2)+")")
        const pie = d3.pie()
                        .value((d) => d.value)
                        
        const path = d3.arc()
                        .innerRadius(30)
                        .outerRadius(radius)

        const arc = pieChart.selectAll("arc")
                            .append("g")
                            .data(pie(pieData))
                            .enter()
                            
        arc.append("path")
            .attr("d", path)
            .attr("fill", (d, i) => pieColorArray[i])
            .on("mouseover", function(d) {
                const pieTooltip = d3.select(this.parentNode)
                                    .append("g")
                                    .attr("id", "tooltip")
                                    .attr("transform", "translate("+(-radius * 1.2)+", "+0+")")
      
                pieTooltip.append("rect")
                        .attr("width", 155)
                        .attr("height", 30)
                        .attr("fill", "#1b9e77");
      
                pieTooltip.append("text")
                        .attr("x", 10)
                        .attr("y", 20)
                        .attr("fill", "white")
                        .text(d.data.label + ": " + d.data.value + "/" + totalCount);

                d3.select(this)
                    .attr("d", d => {
                        const modifiedArc = d3.arc()
                                            .innerRadius(30 + 10)
                                            .outerRadius(radius + 10);
                                            return modifiedArc(d);
                    })
              })
            .on("mouseout", function() {
                d3.select(this.parentNode)
                    .select("#tooltip")
                    .remove();

                d3.select(this)
                    .attr("d", path)
              });

        const pieLegend = d3.select("#pieChart3_1")                            
                            .selectAll("legend")
                            .data(pieData)
                            .enter()
                            .append("g")
                            .attr("transform", (d, i) => "translate("+(radius * 2)+", "+(2-i) * 20+")")
      
        pieLegend.append("rect")
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", (d, i) => pieColorArray[i])
      
        pieLegend.append("text")
            .attr("x", 20)
            .attr("y", 10)
            .text((d) => d.label)        
            

    } // end of createPieChart3_1()

    function createPieChart3_2() {
        const width = 250
        const height = 200
        const margin = {top:10, right:10, bottom:10, left:10}
        const pieColorArray = ["#bcbd22", "#e377c2"]

        const radius = Math.min(width, height) / 3

        const data = filteredSortedDataStream3
        //console.log(data)
        //console.log(data[0].injuredTrueCount)

        const deathNonDeathArray = [data[0].deathFalseCount, data[0].deathTrueCount]
        const totalCount = data[0].deathFalseCount + data[0].deathTrueCount
        //console.log(injuryNonInjuryArray)

        const pieData = deathNonDeathArray.map((value, index) => ({label: index === 0 ? "deathFalse" : "deathTrue", value: value})) //first=deathFalseCount; second=deathTrueCount
        console.log(pieData)

        //d3.select("#pieChart3_2").html("") //clear the previous "pie-chart" element if any exist
        d3.selectAll("#lineChart3Secondary2").selectAll("*").remove()
        d3.selectAll("#lineChart3Secondary2").append("svg").attr("id", "pieChart3_2")

        

        const pieChart = d3.select("#pieChart3_2")
                            .attr("width", width)
                            .attr("height", height)
                            .append("g")
                            .attr("transform", "translate("+(width/3)+", "+(height/2)+")")
        const pie = d3.pie()
                        .value((d) => d.value)
                        
        const path = d3.arc()
                        .innerRadius(30)
                        .outerRadius(radius)

        const arc = pieChart.selectAll("arc")
                            .append("g")
                            .data(pie(pieData))
                            .enter()
                            
        arc.append("path")
            .attr("d", path)
            .attr("fill", (d, i) => pieColorArray[i])
            .on("mouseover", function(d) {
                const pieTooltip = d3.select(this.parentNode)
                                    .append("g")
                                    .attr("id", "tooltip")
                                    .attr("transform", "translate("+(-radius * 1.2)+", "+0+")")
      
                pieTooltip.append("rect")
                        .attr("width", 155)
                        .attr("height", 30)
                        .attr("fill", "#1b9e77");
      
                pieTooltip.append("text")
                        .attr("x", 10)
                        .attr("y", 20)
                        .attr("fill", "white")
                        .text(d.data.label + ": " + d.data.value + "/" + totalCount);

                d3.select(this)
                    .attr("d", d => {
                        const modifiedArc = d3.arc()
                                            .innerRadius(30 + 10)
                                            .outerRadius(radius + 10);
                                            return modifiedArc(d);
                    })
              })
            .on("mouseout", function() {
                d3.select(this.parentNode)
                    .select("#tooltip")
                    .remove();

                d3.select(this)
                    .attr("d", path)
              });

        const pieLegend = d3.select("#pieChart3_2")                            
                            .selectAll("legend")
                            .data(pieData)
                            .enter()
                            .append("g")
                            .attr("transform", (d, i) => "translate("+(radius * 2)+", "+(2-i) * 20+")")
      
        pieLegend.append("rect")
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", (d, i) => pieColorArray[i])
      
        pieLegend.append("text")
            .attr("x", 20)
            .attr("y", 10)
            .text((d) => d.label)        
            

    } // end of createPieChart3_2()

    function createPieChart3_3() {
        const width = 250
        const height = 200
        const margin = {top:10, right:10, bottom:10, left:10}
        const pieColorArray = ["#bcbd22", "#e377c2"]

        const radius = Math.min(width, height) / 3

        const data = filteredSortedDataStream3
        //console.log(data)
        //console.log(data[0].o2TrueCount)

        const o2NonO2Array = [data[0].o2FalseCount, data[0].o2TrueCount]
        const totalCount = data[0].o2FalseCount + data[0].o2TrueCount
        //console.log(o2NonO2Array)

        const pieData = o2NonO2Array.map((value, index) => ({label: index === 0 ? "o2False" : "o2True", value: value})) //first=o2FalseCount; second=o2TrueCount
        console.log(pieData)

        //d3.select("#pieChart3_3").html("") //clear the previous "pie-chart" element if any exist
        d3.selectAll("#lineChart3Secondary3").selectAll("*").remove()
        d3.selectAll("#lineChart3Secondary3").append("svg").attr("id", "pieChart3_3")

        

        const pieChart = d3.select("#pieChart3_3")
                            .attr("width", width)
                            .attr("height", height)
                            .append("g")
                            .attr("transform", "translate("+(width/3)+", "+(height/2)+")")
        const pie = d3.pie()
                        .value((d) => d.value)
                        
        const path = d3.arc()
                        .innerRadius(30)
                        .outerRadius(radius)

        const arc = pieChart.selectAll("arc")
                            .append("g")
                            .data(pie(pieData))
                            .enter()
                            
        arc.append("path")
            .attr("d", path)
            .attr("fill", (d, i) => pieColorArray[i])
            .on("mouseover", function(d) {
                const pieTooltip = d3.select(this.parentNode)
                                    .append("g")
                                    .attr("id", "tooltip")
                                    .attr("transform", "translate("+(-radius * 1.2)+", "+0+")")
      
                pieTooltip.append("rect")
                        .attr("width", 155)
                        .attr("height", 30)
                        .attr("fill", "#1b9e77");
      
                pieTooltip.append("text")
                        .attr("x", 10)
                        .attr("y", 20)
                        .attr("fill", "white")
                        .text(d.data.label + ": " + d.data.value + "/" + totalCount);

                d3.select(this)
                    .attr("d", d => {
                        const modifiedArc = d3.arc()
                                            .innerRadius(30 + 10)
                                            .outerRadius(radius + 10);
                                            return modifiedArc(d);
                    })
              })
            .on("mouseout", function() {
                d3.select(this.parentNode)
                    .select("#tooltip")
                    .remove();

                d3.select(this)
                    .attr("d", path)
              });

        const pieLegend = d3.select("#pieChart3_3")                            
                            .selectAll("legend")
                            .data(pieData)
                            .enter()
                            .append("g")
                            .attr("transform", (d, i) => "translate("+(radius * 2)+", "+(2-i) * 20+")")
      
        pieLegend.append("rect")
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", (d, i) => pieColorArray[i])
      
        pieLegend.append("text")
            .attr("x", 20)
            .attr("y", 10)
            .text((d) => d.label)        
            

    } // end of createPieChart3_3()









}



/*
   const nestedData = d3.nest()
                    .key(function(d) {return d.year})
                    .entries(dataToWorkWith)

    const groupedData = nestedData.map((group) => ({
        year: +group.key,
        attempt: group.values.length,
        success: group.values.filter((d) => d.success === "TRUE").length,
        failure: group.values.filter((d) => d.success === "FALSE").length
    }))
   
    sortedTotalSuccessFailure = groupedData.slice().sort((a,b) => d3.ascending(a.year, b.year))
   // console.log(sortedTotalSuccessFailure)

    allSeason = d3.map(dataToWorkWith, function(d){return d.season}).keys() //gets 'Spring', 'Autumn', 'Winter' and 'Summer'
    //console.log(allSeason)

    createLineChart()
    
    /* Function def begins here.
        1. createLineChart()
        2. CreatePieChart()
        3. createBarChart()
    */
   /*
    function createLineChart() {
        const width = d3.select("#line-chart").attr("width")
        const height = d3.select("#line-chart").attr("height")
        const margin = {top:50, right:50, bottom:50, left:50}

        xs = d3.scaleLinear().domain([1921, 2019]).range([0, width - margin.left - margin.right])
        ys = d3.scaleLinear().domain([0, 1100]).range([height - margin.top - margin.bottom, 0])

        x_axis = d3.axisBottom(xs).ticks(10).tickFormat(d3.format("")) //create bottom x-axis
        y_axis = d3.axisLeft(ys).ticks(10) //create left y-axis

        d3.select("#seasonButton")
            .selectAll('option')
            .data(allSeason)
            .enter()
            .append('option')
            .text(function (d) {return d;}) // this is the text shown in the menu
            .attr("value", function (d) {return d;}) // this is the value associated with the text
            .attr("width", margin.left)
            .attr("height", margin.top)

        d3.select("#line-chart") //draw the line
            .append("path")
            .attr("transform", "translate("+margin.left+", "+margin.top+")")
            .datum(sortedTotalSuccessFailure) 
            .attr("d", d3.line()
            .x(function(d) {return xs(d.year); }) 
            .y(function(d) { return ys(d.attempt) }))
            .style("fill", "none")
            .style("stroke", "blue")
            .style("stroke-width", "2");

        d3.select("#line-chart") //x-axis
            .append("g")
            .attr("transform", "translate("+margin.left+", "+(height-margin.bottom)+")")
            .call(x_axis)

        d3.select("#line-chart") //text for x-axis
            .append("text")
            .attr("x", width/2)
            .attr("y", height-(margin.bottom)/3)
            .attr("text-anchor", "middle")
            .style("font-family", "Helvetica")
            .style("font-size", 13)
            .text("Climbing Year")

        d3.select("#line-chart") //y-axis
            .append("g")
            .attr("transform", "translate("+margin.left+", "+margin.top+")")
            .call(y_axis)

        d3.select("#line-chart") //text for y-axis
            .append("text")
            .attr("transform", "translate("+margin.left/3+", "+height/2+")rotate(-90)")
            .attr("text-anchor", "middle")
            .style("font-family", "Helvetica")
            .style("font-size", 13)
            .text("# of attempts")

        //following code will create a moving circle with mouse pointer
        bisect = d3.bisector(d => d.year).left

        overlayRect = d3.select("#line-chart")
                        .append("rect")
                        .attr("x", margin.left)
                        .attr("y", margin.top)
                        .attr("width", width - margin.left - margin.right)
                        .attr("height", height - margin.top - margin.bottom)
                        .style("fill", "none")
                        .style("pointer-events", "all")
                        .on("mouseout", mouseOut)
                        .on("mouseover", mouseOver)
                        .on("mousemove", mouseMove)
                        .on("click", mouseClick)

        movingCircle = d3.select("#line-chart")
                        .append("g")
                        .append("circle")
                        .attr("transform", "translate("+margin.left+", "+margin.top+")")
                        .style("opacity", 1)
                        .style("stroke", "red")
                        .style("fill", "none")
                        .attr("r", 7)

        movingText = d3.select("#line-chart")
                        .append("g")
                        .append("text")
                        .attr("x", margin.left * 2)
                        .attr("y", margin.top * 8)
                        .style("opacity", 1)
                        .style("stroke", "teal")
                        .style("font-family", "Helvetica")
                        .attr("text-anchor", "right")
                        .text("<Select a point on the graph>")

        function mouseOut() {
            movingCircle.style("opacity", 1)
            movingCircle.style("fill", "none")
            movingText.style("opacity", 1)
        }

        function mouseOver() {
            movingCircle.style("opacity", 1)
            movingText.style("opacity", 1)
        }

        function mouseMove() {
            mxPos = Math.round(xs.invert(d3.mouse(this)[0] - margin.left))
            //console.log(mxPos)
            index = bisect(sortedTotalSuccessFailure, mxPos)
            //console.log(index)

            currentLocation = sortedTotalSuccessFailure[index]
            //console.log(currentData)
            movingCircle.attr("cx", xs(currentLocation.year))
                        .attr("cy", ys(currentLocation.attempt))
                        .style("fill", "none")

            movingText.html("Year: " + currentLocation.year + " , " + "Attempts: " + currentLocation.attempt)

        }

        function mouseClick() {
            movingCircle.style("fill", "red")

           mxPos = Math.round(xs.invert(d3.mouse(this)[0] - margin.left))
           //console.log(mxPos)
           index = bisect(sortedTotalSuccessFailure, mxPos)
           //console.log(index)

           currentLocation = sortedTotalSuccessFailure[index]
           console.log(currentLocation)
           createPieChart(currentLocation.year)
        }

        //Add annotation
        const annotations = [
                                {
                                    note: {label: "1953: First ascent"},
                                    x: xs(1953),
                                    y: height - margin.top,
                                    dx: 0,
                                    dy: -90,
                                    type: d3.annotationCalloutElbow,
                                    connector: {end: "arrow"}
                                },
                                {
                                    note: {label: "1975: First women ascent"},
                                    x: xs(1975),
                                    y: height - margin.top,
                                    dx: -1,
                                    dy: -120,
                                    type: d3.annotationCalloutElbow,
                                    connector: {end: "arrow"}
                                },
                                {
                                    note: {label: "2003: Fastest ascent"},
                                    x: xs(2003),
                                    y: height - margin.top,
                                    dx: -1,
                                    dy: -50,
                                    type: d3.annotationCalloutElbow,
                                    connector: {end: "arrow"}
                                },
                                {
                                    note: {label: "2015: Most death in 1 day"},
                                    x: xs(2015),
                                    y: height - margin.top,
                                    dx: -1,
                                    dy: -120,
                                    type: d3.annotationCalloutElbow,
                                    connector: {end: "arrow"}
                                },
                            ]

        const makeAnnotations = d3.annotation().annotations(annotations)

        d3.select("#line-chart") //text for y-axis
            .append("g")
            .attr("transform", "translate("+margin.left+", "+0+")")
            .style("stroke", "orange")
            .call(makeAnnotations)

    }//end of line chart function

    function createPieChart(paramYear) {
        const width = d3.select("#pie-chart").attr("width")
        const height = d3.select("#pie-chart").attr("height")
        const margin = {top:50, right:50, bottom:50, left:50}

        const radius = Math.min(width, height) / 3

        const filteredYearData = sortedTotalSuccessFailure.filter((d) => d.year === +paramYear)
        //console.log(filteredYearData)
        //console.log(filteredYearData[0].success)

        const successFailureArray = [filteredYearData[0].success, filteredYearData[0].failure]
        //console.log(successFailureArray)

        const pieData = successFailureArray.map((value, index) => ({label: index === 0 ? "Success" : "Failure", value: value})) //first=success; second=failure
        //console.log(pieData)

        d3.select("#pie-chart").html("") //clear the previous "pie-chart" element if any exist

        const pieChart = d3.select("#pie-chart")
                            .attr("width", width)
                            .attr("height", height)
                            .append("g")
                            .attr("transform", "translate("+(width/2)+", "+(height/2)+")")
        const pie = d3.pie()
                        .value((d) => d.value)
                        
        const path = d3.arc()
                        .innerRadius(50)
                        .outerRadius(radius)

        const arc = pieChart.selectAll("arc")
                            .append("g")
                            .data(pie(pieData))
                            .enter()
                            
        arc.append("path")
            .attr("d", path)
            .attr("fill", (d, i) => d3.schemeCategory10[i])
            .on("mouseover", function(d) {
                const pieTooltip = d3.select(this.parentNode)
                                    .append("g")
                                    .attr("id", "tooltip")
                                    .attr("transform", "translate("+(radius * 0.4)+", "+0+")")
      
                pieTooltip.append("rect")
                        .attr("width", 90)
                        .attr("height", 30)
                        .attr("fill", "teal");
      
                pieTooltip.append("text")
                        .attr("x", 10)
                        .attr("y", 20)
                        .attr("fill", "white")
                        .text(d.data.label + ": " + d.data.value);

                d3.select(this)
                    .attr("d", d => {
                        const modifiedArc = d3.arc()
                                            .innerRadius(50 + 10)
                                            .outerRadius(radius + 10);
                                            return modifiedArc(d);
                    })
              })
            .on("mouseout", function() {
                d3.select(this.parentNode)
                    .select("#tooltip")
                    .remove();

                d3.select(this)
                    .attr("d", path)
              });

        const pieLegend = d3.select("#pie-chart")                            
                            .selectAll("legend")
                            .data(pieData)
                            .enter()
                            .append("g")
                            .attr("transform", (d, i) => "translate("+(radius * 2)+", "+(2-i) * 20+")")
      
        pieLegend.append("rect")
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", (d, i) => d3.schemeCategory10[i])
      
        pieLegend.append("text")
            .attr("x", 20)
            .attr("y", 10)
            .text((d) => d.label)

        const centralText = d3.select("#pie-chart")
            .append("g")
            .attr("transform", "translate("+(radius * 1.2)+", "+(radius * 1.5)+")")
            .append("text")
            .attr("x", 0)
            .attr("y", 0)
            .style("stroke", "teal")
            .style("font-family", "Helvetica")
            .attr("text-anchor", "right")
            .html("Year: " + paramYear)
            

    } // end of create pie chart function

    
}
*/
