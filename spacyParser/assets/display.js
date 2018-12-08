function $(id){ return document.getElementById(id); }
const textSection = $("text");
const rightSection = $("right");
const count = $("count");
const infoPannel = $("info");
const loading = $("loading");
const btnGroup = $("btnGroup");
const fileName = $("fileName");
const progress = $("progress");
const barFront = $("bar_front");
const remains = $("remains");

let handleSingleText = false;
let currentTextIndex = null;

const noInfoPlaceholder = "";
const defultLabelNumber = 8;
let respond;
let sameWords={};
// TODO, change here!!!!!!!
let editableLabels = [0, 2, 3, 4, 5];
let toggleInfoPanel = false;

let tagCount = new Array(30);
tagCount.fill(0);
let defaultLabel=[];
for (let i=0; i<defultLabelNumber; i++) { defaultLabel.push('tag_'+(i+1)) }
const [startColor, stopColor] = [new RGBColor('#008FB2'), new RGBColor('#A0B61E')];
const defaultColor = startColor.transitionTo(stopColor, defultLabelNumber);
// defaultColor = ['#444', 'white', 'rgb(0, 247, 0)', 'rgb(255, 234, 0)'];

!function registerListeners(){
    let getEvent = event => event || window.event || arguments.callee.caller.arguments[0];
    
    // Click outside textDiv or press ESC to clear focus
    textSection.onclick = function(event){ getEvent(event).stopPropagation(); }
    btnGroup.onclick = function(event){ getEvent(event).stopPropagation(); }
    document.onclick = function(event){ Component.reset(); }
    document.onkeydown = function (event) {
        if (getEvent(event).keyCode == 27) { Component.reset(); }
    };
    
    // Clear bg of textDiv when mouseout
    textSection.onmouseout = function (event) {
        if (!handleSingleText) {
            Component.reset();
        } else if (!currentTextIndex) {
            currentTextIndex = getEvent(event).target.getAttribute('index');
        }
    };
}();


let Component = {
    _reset: function(textObj){
        changeStat(textObj.getAttribute('label'), 'clear');
        textObj.removeAttribute("style");
    },
    reset: function(){
        changeInfo();
        textObj = document.getElementById('w_' + currentTextIndex);
        if (textObj) {
            for (let div of sameWords[textObj.innerHTML]) {this._reset(div)}
        }
        handleSingleText = false;
        currentTextIndex = null;
    },
    _focus: function(textObj){
        changeStat(textObj.getAttribute('label'), 'add');
        textObj.style.setProperty('background-color', 'rgba(255, 255, 255, 0.1)', 'important');
        currentTextIndex = textObj.getAttribute('index');
    },
    focus: function(textObj){
        changeInfo(textObj.getAttribute('index'));
        try {
            for (let div of sameWords[textObj.innerHTML]) {this._focus(div)}
        } catch (error) {
            console.log(textObj.innerHTML)
            console.log(sameWords[textObj.innerHTML])
        }
        
    },
    freeze: function(){
        handleSingleText = true;
    }
}

function drawElements(content) {

    function addLabelCss() {
        let colorList = respond ? respond.labelConfig.colors : defaultColor;
        let colorStyle = document.getElementById("colors");
        colorStyle.innerHTML = "";
        for (let color in colorList) {
            colorStyle.innerHTML += ".tag_" + color + " {color:" + colorList[color] + "; background-color:" + colorList[color] + "}\n";
        }
    }

    scrollTo(0, 0);

    respond = content;
    if (content !== undefined) {
        drawText();
    }
    if (toggleInfoPanel) {drawInfo();} else {infoPannel.style.display = "none";}
    
    drawStat();
    addLabelCss();

    loading.style.opacity = 0;
}

function drawText() {

    let wordList = respond.words.parsed;
    tagCount = new Array(30);
    tagCount.fill(0);
    textSection.innerHTML = "";

    for (let wordIndex in wordList) {
        let text = wordList[wordIndex].text;
        let label = wordList[wordIndex].label;
        // let editable =  word.editable;
        let wordDiv = document.createElement('div');
        wordDiv.id = 'w_' + wordIndex;
        wordDiv.className = "sep_word";
        wordDiv.className += ' tag_' + label;
        wordDiv.setAttribute("index", wordIndex);
        wordDiv.setAttribute("label", label);

        tagCount[label] += 1;
        wordDiv.innerHTML = text;

        if (editableLabels.indexOf(label) !== -1) {
            wordDiv.onmouseover = function (e) {
                if (!handleSingleText) {
                    Component.focus(wordDiv);
                }
            };
            wordDiv.onclick = function (e) {
                Component.reset();
                Component.focus(wordDiv);
                Component.freeze();
            };
        }
        
        textSection.appendChild(wordDiv);

        if (!sameWords[text]) sameWords[text] = [];
        sameWords[text].push(wordDiv);
    }

    const add = (a,b) => a+b
    let tagCountDict = {};
    for (let i in respond.labelConfig.names)  tagCountDict[respond.labelConfig.names[i]] = tagCount[i];
    respond.statistic = {
        'totalWordCount': tagCount.reduce(add),
        'tagCount': tagCountDict
    }

}

