import React from 'react';
import { autorun } from 'mobx';
import maobi_icon from '../../static/毛笔小.svg'
export default class SearchInput extends React.Component{
    render(){
        const input_width = 150, input_height = 25
        return(
            <div style={{position: "absolute", top: 32, right: 600,}}>
                <img style={{height: input_height-5, top: 4, left: 6, position: 'absolute', zIndex: 30}} src={maobi_icon} alt=""/>
                <input 
                className='input-div' 
                style={{
                    width: input_width, height: input_height, position: "absolute", background: 'white',
                    borderRadius: 5,  border: 0, outline: 'none',
                    fontSize: input_height-15, padding: "7.5px 30px", 
                    // boxShadow: 'rgb(136, 136, 136) 0px 5px 20px',
                    paddingLeft: input_height+12,
                    zIndex: 29
                }}
                />
            </div>
        )
    }
}