const express = require('express');
const socket = require("socket.io");
const morgan = require('morgan');
const formidable = require('express-formidable');
const fs = require('fs');
const fileShortHand = require('./junk_Code/fileLister.js').fileLister;
const fileTools = require('./junk_Code/fileTools.js').fileOptions;
const path = require('path');
const getFolderSize = require("get-folder-size");

let fileWorker = new fileShortHand;
let fileOptions = new fileTools;

const app = express();

app.use(morgan('dev'));
app.use(formidable());
app.set('port', process.env.PORT || 80);

//Routes
app.use("/", express.static(path.join(__dirname, 'public')));

app.get("/favicon.ico", (req, res) => {
    res.sendFile(path.join(__dirname, 'public/favicon.ico'));
});

//app functionality
app.get("/data", (req, res) => {
    res.send(fileWorker.getDetails(path.join(__dirname, 'disk/storage')));
});

app.get("/download", (req, res) => {

    var file = fs.readFileSync(path.join(__dirname, 'disk/storage/' + req.query.path), 'binary');
    res.setHeader('Content-Length', file.length);
    res.write(file, 'binary');
    res.end();

});


app.post("/upload", (req, res) => {

    let fileRoute = path.join(__dirname, "disk/storage/" + req.fields.dir + "/" + req.files.upload.name);
    let copy = 0;

    while(fs.existsSync(fileRoute)) {
        copy += 1;
        fileRoute = path.join(__dirname, "disk/storage/" + req.fields.dir + `/(copy ${copy}) - ` + req.files.upload.name);
    }

    fs.writeFileSync(fileRoute, fs.readFileSync(req.files.upload.path));
    res.status(200).send();

});

app.post("/newfolder", (req, res) => {

    let newDir = path.join(__dirname, 'disk/storage/' + req.query.path);
    let mkRes = fileOptions.createDirectory(newDir)

    if (mkRes == undefined) {
            res.status(200).send()
    } else {
        res.status(400).send()
    }

});

app.delete("/data", async function (req, res) {

    let reqFile = path.join(__dirname, 'disk/storage/' + req.query.path);
    let trash = fs.readFileSync(path.join(__dirname, 'disk/trash/trash.json'), {encoding: 'utf-8'});

    let copyResult = true; //Remenber, this is true to permit the flow without copying the file
    let delResult
    let trashArr = JSON.parse(trash);

    let trashEl = {
        "date": new Date(),
        "name": fileOptions.fileName(reqFile),
        "origin": req.query.path,
        "size": fileOptions.size(reqFile),
        "kind": fileOptions.fileExtension(reqFile)
    };

    trashArr.trash.push(trashEl);

    fs.writeFileSync(path.join(__dirname, 'disk/trash/trash.json'), JSON.stringify(trashArr));
/*
    try {
        fileOptions.copy(reqFile, path.join(__dirname, 'disk/trash/' + fileOptions.fileName(reqFile)));
        copyResult = true
    } catch (error) {
        copyResult = false
    }
*/
    try {
        fileOptions.delete(reqFile);
        delResult = true
    } catch (error) {
        delResult = false
    }

    if (delResult && copyResult) {
        res.status(200).send("");
    } else {
        res.status(400).send("");
    }
});

app.get("/changedir", (req, res) => {
    res.send(fileWorker.getDetails(path.join(__dirname, 'disk/storage/' + req.query.path)));
});

app.get("/stats", (req,res) => {

    let stats = {};
    getFolderSize(path.join(__dirname, 'disk/storage/'), (err, size) => {
        if (err) { 
            res.status(400).send();
            throw err;
        }
        stats.size = size;
    });

    let dirDet = fileOptions.dirFileCount(path.join(__dirname, 'disk/storage/'));

    stats.files = dirDet[1];
    stats.directories = dirDet[0];

    setTimeout(() => { res.status(200).json(stats)}, 2000);
})

app.get("/trash", (req,res) => {

    let trash = fs.readFileSync(path.join(__dirname, 'disk/trash/trash.json'), {encoding: 'utf-8'});
    trash = JSON.parse(trash);
    res.status(200).json(trash);
})

app.post("/trash", (req,res) => {

    let trash = fs.readFileSync(path.join(__dirname, 'disk/trash/trash.json'), {encoding: 'utf-8'});
    let trashArr = JSON.parse(trash);

    let restoreThis =  trashArr.trash[req.query.index]; //Meta to restore the req file
    trashArr.trash.splice(req.query.index, 1);

    fs.writeFileSync(path.join(__dirname, 'disk/trash/trash.json'), JSON.stringify(trashArr));

    res.status(200).send();

    //actions to restore the file to the old path

})
//Until here

const server = app.listen(app.get('port'), ()=> {
    console.log('Server on port ' + app.get('port'));
});

const io = socket(server);

io.on("connection", (socket) => {
    console.log("Socket connection: ", socket.id);

    socket.on('upload', function() {
        socket.broadcast.emit('refresh');
        console.log("Socket event (upload)");
    });

    socket.on('newFolder', function() {
        io.sockets.emit('refresh');
        console.log("Socket event (new folder)");
    });
});



