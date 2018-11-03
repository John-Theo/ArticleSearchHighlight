let textSection = document.getElementById("text");
let count = document.getElementById("count");
let infoPannel = document.getElementById("info");
let infoList = [];
let tagCount = new Array(6); tagCount.fill(0);
let defaultLabel = ['tag_0', 'tag_1', 'tag_2', 'tag_3'];
let defaultColor = ['#444', 'white', 'rgb(0, 247, 0)', 'rgb(255, 234, 0)'];


textSection.addEventListener('mouseout', function(e){
    drawInfo(0);
});

function add_tag_css(colorList){
    if (colorList === undefined){ colorList = defaultColor; } 
    // else { defaultColor = colorList; }
    let colorStyle = document.getElementById("colors");
    colorStyle.innerHTML = "";
    for (let color in colorList){
        colorStyle.innerHTML += ".tag_"+color+" {color:"+colorList[color]+"; background-color:"+colorList[color]+"}\n";
    }
    console.log(colorStyle);
}

function drawElements(content){
    scrollTo(0,0);
    
    if (content !== undefined) {
        add_tag_css(content["tag"]["colors"]);
        drawText(content["text"], content["tag"]["labels"]);
        drawStat(content["tag"]["names"]);
        infoList = content["info"];
        drawInfo(0);
    } else {add_tag_css();drawStat();}
}

function drawText(text_list, tag_list){

    tagCount = new Array(6); tagCount.fill(0);
    textSection.innerHTML = "";

    for (let word in text_list){
        let wordDiv = document.createElement('div');
        wordDiv.id = 'w_'+word;
        wordDiv.className = "sep_word";
        wordDiv.className += ' tag_'+ tag_list[word]
        tagCount[tag_list[word]] += 1;
        wordDiv.innerHTML = text_list[word];
        wordDiv.addEventListener('mouseover', function(e){
            drawInfo(Number(e.target.id.split('_')[1])+1);
        });
        textSection.appendChild(wordDiv);
    }

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

function drawStat(labelList){
    count.innerHTML = "";
    if (labelList === undefined) { labelList = defaultLabel }

    for (let label in labelList){
        let statDiv = document.createElement('div');
        statDiv.className = "tag_sec";
        
        let countDiv = document.createElement('div');
        countDiv.className = "tag_count";
        countDiv.innerHTML = tagCount[label];
        statDiv.appendChild(countDiv);

        let colorDiv = document.createElement('div');
        colorDiv.className = "color_indicator tag_"+label;
        countDiv.appendChild(colorDiv);

        let labelDiv = document.createElement('div');
        labelDiv.className = "tag_label";
        labelDiv.innerHTML = labelList[label];
        statDiv.appendChild(labelDiv);

        count.appendChild(statDiv);
    }
}

window.onload=function(){
    drawElements();
}
