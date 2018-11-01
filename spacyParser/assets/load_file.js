function read(){
    file = document.getElementById('fileUpload');
    if (file.files.length != 0){
        let uploadFile = file.files[0]
        let reader = new FileReader();
        reader.readAsText(uploadFile, "UTF-8");
        reader.onload = function (evt) {
            var fileString = evt.target.result;
            post('../api/spacy_parse/', {'content': fileString});
        }
    }
}

function post(URL, PARAMS) {
    var temp = document.createElement("form");
    temp.action = URL;
    temp.method = "post";
    temp.style.display = "none";

    for (let attr in PARAMS) {
        let opt = document.createElement("textarea");
        opt.name = attr;
        opt.value = PARAMS[attr];
        temp.appendChild(opt);
    }
    document.body.appendChild(temp);
    temp.submit();
}
