let route = '';
let store = [];

getData('/data');

function getData(dir) {

    let explorerView = _('fileView');
    explorerView.innerHTML = "";

    let resHTML = document.createElement("div");
    resHTML.classList.add("no_file");

    resHTML.innerHTML = `
        <img src="img/spin.png" id="spin">
    `;
    explorerView.appendChild(resHTML);

    fetch(dir)
        .then(response => response.json())
        .then(data => {
            loadDir(data);
        });
}

async function loadDir(data) {

    store = data;
    let explorerView = _('fileView');
    explorerView.innerHTML = "";

    if(data.length == 0) {
        let resHTML = document.createElement("div");
        resHTML.classList.add("no_file");

        resHTML.innerHTML = `
            <h2>No files in this directory</h2>
        `;
        explorerView.appendChild(resHTML);
    }

    for (let i = 0; i < data.length; i++) {

        let resHTML = document.createElement("div");
        resHTML.classList.add("file");

        let ext;
        let fileName = data[i].name

        if (fileName.lastIndexOf(".") != -1 && data[i].kind != "dir") {
            ext = await OfficeDoc(data[i].extension);
        } else if (data[i].kind == "dir"){
            ext = await OfficeDoc(data[i].extension);
        } else {
            ext = "unknown";
        }


        let downloadBtn = "";
        if (data[i].kind != "dir") {
            downloadBtn = `<img src="/img/download.png" class="fileAction download">`;
        }

        if(fileName.length > 18) {fileName = data[i].name.slice(0, 15) + '...'}

        resHTML.innerHTML = `
                <div class="file_subfile" type="${data[i].kind}">
                    <img src="${ext}" class="extIcn">
                    <p tag="${data[i].name}">${fileName}</p>

                    <div class="file_tools" type="${data[i].kind}" name="${data[i].name}" index="${i}">
                        ${downloadBtn}
                        <img src="/img/trash.png" class="deleteAction delete">
                        <img src="/img/info.png" class="infoAction fInfo">
                    </div>
                </div>
                `;
        setTimeout(() => {resHTML.style.transform = "scale(1)"}, i*10)
        explorerView.appendChild(resHTML);
    }

    _('route').innerText = 'root' + route;


    let files = document.getElementsByClassName('file_subfile');
    addEvent(files);
}


