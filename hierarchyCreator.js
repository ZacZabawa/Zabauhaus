const fs = require('fs');
const chokidar = require('chokidar');

const flatJsonPath = 'notes_flat.json';
const hierarchicalJsonPath = 'notes_hierarchical.json';
const logFilePath = 'hierarchyCreator.log';

function logToFile(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}\n`;
  fs.appendFileSync(logFilePath, logMessage);
}

function sortJsonFields(flatJson) {
    const fieldOrder = ["title", "type", "graph", "category", "id", "datetimeCreate", "datetimeUpdate", "subheader", "parents", "tags", "portfolioimages", "function", "video", "visibility", "modified", "projects", "url"];
    return flatJson.map(entry => {
        let sortedEntry = {};
        fieldOrder.forEach(field => {
            sortedEntry[field] = entry.hasOwnProperty(field) ? entry[field] : '';
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

chokidar.watch(flatJsonPath).on('change', (path) => {
  logToFile(`File ${path} has been changed`);
  try {
      logToFile('Attempting to read flat JSON');
      let flatJson = JSON.parse(fs.readFileSync(flatJsonPath, 'utf8'));
      logToFile('Flat JSON read successfully');

      logToFile('Attempting to sort JSON fields');
      let sortedJsonArray = sortJsonFields(flatJson);
      logToFile('JSON fields sorted successfully');

      logToFile('Attempting to create hierarchical JSON');
      let hierarchicalJson = createHierarchy(sortedJsonArray);
      logToFile('Hierarchical JSON created successfully');

      logToFile('Attempting to write hierarchical JSON to file');
      fs.writeFileSync(hierarchicalJsonPath, JSON.stringify(hierarchicalJson, null, 2));
      logToFile('Hierarchical JSON updated successfully');
  } catch (error) {
      logToFile(`Error: ${error.message}`);
  }
});
