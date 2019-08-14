import React from 'react';
import stateStore from '../manager/stateManager';
import { autorun } from 'mobx';
import './WritePotery.css'
import $ from 'jquery'
import net_work from '../manager/network';
import pingshuiyun from '../data/平水韵.json'
import cilingzhengyun from '../data/词林正韵.json'
import yun2tone from '../data/韵母2声调.json'
import * as d3 from 'd3';

const normalLiner  = d3.line()
.x(d=> d.x)
.y(d=> d.y)
let auto_word_id = 0
const notes = new Set(',.。，、＇：∶；?‘’“”〝〞ˆˇ﹕︰﹔﹖﹑·¨….¸;！´？！～—ˉ｜‖＂〃｀@﹫¡¿﹏﹋﹌︴々﹟#﹩$﹠&﹪%*﹡﹢﹦﹤‐￣¯―﹨ˆ˜﹍﹎+=<­­＿_-\ˇ~﹉﹊（）〈〉‹›﹛﹜『』〖〗［］《》〔〕{}「」【】︵︷︿︹︽_﹁﹃︻︶︸﹀︺︾ˉ﹂﹄︼'.split(''))
class Word {
    constructor(text, sentence, ) {
        this.id = auto_word_id++
        this.text = text
        this.next_is_conn = false
        this.former_is_conn = false
        this.sentence = sentence
        this.is_focus = false
    }
}
const unvalid_char = [' ', '', '1', '2', '3', '4', '5', '6', '7', '8', '9']
$.fn.setCursorPosition = function (position) {
    if (this.lengh == 0) return this;
    return $(this).setSelection(position, position);
}

