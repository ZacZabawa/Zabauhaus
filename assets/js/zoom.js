// zoom.js

// Define the zoom behavior
var zoom = d3.zoom()
    .scaleExtent([0.1, 7]) // This sets the minimum and maximum zoom scale
    .on('zoom', zoomed);   // This sets the zoom event handler

// The zoom handler function that applies the zoom transformation to the svg
function zoomed(event) {
    // Assuming 'svg' is the d3 selection of your SVG element
    svg.attr('transform', event.transform);
}

// Function to zoom in and out on the organization node
function zoomInAndOut(svg, orgNode, callback) {
    // Assuming orgNode has x and y properties that represent its position
    // Transition to zoom in on the organization node
    svg.transition()
        .duration(2000) // Duration of the zoom in transition
        .call(zoom.transform, d3.zoomIdentity.translate(orgNode.x, orgNode.y).scale(2)) // Zoom in 2x towards the orgNode
        .transition()
        .delay(2000) // Delay before zooming out
        .duration(2000) // Duration of the zoom out transition
        .call(zoom.transform, d3.zoomIdentity) // Zoom back out to original scale
        .end() // This returns a Promise that resolves when the transition ends
        .then(callback); // Once the zoom out is complete, call the callback function
}

// Make sure to export the functions if you are using modules