function addEvent(files) {

    for (let i = 0; i < files.length; i++) {
        files[i].addEventListener('click',function(e) {

            let selType = e.currentTarget;

            if(selType.getAttribute('type') == 'dir') {
                let dirName = selType.querySelector('p').getAttribute('tag');

                fetch(`/changedir?path=${route + '/' + dirName}`)
                .then(response => response.json())
                .then(data => {
                    route += "/" + dirName;
                    _('route').innerText += route;
                    loadDir(data);
                })
            }
        })
    }

//Actions to download the file
    let downloadBtn = document.getElementsByClassName('download');

    for (let i = 0; i < downloadBtn.length; i++) {
        
        downloadBtn[i].addEventListener('click', function (e) {
            let selParent = e.target.parentElement;
            let downFile = route + "/" + store[selParent.getAttribute('index')].name;

            fetch(`/download?path=${downFile}`)
            .then(response => {
                if(response.status == 200) {

                    let showAlert = selParent.parentElement;
                    showAlert.parentElement.style.background = "#00ff007e"
                    setTimeout(() => {showAlert.parentElement.style.background = "#91919127"}, 7000)

                    return response.blob();
                } else {
                    let showAlert = selParent.parentElement;
                    showAlert.parentElement.style.background = "#ff00007e"
                    setTimeout(() => {showAlert.parentElement.style.background = "#91919127"}, 4000)
                }
            })

            .then(blob => {

                let url = window.URL.createObjectURL(blob);
                let a = document.createElement('a');
                a.href = url;
                a.download = store[selParent.getAttribute('index')].name;
                document.body.appendChild(a);
                a.click();
                a.remove();
            })

        })
    }
//Actions to delete the file
    let deleteBtn = document.getElementsByClassName('delete');

    for (let i = 0; i < deleteBtn.length; i++) {
        
        deleteBtn[i].addEventListener('click', function (e) {
            let selParent = e.target.parentElement;
            let deleteFile = route + "/" + store[selParent.getAttribute('index')].name;

            if (confirm("Confirm action.")) {

                fetch(`/data?path=${deleteFile}`, { method: 'DELETE'})
                .then(response => {
                    if(response.status == 200) {
                        _('fileView').innerHTML = "";
                        getData(`/changedir?path=${route}`);
                    } else {
                        let showAlert = selParent.parentElement;
                        showAlert.parentElement.style.background = "#ff00007e"
                        setTimeout(() => {showAlert.parentElement.style.background = "#91919127"}, 4000)
                    }
                })
            } 
        })
    }
//Actions to get file info
    let infoBtn = document.getElementsByClassName('fInfo');

    for (let i = 0; i < infoBtn.length; i++) {
        
        infoBtn[i].addEventListener('click', async function (e) {

            let selParent = e.target.parentElement;
            let infoViewCard = _('infoView_card')

            let details = store[selParent.getAttribute('index')]
            let type = "";

            if (details.kind != 'dir') {type = details.extension.toUpperCase() + " file"}
            else {type = "Directory"}

            let detailsHTML = `
            <img src="${await OfficeDoc(details.extension)}">
            <h2><span>File name: </span> ${details.name}</h2>
            <p><span>Type: </span> ${type}</p>
            <p><span>Size: </span> ${formatBytes(details.size)}</p>
            <p><span>Created: </span> ${details.created}</p>
            <p><span>Modified: </span> ${details.modified}</p>
            `;
            
            infoViewCard.innerHTML = detailsHTML;

            let infoView = _('infoView');
            infoView.style.visibility = "visible";
            infoView.style.opacity = "1";
            infoView.style.transition = "visibility 5s, opacity .3s ease-in";

            infoView.addEventListener("click", (e) => {

                if(e.target.getAttribute("id") == "infoView") {
                    let infoHideView = _('infoView');
                    infoHideView.style.visibility = "hidden";
                    infoHideView.style.opacity = "0";
                    infoHideView.style.transition = "visibility .3s, opacity .3s ease-out";
                }
            })

        })
    }

}


document.getElementById('goback').addEventListener('click', function() {

    _("infoView").click()
    _("trashView").click()
    _("uploadView").click()
    _("statView").click()

    if (route != null) {
        route = route.slice(0, route.lastIndexOf('/'));

        fetch(`/changedir?path=${route}`)
            .then(response => response.json())
            .then(data => {
                loadDir(data);
            });
    }

})

document.getElementById('refresh').addEventListener('click', function() {


    _("infoView").click()
    _("trashView").click()
    _("uploadView").click()
    _("statView").click()

    _('fileView').innerHTML = "";
    getData(`/changedir?path=${route}`);

})

let upFiles = [];

