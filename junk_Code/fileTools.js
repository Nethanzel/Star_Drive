const fs = require('fs');
const path = require('path');


let directories = 0;

const getAllFiles = function(dirPath, arrayOfFiles) {
    let files = fs.readdirSync(dirPath)

    arrayOfFiles = arrayOfFiles || []

    files.forEach(function(file) {

      if (fs.statSync(dirPath + "/" + file).isDirectory()) {
        directories += 1;
        arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
      } else {
        arrayOfFiles.push(path.join(__dirname, dirPath, "/", file))
      }

    })

    return arrayOfFiles
}

const copyDir = function(src, dest) {
	mkdir(dest);
	var files = fs.readdirSync(src);
	for(var i = 0; i < files.length; i++) {
		var current = fs.lstatSync(path.join(src, files[i]));
		if(current.isDirectory()) {
			copyDir(path.join(src, files[i]), path.join(dest, files[i]));
		} else if(current.isSymbolicLink()) {
			var symlink = fs.readlinkSync(path.join(src, files[i]));
			fs.symlinkSync(symlink, path.join(dest, files[i]));
		} else {
			copy(path.join(src, files[i]), path.join(dest, files[i]));
		}
	}
};

const copy = function(src, dest) {
	var oldFile = fs.createReadStream(src);
	var newFile = fs.createWriteStream(dest);
	oldFile.pipe(newFile);
};


const mkdir = function(dir) {
	// making directory without exception if exists
	try {
		fs.mkdirSync(dir, 0755);
	} catch(e) {
		if(e.code != "EEXIST") {
			throw e;
		}
	}
};

class fileOptions {

    isDir(path) {
        if(fs.existsSync(path)) {

            if(fs.statSync(path).isDirectory()) {
                return 'dir';
            } else {
                return 'file';
            }
        }
    };

    fileExtension (file) {

        let dotPos = file.lastIndexOf(".");

        let ext = file.substring(dotPos + 1, file.length);

        if (this.isDir(file) == 'dir') {
            return 'dir';

        } else if (dotPos != -1) {
            return ext;

        } else {
            return 'unknown';

        }
    }

    fileName (path) {
        let slashPos = path.lastIndexOf("\\") + 1;

        let name = path.substring(slashPos, path.length);

        return name
    }

    creation (path) {
        let stat = fs.statSync(path);
        if(fs.existsSync(path)) {
            return stat.birthtime;
        } else return 0
    }

    modified (path) {
        let stat = fs.statSync(path);

        if(fs.existsSync(path)) {
            return stat.mtime;
        } else return 0
    }

    size (path) {

        if(fs.existsSync(path)) {
            let stat = fs.statSync(path);
            return stat.size;
        } else return 0
        
    }

    delete (path) {

        if(fs.statSync(path).isFile()) {
            
            if(fs.unlinkSync(path) == undefined) {
                return true;
            } else {
                return false
            }

        } else if (fs.statSync(path).isDirectory()) {

           if (fs.rmdirSync(path, {recursive: true}) == undefined){
               return true;
           } else {
               return false
           }

        } else {
            return false;
        }

    }

    createDirectory(path) {

        if(!fs.existsSync(path)) {
            return fs.mkdirSync(path);
            
        } else {
            return false
        }
    }
    
    dirFileCount(path) {

        directories = 0;
        let files = getAllFiles(path).length;
        let countResult = [directories, files]

        return countResult
    }

    copy(path, newPath) {

        if(fs.statSync(path).isFile()) {

            fs.copyFile(path, newPath, (e) => {if (e) throw e});

        } else if (fs.statSync(path).isDirectory()) {
            copyDir(path, newPath)
        }

    }

}


module.exports = {fileOptions: fileOptions};