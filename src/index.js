import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import '../node_modules/semantic-ui-css/semantic.min.css';
import {Router, Route} from 'react-router-dom'
import  {createHashHistory} from 'history';

const hashHistory = createHashHistory();
const WebRouter = ()=> (
    <Router history={hashHistory}>
        <Route match exact path="/" component={App}/>
    </Router>
)

ReactDOM.render(<WebRouter />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
