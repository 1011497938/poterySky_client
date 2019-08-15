import $ from 'jquery'
import pingshuiyun from '../data/平水韵.json'
import cilingzhengyun from '../data/词林正韵.json'
import yun2tone from '../data/韵母2声调.json'

const silkRibbonPathString = (sx,sy,tx,ty,tension)=>{
    var m0, m1;
    return (tension==1?[  "M", [sx,sy],
        "L", [tx,ty],
        //"Z"
        ]:[  "M", [sx,sy],
        "C", [m0 = tension*sx+(1-tension)*tx,sy], " ",
            [m1 = tension*tx+(1-tension)*sx,ty], " ", [tx,ty],
        //"Z"
    ]).join("");
}

const ribbonPathString = (sx,sy,sdy,tx,ty,tdy,tension)=>{
    var m0,m1;
    return (tension===1?[	      "M", [sx,sy],
        "L", [tx,ty],
        "V", ty+tdy,
        "L", [sx, sy +sdy],
        "Z"
      ]:[	      "M", [sx,sy],
        "C", [m0 = tension*sx+ (1-tension)*tx,sy], " ",
             [m1 = tension*tx+ (1-tension)*sx,ty], " ", [tx,ty],
        "V", ty+tdy,
        "C", [m1,ty+tdy], " ", [m0,sy+sdy], " ", [sx,sy+sdy],
        "Z"
      ]).join("");
}
const arcLine = (d) => {
    var dx = d.target.x - d.source.x,//增量
        dy = d.target.y - d.source.y,
        dr = Math.sqrt(dx * dx + dy * dy);
    return "M" + d.source.x + "," 
    + d.source.y + "A" + dr + "," 
    + dr + " 0 0,1 " + d.target.x + "," 
    + d.target.y;
  }


  
// 处理平水韵
const word2yun = {}
const yuns = Object.keys(pingshuiyun)
const yun2simp_yun = {}
const yun2rhyme = {}
for (let yun in pingshuiyun) {
    let words = pingshuiyun[yun].split('')
    pingshuiyun[yun] = words
    words.forEach(word => {
        word2yun[word] = yun
    })
}
const rhymes = ['平', '上', '去', '入']
const replace_list = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '声', '平', '上', '去', '入']
yuns.forEach(yun => {
    rhymes.forEach(elm => {
        if (yun.indexOf(elm) !== -1) {
            yun2rhyme[yun] = elm
        }
    })

    let simp_yun = yun
    replace_list.forEach(word => {
        simp_yun = simp_yun.replace(word, '')
    })
    replace_list.forEach(word => {
        simp_yun = simp_yun.replace(word, '')
    })
    yun2simp_yun[yun] = simp_yun
    return simp_yun
})

let word2cilin = {}
for (let bu in cilingzhengyun) {
    const text = cilingzhengyun[bu].split('')
    text.forEach(word => {
        word2cilin[word] = bu
    })
}

function analyzeWordTone(word) {
    // console.log(word2yun[word], yun2simp_yun[word2yun[word]], yun2tone[yun2simp_yun[word2yun[word]]])
    return yun2tone[yun2simp_yun[word2yun[word]]]
}


$.fn.setCursorPosition = function (position) {
    if (this.length == 0) return this;
    return $(this).setSelection(position, position);
}

$.fn.setSelection = function (selectionStart, selectionEnd) {
    if (this.length == 0) return this;
    let input = this[0];

    if (input.createTextRange) {
        var range = input.createTextRange();
        range.collapse(true);
        range.moveEnd('character', selectionEnd);
        range.moveStart('character', selectionStart);
        range.select();
    } else if (input.setSelectionRange) {
        input.focus();
        input.setSelectionRange(selectionStart, selectionEnd);
    }

    return this;
}

$.fn.focusEnd = function () {
    this.setCursorPosition(this.val().length);
}

const notes = new Set(',.。，、＇：∶；?‘’“”〝〞ˆˇ﹕︰﹔﹖﹑·¨….¸;！´？！～—ˉ｜‖＂〃｀@﹫¡¿﹏﹋﹌︴々﹟#﹩$﹠&﹪%*﹡﹢﹦﹤‐￣¯―﹨ˆ˜﹍﹎+=<­­＿_-\ˇ~﹉﹊（）〈〉‹›﹛﹜『』〖〗［］《》〔〕{}「」【】︵︷︿︹︽_﹁﹃︻︶︸﹀︺︾ˉ﹂﹄︼'.split(''))
export {
    silkRibbonPathString,
    ribbonPathString,
    arcLine,
    analyzeWordTone,
    notes,
}