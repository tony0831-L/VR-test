import * as THREE from './three.js/build/three.module.js' 
import {PointerLockControls} from './three.js/examples/jsm/controls/PointerLockControls.js';
import { GLTFLoader } from './three.js/examples/jsm/loaders/GLTFLoader.js';
import { VRButton } from './three.js/examples/jsm/webxr/VRButton.js';

export default class Three{

    constructor(){
        this.init()
    }

    init(){
        this.setScene()
        this.setCam()
        this.setRender()
        this.setKeyContorl()
        this.setVRContorl()
        this.loadModels()
        this.setlight()
        this.animate()
    }

    setScene(){
        this.scene = new THREE.Scene();        
        this.scene.background = new THREE.Color( 0xffffff );
    }

    setCam(){
        this.camera = new THREE.PerspectiveCamera( 75 , window.innerWidth / window.innerHeight, 0.1, 1000 );
        this.camera.position.set(15,32.5,25);
    }

    setRender(){
        this.renderer = new THREE.WebGLRenderer( { antialias: true } );
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( this.renderer.domElement );
    }
    setKeyContorl(){
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;

        this.raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );
        this.velocity = new THREE.Vector3();
        this.prevTime = performance.now();
        this.direction = new THREE.Vector3();

        let blocker = document.getElementById('blocker')
        this.blocker = blocker

        let instructions = document.getElementById('instructions')
        this.instructions = instructions

        let controls = new PointerLockControls( this.camera, document.body );
        this.controls = controls
        this.scene.add(controls.getObject())

        this.instructions.addEventListener('click',function() {controls.lock()},false)
        controls.addEventListener('lock', function() {
            instructions.style.display = 'none'
            blocker.style.display = 'none'
        })
        controls.addEventListener('unlock', function() {
            blocker.style.display = 'block'
            instructions.style.display = ''
        })
        document.addEventListener('keydown',this.keyDownEventHandler);
        document.addEventListener('keyup',this.keyUpEventHandler)
        window.addEventListener( 'resize', this.onWindowResize(this) );

    }

    setVRContorl(){
        document.body.appendChild( VRButton.createButton( this.renderer ) );
        this.renderer.xr.enabled = true;
        this.renderer.xr.addEventListener(
            'sessionstart',
            function() {
                this.controls.lock()
                this.camera.position.y = -50 ;
            },
            false
        )
    }

    loadModels(){
        this.modelLoader('./src/model/classroom/',{x:25,y:25,z:25},{x:0,y:0,z:0});
        this.modelLoader('./src/model/women/',{x:19,y:19,z:19},{x:15,y:1,z:-70});
        this.mainCharacterLoader('./src/model/man/');
        this.modelLoader('./src/model/chair/',{x:30,y:25,z:30},{x:15,y:1,z:25},3.15);
        this.modelLoader('./src/model/table/',{x:30,y:25,z:30},{x:15,y:1,z:-60});
    }

    modelLoader(path,size,position,rotation){
        this.loader = new GLTFLoader().setPath(path);
        this.loader.load('scene.glb',
        (gltf)=>{
            gltf.scene.scale.set(size.x,size.y,size.z);
            gltf.scene.position.set(position.x,position.y,position.z);
            if (rotation) {
                gltf.scene.rotation.y += rotation ;
            }
            this.scene.add(gltf.scene);
        },()=>{},(error)=>{
            console.log(error)
        })
    }

    setlight(){

        let light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
        light.position.set( 0.5, 1, 0.75 );
        this.scene.add( light );

        light = new THREE.PointLight(0xFFFFFF, 1, 0);
        light.position.set(0, 10, 0)
        light.castShadow = true
        this.scene.add(light);

        light = new THREE.PointLight(0xffffff, 3, 10);
        this.camera.add( light );
    }

    mainCharacterLoader(path){
        const loader = new GLTFLoader().setPath(path);
        loader.load('scene.glb',
        (gltf)=>{
            gltf.scene.scale.set(19,19,19);
            gltf.scene.position.set(-6,-30,0);     //first-person
            //gltf.scene.position.set(-6,-32.5,-15); //third-perosn
            gltf.scene.rotation.y += 3.15 ;
            this.camera.add(gltf.scene);
            let pointLight = new THREE.PointLight(0xffffff, 3, 10);
            this.camera.add( pointLight );
        },()=>{},(error)=>{
            console.log(error)
        })
    }

    keyDownEventHandler = (e)=>{
        switch(e.code){
            case 'KeyW' :
                this.moveForward = true ;
                break;
            case 'KeyA' :
                this.moveLeft = true ;
                break;
            case 'KeyS' :
                this.moveBackward = true ;
                break;
            case 'KeyD' :
                this.moveRight = true ;
                break;
        }
    }

    keyUpEventHandler = (e)=>{
                switch(e.code){
                    case 'KeyW' :
                        this.moveForward = false ;
                        break;
                    case 'KeyA' :
                        this.moveLeft = false
                        break;
                    case 'KeyS' :
                        this.moveBackward = false ;
                        break;
                    case 'KeyD' :
                        this.moveRight = false ;
                        break;
                }
    }

    onWindowResize(three){
        three.camera.aspect = window.innerWidth / window.innerHeight;
        three.camera.updateProjectionMatrix();
        three.renderer.setSize( window.innerWidth, window.innerHeight );
    }

    render(){
        this.renderer.render(this.scene, this.camera)
    }

    animate() {
        this.renderer.setAnimationLoop( this.animate.bind((this)) );
        this.time  = performance.now();
    
        if (this.controls.isLocked === true) {
            this.raycaster.ray.origin.copy( this.controls.getObject().position );
            this.raycaster.ray.origin.y -= 10;
    
            this.delta = ( this.time - this.prevTime ) / 1000;
        
            this.velocity.x -= this.velocity.x * 10.0 * this.delta;
            this.velocity.z -= this.velocity.z * 10.0 * this.delta;
        
            this.velocity.y -= 9.8 * 100.0 * this.delta;
        
            this.direction.z = Number( this.moveForward ) - Number( this.moveBackward );
            this.direction.x = Number( this.moveRight ) - Number( this.moveLeft );
            this.direction.normalize(); 
        
            if ( this.moveForward || this.moveBackward ) this.velocity.z -= this.direction.z * 400.0 * this.delta;
            if ( this.moveLeft || this.moveRight ) this.velocity.x -= this.direction.x * 400.0 * this.delta;
        
            this.controls.moveRight( - this.velocity.x * this.delta );
            this.controls.moveForward( - this.velocity.z * this.delta );
        }
        this.prevTime = this.time;
        this.render();
    
    }
}