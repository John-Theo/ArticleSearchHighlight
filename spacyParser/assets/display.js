let text_sec = document.getElementById("text")

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
    sep_word.innerHTML = word_seq[word];
    sep_word.addEventListener('mouseover', function(e){
        draw_info(Number(e.target.id.split('_')[1])+1);
    });
    text_sec.appendChild(sep_word);
}

let right = document.getElementById("right")

function draw_info(index){

    right.innerHTML = "";

    let source;
    if (index === 0) { source = empty; } else { source = info[index-1] }
    for (let group of source){
        let section = document.createElement('div');
        section.className = "section";
        section.innerHTML = obj2html(group);
        right.appendChild(section);
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
