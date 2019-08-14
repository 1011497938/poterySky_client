import React from 'react';
import stateStore from '../manager/stateManager';
import { autorun } from 'mobx';

const start_time = -900, end_time = 2000
export default class PoteryXTime extends React.Component{
    constructor(props) {
        super(props)
        this.state = {
            width: stateStore.windows_width.get(),
            height: stateStore.window_height.get(),
            data: {}
        }
    }
    componentDidMount(){
        const {data} = this.state
    }
    render(){
        const {width, height} = this.state
        return (
            <svg width={width} height={height}>
                {/* 用来画删山 */}
                <svg/>
            </svg>
        )
    }
}