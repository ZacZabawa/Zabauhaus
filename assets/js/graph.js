// Combined zoom and graph.js

// Define the zoom behavior
var zoom = d3.zoom()
    .scaleExtent([0.1, 7])
    .on('zoom', zoomed);

// The zoom handler function
function zoomed(event) {
    // Make sure to select the correct SVG element to apply the transformation
    d3.select(this).selectAll('svg > g').attr('transform', event.transform);
}

function zoomInAndOut(svg, orgNode, callback) {
    // Transition to zoom in on the organization node
    svg.transition()
        .duration(2000) // 2 seconds
        .call(zoom.transform, d3.zoomIdentity.translate(orgNode.x, orgNode.y).scale(2)) // Zoom in 2x
        .transition()
        .delay(2000) // Wait for 2 seconds
        .duration(2000) // 2 seconds
        .call(zoom.transform, d3.zoomIdentity) // Zoom out
        .end() // Returns a Promise that resolves when all transitions end
        .then(callback);
}

function renderGraph(graphId, graphData) {
    // Initial setup
    let width = 0.9 * window.innerWidth; // 90% of viewport width
    let height = window.innerHeight; // 100% of viewport height

    // Create SVG for the graph
    const svg = d3.select(`#${graphId}`).append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(zoom); // Attach the zoom behavior to the SVG

    // Error handling for missing SVG element
    if (!svg.node()) {
        handleError(new Error("SVG element could not be created."));
        return;
    }
       
        // Extract nodes and links from the hierarchical data
        const nodes = [];
        const links = [];
        // Calculate the radius based on the SVG's width or height
        const functionRadius = 0.3 * Math.min(width, height); // Adjust the proportion as needed
        const projectRadius = 0.4 * Math.min(width, height); // Adjust the proportion as needed
        
        function traverse(node, parent = null, index = 0, angleOffset = 0) {
            nodes.push(node);
            if (parent) {
                links.push({ source: parent.id, target: node.id });
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
        
        // Create SVG for the graph
        const svg = d3.select(`#${graphId}`).append("svg")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("preserveAspectRatio", "xMidYMid meet");
        
        graphData.forEach(root => traverse(root));
        // Create force simulation
                const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id))
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("function", d3.forceRadial(d => d.type === 'function' ? 300 : 0, width / 2, height / 2).strength(0.8))
            .force("project", d3.forceRadial(d => d.type === 'project' ? 500 : 0, width / 2, height / 2).strength(0.8))
            .force("collide", d3.forceCollide().radius(60)); // Add collision force
            
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
        
        const buffer = 50; // Adjust the buffer as needed
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
        // Create node groups
        const node = svg.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 0)
            .selectAll("g")
            .data(nodes)
            .join("g")
            .attr("transform", d => `translate(${d.x}, ${d.y})`);
        
        // Add circles to the node groups
        node.append("circle")
            .attr("r", 60)
            .attr("fill", d => `url(#${d.type})`); // Use the type of the node (organization, function, project) to determine the fill
        
        
        
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
        
        wrapText(text, 60); // Wrap the text if it's wider than 60 pixels
        
        
        // Define the pattern for each level
        svg.append('defs')
                    .selectAll('pattern')
                    .data(['organization', 'function', 'project'])
                    .join('pattern')
                    .attr('id', d => d)
                    .attr('width', 1)
                    .attr('height', 1)
                    .append('image')
                    .attr('xlink:href', d => `${d}.svg`)
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
}

// Call this function with the appropriate graphId and graphData
// renderGraph("graph2", yourGraphData);
