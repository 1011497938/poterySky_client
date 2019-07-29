// import * as THREE from 'three/src/Three'
import * as THREE from 'three/build/three'
import React from 'react'
import  './controls/OrbitControls';
import potery2vec3d from '../data/vec6.json'
// import CameraControllerFPS from '../../node_modules/threejs-camera-controller-multitarget-framing/index'
// 7月18日
export default class Sky extends React.Component {
  // constructor(props){
  //   super(props)
  //   console.log('sky2')
  // }

  componentDidMount() {
    const { container } = this.refs
    let renderer = new THREE.WebGLRenderer(),
        scene = new THREE.Scene(),
        camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 )

    camera.position.z = 250
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    var geometry = new THREE.SphereGeometry(1, 1, 1);
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    var cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // 创建星空
    /* 存放粒子数据的网格 */
    geometry = new THREE.BufferGeometry();
    let positions = [];
    let colors = [];
    let color = new THREE.Color();

    color.setRGB(64, 224, 208);
    

    // 点动画
    const amplify_k = 0.001
    const potery_ids = []
    for(let potery_id in potery2vec3d){
      potery_ids.push(potery_id)
      const vec = potery2vec3d[potery_id]
      for (let index = 0; index < vec.length; index++) {
        vec[index] *= amplify_k
      }
    }
    for(let potery_id in potery2vec3d){
      const vec = potery2vec3d[potery_id]
      let [x,y,z] = vec

      positions.push(x, y, z);
      // 颜色
      colors.push(color.r, color.g, color.b);
    }

    // 添加点和颜色
    geometry.addAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    material = new THREE.PointsMaterial({
        size: 1,
        sizeAttenuation: true,
        vertexColors: THREE.VertexColors,
        transparent: true,
        opacity: 0.9
    });
    /* 批量管理点 */
    let points = new THREE.Points(geometry, material);
    scene.add(points);
    console.log(scene.children, points)
    // scene.fog = new THREE.Fog(0xffeb3b,0,120); 
    // 漫游器设置  
    let controls = new THREE.OrbitControls( camera, renderer.domElement );
    // camera.position.set( 0, 20, 100 );
    controls.update();

    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();
    function onMouseClick(event) {
      //通过鼠标点击的位置计算出raycaster所需要的点的位置，以屏幕中心为原点，值的范围为-1到1.
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

      // 通过鼠标点的位置和当前相机的矩阵计算出raycaster
      raycaster.setFromCamera(mouse, camera);
      // 获取raycaster直线和所有模型相交的数组集合
      var intersects = raycaster.intersectObjects(scene.children);
      //将所有的相交的模型的颜色设置为红色，如果只需要将第一个触发事件，那就数组的第一个模型改变颜色即可
      for (var i = 0; i < intersects.length; i++) {
        const elm = intersects[i]
        let {index} = elm
        let potery_id = potery_ids[index]
        // console.log(x,y,z, potery_ids[index], potery2vec3d[potery_id])
      }
    }
    container.addEventListener( 'click', onMouseClick, false );
  }
  render() {
    return (
      <div style={{ width: '100%', height: '100%' }} ref='container'>

      </div>
    )
  }
}
