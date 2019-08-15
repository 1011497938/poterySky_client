import React from 'react';
import stateStore from '../manager/stateManager';
import { autorun, observable } from 'mobx';
import './WritePotery.css'
import $ from 'jquery'
import net_work from '../manager/network';
import * as d3 from 'd3';
import deepcopy from 'deep-copy'
import { List } from 'semantic-ui-react'
import yun_left from '../static/背景云1.svg'
import yun_right from '../static/背景云2.svg'
import title from '../static/标题/为你写诗.png'
import { analyzeWordTone } from '../manager/commonFunction';

const normalLiner = d3.line()
    .x(d => d.x)
    .y(d => d.y)
let auto_word_id = 0
const notes = new Set(',.。，、＇：∶；?‘’“”〝〞ˆˇ﹕︰﹔﹖﹑·¨….¸;！´？！～—ˉ｜‖＂〃｀@﹫¡¿﹏﹋﹌︴々﹟#﹩$﹠&﹪%*﹡﹢﹦﹤‐￣¯―﹨ˆ˜﹍﹎+=<­­＿_-\ˇ~﹉﹊（）〈〉‹›﹛﹜『』〖〗［］《》〔〕{}「」【】︵︷︿︹︽_﹁﹃︻︶︸﹀︺︾ˉ﹂﹄︼'.split(''))
let word2info = {}
let predict = []

class Word {
    constructor(text, sentence, ) {
        this.id = auto_word_id++
        this.text = text
        this.next_is_conn = false
        this.former_is_conn = false
        this.sentence = sentence
        this.is_focus = false

        this.in_seg = undefined   //在那个分词里面
        this.seg_index = 0 //分词中的位置
    }

