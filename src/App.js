import React from 'react';
import logo from './logo.svg';
import './App.css';
import Sky from './components/Sky1';

class App extends React.Component {
  render(){
    return (
      <div className="App" style={{width:'100%', height:'100%', background: 'black'}}>
        {/* <TestSky/> */}
        <Sky/>
      </div>
    );
  }
}

export default App;
