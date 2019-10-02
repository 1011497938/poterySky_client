import React from 'react';
import { autorun } from 'mobx';
import './PoteryInfo.css'
import net_work from '../../manager/network';
import author_png from '../../static/author.png'
import './AuthorInfo.css'
import { List, Menu } from 'semantic-ui-react'
import PoteryAnalyze from '../graph_component/PoteryAnalyze';
import shiciliebiao from '../../static/标题/著述.png'
// import guanxiwang from '../../static/标题/关系网.png'
import shitu from '../../static/标题/士官.png'

export default class AuthorInfo extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            BasicInfo: {},
            poteries: [],
            events: [],
            PersonAddresses: {},
            PersonAliases: [],

            show_potery: true
        }
    }
    componentDidMount() {
        // const {author} = this.props
        const author = '苏轼'
        net_work.require('getAuthorInfo', { author_id: author })
            .then(data => {
                // console.log(data)
                const { poteries, msg } = data
                if (msg) {
                    this.setState({
                        poteries: poteries,
                        BasicInfo: { ChName: author }
                    })
                    return
                }
                console.log(data)
                const person = data.Package.PersonAuthority.PersonInfo.Person
                const {
                    BasicInfo, PersonAddresses, PersonAliases, PersonEntryInfo, PersonKinshipInfo,
                    PersonSocialAssociation, PersonSocialStatus, PersonSources, PersonTexts, PersonPostings
                } = person
                console.log(person)

                this.setState({
                    poteries: poteries,
                    PersonAddresses: PersonAddresses,
                    BasicInfo: BasicInfo,
                    PersonAliases: PersonAliases,
                })
            })
    }

    render() {
        const { poteries, BasicInfo, PersonAddresses, PersonAliases, show_potery} = this.state
        const items = [
            { key: '诗词', active: true, name: '诗词' },
            { key: '著作', name: '著作' },
        ]
        return (
            <div style={{ position: 'relative', width: '90%', left: '5%', top: '2.5%', height: '92%', overflowX: 'auto', overflowY: 'hidden' }}>
                <div className='scroll_container' style={{ position: 'relative', width: 3000, height: '100%', overflowX: 'hidden', overflowY: 'hidden' }}>
                    {/* 基本信息 */}
                    <div style={{ position: 'relative', width: 300, height: '100%', float: 'left', marginRight: 30 }}>
                        <img src={author_png} style={{ top: '28%', left: 0, maxHeight: '50%', maxWidth: 80, position: 'absolute', float: 'left' }} alt='词人画像' />
                        <div style={{ position: 'absolute', top: '40%', textAlign: 'left', writingMode: 'vertical-lr', left: 130, fontSize: 35 }}>{BasicInfo.ChName}</div>
                        <span style={{ position: 'absolute', top: '28%', textAlign: 'left', left: 172, fontSize: 10 }}>
                            <span className='basic-row' style={{ top: 0 }}><span className='basic-key'>姓名:</span>{BasicInfo.ChName}</span>
                            <span className='basic-row' style={{ top: 20 }}><span className='basic-key'>朝代:</span>{BasicInfo.Dynasty}</span>
                            {/* <span className='basic-row' style={{}}><span className='basic-key'>民族:</span>{}</span> */}
                            <span className='basic-row' style={{ top: 40 }}><span className='basic-key'>籍贯:</span>{PersonAddresses.Address && PersonAddresses.Address.AddrName}</span>
                            <span className='basic-row' style={{ top: 60 }}><span className='basic-key'>生卒:</span>{(BasicInfo.YearBirth || '') + '-' + (BasicInfo.YearDeath || '')}</span>
                            <span className='basic-row' style={{ top: 80 }}><span className='basic-key'>性别:</span>{BasicInfo.Gender === '0' ? '男' : '女'}</span>
                            <span className='basic-row' style={{ top: 100 }}>
                                <span className='basic-key'>别名:</span>
                                {PersonAliases.Alias && PersonAliases.Alias.map(elm => elm.AliasName + '(' + elm.AliasType + ')').join(',')}
                            </span>
                        </span>
                    </div>
                    <div style={{ position: 'relative', width: 100, height: '100%', float: 'left' }}>
                        <img src={shiciliebiao} style={{width: 50, top: 100, position: 'absolute'}} alt=''/>
                    </div>

                    {/* 诗词列表 */}
                    <div style={{ position: 'relative', width: 250, height: '87%', marginTop: '1%', float: 'left'}}>
                        <Menu widths={3} style={{ background: '#9e7448', border: 'none', height: 6, minHeight: 0}}>
                            <Menu.Item name='诗词' onClick={()=>{ this.setState({show_potery: true})}} style={{height: 6, width: 125, background: show_potery? '#9e7448': '#bc9d7b' }}/>
                            <Menu.Item name='著作' onClick={()=>{this.setState({show_potery: false})}} style={{height: 6, width: 125, background: show_potery? '#bc9d7b' :'#9e7448'}}/>
                        </Menu>
                        <div style={{ position: 'relative', width: 250, height: '90%', float: 'left', overflowY: 'auto', marginTop: 17 }}>
                            <List celled selection verticalAlign='middle'>
                                {
                                    poteries.map((elm, index) => {
                                        return (
                                            <List.Item key={index}>
                                                <List.Content>
                                                    <span>{elm[1] && elm[1].substring(0, 30)}</span>
                                                </List.Content>
                                            </List.Item>
                                        )
                                    })
                                }
                            </List>
                        </div>


                    </div>

                    {/* 著作 */}
                    <div style={{ position: 'relative', height: '97%', float: 'left', marginLeft: 30 }}>
                        <PoteryAnalyze potery={'p_1345'}/>
                    </div>

                    <div style={{ position: 'relative', width: 100, height: '100%', float: 'left' }}>
                        <img src={shitu} style={{width: 50, top: 100, position: 'absolute'}} alt=''/>
                    </div>

                    
                    <div style={{ position: 'relative', width: 200, height: '100%', float: 'left' }}>

                    </div>
                </div>
            </div>
        )
    }
}