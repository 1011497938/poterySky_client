// import * as THREE from 'three/src/Three'
import * as THREE from 'three/build/three'
import React from 'react'
import './controls/OrbitControls';
// import potery2vec3d from '../data/potery2vec/vec6.json'
import star_png from '../static/star.png'
import net_work, { require } from '../manager/network';
export default class Sky extends React.Component {
  // constructor(props){
  //   super(props)
  //   console.log('sky2')
  // }

  componentDidMount() {
    this.loadStar()
  }

  loadStar() {
    net_work.require('topPoteriesVec', { start: 0, end: 50000 })
      .then(potery2vec3d => {
        console.log(potery2vec3d, this)
        const { container } = this.refs
        let renderer = new THREE.WebGLRenderer({
          antialias: true, //是否开启反锯齿 
          precision: "highp", //着色精度选择 
          alpha: true,  //是否可以设置背景色透明 
          premultipliedAlpha: false,
          stencil: false,
          preserveDrawingBuffer: true, //是否保存绘图缓冲 
        }),
          scene = new THREE.Scene(),
          camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000)

        this.camera = camera
        this.scene = scene
        this.renderer = renderer

        camera.position.z = 250
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);

        const potery_ids = Object.keys(potery2vec3d)
        this.potery_ids = potery_ids
        this.potery2vec3d = potery2vec3d

        // 中心的方块
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
        color.setRGB(231, 13, 13);

        // 点动画
        const amplify_k = 0.001


        for (let potery_id in potery2vec3d) {
          potery_ids.push(potery_id)
          const vec = potery2vec3d[potery_id]
          for (let index = 0; index < 3; index++) {
            vec[index] *= amplify_k
          }
        }
        for (let potery_id in potery2vec3d) {
          const vec = potery2vec3d[potery_id]
          let [x, y, z, rank] = vec

          positions.push(x, y, z);
          // 颜色
          const { r, g, b } = color //getRandomColor()
          colors.push(color.r, color.g, color.b);
        }
        // console.log(positions,colors)
        // 添加点和颜色
        geometry.addAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        let star_texture = new THREE.TextureLoader().load(star_png);
        material = new THREE.PointsMaterial({
          size: 1,
          sizeAttenuation: true,
          vertexColors: THREE.VertexColors,
          transparent: true,
          opacity: 0.9,
          // map: star_texture,
          // color: 0xff00ff,
        });
        /* 批量管理点 */
        let points = new THREE.Points(geometry, material);
        scene.add(points);
        // console.log(scene.children, points)
        // scene.fog = new THREE.Fog(0xffeb3b,0,120); 

        // 漫游器设置  
        let controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.update();

        function animate() {
          requestAnimationFrame(animate);
          controls.update();
          renderer.render(scene, camera);
        }
        animate();
        this.addClickStarListener()
      })
  }

  addClickStarListener() {
    const { camera, scene, potery_ids, potery2vec3d } = this
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
        let { index } = elm
        let potery_id = potery_ids[index]
        // console.log(x,y,z, potery_ids[index], potery2vec3d[potery_id])
      }
    }
    this.refs.container.addEventListener('click', onMouseClick, false);
  }

  render() {
    return (
      <div style={{ width: '100%', height: '100%' }} ref='container'>

      </div>
    )
  }
}
