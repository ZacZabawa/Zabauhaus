document.querySelectorAll('.scroll-arrow').forEach(arrow => {
    arrow.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(e.target.getAttribute('href'));
        target.scrollIntoView({ behavior: 'smooth' });
    });
});


setTimeout(function() {
    document.getElementById('loading-screen').classList.add('slide-up');
}, 3000); // Adjust the time as needed

document.getElementById('loading-screen').addEventListener('animationend', function() {
    this.style.display = 'none';
});


function wrapText(text, width) {
    text.each(function() {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = .5, // ems
            y = text.attr("y"),
            dy = parseFloat(text.attr("dy")),
            tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
        }
    });
}

// Define delays for each type
const typeDelays = {
    'organization': 5000,
    'function': 7000, // Delay functions by 500ms
    'project': 10000 // Delay projects by 1000ms
};



function renderGraph(graphId, graphData) {
    // Initial setup
    let width = 0.9 * window.innerWidth; // 90% of viewport width
    let height = window.innerHeight * 1; // 30% of viewport height for each graph

   

    if (graphId === "graph2") {
        // Extract nodes and links from the hierarchical data
        const nodes = [];
        const links = [];
        const functionRadius = 0.3 * Math.min(width, height);
        const projectRadius = 0.4 * Math.min(width, height);

        // Function to initialize the zoom behavior
        function initializeZoom(svg) {
            const zoom = d3.zoom()
              .scaleExtent([1, 8]) // Set the scale extent for zooming
              .on('zoom', (event) => {
                svg.selectAll('g').attr('transform', event.transform);
              });
          
            svg.call(zoom);
            filterAndZoom(zoom, 'Amusement');  
          }

        // Create SVG for the graph with zoom functionality
            const svg = d3.select(`#${graphId}`).append("svg")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .call(d3.zoom().on("zoom", (event) => {
                svg.attr("transform", event.transform);
            }))
            .append("g");






      

// Function to filter nodes based on category and zoom into them
function filterAndZoom(category) {
    // Filter nodes based on category
    const filteredNodes = nodes.filter(d => d.category === category);

    // Calculate the extents of the filtered nodes
    const xExtent = d3.extent(filteredNodes, d => d.x);
    const yExtent = d3.extent(filteredNodes, d => d.y);

    // Calculate the center and zoom scale
    const xCenter = (xExtent[0] + xExtent[1]) / 2;
    const yCenter = (yExtent[0] + yExtent[1]) / 2;
    const zoomScale = .5 // Calculate appropriate zoom scale based on extents

    // Apply zoom and translation
    svg.transition()
       .duration(750) // Adjust duration as needed
       .call(zoom.transform, d3.zoomIdentity.translate(width / 2 - zoomScale * xCenter, height / 2 - zoomScale * yCenter).scale(zoomScale));
}

// Event listeners for toolbar buttons
document.getElementById('amusementBtn').addEventListener('click', function() {
    filterAndZoom('Amusement');
});

document.getElementById('practicalBtn').addEventListener('click', function() {
    filterAndZoom('Practical');
});

document.getElementById('researchBtn').addEventListener('click', function() {
    filterAndZoom('Research');
});
        

    function traverse(node, parent = null, index = 0, angleOffset = 0) {
        nodes.push(node);
    if (parent) {links.push({ source: parent.id, target: node.id });
    }
    if (node.functions) {
        const angleStep = 2 * Math.PI / node.functions.length; // Calculate the angle step
        node.functions.forEach((child, i) => {
            if (child.type === 'function') { // Check the type of the node
                child.x = width / 2 + 0.8 * functionRadius * Math.cos(i * angleStep + angleOffset); // Calculate the x position
                child.y = height / 2 + 0.8 * functionRadius * Math.sin(i * angleStep + angleOffset); // Calculate the y position
            }
            traverse(child, node, i, i * angleStep);
        });
    }
    if (node.projects) {
        const angleStep = 2 * Math.PI / node.projects.length;
        node.projects.forEach((child, i) => {
            child.x = width / 2 + projectRadius * Math.cos(i * angleStep + angleOffset); // Calculate the x position
            child.y = height / 2 + projectRadius * Math.sin(i * angleStep + angleOffset); // Calculate the y position
            traverse(child, node, i, i * angleStep + angleOffset);
        });
    }
}

// Traverse the graph data to populate nodes and links
graphData.forEach(root => traverse(root));

// Create force simulation
const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("function", d3.forceRadial(d => d.type === 'function' ? 300 : 0, width / 2, height / 2).strength(0.8))
    .force("project", d3.forceRadial(d => d.type === 'project' ? 500 : 0, width / 2, height / 2).strength(0.6))
    .force("collide", d3.forceCollide().radius(50)); // Add collision force


    
// Calculate the maximum distance of the function nodes from the center
let maxDistance = 0;
nodes.forEach(node => {
    if (node.type === 'function') {
        const dx = node.x - width / 2;
        const dy = node.y - height / 2;
        const distance = Math.sqrt(dx * dx + dy * dy);
        maxDistance = Math.max(maxDistance, distance);
    }
});

const buffer = 20; // Adjust the buffer as needed
const radius = maxDistance + buffer;

// Add the circle to the SVG
svg.append("circle")
    .attr("cx", width / 2)
    .attr("cy", height / 2)
    .attr("r", radius)
    .style("fill", "rgba(0, 0, 0, 0.5)"); // Change the color and opacity as needed

    // Add a path for the text
svg.append("path")
.attr("id", "textPath")
.attr("d", `M ${width / 2 - radius}, ${height / 2} a ${radius},${radius} 0 1,1 ${2 * radius},0`)
.style("fill", "none");

// Add the text along the path
svg.append("text")
.attr("dy", -10) // Adjust the offset as needed
.append("textPath")
.attr("xlink:href", "#textPath")
.attr("startOffset", "25%") // Adjust the position as needed
.style("text-anchor", "middle")
.text("Areas of Expertise");

// Calculate the radius for the projects circle
const projectCircleRadius = functionRadius * 1.9; // Adjust the multiplier as needed

// Add the projects circle to the SVG
svg.append("circle")
    .attr("cx", width / 2)
    .attr("cy", height / 2)
    .attr("r", projectCircleRadius)
    .style("fill", "rgba(0, 0, 0, 0.5)"); // Change the color and opacity as needed

// Add a path for the projects label
svg.append("path")
    .attr("id", "projectsTextPath")
    .attr("d", `M ${width / 2 - projectCircleRadius}, ${height / 2} a ${projectCircleRadius},${projectCircleRadius} 0 1,1 ${2 * projectCircleRadius},0`)
    .style("fill", "none");

// Add the projects label along the path
svg.append("text")
    .attr("dy", -10) // Adjust the offset as needed
    .append("textPath")
    .attr("xlink:href", "#projectsTextPath")
    .attr("startOffset", "25%") // Adjust the position as needed
    .style("text-anchor", "middle")
    .text("Projects");

// Create links
const link = svg.append("g")
            .attr("stroke", "#0c0c0d")
            .attr("stroke-opacity", 1)
            .selectAll("line")
            .data(links)
            .join("line");


const color = d3.scaleOrdinal(d3.schemeCategory10);        


// Filter out  nodes
const parentNodes = nodes.filter(d => d.type !== 'project');

// Create node groups with staggered loading, using only parent nodes
const node = svg.append("g")
  .attr("stroke", "#fff")
  .attr("stroke-width", 0)
  .selectAll("g")
  .data(parentNodes) // Use the filtered array
  .enter()
  .append("g")
  .attr("class", "node") // Add a class for styling and selection
  .attr("transform", d => `translate(${d.x}, ${d.y})`)
  .style("opacity", 0.2); // Start with nodes hidden

// Fade in the nodes based on their type with a delay
node.transition()
 .delay(d => typeDelays[d.type]) // Apply delay based on the type
 .style("opacity", 1); // Fade in the node

    // Function to debounce the hover action
    function debounce(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

// Debounced hover function to improve performance
// const debouncedShowChildNodes = debounce(function(event, d) {
//     if (!d3.select(this).classed("clicked") && d.type !== 'organization' && d.type !== 'function') {
//         showChildNodes(d, this);
//     }
// }, 500); // 50 milliseconds debounce time

// Hover/select interaction to display child projects
node.filter(d => d.type !== 'organization') // Exclude organization nodes
.on("mouseover", function(event, d) {
    if (!d3.select(this).classed("clicked") && d.type !== 'organization') {
        showChildNodes(d, this);
    }
})
.on("mouseout", function(event, d) {
    if (!d3.select(this).classed("clicked") && d.type !== 'organization') {
        hideChildNodes();
    }
})
.on("click", function(event, d) {
    if (d.type !== 'organization') { // Exclude organization nodes from click
        const nodeSelection = d3.select(this);
        const alreadyClicked = nodeSelection.classed("clicked");
        svg.selectAll(".node").classed("clicked", false); // Remove clicked class from all nodes
        hideChildNodes(); // Hide any previously shown child nodes

        if (!alreadyClicked) {
            nodeSelection.classed("clicked", true); // Add clicked class to the current node
            showChildNodes(d, this); // Show child nodes for the current node
        }
        // Prevent the click from triggering any parent elements
        event.stopPropagation();
    }
    });

// Function to show child nodes
function showChildNodes(d, nodeElement) {
    const children = d.functions || d.projects || [];
    children.forEach(child => {
        const childNode = svg.append("g")
            .attr("class", "node child-node")
            .attr("transform", `translate(${child.x}, ${child.y})`)
            .style("opacity", 0);

        childNode.append("circle")
            .attr("r", 60)
            .attr("fill", `url(#${child.type})`);

        childNode.append("text")
            .attr("class", "node-text")
            .attr("text-anchor", "middle")
            .attr("dy", ".35em")
            .style("font-size", `${svgWidth / 100}px`)
            .text(child.title);


            
        childNode.transition()
            .style("opacity", 1);
    });
}

// Function to hide child nodes
function hideChildNodes() {
    svg.selectAll(".child-node").remove();
}

// Clicking on the SVG background will hide all child nodes and remove the clicked class
svg.on("click", function() {
    svg.selectAll(".node.clicked").classed("clicked", false);
    hideChildNodes();
});

 // Add circles to the node groups
node.append("circle")
 .attr("r", 60)
 .attr("fill", d => `url(#${d.type})`); // Use the type of the node to determine the fill

// Define the width and height of the SVG
const svgWidth = svg.node().getBoundingClientRect().width;
const svgHeight = svg.node().getBoundingClientRect().height;

// Add text to the node groups
var text = node.append("text")
    .attr("class", "node-text")
    .attr("text-anchor", "middle")
    .attr("dy", ".35em")
    .style("font-size", `${svgWidth / 100}px`) // Set the font size based on the width of the SVG
    .text(d => {
        // Split the title into words, capitalize each word, and join the words back into a string
        return d.title.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    });

wrapText(text, 20); // Wrap the text if it's wider than 60 pixels


// Define the pattern for each level
svg.append('defs')
            .selectAll('pattern')
            .data(['organization', 'function', 'project'])
            .join('pattern')
            .attr('id', d => d)
            .attr('width', 1)
            .attr('height', 1)
            .append('image')
            .attr('xlink:href', d => `svg/${d}.svg`)
            .attr('width', 120)
            .attr('height', 120)
            .attr('x', 0) // Center the image horizontally
            .attr('y', 0); // Center the image vertically;
    
// Update nodes and links positions after each tick
simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
    
            node
                .attr("transform", d => `translate(${d.x}, ${d.y})`);
            });

// // // Sequentially load functions with a delay
//  const delay = 2000; // 2 seconds delay
//  const functions = svg.selectAll(".function")
//     .data(nodes.filter(d => d.type === 'function'));

// functions.enter()
//     .append("circle")
//     .attr("r", 60)
//     .attr("fill", d => color(d.group))
//     .attr("cx", d => d.x)
//     .attr("cy", d => d.y)
//     .style("opacity", 0)
//     .transition()
//     .delay((_, i) => i * delay)
//     .style("opacity", 1);

// // Zoom and unzoom behavior
// svg.transition()
//     .duration(750)
//     .call(zoom.transform, d3.zoomIdentity); // Zoom in

// setTimeout(() => {
//     svg.transition()
//         .duration(750)
//         .call(zoom.transform, d3.zoomIdentity.scale(1)); // Unzoom after 2 seconds
// }, delay);

// // Hover/select interaction to display child projects
// functions.on("mouseover", function(event, d) {
//     // Highlight the selected function
//     d3.select(this).attr("stroke", "black").attr("stroke-width", 2);

//     // Display child projects
//     const projects = svg.selectAll(".project")
//         .data(d.projects || [], d => d.id);

//     projects.enter()
//         .append("circle")
//         .attr("r", 30)
//         .attr("fill", d => color(d.group))
//         .attr("cx", d => d.x)
//         .attr("cy", d => d.y)
//         .style("opacity", 0)
//         .transition()
//         .style("opacity", 1);

//     projects.exit().remove();
// }).on("mouseout", function() {
//     // Remove highlight
//     d3.select(this).attr("stroke", null);

//     // Remove child projects
//     svg.selectAll(".project").remove();
// });
    }}

// Load and visualize notes.json
d3.json("notes_hierarchical.json")
    .then(function(data) {
        console.log("Fetched notes data:", data);

        // Corrected filtering conditions
        const graph1Data = data.filter(d => d.graph.startsWith('Graph 1'));
        const graph2Data = data.filter(d => d.graph.startsWith('Graph 2'));
        const graph3Data = data.filter(d => d.graph.startsWith('Graph 3'));

        console.log("Graph 1 Data:", graph1Data);
        console.log("Graph 2 Data:", graph2Data);
        console.log("Graph 3 Data:", graph3Data);

        // Render each graph
        renderGraph("graph1", graph1Data);
        renderGraph("graph2", graph2Data);
        renderGraph("graph3", graph3Data);

        // Update sizes on window resize
        window.addEventListener('resize', function() {
            d3.selectAll("svg").remove(); // Clear existing SVGs
            renderGraph("graph1", graph1Data);
            renderGraph("graph2", graph2Data);
            renderGraph("graph3", graph3Data);
        });
    })

    
    .catch(function(error) {
        console.error("Error fetching or processing main.js:", error);
    })
