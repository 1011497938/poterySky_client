import React from 'react';
import { autorun } from 'mobx';
import './PoteryInfo.css'
import net_work from '../../manager/network';
import PoteryAnalyze from '../graph_component/PoteryAnalyze';
export default class PoteryInfo extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            sentences: []
        }
    }
    componentDidMount(){
        // const potery_id = 'p_241844'
        // net_work.require('getPoteryInfo', {potery_id: potery_id})
        // .then(data=>{
        //     console.log(data)

        // })
    }

    render() {
        const {potery} = this.props
        return (
            <div style={{ position: 'relative', width: '90%', left:'5%',top: '4%',height: '92%', overflowX: 'hidden', overflowY: 'hidden', }}>
                <div className='scroll_container' style={{ position: 'relative', height: '100%',  overflowX: 'auto', overflowY: 'hidden' }}>
                    <PoteryAnalyze potery={potery}/>
                </div>
            </div>
        )
    }
}