import React from 'react';
import './App.css';
import { ResizeObserver } from 'resize-observer';
import stateStore from './manager/stateManager';
import { autorun } from 'mobx';
import SearchPage from './components/SerachPage'
import HomePage from './components/HomePage'
import maobi_icon from './static/毛笔小.svg'
import Nav from './components/ui_components/Nav';
import ShangtuLogo from './components/ui_components/ShangtuLogo';
import PoteryPage from './components/PoteryPage';
import SearchInput from './components/ui_components/SearchInput';
import AuthorPage from './components/AuthorPage';
import WordPage from './components/WordPage';
import WritePotery from './components/WritePotery';
class App extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      width: stateStore.windows_width.get(),
      height: stateStore.window_height.get()
    }
  }
  componentWillMount(){
    const {props} = this
    // 处理浏览器参数
    // const { dispatch, form } = props;
    // 获得URL参数
    const query_params = new URLSearchParams(props.location.search);
    const view_state = query_params.get('');
  }
  componentDidMount(){
    const ro = new ResizeObserver((event, value)=>{
      const {height, width} = event[0].contentRect
      // console.log(width, height)
      stateStore.setWindowSize(width, height)
    });
    ro.observe(this.refs.app);

    this.onWindowSizeChange = autorun(()=>{
      let width = stateStore.windows_width.get()
      let height = stateStore.window_height.get()
      // console.log(width, height)
      this.setState({width: width, height: height})
    })

  }
  // background: 'black'
  render(){
    // console.log(this.props)
    const {width, height} = this.state
    return (
      <div className="App" 
        style={{
          width: '100%', height: '100%', 
          background: 'white', 
          position: 'absolute', top: 0, left: 0,
          overflow: 'hidden',
          // cursor: 'url(' + maobi_icon + '),auto',
        }} 
        ref='app'
      >
        <Nav/>
        <ShangtuLogo/>
        <SearchInput/>
        <div style={{position: 'absolute', top: 0, left: 0, width: width, height: height}}>
          {/* <SearchPage/> */}
          {/* <HomePage/> */}
          {/* <PoteryPage/> */}
          {/* <WordPage/> */}
          {/* <AuthorPage/> */}
          <WritePotery/>
        </div>
      </div>
    );
  }
}

export default App;
