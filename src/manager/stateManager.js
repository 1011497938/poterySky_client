import { observable, action, computed } from "mobx";
import $ from "jquery";

class State{
    constructor(){

    }

    windows_width = observable.box($(window).width())
    window_height = observable.box($(window).height())
    setWindowSize(width, height){
        this.window_height.set(height)
        this.windows_width.set(width)
    }

    view_names = ['首页', '群星荟萃', '裁章剪句', '逸兴云飞', '为你写诗']
    default_show_view =  this.view_names[0]
    //  //'首页'  
    show_view = observable.box(this.default_show_view)
}

const stateStore = new State()
export default stateStore