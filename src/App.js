import React from 'react';
import './App.css';
import Sky from './components/Sky4';

class App extends React.Component {
  // background: 'black'
  render(){
    return (
      <div className="App" style={{width:'100%', height:'100%', }}>
        <Sky/>
      </div>
    );
  }
}

export default App;
