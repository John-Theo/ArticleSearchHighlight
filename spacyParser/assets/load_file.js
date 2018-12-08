let files;
let currentFileIndex=0;

function readNext(){
    if (currentFileIndex != 0) {
        exportContent();
    }

    function updateProgress(uploadFile) {
        fileName.innerHTML = uploadFile.name;
        barFront.style.width = `${Math.ceil(currentFileIndex/files.length*100)}%`;
        remains.innerHTML = `${currentFileIndex} / ${files.length-currentFileIndex}`;
    }

    if (files){
        if (currentFileIndex >= files.length) {
            alert("All files finished!");
        } else {
            let uploadFile = files[currentFileIndex];
            updateProgress(uploadFile);
            let reader = new FileReader();
            reader.readAsText(uploadFile, "UTF-8");
            reader.onload = function (evt) {
                var fileString = evt.target.result;
                loading.style.opacity = 1;
                post('../spacy_parser/', {'content': fileString, 'file_name': uploadFile.name});
            };
            currentFileIndex += 1;
        }
    } else {
        alert("Select some files first!");
    }
}

function post(URL, PARAMS) {
    let formData = new FormData(); 
    for (let attr in PARAMS) {
        formData.append(attr, PARAMS[attr]);
    }
    ajax("POST", URL, formData);
}

function download(filename, text) {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
}

function exportContent(){
    let name = respond.fileName;
    download(name.slice(0, name.lastIndexOf('.'))+'.json', JSON.stringify(respond));
}

function fail(code) {
}

function ajax(method, url, data){
    var request = new XMLHttpRequest(); // 新建XMLHttpRequest对象

    request.onreadystatechange = function () { // 状态发生变化时，函数被回调
        if (request.readyState === 4) { // 成功完成
            if (request.status === 200) {
                // 成功，通过responseText拿到响应的文本:
                return drawElements(JSON.parse(request.responseText));
            } else {
                // 失败，根据响应码判断失败原因:
                return fail(request.status);
            }
        } else {
            // HTTP请求还在继续...
        }
    }

    request.open(method, url, true);
    if (method == "GET") {
        request.send();
    } else {
        request.send(data);
    }
    
}


function selectFolder(){
    let file = document.getElementById('fileUpload');
    file.click();
    file.onchange = () => {
        if (file.files.length != 0){
            files = file.files;
            currentFileIndex = 0;
            readNext();
        }
    }
}