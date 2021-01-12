const fs = require('fs');
const path = require('path');
const fileTools = require('./fileTools.js').fileOptions;

let fileOptions = new fileTools();


class fileLister {

    getDetails(route) {

        let rFiles = fs.readdirSync(route);
        let fileDetails = [];

        rFiles.forEach(val => {
            fileDetails.push({name: val,
                kind: fileOptions.isDir(path.join(route, val)),
                extension: fileOptions.fileExtension(path.join(route, val)),
                created: fileOptions.creation(path.join(route, val)),
                modified: fileOptions.modified(path.join(route, val)),
                size: fileOptions.size(path.join(route, val))})
        });

        return fileDetails;
    };

}


module.exports = {fileLister: fileLister};
