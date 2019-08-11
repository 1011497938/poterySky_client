// import { Promise } from "q";
// import deepcopy from 'deepcopy'

class NetWork {
    constructor(){
        this.fetch_url = 'http://localhost:8000/'
        // this.require('init').then(res => console.log(res))
    }

    // 缓存没有用到
    // 要加一个timeout
    url2data = {}
    require(url, par = undefined){
        const {url2data} = this
        url = this.fetch_url + url
        if (par) {
            url += '?'
            for(let key in par){
                let elm = par[key]
                if(Array.isArray(elm))
                    elm = elm.join(',')
                url += key + '=' + elm + '&'
            }
            url = url.slice(0,-1)            
        }

        if (url2data[url]) {

        }else{
            console.log('get', url.slice(0, 50))
            return fetch(url,{
                method:'GET',
                headers:{
                    'Content-Type':'application/json;charset=UTF-8'
                },
                cache:'default'
            })
            .then(res =>{
                let data = res.json()
                return data
            })            
        }

    }

}

const net_work = new NetWork()

export default net_work
