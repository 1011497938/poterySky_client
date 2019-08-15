import React from 'react';
import stateStore from '../manager/stateManager';
import { autorun } from 'mobx';
import network from '../manager/network'
import deepcopy from 'deep-copy'
import './PoteryPage.css'
import $ from 'jquery'
import ScrollView from './ui_components/ScrollView';
import PoteryInfo from './ui_components/PoteryInfo';
import { unwatchFile } from 'fs';

const font_size = 18
const max_stage_nums = 3
const stage_dist = 10

export default class PoteryPage extends React.Component {
    constructor(props) {
        super(props)
        let width = stateStore.windows_width.get()
        let height = stateStore.window_height.get()
        this.state = {
            width: width,
            height: height,
            potery_stages: [],   //数组
            select_potery: undefined,
        }
        this.top_stage_index = 0
        this.stage_pointer = 0
    }

    addPoteries() {
        const { potery_stages } = this.state

        const arrangePosition = poteries => {
            // 去掉同层的遮挡
            poteries = poteries.sort((a, b) => a.x - b.x)
            poteries.forEach((elm, index) => {
                if (index === 0)
                    return
                const former = poteries[index - 1]
                const x = elm.x, former_x = former.x + font_size
                if (former_x > x) {
                    elm.x = former_x + Math.random() * 3
                }
            })
        }

        network.require('getSomePoteries', {})
            .then(potery_stages => {
                const { width, height } = this.state
                potery_stages = potery_stages.map((arr, index) => {
                    let poteries = arr.map(elm => {
                        const [id, content] = elm
                        const x = Math.random() * width, //*0.9+width*0.05,
                            y = Math.random() * height * 3 - height

                        document.styleSheets[0].insertRule(
                            '@keyframes keyframe_' + id + '{' +
                            '0% {transform:translateY(' + (-height).toString() + 'px)}' +
                            '100% {transform:translateY(' + (height - y).toString() + 'px)}' +
                            '}'
                        )
                        document.styleSheets[0].insertRule(
                            '.animate' + id + '{' +
                            'animation-name: keyframe_' + id + ';' +
                            'animation-duration: ' + (Math.random() * 15 + 20).toString() + 's;' +
                            'animation-timing-function: linear;' +
                            'animation-iteration-count: infinite;' +
                            '}'
                        )
                        return {
                            id: id,
                            content: content,
                            x: x,
                            y: y,
                            height: content.split('').length * font_size + 10,
                            speed: Math.random() / 2 + 0.5,
                            _show: true
                        }
                    })

                    potery_stages.push(poteries)
                    arrangePosition(poteries)
                    return {
                        poteries: poteries,
                        z: (index + 1) * stage_dist,
                    }
                })
                potery_stages.forEach((elm, index) => {
                    let poteries = [...elm.poteries]
                    for (let i = 1; i < 10; i++) {
                        const next = potery_stages[index + i]
                        if (next)
                            poteries = [...poteries, ...next.poteries]
                    }
                    arrangePosition(poteries)
                })
                this.setState({ potery_stages: potery_stages })
            })
    }

    componentDidMount() {
        this.onWindowSizeChange = autorun(() => {
            let width = stateStore.windows_width.get()
            let height = stateStore.window_height.get()
            this.setState({ width: width, height: height })
        })
        this.addPoteries()
        this.animate()
    }

    animate() {
        // 前进有问题
        // const move = ()=>{
        //     const {width, height, potery_stages, top_stage_index} = this.state
        //     potery_stages.forEach(elm=>{
        //         const {poteries, z} = elm
        //         elm.z -= 10 //前移速度
        //         if(elm.z<0){
        //             elm.z += stage_dist*potery_stages.length
        //         }
        //     })
        //     this.setState({potery_stages:potery_stages})
        // }
        // var moveInterview = setInterval(move, 3000)
    }
    handleClickPotery(data) {
        // console.log(data)
        this.setState({ select_potery: data })
    }
    handleScrollClose(){
        this.setState({select_potery: undefined})
    }
    render() {
        const { width, height, potery_stages, select_potery } = this.state

        return (
            <div className='potery-page'>
                {
                    select_potery && (
                        <ScrollView onClose={this.handleScrollClose.bind(this)}>
                            <PoteryInfo potery={select_potery.id} />
                        </ScrollView>
                    )
                }
                {
                    potery_stages.map((elm, stage_index) => {
                        const { poteries, z } = elm
                        const opacity = (potery_stages.length * stage_dist - z) / potery_stages.length / stage_dist
                        // if(opacity<0.3){
                        //     return undefined
                        // }
                        return (
                            <div key={stage_index} className='stage' style={{ opacity: opacity, }} >
                                {
                                    poteries.map((elm, potery_index) =>
                                        <Sentence key={potery_index} data={elm} z={z} onClick={this.handleClickPotery.bind(this)} />
                                    )
                                }
                            </div>
                        )
                    })
                }

            </div>
        )
    }
}

class Sentence extends React.Component {
    constructor(props) {
        super()
        this.state = {

        }
    }
    static defaultProps = {
        onClick: () => { }
    }
    componentDidMount() {
        // const move = ()=>{
        //     const {container} = this.refs
        //     const {data, z} = this.props
        //     // console.log(container)
        //     let {top} = container.style
        //     container.style.top = (parseFloat(top.replace('px','')) + data.speed*10) + 'px'
        //     // console.log(container.style.top)
        // }
        // const moveInterview = setInterval(move, 10)
    }
    render() {
        const { data, z, onClick } = this.props
        const { x, y, content, id } = data
        const size = font_size * (1 - 0.005 * z)
        const words = content.split(''),
            words_num = words.length,
            opacity_k = words_num > 0 ? (1 / words_num) : 1

        return (
            <div ref='container' style={{ left: x, top: y, cursor: 'pointer' }} className={'sentence animate'+ id}  //
                onClick={() => {
                    // console.log(data)
                    onClick(data)
                }}>
                {words.map((word, index) => {
                    const opacity = opacity_k * index * 0.6 + 0.4 //+0.4*(1-z)
                    return (
                        <span key={index} className='word' style={{ opacity: opacity, }}>
                            {word}
                        </span>
                    )
                })}
            </div>
        )
    }
}