import React from 'react';
import qxhc from '../../static/搜索页/群星荟萃.svg'
import yxyf from '../../static/搜索页/逸兴云飞.svg'
import czjj from '../../static/搜索页/裁章剪句.svg'
import wnxs from '../../static/搜索页/为你写诗.svg'

export default class Nav extends React.Component {

    render() {
        const nav_img_css = { width: 18, position: 'absolute', top: 3 }, nav_div_css = { top: 0, left: 20, position: 'absolute' }
        return (
            <div className='nav' style={{ width: 400, top: 35, right: 10, position: 'absolute', zIndex: 100, fontSize: 17 }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: 100 }}>
                    <img src={qxhc} style={{ width: 16, position: 'absolute', top: 3 }} alt='' />
                    <div style={nav_div_css}>群星荟萃</div>
                </div>
                <div style={{ position: 'absolute', top: 0, left: 100 }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: 100 }}>
                        <img src={czjj} style={nav_img_css} alt='' />
                        <div style={nav_div_css}>裁章剪句</div>
                    </div>
                </div>
                <div style={{ position: 'absolute', top: 0, left: 200 }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: 100 }}>
                        <img src={yxyf} style={nav_img_css} alt='' />
                        <div style={nav_div_css}>逸兴云飞</div>
                    </div>
                </div>
                <div style={{ position: 'absolute', top: 0, left: 300 }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: 100 }}>
                        <img src={wnxs} style={nav_img_css} alt='' />
                        <div style={nav_div_css}>为你写诗</div>
                    </div>
                </div>
            </div>
        )
    }
}