document.getElementById("upload").addEventListener("click", async () => {

    _("infoView").click()
    _("trashView").click()
    _("statView").click()

    let uploadView = _('uploadView');
    uploadView.style.visibility = "visible";
    uploadView.style.opacity = "1";
    uploadView.style.transition = "visibility 5s, opacity .3s ease-in";

    uploadView.addEventListener("click", (e) => {
        if(e.target.getAttribute("id") == "uploadView") {
            let uploadHideView = _('uploadView');
            uploadHideView.style.visibility = "hidden";
            uploadHideView.style.opacity = "0";
            uploadHideView.style.transition = "visibility .3s, opacity .3s ease-out";
        }
    })


    let uploadControls = _('uploadControls')

    uploadControls.innerHTML = `
        <h2>Upload files</h2>
        <span>Choose the files to be uploaded: </span>
        <input type="file" id="upFiles" multiple>
        <div id="filePreview">

        </div>

        <div id="fileSender">
            <div id="uploadStatus">
                <img src="img/spin.png" id="upSpin">
                <div>
                    <p id="upStatus">Uploading <span>filename.ext</span> (0/0 uploaded)</p>
                    <progress id="progressBar" max="200"></progress>
                </div>

            </div>
            <div id="btnSender">
                <img src="/img/upload.png"> <span>Upload</span>
            </div>
        </div>
    `;

    let inputFile = _("upFiles");
    inputFile.onchange = async () => {

        upFiles = Array.from(inputFile.files);
        _("filePreview").innerHTML = "";

        for(let i = 0; i < upFiles.length; i++) {

            let fileName = upFiles[i].name;
            let ext;

            if (fileName.lastIndexOf(".") != -1) {
                ext = await OfficeDoc(fileName.substring(fileName.lastIndexOf(".")+1, fileName.length));
            } else {
                ext = "unknown";
            }

            if(fileName.length > 13) {fileName = fileName.slice(0, 13) + '...'}

            _("filePreview").innerHTML +=`
                <div class="preview" id="upload${i}">
                    <div class="details">
                        <img src="${ext}" id="imgPreview">
                        <p>${fileName}</p>
                        <p>(${formatBytes(upFiles[i].size)})</p>
                    </div>

                    <div class="remove" index="${upFiles[i].name}">
                        <p index="${upFiles[i].name}">X</p>
                    </div>

                </div>
            `
        }

        _("fileSender").style.display = "flex"
        _("btnSender").style.display = "flex"
        _("progressBar").style.display = "flex"
        _("uploadStatus").style.display = "none"

        let removers = document.getElementsByClassName("remove");

        for(let i = 0; i < removers.length; i++){

            removers[i].addEventListener("click", (e) => {

                let target = e.target;
                let targetParent = target.parentElement

                if(targetParent.parentElement.getAttribute("id") != "filePreview") {
                    targetParent.parentElement.remove();
                }

                for(let i = upFiles.length -1; i > -1; i--) {

                    if(upFiles[i].name == target.getAttribute("index")) {
                        upFiles.splice(i, 1)
                    }
                }

                if(upFiles.length == 0) {

                    _("fileSender").style.display = "none"

                }
            })
        }
    }

    _("btnSender").addEventListener("click", () => {
        _("uploadStatus").style.display = "flex"
        _("btnSender").style.display = "none"
        ///upload here
        uploadFile(upFiles[0]);
    })

})

document.getElementById("trash").addEventListener("click", async () => {

    _("statView").click()
    _("uploadView").click()
    _("infoView").click()

    let trashView = _('trashView');
    trashView.style.visibility = "visible";
    trashView.style.opacity = "1";
    trashView.style.transition = "visibility 5s, opacity .3s ease-in";

    let trashControlView = _('trashControls');
    trashControlView.innerHTML = "";

    let filesView = document.createElement("div");
    filesView.classList.add("delFilesView");

    fetch("/trash")
    .then(response => response.json())
    .then( async (data) => {

        if(data.trash.length == 0) {
            filesView.innerHTML += `
            <h3>No deleted files</h3>
        `;
        }

        for(let i = 0; i < data.trash.length; i++) {
            filesView.innerHTML += `
            <div class="dFile">
                <img src="${await OfficeDoc(data.trash[i].kind)}" class="delIcon">
                <div>
                    <p>Name: <span>${data.trash[i].name}</span></p>
                    <p>Path: <span>${data.trash[i].origin}</span></p>
                    <p>Deleted: <span>${data.trash[i].date}</span></p>
                    <p>Type: <span>${data.trash[i].kind}</span></p>
                </div>
                <div class="restore">
                    <div>
                        <img src="img/untrash.png" class="fRestore" index="${i}">
                    </div>
                </div>
            </div>
        `;
        }
    })

    let delteTitle = document.createElement("h2");
    delteTitle.innerText = "Deleted files";

    trashControlView.append(delteTitle);
    trashControlView.append(filesView);



    trashView.addEventListener("click", (e) => {

        if (e.target.getAttribute("id") == "trashView") {
            trashView.style.visibility = "hidden";
            trashView.style.opacity = "0";
            trashView.style.transition = "visibility .3s, opacity .3s ease-out";
        }

    })

    setTimeout(() => {
        let restorers = document.getElementsByClassName("fRestore");

        for (let i = 0; i < restorers.length; i++) {
    
            restorers[i].addEventListener("click", (e) => {

                if(confirm("Confirm to restore")) {
    
                    fetch(`/trash?index=${e.target.getAttribute("index")}`, { method: 'POST'})
    
                        .then(response => {
                            if (response.status = 200) {
                                _("trash").click();
    
                            }
                        })
                }
            })
        }
    }, 500)

})

