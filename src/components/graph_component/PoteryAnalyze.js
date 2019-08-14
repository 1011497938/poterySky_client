import React from 'react';
import net_work from '../../manager/network';
import $ from 'jquery'
import * as d3 from 'd3';

export default class PoteryAnalyze extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            svg_width: 0,
            svg_height: 0,
        }
    }
    static defaultProps = { 
        width: '100%',
        height: '100%'
    }

    componentDidMount(){
        const potery_id = 'p_241844'
        net_work.require('getPoteryInfo', {potery_id: potery_id})
        .then(data=>{
            console.log(data)
            let {container, svg, potery_content} = this.refs
            const container_width = $(container).width(), container_height = $(container).height()
            // console.log(container_height, container_width)

            potery_content = d3.select(potery_content)

            this.setState({svg_height: container_height, svg_width: container_width})
        })
    }

    render(){
        const {width, height} = this.props
        const {svg_height, svg_width} = this.state
        return (
        <div style={{width: height, height: height, }} ref='container'>
            <svg width={svg_width} height={svg_height} ref='svg'>
                <g ref='potery_content'/>
            </svg>
        </div>
        )
    }
}