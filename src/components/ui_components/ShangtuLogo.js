import React from 'react';
import shangtu_logo from '../../static/上图logo.png'

export default class ShangtuLogo extends React.Component {
    render(){
        return(
            <img style={{height: 30, top: 30, left: 10, position: 'absolute', zIndex: 100}} src={shangtu_logo} alt="上海图书馆"/>
        )
    }
}