document.getElementById("newFolder").addEventListener("click", () => {

    _("statView").click
    _("infoView").click()
    _("trashView").click()
    _("uploadView").click()

    let newFolderName = prompt("Name the new folder");

    if (newFolderName != null) {

        fetch(`/newfolder?path=${route + '/' + newFolderName}`, { method: 'POST'})

        .then(response => {
            if(response.status !== 200) {

                let fView = _('fileView')

                let resHTML = document.createElement("div");
                resHTML.classList.add("file");

                if(newFolderName.length > 19) {newFolderName = newFolderName.slice(0, 19) + '...'}

                resHTML.innerHTML = `
                        <div class="file_subfile" type="dir">
                            <img src="/img/DIR.png" class="extIcn">
                            <p>${newFolderName}</p>

                            <div class="file_tools" type="dir" name="${newFolderName}">

                                <img src="/img/trash.png" class="deleteAction delete">
                                <img src="/img/info.png" class="infoAction fInfo">
                            </div>
                        </div>
                        `;

                setTimeout(() => {resHTML.style.transform = "scale(1)"}, 1*10)
                setTimeout(() => {resHTML.style.transform = "scale(0)"}, 3000)

                resHTML.style.background = "#ff00007e";
                fView.appendChild(resHTML);

                setTimeout(() => {resHTML.remove()}, 5000)

            } else {
                let fView = _('fileView')

                let resHTML = document.createElement("div");
                resHTML.classList.add("file");

                if(newFolderName.length > 19) {newFolderName = newFolderName.slice(0, 19) + '...'}

                resHTML.innerHTML = `
                        <div class="file_subfile" type="dir">
                            <img src="/img/DIR.png" class="extIcn">
                            <p>${newFolderName}</p>

                            <div class="file_tools" type="dir" name="${newFolderName}">

                                <img src="/img/trash.png" class="deleteAction delete">
                                <img src="/img/info.png" class="infoAction fInfo">
                            </div>
                        </div>
                        `;

                setTimeout(() => {resHTML.style.transform = "scale(1)"}, 1*10)

                resHTML.style.background = "#00ff007e";
                fView.appendChild(resHTML);

                setTimeout(() => {resHTML.style.background = "#91919127"});

                socket.emit("newFolder", {});
            }
        })
    }
    
})

document.getElementById("status").addEventListener("click", () => {

    _("infoView").click()
    _("trashView").click()
    _("uploadView").click()

    let trashControlView = _('statControls')

    trashControlView.innerHTML = `
            <h2>Drive status</h2>

            <div id="progressParent">
                <div class="progress" id="progress">
                    <div class="inner">
                        <span id="percentage"></span>
                    </div>
                </div>
            </div>
    `;

    let usage = 0;

    fetch("/stats")
    .then(response => response.json())
    .then(data => {

        usage = parseFloat(formatBytes(data.size));

        trashControlView.innerHTML += `
            <p>Used space: <span>${formatBytes(data.size)}/10 GB</span></p>
            <p>Directories: <span>${data.directories}</span></p>
            <p>Files: <span>${data.files}</span></p>
        `
        var progressBar =  new ProgressBar.Circle('#progress', {
            color: '#0059ce',
            strokeWidth: 12,
            duration: 2000, // milliseconds
            easing: 'easeInOut'
        });
        progressBar.animate((usage / 10240) * 1); // percent
        _("percentage").innerText = (parseFloat((usage / 10240) * 100)).toFixed(2) + "%"
    })

    let statView = _('statView');
    statView.style.visibility = "visible";
    statView.style.opacity = "1";
    statView.style.transition = "visibility 5s, opacity .3s ease-in";

    statView.addEventListener("click", (e) => {

        if(e.target.getAttribute("id") == "statView") {
            statView.style.visibility = "hidden";
            statView.style.opacity = "0";
            statView.style.transition = "visibility .3s, opacity .3s ease-out";
        }
    })

})