    calInSeg() {
        let { text, } = this, text_num = text.split('').length
        if (text_num) {

        }
    }
}
const unvalid_char = [' ', '', '1', '2', '3', '4', '5', '6', '7', '8', '9']
const sentiment2color = {
    '喜': '#ec5737',
    '怒': '#5d513b',
    '哀': '#163471',
    '乐': '#f0c239',
    '思': '#339999',
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
            title: '',
            recommand_list: [],
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


    checkWordValid(word) {
        return !unvalid_char.includes(word.text)
    }
    adjustInput() {
        // console.log(this, 'change')
        let { checkWordValid } = this
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
            new_sentence = new_sentence.filter(elm => elm && ((checkWordValid(elm)) || elm.is_focus))
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
        return new_sentences
    }
    onPoteryChange() {
        let new_sentences = this.adjustInput()
        this.setState({ sentences: new_sentences })

        setTimeout(() => {
            if (this.last_input_time <= 0) {
                net_work.require('analyzePotery', { content: this.getText() })
                    .then(data => {
                        // console.log(data)
                        const { words } = data
                        for (let word in words) {
                            words[word].word = word
                        }
                        word2info = words
                        predict = data.predict
                        let seg_words = Object.keys(word2info)
                        let sentences = this.adjustInput()

                        // 找到字在哪个词中
                        sentences.forEach(sentence => {
                            sentence.forEach((word, start) => {
                                word.in_seg = undefined
                            })
                            // 还要判断下是不是正在输入
                            sentence.forEach((word, start) => {
                                if (word.in_seg) {
                                    return
                                }
                                for (let end = sentence.length; end > start; end--) {
                                    const sub_sentence = sentence.slice(start, end)
                                    const sub_content = sub_sentence.map(elm => elm.text).join('')
                                    // console.log(sub_content, seg_words)
                                    let seg_word = seg_words.find(elm => elm === sub_content)
                                    if (seg_word) {
                                        seg_word = deepcopy(word2info[seg_word])
                                        for (let index = start; index < end; index++) {
                                            sentence[index].in_seg = seg_word
                                            sentence[index].seg_index = index - start
                                        }
                                    }
                                }
                            })
                        })
                        this.setState({ sentences: sentences })
                        // setTimeout(this.onFocusChange.bind(this), 10)
                    })
            }
        }, 201)
        this.last_input_time = 200
    }

    getText() {
        const { sentences } = this.state
        let content = ''
        sentences.forEach(sentence => {
            sentence.forEach(word => {
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

    onFocusChange() {
        const { sentences, recommand_list } = this.state
        // console.log(recommand_list)
        let new_recommand_list = []
        sentences.forEach(sentence => {
            sentence.forEach(word => {
                if (word.is_focus && word.in_seg) {
                    new_recommand_list = word.in_seg.sim
                }
                // else{
                //     if(word.text===''){
                //         new_recommand_list = predict
                //     }
                // }
            })
        })
        // console.log(recommand_list)
        if (recommand_list !== new_recommand_list)
            this.setState({ recommand_list: new_recommand_list })
    }
    render() {
        const { width, height, sentences, recommand_list } = this.state

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
                <img style={{ height: 300, top: '30%', left: '5%', position: 'absolute', zIndex: 1 }} src={title} alt="" />
                <img style={{ width: 500, top: 100, left: 0, position: 'absolute', zIndex: 0 }} src={yun_left} alt="" />
                <img style={{ width: 500, top: 100, right: 0, position: 'absolute', zIndex: 0 }} src={yun_right} alt="" />
                {/* <ScrollView>
                </ScrollView> */}
                <div style={{ position: 'absolute', width: '21%', height: '50%', top: 130, right: "2%", overflowY: 'auto' }}>
                    <List celled selection verticalAlign='middle'>
                        {
                            recommand_list.map((elm, index) => {
                                return (
                                    <List.Item key={index}>
                                        <List.Content>
                                            <span>{elm}</span>
                                        </List.Content>
                                    </List.Item>
                                )
                            })
                        }
                    </List>
                </div>
                <div style={{ position: 'absolute', top: 100, left: '25%', width: '50%', height: 550, overflow: 'auto' }}>
                    {
                        sentences.map((sentence, index) => {
                            // console.log(sentence)
                            return (
                                <div className='input_per_sentence' style={{ top: index * 80, width: sentence.length * 50 }} key={index}>
                                    {
                                        sentence.map((word, index) => {
                                            return (
                                                <InputBox word={word} key={index} onChange={this.onPoteryChange.bind(this)} parent={this} onFocusChange={this.onFocusChange.bind(this)} />
                                            )
                                        })
                                    }
                                </div>
                            )
                        })
                    }
                </div>
                <button
                    style={{
                        width: 100, background: '#795548', left: width / 2 - 25, 
                        bottom: 50, position: "absolute", border: 0,
                        borderRadius: 5, height: 25, color: 'white'
                    }}>
                    提交
                </button>
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
    drawRhym() {
        let line_ys = [30, 23, 16, 9, 2]
        const backgroundLine = d3.select(this.refs.backgroundLine)
        backgroundLine.selectAll('path')
            .data(line_ys.map(elm => [
                { x: 0, y: elm },
                { x: 60, y: elm },
            ]))
            .enter()
            .append('path')
            .attr('stroke', 'gray')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '2,2')
            .attr('d', d => {
                return normalLiner(d)
            })
        const { word } = this.state, word_length = word.text.split('').length
        // console.log(word.text.length)
        if (word_length > 1)
            return

        const rhyme_g = d3.select(this.refs.rhyme)
        const rhyme = analyzeWordTone(word.text)
        const rhyme2point = [
            [[0, 4], [1, 4]],
            [[0, 2], [1, 4]],
            [[0, 1], [0.25, 0], [1, 4]],
            [[0, 4], [1, 0]],
        ].map(points => {
            return points.map(point => {
                return {
                    x: point[0] * 24 + 3,
                    y: line_ys[point[1]]
                }
            })
        })
        const points = rhyme2point[rhyme - 1]
        rhyme_g.selectAll('path').remove()
        rhyme_g.selectAll('circle').remove()
        if (points) {
            let lines = []
            points.forEach((point, index) => {
                if (points[index + 1])
                    lines.push([point, points[index + 1]])
            })
            // console.log(lines, rhyme, points)

            let color = 'black'
            if (word.in_seg) {
                let { sentiment } = word.in_seg
                if (sentiment && sentiment[1] > 0.2)
                    color = sentiment2color[sentiment[0]] || color
                // console.log(sentiment[0], sentiment[1], word.in_seg.word, )
            }

            rhyme_g.selectAll('path')
                .data(lines)
                .enter()
                .append('path')
                .attr('stroke', color)
                .attr('stroke-width', 1)
                .attr('d', d => {
                    return normalLiner(d)
                })

            rhyme_g.selectAll('circle')
                .data(points)
                .enter()
                .append("circle")
                .attr('r', 2)
                .attr('fill', color)
                .attr('cx', d => d.x)
                .attr('cy', d => d.y)
        }
        // console.log(rhyme, word.text)
    }
    render() {
        const { word } = this.state
        const { onChange, parent, onFocusChange } = this.props
        // console.log(word)
        let container_classname = ''
        let margin_class_name = ''
        if (notes.has(word.text)) {
            container_classname = 'input_per_note '
            margin_class_name = ''
        } else {
            container_classname = 'input_per_word '
            if (word.in_seg) {
                const { seg_index } = word
                if (seg_index === 0) {
                    margin_class_name = 'seg_left'
                } else if (seg_index === word.in_seg.word.split('').length - 1) {
                    margin_class_name = 'seg_right'
                } else {
                    margin_class_name = 'seg_center'
                }
            } else {
                margin_class_name = 'no_seg'
            }
        }

        return (
            <div className={container_classname + margin_class_name} style={{}}>
                <input type='text'
                    ref='input'
                    value={word.text}
                    onClick={(event) => {
                        event.currentTarget.select()
                        word.is_focus = true
                        onFocusChange()
                    }}
                    onKeyDown={(event) => {
                        word.is_focus = true
                        onFocusChange()
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
                        if (keynum === 8) {
                            if (word.text === '')
                                parent.onGoLeft()
                        }
                        this.last_input_time = 300
                    }}
                    onChange={(event) => {
                        onFocusChange()
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
                <svg style={{ position: 'relative', marginTop: 5 }} width={30} height={32}>
                    <g ref='backgroundLine'></g>
                    <g ref='rhyme'></g>
                </svg>
            </div>
        )
    }
}