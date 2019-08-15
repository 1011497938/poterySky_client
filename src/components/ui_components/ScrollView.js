import React from 'react';
// import juanzhou_left from '../../static/卷轴/卷轴左.png'
// import juanzhou_center from '../../static/卷轴/卷轴中.png'
// import juanzhou_right from '../../static/卷轴/卷轴右.png'
import delete_icon from '../../static/nav_icon/关闭.png'
import stateStore from '../../manager/stateManager';
import { autorun } from 'mobx';
import './ScrollView.css'
export default class ScrollView extends React.Component{
    constructor(props){
        super(props)
        let width = stateStore.windows_width.get()
        let height = stateStore.window_height.get()
        this.state = {
            width: width,
            height: height,
            show_children: false
        }
    }
    componentWillMount(){
        this.addScrollExpanMotion()
    }
    componentDidMount(){

    }
    addScrollExpanMotion(){
        const {width, height} = this.state
        this.onWindowSizeChange = autorun(()=>{
            let width = stateStore.windows_width.get()
            let height = stateStore.window_height.get()
            this.setState({width: width, height: height})
        })

        document.styleSheets[0].insertRule(
            '@keyframes keyframe_scroll_left {' +
                '0% {left:' + (width/2) +'px}' +
                '100% {left:'+ (width*0.1-20) + 'px}' +
            '}'
        )
        document.styleSheets[0].insertRule(
            '@keyframes keyframe_scroll_center {' +
                '0% {left:' + (width/2) +'px; width:' + 0 + 'px}' +
                '100% {left:'+ (width*0.1) + 'px; width:' + (width*0.8) + 'px}' +
            '}'
        )
        document.styleSheets[0].insertRule(
            '@keyframes keyframe_scroll_right {' +
                '0% {left:' + (width/2) +'px}' +
                '100% {left:' + (width*0.9-30) + 'px}' +
            '}'
        )
        document.styleSheets[0].insertRule(
            '.animate_scroll_left {'+
                'animation-name: keyframe_scroll_left;'+
                'animation-duration: 1s;'+
                'animation-timing-function: linear;'+
                'animation-iteration-count: 1;'+
                'animation-fill-mode: forwards;'+
            '}'
        )
        document.styleSheets[0].insertRule(
            '.animate_scroll_center {'+
                'animation-name: keyframe_scroll_center;'+
                'animation-duration: 1s;'+
                'animation-timing-function: linear;'+
                'animation-iteration-count: 1;'+
                'animation-fill-mode: forwards;'+
            '}'
        )
        document.styleSheets[0].insertRule(
            '.animate_scroll_right {'+
                'animation-name: keyframe_scroll_right;'+
                'animation-duration: 1s;'+
                'animation-timing-function: linear;'+
                'animation-iteration-count: 1;'+
                'animation-fill-mode: forwards;'+
            '}'
        )

        setTimeout(()=>{
            this.setState({show_children: true})
        }, 100)
    }

    handleClose(){
        const {onClose} = this.props
        if(onClose){
            onClose()
        }
    }
    render(){
        const {width, height} = this.state
        const scroll_width = width*0.6, scroll_height = height*0.6
        // console.log(width, height)
        return(
        <div style={{position: 'relative', width: '100%', height: '100%', }}>
            <div style={{position: 'relative', width: '100%', height: '100%', background: '#010101', zIndex: 100, opacity: 0.2}} onClick={this.handleClose.bind(this)}></div>
            <div className='scroll-left animate_scroll_left'
            style={{
                top: height*0.2, height: scroll_height+10, width: 50,
            }}/>

            <div className='scroll-center animate_scroll_center'
            style={{
                top: height*0.2, height: scroll_height, 
            }}>
                <img onClick={this.handleClose.bind(this)} src={delete_icon} style={{width: 20, position: 'absolute', right: 70, top: 20, cursor: 'pointer', zIndex: 9999}} alt=''/>
                {this.state.show_children && this.props.children}
            </div>
            <div className='scroll-right animate_scroll_right'
            style={{
                top: height*0.2, height: scroll_height+10, width: 50,
            }}/>
        </div>
        )
    }
}