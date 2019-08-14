import React from 'react';
import stateStore from '../manager/stateManager';
import { autorun, set } from 'mobx';
import Nav from './ui_components/Nav';
import background from '../static/宣纸背景.jpg'
import network from '../manager/network'
import './AuthorPage.css'
import net_work from '../manager/network';
import * as d3 from 'd3';
import ScrollView from './ui_components/ScrollView';
import AuthorInfo from './ui_components/AuthorInfo';


export default class AuthorPage extends React.Component {
    constructor(props) {
        super(props)
        let width = stateStore.windows_width.get()
        let height = stateStore.window_height.get()
        this.state = {
            width: width,
            height: height,
        }
    }

    componentDidMount() {
        this.onWindowSizeChange = autorun(() => {
            let width = stateStore.windows_width.get()
            let height = stateStore.window_height.get()
            this.setState({ width: width, height: height })
        })
        this.getDataAndDraw()
    }
    getDataAndDraw() {
        net_work.require('getSomeAuthors', {})
            .then(links => {
                const { width, height } = this.state
                // console.log(links)
                // links = links.slice(0, 20)
                let nodes = [], edges = [],names = new Set()
                links.forEach(link => {
                    names.add(link[0])
                    names.add(link[1])
                });
                nodes = [...names].map(elm=>{
                    return {
                        name: elm
                    }
                })
                links.forEach(link => {
                    edges.push({
                        source: nodes.findIndex(elm => link[0] === elm.name),
                        target: nodes.findIndex(elm => link[1] === elm.name),
                    })
                });
                // console.log(nodes)
                // console.log(nodes, edges)
                const forceSimulation = d3.forceSimulation(nodes)
                    .force("charge", d3.forceManyBody())
                    .force("link", d3.forceLink(edges))
                    .force("center", d3.forceCenter().x(width / 2).y(height / 2))
                    .tick(()=>{
                        console.log()
                    })
                    // .velocityDecay(0.1)

                const svg_container  = d3.select(this.refs.svg_container)
                const svg = d3.select(this.refs.svg)

                const normalLiner  = d3.line()
                .x(d=> d.x)
                .y(d=> d.y)
                // let lit_link = svg_container.selectAll(".lit_link")
                //     .data(edges)
                //     .enter()
                //     .append("path")
                //     .attr('class', "lit_link")
                //     .attr('stroke', 'black')
                //     .attr('stroke-width', 1)

                let author_circle =svg_container.selectAll(".author_circle")
                    .data(nodes)
                    .enter()
                    .append("circle")
                    .attr('class', "author_circle")
                    .attr('r', 10)
                    .attr('fill', '#9ea0b9')
                    // .on('mouseover', (value, event)=>{
                    //     console.log(value)
                    // })
                let author_text = svg_container.selectAll("author_text")
                .data(nodes)
                .enter()
                .append("text")
                .attr('class', "author_text")
                .text(d=> d.name)
                .attr('fill', 'black')
                .attr('text-anchor', 'middle')
                // .on('mouseover', (value, event)=>{
                //     console.log(value)
                // })



                svg.call(d3.zoom().on("zoom", function(){
                    svg_container.attr('transform',d3.event.transform)
                }))

                forceSimulation.on("tick", ()=>{
                    author_circle
                    .attr('cx', d=> d.x)
                    .attr('cy', d=> d.y)
                    author_text
                    .attr('x', d=> d.x+30)
                    .attr('y', d=> d.y-30)

                    // lit_link
                    // .attr('d', d=>{
                    //     return normalLiner([
                    //         d.source,
                    //         d.target
                    //     ])
                    // })
                })
            })
    }
    render() {
        const { width, height } = this.state
        return (
            <div className='author-page'>
                <ScrollView>
                    <AuthorInfo/>
                </ScrollView>
                <svg width={width} height={height} ref='svg'>
                    <g ref='svg_container'>

                    </g>
                </svg>
            </div>
        )
    }
}