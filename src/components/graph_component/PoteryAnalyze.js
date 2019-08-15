import React from 'react';
import net_work from '../../manager/network';
import $ from 'jquery'
import * as d3 from 'd3';
import WordBox from './WordBox';
import { silkRibbonPathString } from '../../manager/commonFunction';

export default class PoteryAnalyze extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            svg_width: 0,
            svg_height: 0,
            data: {
                poet: '',
                potery_id: undefined,
                sentences: [],
                word2sentiment: {},
                selected_sentence: undefined
            }
        }
    }
    static defaultProps = {
        width: '100%',
        height: '100%'
    }

    componentDidMount() {
        const {potery} = this.props
        if(!potery)
            return
        net_work.require('analyzePotery', { pid: potery })
            .then(data => {
                // console.log(data)
                let { container, svg, potery_content } = this.refs
                const container_width = $(container).width(), container_height = $(container).height()

                this.setState({ 
                    svg_height: container_height, 
                    svg_width: container_width, 
                    data: data, 
                    selected_sentence: data.sentences[0]
                })
            })
        this.drawSimSentence()
    }
    componentDidUpdate(){
        this.drawSimSentence()
    }
    drawSimSentence(){
        const {selected_sentence, data} = this.state
        const {sentences} = data
        const {true_height, true_width} = this
        if(!selected_sentence)
            return
        let { container, svg, potery_content } = this.refs
        potery_content = d3.select(potery_content)
        svg = d3.select(svg)
        svg.selectAll('path').remove()
        svg.selectAll('text').remove()
        const selected_sentence_index = sentences.findIndex(elm=> elm===selected_sentence),
              selected_sentence_y = selected_sentence_index * 100 + 110,
              sim_sentence = selected_sentence[5],
              selected_sentence_x = true_width-490 //this.getSentenceLength(selected_sentence)*43
        
        const calSimY = index => {
            let top =  50 + selected_sentence_y - sim_sentence.length/2*30
            let end = (sentences.length-1)*30 + 50 + selected_sentence_y - sim_sentence.length/2*30
            let y = index*100+50 + selected_sentence_y - sim_sentence.length/2*30

            // debugger
            if(top<50){
                return y + (50-top)
            }  
            if(end>true_height){
                return y - (end-true_height)
            }
            return y
        }
        svg.selectAll('.sim_sentnece_text')
        .data(sim_sentence)
        .enter()
        .append("text")
        .attr('class', "sim_sentnece_text")
        .text(d=> d[2])
        .attr('fill', 'black')
        .attr('text-anchor', 'start')
        .attr('x', (d,index)=> true_width - 400)
        .attr('y', (d,index)=> calSimY(index))
        .style('cursor', 'pointer')
        .on('mouseover', (value, event)=>{
        })
        .on('mouseout', (value, event)=>{
        })
        .on('click', value=>{
            const poet_id = data.poet
            const sim_potery = sim_sentence[2]
            console.log(value)
        })

        const normalLiner = d3.line()
        .x(d => d[0])
        .y(d => d[1])
        svg.append('path')
        .attr('stroke', '#9d6737')
        .attr('stroke-width', 4)
        .attr('fill', 'None')
        .attr('d', normalLiner([
            [0, selected_sentence_y],
            [selected_sentence_x, selected_sentence_y],
        ]))

        svg.selectAll('.link')
        .data(sim_sentence)
        .enter()
        .append("path")
        .attr('stroke', '#9d6737')
        .attr('stroke-width', 4)
        .attr('fill', 'None')
        .attr('class', 'lallalall')
        .attr('d', (d,index)=> silkRibbonPathString(
            selected_sentence_x, selected_sentence_y,
            true_width - 400, calSimY(index),
            0.5
        ))

        // console.log(selected_sentence)
    }

    getSentenceLength(sentence){
        return sentence[3].join('').split('').length
    }
    render() {
        const { width, height } = this.props
        const { svg_height, svg_width, data, selected_sentence } = this.state
        const {sentences, word2sentiment} = data

        let true_height = Math.max(...[100*(sentences.length)+2, 800]), 
            true_width = Math.max(...sentences.map(elm=> elm[3].join('').split('').length)) * 46 + 100 + 400
        true_width = isNaN(true_width)||true_width===Infinity? 700: true_width
        // true_height = true_height>800?true_height:true_height
        this.true_width = true_width
        this.true_height = true_height
        return (
            <div style={{ width: true_width, height: height, overflowY: 'auto', position: 'absolute'}} ref='container'>
                <div style={{zIndex: 2001,height: true_height, position: 'relative', width: true_width-390}}>
                {
                    sentences.map((sentence, sentence_index) => {
                        // console.log(sentence)
                        return (
                            <div key={sentence_index} 
                                style={{position: 'absolute', left: 0, top: sentence_index*100, cursor: 'pointer'}}
                                onClick={()=>{
                                    this.setState({selected_sentence: sentence})
                                }}
                            >
                                {
                                    sentence[3].map((word, index) => {
                                        const chars = word.split('')
                                        const sentiment = word2sentiment[word]
                                        let type = 'no_seg'
                                        if(chars.length>1){
                                            if(index===0)
                                                type = 'seg_left'
                                            else if(index===chars.length-1)
                                                type = 'seg_right'
                                            else
                                                type = 'seg_center'
                                        }
                                        return chars.map((char, index)=>{
                                            return <WordBox sentiment={sentiment} key={index} word={char} type={type} isSelected={sentence===selected_sentence}
                                                        // ref={(selected_sentence===sentence)&&(index===char.length-1)?'last':undefined}
                                                    />
                                        })
                                    })
                                }
                            </div>
                        )
                    })
                }
                </div>
                <svg className='水水水水' width={true_width-50} height={true_height} ref='svg' 
                    style={{zIndex: 2000,position: 'absolute', top: 0, left: 0}}>
                    <g ref='potery_content' />
                </svg>
            </div>
        )
    }
}