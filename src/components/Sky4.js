// import * as THREE from 'three/src/Three'
import * as THREE from 'three/build/three'
import React from 'react'
import './controls/OrbitControls';
import net_work from '../manager/network';
import star_png from '../static/star.png'

export default class Sky extends React.Component {
    componentDidMount() {
        this.drawSky()
    }

    drawSky() {
        const show_potery_num = 10000
        net_work.require('topPoteriesVec', { start: 0, end: show_potery_num})
            .then(potery_vecs => {
                let potery2vec3dWithRank = {}
                potery_vecs.forEach(element => {
                    const [id, x, y, z, rank] = element
                    potery2vec3dWithRank[id] = [x, y, z, rank]
                    // console.log(id, rank)
                });
                const potery_ids = potery_vecs.map(elm=> elm[0])
                this.potery_ids = potery_ids
                this.potery2vec3d = potery2vec3dWithRank

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
                scene.background = new THREE.Color(0x000000);

                camera.position.z = 250
                renderer.setSize(window.innerWidth, window.innerHeight);
                container.appendChild(renderer.domElement);

                /* 存放粒子数据的网格 */
                let geometry = new THREE.BufferGeometry();
                let positions = [];
                let colors = [];

                let color = new THREE.Color();
                const max_rank = potery2vec3dWithRank[potery_ids[0]][3], // Math.max(...potery_ids.map(elm=> potery2vec3dWithRank[elm][3])),
                    min_rank = potery2vec3dWithRank[potery_ids[potery_ids.length-1]][3] //Math.min(...potery_ids.map(elm=> potery2vec3dWithRank[elm][3]))
                /* 使粒子在立方体范围内扩散 */
                let n = 1000
                for (let i = 0; i < potery_ids.length; i++) {
                    const potery_id = potery_ids[i]
                    let [x,y,z,rank] = potery2vec3dWithRank[potery_id]
                    // console.log(potery_id, x,y,z, rank)
                    positions.push(x/2000, y/2000, z/2000);

                    // 颜色
                    let vx = (x / n) + 0.5;
                    let vy = (y / n) + 0.5;
                    let vz = (z / n) + 0.5;
                    rank = (rank-min_rank)/(max_rank-min_rank)
                    // color.setRGB(vx, vy, vz);
                    rank = i/potery_ids.length
                    color.setRGB(rank*0.9+0.1,rank, rank*0.7+0.3);
                    // console.log(color.r, color.g, color.b)
                    colors.push(color.r, color.g, color.b);
                }
                // console.log(colors)
                // 添加点和颜色
                geometry.addAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
                geometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
                let star_texture = new THREE.TextureLoader().load(star_png);
                let material = new THREE.PointsMaterial({
                    size: 1,
                    sizeAttenuation: true,
                    vertexColors: THREE.VertexColors,
                    transparent: true,
                    opacity: 1,
                    map: star_texture,
                });
                /* 批量管理点 */
                let points = new THREE.Points(geometry, material);

                scene.add(points);

                let controls = new THREE.OrbitControls(camera, renderer.domElement);
                controls.update();

                function animate() {
                    requestAnimationFrame(animate);
                    controls.update();

                    renderer.render(scene, camera);
                }
                animate()
            })
    }
    render() {
        return (
            <div style={{ width: '100%', height: '100%' }} ref='container'>

            </div>
        )
    }
}
