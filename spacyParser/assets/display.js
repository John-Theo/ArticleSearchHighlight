let textSection = document.getElementById("text");
let count = document.getElementById("count");
let infoPannel = document.getElementById("info");
let infoList = [];
let tagCount = [0, 0, 0, 0, 0, 0];
let defaultLabel = ['normal', 'stop', 'special', 'url', 'common', 'weird'];
let defaultColor = ['white', '#444', 'rgb(255, 234, 0)', 'rgb(0, 247, 0)', 'rgb(14, 85, 0)', 'rgb(231, 73, 0)'];

function sum(arr) {
    return eval(arr.join("+"));
};

textSection.addEventListener('mouseout', function(e){
    drawInfo(0);
});

function add_tag_css(colorList){
    if (colorList === undefined){ colorList = defaultColor; } 
    // else { defaultColor = colorList; }
    let colorStyle = document.getElementById("colors");
    colorStyle.innerHTML = "";
    for (let color in colorList){
        colorStyle.innerHTML += ".tag_"+color+" {color:"+colorList[color]+"}\n";
    }
}

function drawText(content){
    
    let text_list;
    let tag;
    if (content !== undefined) {
        text_list = content["text"];
        tag = content["tag"]["labels"];
        defaultLabel = content["tag"]["names"];
        infoList = content["info"];
        add_tag_css(content["tag"]["colors"]);
    }

    tagCount = [0, 0, 0, 0, 0, 0];
    textSection.innerHTML = "";
    scrollTo(0,0);

    for (let word in text_list){
        let wordDiv = document.createElement('div');
        wordDiv.id = 'w_'+word;
        wordDiv.className = "sep_word";
        wordDiv.className += ' tag_'+ tag[word]
        tagCount[tag[word]] += 1;
        wordDiv.innerHTML = text_list[word];
        wordDiv.addEventListener('mouseover', function(e){
            drawInfo(Number(e.target.id.split('_')[1])+1);
        });
        textSection.appendChild(wordDiv);
    }

    drawStat();
}

function drawInfo(index){
    infoPannel.innerHTML = "";

    if (index === 0) { return }
    
    for (let group of infoList[index-1]){
        let infoDiv = document.createElement('div');
        infoDiv.className = "section";
        infoDiv.innerHTML = obj2html(group);
        infoPannel.appendChild(infoDiv);
    }
    
    function add_color(content, key){
        if (key === 'tag_') {return ' tag'}
        else if (content === true) {return ' true'}
        else if (content === false) {return ' false'}
        return ''
    }
    
    function obj2html(dict){
        let content = "";
        for (let key in dict){
            content += '<div class="line">'+
                            '<div class="attr">'+key+"</div>"+
                            `<div class="value${add_color(dict[key], key)}">`+dict[key]+"</div>"+
                        "</div>"
        }
        return "<div>"+content+"</div>"
    }
}

function drawStat(){
    count.innerHTML = "";

    // tag_count[5] = sum(tag_count);
    for (let label in defaultLabel){
        let statDiv = document.createElement('div');
        statDiv.className = "tag_sec";
        
        let countDiv = document.createElement('div');
        countDiv.className = "tag_count";
        countDiv.innerHTML = tagCount[label];
        statDiv.appendChild(countDiv);

        let labelDiv = document.createElement('div');
        labelDiv.className = "tag_label";
        labelDiv.innerHTML = defaultLabel[label];
        statDiv.appendChild(labelDiv);

        count.appendChild(statDiv);
    }
}

window.onload=function(){
    add_tag_css();
    drawText();
    drawInfo(0);
}
