const fs = require('fs');
const chokidar = require('chokidar');

const flatJsonPath = 'notes_flat.json';
const hierarchicalJsonPath = 'notes_hierarchical.json';

function sortJsonFields(flatJson) {
    const fieldOrder = ["title", "type", "graph", "category", "id", "datetimeCreate", "datetimeUpdate", "subheader", "parents", "tags", "portfolioimages", "function", "video", "visibility", "modified", "projects", "url"];
  
    return flatJson.map(entry => {
      let sortedEntry = {};
  
      fieldOrder.forEach(field => {
        if (entry.hasOwnProperty(field)) {
          sortedEntry[field] = entry[field];
        }
      });
  
      return sortedEntry;
    });
}

function createHierarchy(sortedJsonArray) {
    const hierarchy = [];
    const organizations = sortedJsonArray.filter(note => note.type === 'organization');
    organizations.forEach(organization => {
        const functionsMap = new Map();
        sortedJsonArray.forEach(note => {
            if (note.type === 'function' && note.graph === organization.graph) {
                functionsMap.set(note.function.toLowerCase().trim(), { ...note, projects: [] });
            }
        });
        sortedJsonArray.forEach(note => {
            if (note.type === 'project' && note.graph === organization.graph) {
                let funcTitle = note.function.toLowerCase().trim();
                let func = functionsMap.get(funcTitle);
                if (func) {
                    func.projects.push(note);
                } else {
                    logToFile(`No matching function for project: ${note.title} with function: ${note.function}`);
                }
            }
        });
        organization.functions = Array.from(functionsMap.values());
        hierarchy.push(organization);
    });
    return hierarchy;
}

function updateHierarchicalJson() {
    try {
        console.log('Attempting to read flat JSON');
        let flatJson = JSON.parse(fs.readFileSync(flatJsonPath, 'utf8'));
        console.log('Flat JSON read successfully');

        console.log('Attempting to sort JSON fields');
        let sortedJsonArray = sortJsonFields(flatJson);
        console.log('JSON fields sorted successfully');

        console.log('Attempting to create hierarchical JSON');
        let hierarchicalJson = createHierarchy(sortedJsonArray);
        console.log('Hierarchical JSON created successfully');

        console.log('Attempting to write hierarchical JSON to file');
        fs.writeFileSync(hierarchicalJsonPath, JSON.stringify(hierarchicalJson, null, 2));
        console.log('Hierarchical JSON updated successfully');
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}

// Initial update
updateHierarchicalJson();

// Watch for changes in the flat JSON file using Chokidar
const watcher = chokidar.watch(flatJsonPath, { persistent: true });

watcher.on('change', path => {
    console.log(`File ${path} has been changed. Updating hierarchical JSON...`);
    updateHierarchicalJson();
});

console.log(`Watching for changes in ${flatJsonPath}...`);