$.fn.setSelection = function (selectionStart, selectionEnd) {
    if (this.lengh == 0) return this;
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


export default class WritePotery extends React.Component {
    constructor(props) {
        super(props)
        let width = stateStore.windows_width.get()
        let height = stateStore.window_height.get()

        let new_sentence = []
        new_sentence.push(new Word('', new_sentence))
        this.state = {
            width: width,
            height: height,
            sentences: [new_sentence],  // ['明月几时有,', '把酒问青天', '不知天上宫阙', ' '],
            title: ''
        }

        this.last_input_time = 0
        setInterval(() => {
            if (this.last_input_time > 0) {
                this.last_input_time -= 100
                // console.log('正在打字')
            } else {
                // console.log('没在打字')
            }
        }, 100)
    }

    componentDidMount() {
        this.onWindowSizeChange = autorun(() => {
            let width = stateStore.windows_width.get()
            let height = stateStore.window_height.get()
            this.setState({ width: width, height: height })
        })
    }


    checkWordValid(word){
        return !unvalid_char.includes(word.text)
    }
    onPoteryChange() {
        // console.log(this, 'change')
        let {checkWordValid} = this
        let { sentences } = this.state
        const test_en_reg = /[A-Za-z]/; // 判断输入的是不是字母

        let new_sentences = []
        sentences.forEach(sentence => {
            let new_sentence = []
            sentence.forEach(word => {
                let words = word.text.split(''), words_num = words.length
                if (words_num > 0) {
                    // 要分裂的
                    if (words_num > 1) {
                        let new_word = '', new_words = []
                        words.forEach(word => {
                            if (!test_en_reg.test(word)) {
                                if (new_word !== '') {
                                    new_words.push(new Word(new_word, new_sentence))
                                    new_word = ''
                                }
                                new_words.push(new Word(word, new_sentence))
                            } else {
                                new_word += word
                            }
                        })
                        if (word.is_focus) {
                            new_words[new_words.length - 1].is_focus = true
                            // console.log(new_words[new_words.length - 1])
                        }
                        new_words.forEach(elm => new_sentence.push(elm))
                    } else {
                        new_sentence.push(word)
                    }
                }
            })
            new_sentence = new_sentence.filter(elm => elm && ((checkWordValid(elm)) || elm.is_focus) )
            new_sentences.push(new_sentence)
        })
        new_sentences = new_sentences.filter(sentence => sentence.length > 0)
        if (new_sentences.length === 0) {
            let new_sentence = []
            new_sentence.push(new Word('', new_sentence))
            new_sentences.push(new_sentence)
        }
        sentences.forEach(sentence => {
            if (sentence[sentence.length - 1].text !== '') {
                sentence.push(new Word('', sentence))
            }
        })
        if (sentences[sentences.length - 1].length > 1) {
            let new_sentence = []
            new_sentence.push(new Word('', new_sentence))
            sentences.push(new_sentence)
        }
        this.setState({ sentences: new_sentences })
        
        setTimeout(()=>{
            if(this.last_input_time<=0){
                net_work.require('analyzePotery', {content: this.getText()})
                .then(data=>{
                    console.log(data)
                })
            }
        }, 201)
        this.last_input_time = 200
    }

    getText(){
        const { sentences } = this.state
        let content = ''
        sentences.forEach(sentence=>{
            sentence.forEach(word=>{
                content += word.text
            })
        })
        return content
    }
    onGoRight() {
        const { sentences } = this.state
        let is_finish = false
        sentences.forEach((sentence, s_index) => {
            if (is_finish)
                return
            sentence.forEach((word, w_index) => {
                if (is_finish)
                    return
                if (word.is_focus) {
                    // console.log(word)
                    if (w_index < sentence.length - 1) {
                        word.is_focus = false
                        sentence[w_index + 1].is_focus = true
                    } else {
                        if (s_index < sentences.length - 1) {
                            word.is_focus = false
                            sentences[s_index + 1][0].is_focus = true
                        }
                    }
                    is_finish = true
                    return
                }
            })
        })
        this.setState({ sentences: sentences })
    }
    onGoLeft() {
        this.onPoteryChange()
        const { sentences } = this.state
        let is_finish = false
        sentences.forEach((sentence, s_index) => {
            if (is_finish)
                return
            sentence.forEach((word, w_index) => {
                if (is_finish)
                    return
                if (word.is_focus) {
                    if (w_index > 0) {
                        word.is_focus = false
                        sentence[w_index - 1].is_focus = true
                    } else {
                        if (s_index > 0) {
                            word.is_focus = false
                            let former_row = sentences[s_index - 1]
                            former_row[former_row.length - 1].is_focus = true
                        }
                    }
                    is_finish = true
                    return
                }
            })
        })
        this.setState({ sentences: sentences })
    }

    render() {
        const { width, height, sentences } = this.state

        // console.log(sentences)
        sentences.forEach(sentence => {
            if (sentence[sentence.length - 1].text !== '') {
                sentence.push(new Word('', sentence))
            }
        })
        if (sentences[sentences.length - 1].length > 1) {
            let new_sentence = []
            new_sentence.push(new Word('', new_sentence))
            sentences.push(new_sentence)
        }
        return (
            <div className='write-potery-page'>
                {/* <ScrollView>
            </ScrollView> */}
                <div style={{ position: 'absolute', top: 200, left: '30%', width: '100%' }}>
                    {
                        sentences.map((sentence, index) => {
                            // console.log(sentence)
                            return (
                                <div className='input_per_sentence' style={{ top: index * 80 }} key={index}>
                                    {
                                        sentence.map((word, index) => {
                                            return (
                                                <InputBox word={word} key={index} onChange={this.onPoteryChange.bind(this)} parent={this} />
                                            )
                                        })
                                    }
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        )
    }
}

class InputBox extends React.Component {
    constructor(props) {
        super(props)
        this.state = {

        }
        this.last_input_time = 0
        setInterval(() => {
            if (this.last_input_time > 0) {
                this.last_input_time -= 100
            }
        }, 100)
        this.is_writeing_chn = false
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        //   console.log(nextProps, prevState)
        let { word } = nextProps
        if (!word) {
            word = new Word('', undefined)
        }
        return { word: word }
    }
    componentDidMount() {
        this.setFocus()
        this.drawRhym()
    }
    componentDidUpdate() {
        this.setFocus()
        this.drawRhym()
    }
    setFocus() {
        const { word } = this.state
        if (word.is_focus) {
            let input = $(this.refs.input)
            input.focus()
        }
    }
    drawRhym(){
        let line_ys = [30, 23, 16, 9, 2]
        const backgroundLine = d3.select(this.refs.backgroundLine)
        backgroundLine.selectAll('path')
        .data(line_ys.map(elm=> [
            {x:0, y:elm},
            {x:60, y:elm},
        ]))
        .enter()
        .append('path')
        .attr('stroke', 'black')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '2,2')
        .attr('d', d=>{
            return normalLiner(d)
        })
        const { word } = this.state, word_length = word.text.split('').lengh
        // console.log(word.text.lengh)
        if(word_length>1)
            return

        const rhyme_g = d3.select(this.refs.rhyme)
        const rhyme = analyzeWordTone(word.text)
        const rhyme2point =  [
            [[0,4], [1,4]], 
            [[0,2], [1,4]], 
            [[0,1], [0.25,0], [1,4]], 
            [[0,4], [1,0]],
        ].map(points=>{
            return points.map(point=> {
                return {
                    x: point[0] * 30 + 7,
                    y: line_ys[point[1]]
                }
            })
        })
        const points = rhyme2point[rhyme-1]
        rhyme_g.selectAll('path').remove()
        rhyme_g.selectAll('circle').remove()
        if(points){
            let lines = []
            points.forEach((point, index)=>{
                if(points[index+1])
                    lines.push([point, points[index+1]])
            })
            // console.log(lines, rhyme, points)
            rhyme_g.selectAll('path')
            .data(lines)
            .enter()
            .append('path')
            .attr('stroke', 'black')
            .attr('stroke-width', 1)
            .attr('d', d=>{
                return normalLiner(d)
            })

            rhyme_g.selectAll('circle')
            .data(points)
            .enter()
            .append("circle")
            .attr('r', 2)
            .attr('fill', 'black')
            .attr('cx', d=> d.x)
            .attr('cy', d=> d.y)
        }
        // console.log(rhyme, word.text)
    }
    render() {
        const { word } = this.state
        const { onChange, parent } = this.props
        return (
            <div className={notes.has(word.text) ? 'input_per_note' : 'input_per_word'} style={{}}>
                <input type='text'
                    ref='input'
                    value={word.text}
                    onClick={(event) => {
                        event.currentTarget.select()
                        word.is_focus = true
                    }}
                    onKeyDown={(event) => {
                        word.is_focus = true
                        let keynum = window.event ? event.keyCode : event.which;
                        let keychar = String.fromCharCode(keynum);
                        // console.log(keynum)
                        if (keynum === 13 || keynum === 32) {
                            onChange()
                        }
                        if (keynum === 229 || keynum === 13 || keynum === 32) {
                            this.is_writeing_chn = true
                        }
                        if (keynum === 37) {
                            onChange()
                            parent.onGoLeft()
                            event.preventDefault()
                        }
                        if (keynum === 39) {
                            onChange()
                            parent.onGoRight()
                            event.preventDefault()
                        }
                        // if(keynum===8){
                        //     setTimeout(() => {
                        //         parent.onGoLeft()
                        //     }, 200);
                        // }
                        this.last_input_time = 300
                    }}
                    onChange={(event) => {
                        word.is_focus = true
                        const dom_elm = event.currentTarget
                        const { value } = dom_elm
                        if (!this.is_writeing_chn && /.*[A-Za-z]+.*/.test(value)) {
                            // 请不要输入英文和数字
                            // console.log('请不要输入英文和数字')
                            alert('请不要输入英文和数字')
                            return
                        }
                        word.text = value
                        this.setState({ word: word })
                        setTimeout(() => {
                            if (this.last_input_time <= 0 && onChange) {
                                onChange()
                            }
                        }, 301);
                    }}
                    onBlur={event => {
                        word.is_focus = false
                    }}
                />
                <svg style={{top: 37, left: -7, position: 'absolute'}} width={49} height={32}>
                    <g ref='backgroundLine'></g>
                    <g ref='rhyme'></g>
                </svg>
            </div>
        )
    }
}

// 处理平水韵
const word2yun = {}
const yuns = Object.keys(pingshuiyun)
const yun2simp_yun = {}
const yun2rhyme = {}
for(let yun in pingshuiyun){
    let words = pingshuiyun[yun].split('')
    pingshuiyun[yun] = words
    words.forEach(word=> {
        word2yun[word] = yun
    })
}
const rhymes = ['平', '上', '去', '入']
const replace_list = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '声', '平', '上', '去', '入']
yuns.forEach(yun=>{
    rhymes.forEach(elm=>{
        if(yun.indexOf(elm)!==-1){
            yun2rhyme[yun] = elm
        }
    })

    let simp_yun = yun
    replace_list.forEach(word=>{
        simp_yun = simp_yun.replace(word, '')
    })
    replace_list.forEach(word=>{
        simp_yun = simp_yun.replace(word, '')
    })
    yun2simp_yun[yun] = simp_yun
    return simp_yun
})

let word2cilin = {}
for(let bu in cilingzhengyun){
    const text = cilingzhengyun[bu].split('')
    text.forEach(word=>{
        word2cilin[word] = bu
    })
}

function analyzeWordTone(word){
    // console.log(word2yun[word], yun2simp_yun[word2yun[word]], yun2tone[yun2simp_yun[word2yun[word]]])
    return yun2tone[yun2simp_yun[word2yun[word]]]
}