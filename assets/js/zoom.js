// Assume orgNode is your central organization node
var orgNode = {x: width / 2, y: height / 2}; // Replace with actual node position

// Define the zoom behavior
var zoom = d3.zoom()
    .scaleExtent([0.1, 7])
    .on('zoom', zoomed);

// The zoom handler function
function zoomed(event) {
    svg.attr('transform', event.transform);
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
