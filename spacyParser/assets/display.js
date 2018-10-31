let text_sec = document.getElementById("text");
let count = document.getElementById("count");
let tag_count = [0, 0, 0, 0, 0];
let tag_label = ['normal', 'stop', 'special', 'url', 'common'];

function sum(arr) {
    return eval(arr.join("+"));
};

word_seq = text;
text_sec.addEventListener('mouseout', function(e){
    draw_info(0);
});

for (let word in word_seq){
    let sep_word = document.createElement('div');
    sep_word.id = 'w_'+word;
    sep_word.className = "sep_word";
    if (tag[word] !== 0){
        sep_word.className += ' tag_'+ tag[word]
    }
    tag_count[tag[word]] += 1;
    sep_word.innerHTML = word_seq[word];
    sep_word.addEventListener('mouseover', function(e){
        draw_info(Number(e.target.id.split('_')[1])+1);
    });
    text_sec.appendChild(sep_word);
}

// tag_count[5] = sum(tag_count);
for (let label in tag_label){
    let tag_sec = document.createElement('div');
    
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

let hover = document.getElementById("hover")

function draw_info(index){

    hover.innerHTML = "";

    let source;
    if (index === 0) { source = empty; } else { source = info[index-1] }
    for (let group of source){
        let section = document.createElement('div');
        section.className = "section";
        section.innerHTML = obj2html(group);
        hover.appendChild(section);
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

window.onload=function(){
    draw_info(0);
}
