const textSection = document.getElementById("text");
const rightSection = document.getElementById("right");
const count = document.getElementById("count");
const infoPannel = document.getElementById("info");
let loading = document.getElementById("loading");
let handleSingleText = false;
let currentTextIndex = null;
const noInfoPlaceholder = "";
let infoList = [];
let labelList = [];
let tagCount = new Array(30);
tagCount.fill(0);
let defaultLabel = ['tag_0', 'tag_1', 'tag_2', 'tag_3', 'tag_4', 'tag_5', 'tag_6'];
let defaultColor = ['#444', 'white', 'rgb(0, 247, 0)', 'rgb(255, 234, 0)', '#444', 'white', 'rgb(0, 247, 0)'];

defaultLabel = defaultLabel.concat(defaultLabel, defaultLabel);
defaultColor = defaultColor.concat(defaultColor, defaultColor);

document.onkeydown = function (event) {
    var e = event || window.event || arguments.callee.caller.arguments[0];
    if (e && e.keyCode == 27) {
        resetComponents();
    }
};

function resetComponents() {
    drawInfo();
    textObj = document.getElementById('w_' + currentTextIndex);
    if (textObj) {
        changeStat(textObj.getAttribute('label'), 'clear');
        textObj.removeAttribute("style");
    }
    handleSingleText = false;
    currentTextIndex = null;
}

function focusComponent(textObj) {
    drawInfo(textObj.getAttribute('index'));
    changeStat(textObj.getAttribute('label'), 'add');
    textObj.style.setProperty('background-color', 'rgba(255, 255, 255, 0.1)', 'important');
    currentTextIndex = textObj.getAttribute('index');
}

function freezeComponent(){
    handleSingleText = true;
}

textSection.addEventListener('mouseout', function (e) {
    if (!handleSingleText) {
        resetComponents(e.target);
    } else {
        if (!currentTextIndex) currentTextIndex = e.target.getAttribute('index');
        // console.log(currentTextIndex)
    }
});

function add_tag_css(colorList) {
    if (colorList === undefined) {
        colorList = defaultColor;
    }
    let colorStyle = document.getElementById("colors");
    colorStyle.innerHTML = "";
    for (let color in colorList) {
        colorStyle.innerHTML += ".tag_" + color + " {color:" + colorList[color] + "; background-color:" + colorList[color] + "}\n";
    }
}

function drawElements(content) {
    scrollTo(0, 0);

    if (content !== undefined) {
        defaultColor = content["tag"]["colors"];
        drawText(content["text"], content["tag"]["labels"]);
        labelList = content["tag"]["names"];
        infoList = content["info"];
    }
    drawInfo();
    drawStat();
    add_tag_css();

    loading.style.opacity = 0;
}

function drawText(text_list, tag_list) {

    tagCount = new Array(30);
    tagCount.fill(0);
    textSection.innerHTML = "";

    for (let word in text_list) {
        let wordDiv = document.createElement('div');
        wordDiv.id = 'w_' + word;
        wordDiv.className = "sep_word";
        wordDiv.className += ' tag_' + tag_list[word];
        wordDiv.setAttribute("index", word);
        wordDiv.setAttribute("label", tag_list[word]);

        tagCount[tag_list[word]] += 1;
        wordDiv.innerHTML = text_list[word];
        wordDiv.addEventListener('mouseover', function (e) {
            if (!handleSingleText) {
                focusComponent(wordDiv);
                // drawInfo(e.target.getAttribute('index'));
                // changeStat(e.target.getAttribute('label'), 'add');
                // wordDiv.style.setProperty('background-color', 'rgba(255, 255, 255, 0.1)', 'important');
            }
        });
        wordDiv.addEventListener('click', function (e) {
            resetComponents();
            focusComponent(wordDiv);
            freezeComponent();
        });
        textSection.appendChild(wordDiv);
    }

}

function drawInfo(index) {
    infoPannel.innerHTML = "";

    if (index === undefined) {
        infoPannel.innerHTML = noInfoPlaceholder;
        return;
    }

    for (let group of infoList[index]) {
        let infoDiv = document.createElement('div');
        infoDiv.className = "section";
        infoDiv.innerHTML = obj2html(group);
        infoPannel.appendChild(infoDiv);
    }

    function add_color(content, key) {
        if (key === 'tag_') {
            return ' tag'
        } else if (content === true) {
            return ' true'
        } else if (content === false) {
            return ' false'
        }
        return ''
    }

    function obj2html(dict) {
        let content = "";
        for (let key in dict) {
            content += '<div class="line">' +
                '<div class="attr">' + key + "</div>" +
                `<div class="value${add_color(dict[key], key)}">` + dict[key] + "</div>" +
                "</div>"
        }
        return "<div>" + content + "</div>"
    }
}

function changeStat(highlightIndex, mode) {
    let hl_div = document.getElementsByClassName("tag_count")[highlightIndex];
    if (mode == "add") {
        let color = new RGBColor(defaultColor[highlightIndex]);
        let gray = (color.r * 19595 + color.g * 38469 + color.b * 7472) >> 16;
        hl_div.style.backgroundColor = defaultColor[highlightIndex];
        // console.log(color.r, color.g, color.b);
        // console.log(gray);
        if (gray > 90) {
            hl_div.style.color = "rgb(30, 30, 30)";
        }
        // else {
        //     hl_div.style.border="1px solid white";
        // }
    } else if (hl_div) {
        hl_div.removeAttribute("style");
    }
}

function drawStat() {
    count.innerHTML = "";
    if (labelList.length == 0) {
        labelList = defaultLabel;
    }

    for (let label in labelList) {
        let statDiv = document.createElement('div');
        statDiv.className = "tag_sec";

        let countDiv = document.createElement('div');
        countDiv.className = "tag_count";
        countDiv.innerHTML = tagCount[label];
        statDiv.appendChild(countDiv);

        let colorDiv = document.createElement('div');
        colorDiv.className = "color_indicator tag_" + label;
        countDiv.appendChild(colorDiv);

        let labelDiv = document.createElement('div');
        labelDiv.className = "tag_label";
        labelDiv.setAttribute("contenteditable", "true");
        labelDiv.setAttribute("spellcheck", "false");
        labelDiv.innerHTML = labelList[label];
        statDiv.appendChild(labelDiv);

        count.appendChild(statDiv);
    }
}

window.onload = function () {
    drawElements();
}