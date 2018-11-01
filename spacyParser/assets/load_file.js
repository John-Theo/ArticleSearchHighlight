function read(){
    file = document.getElementById('fileUpload');
    if (file.files.length != 0){
        let uploadFile = file.files[0]
        let reader = new FileReader();
        reader.readAsText(uploadFile, "UTF-8");
        reader.onload = function (evt) {
            var fileString = evt.target.result;
            post('../spacy_parser/', {'content': fileString});
        }
    }
}

function post(URL, PARAMS) {
    let formData = new FormData(); 
    for (let attr in PARAMS) {
        formData.append(attr, PARAMS[attr]);
    }
    ajax("POST", URL, formData);
}


function fail(code) {
}

function ajax(method, url, data){
    var request = new XMLHttpRequest(); // 新建XMLHttpRequest对象

    request.onreadystatechange = function () { // 状态发生变化时，函数被回调
        if (request.readyState === 4) { // 成功完成
            if (request.status === 200) {
                // 成功，通过responseText拿到响应的文本:
                return drawText(JSON.parse(request.responseText));
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