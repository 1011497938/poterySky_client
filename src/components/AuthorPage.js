import React from 'react';
import stateStore from '../manager/stateManager';
import { autorun, set } from 'mobx';
import Nav from './ui_components/Nav';
import network from '../manager/network'
import './AuthorPage.css'
import net_work from '../manager/network';
import * as d3 from 'd3';
import ScrollView from './ui_components/ScrollView';
import AuthorInfo from './ui_components/AuthorInfo';
import { silkRibbonPathString, ribbonPathString, arcLine } from '../manager/commonFunction';


export default class AuthorPage extends React.Component {
    constructor(props) {
        super(props)
        let width = stateStore.windows_width.get()
        let height = stateStore.window_height.get()
        this.state = {
            width: width,
            height: height,
            select_author: undefined,
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
            .then(data => {
                const {potery_reltions, social_relations, author2rank} = data
                const { width, height } = this.state
                // console.log(potery_reltions, social_relations, author2rank)
                // links = links.slice(0, 20)
                let nodes = [], edges = [], names = new Set()
                let all_relations = [...potery_reltions,...social_relations]
                all_relations.forEach(link => {
                    names.add(link[0])
                    names.add(link[1])
                });
                nodes = [...names].map(elm=>{
                    return {
                        name: elm,
                        rank: author2rank[elm],
                    }
                })
                const max_rank = Math.max(...nodes.map(elm=> elm.rank)), min_rank = Math.min(...nodes.map(elm=> elm.rank))
                social_relations.forEach(link => {
                    edges.push({
                        source: nodes.findIndex(elm => link[0] === elm.name),
                        target: nodes.findIndex(elm => link[1] === elm.name),
                        link_type: 'social'
                    })
                });
                // console.log(new Set(social_relations.map(elm=> elm[2])))
                potery_reltions.forEach(link => {
                    edges.push({
                        source: nodes.findIndex(elm => link[0] === elm.name),
                        target: nodes.findIndex(elm => link[1] === elm.name),
                        link_type: 'potery'
                    })
                });
                // console.log(nodes)
                // console.log(nodes, edges)
                const forceSimulation = d3.forceSimulation(nodes)
                    .force("charge", d3.forceManyBody().distanceMin([100]) )
                    .force("link", d3.forceLink(edges))
                    .force("center", d3.forceCenter().x(width / 2).y(height / 2))
                    // .tick(()=>{
                    //     console.log()
                    // })
                    .force("collision",d3.forceCollide(60))
                    // .velocityDecay(0.2) 
                    // .velocityDecay(0.1)

                const svg_container  = d3.select(this.refs.svg_container)
                const svg = d3.select(this.refs.svg)
                svg_container.selectAll().remove()

                const normalLiner  = d3.line()
                .x(d=> d.x)
                .y(d=> d.y)

                let lit_link = svg_container.selectAll(".lit_link")
                    .data(edges.filter(elm=> elm.link_type==='social'))
                    .enter()
                    .append("path")
                    .attr('class', "lit_link")
                    .attr('stroke', 'black')
                    .attr('stroke-width', 1)
                    .attr('fill', 'None')
                
                let author_circle =svg_container.selectAll(".author_circle")
                    .data(nodes)
                    .enter()
                    .append("circle")
                    .attr('class', d => "author_circle author_circle" + d.name)
                    .attr('r', d=> (d.rank-min_rank)/(max_rank-min_rank)*10+3)
                    .attr('fill', 'black')
                    .style('cursor', 'pointer')
                    .on('mouseover', (value, event)=>{
                        const circle = svg_container.select('.author_circle' + value.name)
                        circle.attr('r', 14)
                    })
                    .on('mouseout', (value, event)=>{
                        const circle = svg_container.select('.author_circle' + value.name)
                        circle.attr('r', d=> (d.rank-min_rank)/(max_rank-min_rank)*10+3)
                    })
                    .on('click', value=>{
                        // console.log(value)
                        this.setState({select_author: value.name})
                    })

                let author_text = svg_container.selectAll(".author_text")
                .data(nodes)
                .enter()
                .append("text")
                .attr('class', "author_text")
                .text(d=> d.name)
                .attr('fill', 'black')
                .attr('text-anchor', 'middle')
                .style('cursor', 'pointer')
                .on('mouseover', (value, event)=>{
                    const circle = svg_container.select('.author_circle' + value.name)
                    circle.attr('r', 14)
                })
                .on('mouseout', (value, event)=>{
                    const circle = svg_container.select('.author_circle' + value.name)
                    circle.attr('r', d=> (d.rank-min_rank)/(max_rank-min_rank)*10+3)
                })
                .on('click', value=>{
                    this.setState({select_author: value.name})
                })

                let author_checkbox = svg_container.selectAll(".author_checkbox")
                .data(nodes)
                .enter()
                .append("foreignObject")
                .attr('class', "author_checkbox")
                .attr("width", 15)
                .attr("height", 15)
                author_checkbox
                .append("xhtml:body")
                .attr('class', "author_checkbox")
                .html(d => "<input class='author-checkbox' type=checkbox id=" + d.name +"/>");

                svg.call(d3.zoom().on("zoom", function(){
                    svg_container.attr('transform',d3.event.transform)
                }))

                forceSimulation.on("tick", ()=>{
                    author_circle
                    .attr('cx', d=> d.x)
                    .attr('cy', d=> d.y)

                    author_text
                    .attr('x', d=> d.x+15)
                    .attr('y', d=> d.y-15)

                    author_checkbox
                    .attr('x', d=> d.x+15)
                    .attr('y', d=> d.y-15)

                    lit_link
                    .attr('d', d=> arcLine(d))
                })
            })
    }

    onModelClose(){
        this.setState({select_author: undefined})
    }
    render() {
        let { width, height, select_author } = this.state
        select_author = '苏轼'
        return (
            <div className='author-page'>
                {
                select_author && 
                <ScrollView onClose={this.onModelClose.bind(this)}>
                    <AuthorInfo author={select_author}/>
                </ScrollView>
                }
                <svg width={width} height={height} ref='svg'>
                    <g ref='svg_container'>

                    </g>
                </svg>
            </div>
        )
    }
}