function changeInfo(index) {
    if (!toggleInfoPanel) {return;}
    if (!index) {
        let infoKeys = respond.featureConfig.names;
        for (let valueIndex in infoKeys) {
            let infoDiv = document.getElementsByClassName("line")[valueIndex];
            let valueDiv = infoDiv.getElementsByClassName("value")[0];
            valueDiv.className = "value";
            valueDiv.innerHTML = "";
        }
    } else {
        let infoValues = respond.words.parsed[index].features;
        for (let valueIndex in infoValues) {
            let value = infoValues[valueIndex];
            let infoDiv = document.getElementsByClassName("line")[valueIndex];
            let valueDiv = infoDiv.getElementsByClassName("value")[0];
            valueDiv.className = `value ${add_color(value)}`;
            valueDiv.innerHTML = value;
        }

        function add_color(content) {
            if (content === true) {
                return 'true'
            } else if (content === false) {
                return 'false'
            }
            return ''
        }
    }
}

function drawInfo() {

    if (respond) {
        let infoKeys = respond.featureConfig.names;
        let infoIsLong = respond.featureConfig.isLong;
        if (!infoIsLong) infoIsLong = new Array(infoKeys.length), infoIsLong.fill(false);

        for (let keyIndex in infoKeys) {
            let infoDiv = document.createElement('div');
            infoDiv.className = "line ";
            infoDiv.className += infoIsLong[keyIndex] ? "tag_long" : "";
            infoDiv.innerHTML = 
            '<div class="attr">' + infoKeys[keyIndex] + "</div>" +
            `<div class="value"></div>`;
            infoPannel.appendChild(infoDiv);
        }
    } else {
        infoPannel.innerHTML = noInfoPlaceholder;
    }

}

function changeStat(highlightIndex, mode) {
    let hl_div = document.getElementsByClassName("tag_count")[highlightIndex];
    let colorList = respond ? respond.labelConfig.colors: defaultColor;
    if (mode == "add") {
        let color = new RGBColor(colorList[highlightIndex]);
        let gray = (color.r * 19595 + color.g * 38469 + color.b * 7472) >> 16;
        hl_div.style.backgroundColor = colorList[highlightIndex];
        // console.log(color.r, color.g, color.b);
        // console.log(gray);
        if (gray > 90) {
            hl_div.firstElementChild.style.color = "rgb(30, 30, 30)";
        }
        // else {
        //     hl_div.style.border="1px solid white";
        // }
    } else if (hl_div) {
        hl_div.removeAttribute("style");
        hl_div.firstElementChild.removeAttribute("style");
    }
}

function drawStat() {
    count.innerHTML = "";
    let labelList = respond ? respond.labelConfig.names: defaultLabel;

    for (let label in labelList) {
        let statDiv = document.createElement('div');
        statDiv.className = "tag_sec";

        let countDiv = document.createElement('div');
        countDiv.className = "tag_count";
        countDiv.innerHTML = `<div>${tagCount[label]}</div>`;
        countDiv.setAttribute("index", label);
        countDiv.onclick = function(event) {
            if (handleSingleText) {
                let newLabelDiv = event.target;
                let newLabel = newLabelDiv.parentElement.getAttribute("index");
                let oldLabel = document.getElementById("w_"+currentTextIndex).getAttribute("label");
                let oldLabelDiv = document.getElementsByClassName("tag_count")[oldLabel].firstElementChild;
                let currSameWords = sameWords[respond.words.parsed[currentTextIndex].text];

                oldLabelDiv.innerText = parseInt(oldLabelDiv.innerText) - currSameWords.length;
                newLabelDiv.innerText = parseInt(newLabelDiv.innerText) + currSameWords.length;
                tagCount[oldLabel] -= currSameWords.length;
                tagCount[newLabel] += currSameWords.length;

                changeStat(oldLabel, 'clear');
                setTimeout(`changeStat(${newLabel}, 'add')`, 1);
                setTimeout(`changeStat(${newLabel}, 'clear')`, 200);
                for (let textDiv of currSameWords) {
                    let textIndex = textDiv.getAttribute("index"); 
                    respond.words.parsed[textIndex].label = newLabel;
                    textDiv.className = "sep_word tag_"+newLabel;
                    textDiv.setAttribute("label", newLabel);
                }
            } else {
                alert("Please click to select a text element first!");
            }
        };
        statDiv.appendChild(countDiv);

        let colorDiv = document.createElement('div');
        colorDiv.className = "color_indicator tag_" + label;
        countDiv.appendChild(colorDiv);

        let labelDiv = document.createElement('div');
        labelDiv.className = "tag_label";
        // labelDiv.setAttribute("contenteditable", "true");
        // labelDiv.setAttribute("spellcheck", "false");
        labelDiv.innerHTML = labelList[label];
        statDiv.appendChild(labelDiv);

        count.appendChild(statDiv);
    }
}

window.onload = function () {
    drawElements();
}