async function uploadFile(file) {

    _("upload" + fileUpCount).style.background = "#ffbb007e"
    var formdata = new FormData();
    formdata.append("upload", file);
    formdata.append("dir", route)
    var ajax = new XMLHttpRequest();
    ajax.upload.addEventListener("progress", progressHandler, false);
    ajax.addEventListener("load", completeHandler, false);
    ajax.addEventListener("error", errorHandler, false);
    ajax.addEventListener("abort", abortHandler, false);

    ajax.open("POST", "/upload");
    await ajax.send(formdata);
}

let fileUpCount = 0;
let fileUploadName = "";

function progressHandler(event) {
    _("upSpin").style.display = "block"
    fileUploadName = upFiles[fileUpCount].name;
    var percent = Math.round((event.loaded / event.total) * 200);
    _("progressBar").value = percent;
    _("upStatus").innerHTML = `Uploading <span>${fileUploadName}</span> (${fileUpCount}/${upFiles.length} uploaded)`;
}

async function completeHandler() {

    fileUpCount += 1;

    if(fileUpCount > upFiles.length - 1) {
        _("upStatus").innerHTML = "Upload finished";
        _("progressBar").style.display = "none"
        _("upSpin").style.display = "none"

        let lastEl = "upload"
        lastEl += String(fileUpCount - 1);
        _(lastEl).style.background = "#00ff007e"

        fileUpCount = 0;
        upFiles = [];
    } else {
//        _("upStatus").innerHTML = event.target.responseText;
        _("progressBar").value = 0;
        let lastEl = "upload"

        lastEl += String(fileUpCount - 1);
        _(lastEl).style.background = "#00ff007e"
        await uploadFile(upFiles[fileUpCount])
    }

    socket.emit("upload", {});
}

function errorHandler() {
    _("progressBar").style.display = "none"
    _("upStatus").innerHTML = "Upload failed";
    _("upSpin").style.display = "none"
    _("upload" + fileUpCount).style.background = "#ff00007e"
    fileUpCount += 1;

    if(fileUpCount <= upFiles.length - 1) {
        uploadFile(upFiles[fileUpCount])
    } else {
        fileUpCount = 0;
        upFiles = [];
    }
    
}

function abortHandler() {
    _("progressBar").style.display = "none"
    _("upStatus").innerHTML = "Upload aborted";
    _("upSpin").style.display = "none"
    _("upload" + fileUpCount).style.background = "#ff00007e";
    fileUpCount += 1;

    if(fileUpCount <= upFiles.length - 1) {
        uploadFile(upFiles[fileUpCount])
    } else {
        fileUpCount = 0;
        upFiles = [];
    } 
}

function _(el) {
    return document.getElementById(el);
}

let socket = io();

socket.on('refresh', function() {
    _("refresh").click()
});


//Utilis
async function OfficeDoc (fileExt) {
    fileExt = fileExt.toLowerCase();

    if (fileExt == 'doc' || fileExt == 'docx') {
        return '/img/WORD.png';
    } else if (fileExt == 'xls' || fileExt == 'xlsx') {
        return '/img/EXCEL.png';
    } else if (fileExt == 'mdb' || fileExt == 'accdb') {
        return '/img/ACCESS.png';
    } else if (fileExt == 'pptx' || fileExt == 'ppt') {
        return '/img/POWERPOINT.png';
    } else if (fileExt == '') {
        return '/img/unknw.png';
    } else {
        const imgEx = await fetch(`/img/${fileExt.toUpperCase()}.png`);
        return imgEx.status === 200 ? `/img/${fileExt.toUpperCase()}.png` : `/img/unknw.png`;
    }
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}