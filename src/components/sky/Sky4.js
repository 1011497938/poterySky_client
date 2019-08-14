// import * as THREE from 'three/src/Three'
import * as THREE from 'three/build/three'
import React from 'react'
import './controls/OrbitControls';
import net_work from '../manager/network';
import star_png from '../static/star2.png'
import background_png from '../static/background.png'
export default class Sky extends React.Component {
    constructor(props){
        super(props)
        this.show_potery_num = 10000
        this.renderer = new THREE.WebGLRenderer({
            antialias: true, //是否开启反锯齿 
            precision: "highp", //着色精度选择 
            alpha: true,  //是否可以设置背景色透明 
            premultipliedAlpha: false,
            stencil: false,
            preserveDrawingBuffer: true, //是否保存绘图缓冲 
        })
        this.scene = new THREE.Scene()
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000)
    }
    componentDidMount() {
        this.drawSky()
    }

    drawSky() {
        const {show_potery_num, scene, renderer, camera} = this
        net_work.require('topPoteriesVec', { start: 0, end: show_potery_num})
            .then(potery_vecs => {
                // console.log(potery_vecs)
                const amplify_k = 50
                let potery2vec3d = {}, potery2rank = {}
                potery_vecs.forEach(element => {
                    const [id, x, y, z, rank] = element
                    potery2vec3d[id] = [x*amplify_k, y*amplify_k, z*amplify_k]
                    potery2rank[id] = rank
                });
                const potery_ids = potery_vecs.map(elm=> elm[0])
                this.potery_ids = potery_ids
                this.potery2vec3d = potery2vec3d
                this.potery2rank = potery2rank

                const { container } = this.refs

                // scene.background = new THREE.Color(0x3f51b5);

                camera.position.z = 0
                renderer.setSize(window.innerWidth, window.innerHeight);
                container.appendChild(renderer.domElement);

                /* 存放粒子数据的网格 */
                let geometry = new THREE.BufferGeometry();
                let positions = [];
                let colors = [];

                let color = new THREE.Color();
                // const max_rank = potery2vec3d[potery_ids[0]][3], // Math.max(...potery_ids.map(elm=> potery2vec3d[elm][3])),
                //     min_rank = potery2vec3d[potery_ids[potery_ids.length-1]][3] //Math.min(...potery_ids.map(elm=> potery2vec3d[elm][3]))
                for (let i = 0; i < potery_ids.length; i++) {
                    const potery_id = potery_ids[i]
                    let [x,y,z] = potery2vec3d[potery_id], rank = potery2rank[potery_id]
                    positions.push(x, y, z);

                    // 颜色
                    // rank = (rank-min_rank)/(max_rank-min_rank)
                    rank = i/potery_ids.length
                    // color.setRGB(rank*0.9+0.1,rank, rank*0.7+0.3);
                    // color.setRGB(rank,rank, rank);
                    colors.push(color.r*0.3+0.7, color.g*0.3+0.7, color.b*0.3+0.7);
                }

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

    drawLinks(){
        const {show_potery_num, scene, potery2vec3d, renderer, camera} = this
        // 画连线
        net_work.require('topPoteriesSim', { start: 0, end: show_potery_num, max_edge:1})
        .then(pid2sim=>{
            console.log(pid2sim)
            let line_material = new THREE.LineBasicMaterial( { color: 0x0000ff } );
            let count = 0
            for(let pid in pid2sim){
                let sims = pid2sim[pid]
                let p_vec = potery2vec3d[pid]
                // console.log(sims)
                // eslint-disable-next-line no-loop-func
                sims.forEach(sim_id=>{
                    // count++
                    let sim_vec = potery2vec3d[sim_id]
                    let geometry = new THREE.Geometry();
                    let [px,py,pz, prank] = p_vec, [sx,sy,sz, srank] = sim_vec
                    geometry.vertices.push(new THREE.Vector3( px, py, pz));
                    geometry.vertices.push(new THREE.Vector3( sx, sy, sz));
                    let line = new THREE.Line( geometry, line_material );
                    scene.add( line );
                    // console.log(sim_id, pid)
                })
                // console.log(pid)
                // console.log(count)
            }
            renderer.render(scene, camera);
        })
    }
    render() {
        // console.log
        return (
            <div style={{ width: '100%', height: '100%',backgroundImage: 'url(' + background_png + ')', backgroundSize: '100%' }} ref='container'>

            </div>
        )
    }
}
