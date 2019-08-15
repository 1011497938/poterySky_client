
import React from 'react';
import * as d3 from 'd3';
import './WordBox.css'
import { notes, analyzeWordTone } from '../../manager/commonFunction';

const normalLiner = d3.line()
    .x(d => d.x)
    .y(d => d.y)
const sentiment2color = {
    '喜': '#ec5737',
    '怒': '#5d513b',
    '哀': '#163471',
    '乐': '#f0c239',
    '思': '#339999',
}

export default class WordBox extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    componentDidMount() {
        this.drawRhym()
    }
    componentDidUpdate() {
        this.drawRhym()
    }

    drawRhym() {
        const {sentiment} = this.props
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
        const { word } = this.props, word_length = word.split('').length
        // console.log(word.text.length)
        if (word_length > 1)
            return

        const rhyme_g = d3.select(this.refs.rhyme)
        const rhyme = analyzeWordTone(word)
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
            if (sentiment && sentiment[1] > 0.2)
                color = sentiment2color[sentiment[0]] || color
            // console.log(sentiment[0], sentiment[1], word.in_seg.word, )


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
        const { word, type, onClick, isSelected } = this.props
        let container_classname = ''
        let margin_class_name = ''
        if (notes.has(word)) {
            container_classname = 'box_per_note '
            margin_class_name = ''
        } else {
            container_classname = 'box_per_word ' + type
        }

        return (
            <div className={container_classname + margin_class_name} 
            // style={{background: isSelected? '#d4a366':'transprant' }}
            onClick={(event) => {
                if(onClick)
                    onClick()
            }}
            >
                <input type='text'
                    ref='input'
                    value={word}
                    disabled="disabled"
                />
                <svg style={{ position: 'relative', marginTop: 5 }} width={30} height={32}>
                    <g ref='backgroundLine'></g>
                    <g ref='rhyme'></g>
                </svg>
            </div>
        )
    }
}