import React from 'react';
import stateStore from '../manager/stateManager';
import { autorun } from 'mobx';

import background from '../static/搜索页/background.svg'
import mao_bi_icon from '../static/毛笔.svg'
import yun_left from '../static/背景云1.svg'
import yun_right from '../static/背景云2.svg'
import Nav from './ui_components/Nav';
import ShangtuLogo from './ui_components/ShangtuLogo';

export default class SearchPage extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            width: stateStore.windows_width.get(),
            height: stateStore.window_height.get()
        }
    }
    componentDidMount(){
        this.onWindowSizeChange = autorun(()=>{
            let width = stateStore.windows_width.get()
            let height = stateStore.window_height.get()
            this.setState({width: width, height: height})
        })
    }
    render(){
        const {width, height} = this.state
        // console.log(height, width)

        const input_width = 650, input_height = 40
        
        return (
        <div style={{
            width: '100%', height: '100%', position: 'relative', 
            backgroundImage: 'url(' + background + ')',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center 0',
            backgroundSize: 'cover'
        }}>
            <div style={{position: "absolute", top: height/2-input_height/2, left: width/2-input_width/2,}}>
                <img style={{height: input_height-10, top: 15, left: 10, position: 'absolute', zIndex: 30}} src={mao_bi_icon} alt=""/>
                <input 
                className='input-div' 
                style={{
                    width: input_width, height: input_height, position: "absolute", background: 'white',
                    borderRadius: 10,  border: 0, outline: 'none',
                    fontSize: input_height-15, padding: "7.5px 30px", 
                    boxShadow: 'rgb(136, 136, 136) 0px 5px 20px',
                    paddingLeft: input_height+30,
                    zIndex: 29
                }}
                />
            </div>
            <img style={{width: 500, top: 10, left: 0, position: 'absolute', zIndex: 0}} src={yun_left} alt=""/>
            <img style={{width: 300, top: 300, right: 0, position: 'absolute', zIndex: 0}} src={yun_right} alt=""/>
        </div>
        )
    }
}
