let text_sec = document.getElementById("text");
let count = document.getElementById("count");
let info_pannel = document.getElementById("info");
let info_list = [];
let tag_count = [0, 0, 0, 0, 0, 0];
let tag_label = ['normal', 'stop', 'special', 'url', 'common', 'weird'];
let empty=[{"i": null, "idx": null}, {"lemma_": null}, {"shape_": null}, {"tag_": null, "pos_": null}, {"like_email": null, "like_num": null, "like_url": null}, {"is_alpha": null, "is_digit": null, "is_punct": null, "is_stop": null, "is_upper": null}];

function sum(arr) {
    return eval(arr.join("+"));
};

text_sec.addEventListener('mouseout', function(e){
    drawInfo(0);
});

function drawText(content){
    let text_list = content["text"];
    let tag = content["tag"];
    info_list = content["info"];
    tag_count = [0, 0, 0, 0, 0, 0];
    text_sec.innerHTML = "";
    scrollTo(0,0);

    for (let word in text_list){
        let sep_word = document.createElement('div');
        sep_word.id = 'w_'+word;
        sep_word.className = "sep_word";
        if (tag[word] !== 0){
            sep_word.className += ' tag_'+ tag[word]
        }
        tag_count[tag[word]] += 1;
        sep_word.innerHTML = text_list[word];
        sep_word.addEventListener('mouseover', function(e){
            console.log(e.target.id);
            drawInfo(Number(e.target.id.split('_')[1])+1);
        });
        text_sec.appendChild(sep_word);
    }

    drawStat();
}

function drawInfo(index){
    info_pannel.innerHTML = "";

    let source;
    if (index === 0) { source = empty; } else { source = info_list[index-1] }
    for (let group of source){
        let section = document.createElement('div');
        section.className = "section";
        section.innerHTML = obj2html(group);
        info_pannel.appendChild(section);
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
    for (let label in tag_label){
        let tag_sec = document.createElement('div');
        tag_sec.className = "tag_sec";
        
        let count_div = document.createElement('div');
        count_div.className = "tag_count";
        count_div.innerHTML = tag_count[label];
        tag_sec.appendChild(count_div);

        let label_div = document.createElement('div');
        label_div.className = "tag_label";
        label_div.innerHTML = tag_label[label];
        tag_sec.appendChild(label_div);

        count.appendChild(tag_sec);
    }
}

window.onload=function(){
    drawText({});
    drawInfo(0);
}
