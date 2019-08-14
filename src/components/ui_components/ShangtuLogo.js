import React from 'react';
import shangtu_logo from '../../static/上图logo.svg'

export default class ShangtuLogo extends React.Component {
    render(){
        return(
            <img style={{width: 300, top: 10, left: 10, position: 'absolute', zIndex: 100}} src={shangtu_logo} alt="上海图书馆"/>
        )
    }
}