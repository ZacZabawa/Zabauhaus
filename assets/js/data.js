// Load and visualize notes.json
d3.json("notes_hierarchical.json")
    .then(function(data) {
        console.log("Fetched notes data:", data);

        // Corrected filtering conditions
        const graph1Data = data.filter(d => d.graph.startsWith('Graph 1'));
        const graph2Data = data.filter(d => d.graph.startsWith('Graph 2'));
        
        console.log("Graph 1 Data:", graph1Data);
        console.log("Graph 2 Data:", graph2Data);
       

        // Render each graph
        renderGraph("graph1", graph1Data);
        renderGraph("graph2", graph2Data);
       

        // Update sizes on window resize
        window.addEventListener('resize', function() {
            d3.selectAll("svg").remove(); // Clear existing SVGs
            renderGraph("graph1", graph1Data);
            renderGraph("graph2", graph2Data);
          
        });
    })
    .catch(function(error) {
        console.error("Error fetching or processing data:", error);
    });