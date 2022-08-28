import * as THREE from './three.js/build/three.module.js' 
import {PointerLockControls} from './three.js/examples/jsm/controls/PointerLockControls.js';
import { GLTFLoader } from './three.js/examples/jsm/loaders/GLTFLoader.js';
import { FontLoader } from './three.js/examples/jsm/loaders/FontLoader.js';
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
        let talking = false;
        this.talking = talking;

        this.goal =new THREE.Vector3(19,19,19);
        this.pointer = new THREE.Vector2();
        this.wallXpRaycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 1,0,0 ), 0 ,5 );
        this.wallXmRaycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( -1,0,0 ), 0 ,5 );
        this.wallZpRaycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0,0,1 ), 0 ,5 );
        this.wallZmRaycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0,0,-1 ), 0 ,5 );
        this.npcraycaster = new THREE.Raycaster();
        this.velocity = new THREE.Vector3();
        this.prevTime = performance.now();
        this.direction = new THREE.Vector3();

        let blocker = document.getElementById('blocker')
        this.blocker = blocker

        let instructions = document.getElementById('instructions')
        this.instructions = instructions

        let crossHair = document.getElementById('cross')
        this.crossHair = crossHair
        crossHair.style.display = 'none'

        let dialogue = document.getElementById('dialogue')
        this.dialogue = dialogue
        dialogue.style.display = 'none'

        
        let controls = new PointerLockControls( this.camera, document.body );
        this.controls = controls
        this.scene.add(controls.getObject())

        this.instructions.addEventListener('click',function() {controls.lock()},false)
        controls.addEventListener('lock', function() {
            instructions.style.display = 'none'
            blocker.style.display = 'none'
            crossHair.style.display = 'flex'
        })
        controls.addEventListener('unlock', function() {
            blocker.style.display = 'block'
            instructions.style.display = '';
            crossHair.style.display = 'none';
        })
        document.addEventListener('keydown',this.keyDownEventHandler);
        document.addEventListener('keyup',this.keyUpEventHandler);
        window.addEventListener( 'pointermove', (event=>{
            this.pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            this.pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
        }) );
        window.addEventListener( 'resize', this.onWindowResize(this) );

    }
    setVRContorl(){
        this.blocker.appendChild( VRButton.createButton( this.renderer ) );
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
        this.wall = []
        this.npc = []
        // let url = 'https://tony0831-l.github.io/VR-test/src/model/'
        // let url = './src/model/'
        this.modelLoader(url+'classroom/',{type:'wall'},{x:25,y:25,z:25},{x:0,y:0,z:0});
        this.modelLoader(url+'castal/',{type:'wall'},{x:400,y:400,z:400},{x:0,y:-3,z:0});
        this.modelLoader(url+'women/',{type:'npc'},{x:19,y:19,z:19},{x:15,y:1,z:-70});
        this.mainCharacterLoader(url+'man/');
        this.modelLoader(url+'chair/',{type:'wall'},{x:30,y:25,z:30},{x:15,y:1,z:25},3.15);
        this.modelLoader(url+'./table/',{type:'wall'},{x:30,y:25,z:30},{x:15,y:1,z:-60});
    }
    modelLoader(path,cat,size,position,rotation){
        this.loader = new GLTFLoader().setPath(path);
        this.loader.load('scene.glb',
        (gltf)=>{
            gltf.scene.scale.set(size.x,size.y,size.z);
            gltf.scene.position.set(position.x,position.y,position.z);
            if (rotation) {
                gltf.scene.rotation.y += rotation ;
            }
            switch (cat.type) {
                case 'npc':
                    let geometry = new THREE.BoxGeometry( 15, 15, 0 );

                    this.Whitematerial = new THREE.MeshBasicMaterial( { color:  0xffffff } );
                    this.Whitematerial.transparent = true ;
                    this.Whitematerial.lightMapIntensity = 2;
                    this.Whitematerial.opacity = 0.5;
                    this.balckmaterial = new THREE.MeshBasicMaterial( { color:  0x515151 } );
                    this.balckmaterial.transparent = true ;
                    this.balckmaterial.lightMapIntensity = 2;
                    this.balckmaterial.opacity = 0.85;

                    this.mesh = new THREE.Mesh( geometry, this.Whitematerial );
                    this.mesh.position.set(position.x+=10,position.y+=30,position.z+=5)
                    this.oldmesh= this.mesh;
                    this.scene.add( this.mesh );
                    this.npc.push(this.mesh)
                    break;
                case 'wall':
                    this.wall.push(gltf.scene)
                    break;
                default:
                    break;
            }
            this.scene.add(gltf.scene);
        },()=>{},(error)=>{
            console.log(error)
        })
    }
    setlight(){

        let light = new THREE.AmbientLight( 0x404040 , 2 ); // soft white light
        this.scene.add( light );

        light = new THREE.DirectionalLight(0xffffff, 3);
        light.position.set(15, 800, 25)
        light.castShadow = true
        this.scene.add(light);

        light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(15, -100, 25)
        light.castShadow = true
        this.scene.add(light);
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
    npcEventHandeler(){
        let three = this;
        this.npcraycaster.setFromCamera( this.pointer, this.camera );
        let intersections = this.npcraycaster.intersectObjects( this.npc, false );
        let addDialogue = function () {}
        if (intersections.length) {
           this.mesh.material = this.balckmaterial;
           document.addEventListener('click', addDialogue = function() {
            three.talking = true;
            three.dialogue.style.display = 'flex';
            three.camera.position.set(15.47,32.5,-45.7);
            three.camera.lookAt(15.47,32.5,-45.7);
            three.controls.unlock();
            three.blocker.style.opacity = 0;
            setTimeout(() => {
                three.dialogue.style.display = "none";
                three.talking = false;
                three.blocker.style.opacity = 1;
                three.controls.lock()
                document.removeEventListener('click',addDialogue)
            }, 4000);
           })
        }else{
            this.mesh.material = this.Whitematerial
            // document.removeEventListener('click',addDialogue())
        }
    }
    wallEventHandeler(){
        
        this.wallXpRaycaster.ray.origin.copy( this.controls.getObject().position );
        this.wallXmRaycaster.ray.origin.copy( this.controls.getObject().position );
        this.wallZpRaycaster.ray.origin.copy( this.controls.getObject().position );
        this.wallZmRaycaster.ray.origin.copy( this.controls.getObject().position );

        let intersectionsXp = this.wallXpRaycaster.intersectObjects( this.wall, true );
        let intersectionsXm = this.wallXpRaycaster.intersectObjects( this.wall, true );
        let intersectionsZp = this.wallXpRaycaster.intersectObjects( this.wall, true );
        let intersectionsZm = this.wallXpRaycaster.intersectObjects( this.wall, true );

        if(intersectionsXp.length){
            this.velocity.z -= this.direction.z * 400.0 * this.delta;
            this.controls.moveForward( 1.05*this.velocity.z * this.delta );
        }
        if(intersectionsXm.length){
            this.velocity.z -= this.direction.z * 400.0 * this.delta;
            this.controls.moveForward( 1.05*this.velocity.z * this.delta );
        }
        if(intersectionsZp.length){
            this.velocity.x -= this.direction.x * 400.0 * this.delta;
            this.controls.moveRight( 1.05*this.velocity.x * this.delta );
        }
        if(intersectionsZm.length){
            this.velocity.x -= this.direction.x * 400.0 * this.delta;
            this.controls.moveRight( 1.05*this.velocity.x * this.delta );
        }
        
    }
    render(){
        this.renderer.render(this.scene, this.camera)
    }
    animate() {
        this.renderer.setAnimationLoop( this.animate.bind((this)) );
        this.time  = performance.now();
    
        if (this.controls.isLocked === true) {

            this.npcEventHandeler()
            this.wallEventHandeler()
            document.getElementById('x').innerHTML = "x:"+this.camera.position.x
            document.getElementById('z').innerHTML = "z:"+this.camera.position.z

            this.delta = ( this.time - this.prevTime ) / 1000;
        
            this.velocity.x -= this.velocity.x * 10.0 * this.delta;
            this.velocity.z -= this.velocity.z * 10.0 * this.delta;
        
        
            this.direction.z = Number( this.moveForward ) - Number( this.moveBackward );
            this.direction.x = Number( this.moveRight ) - Number( this.moveLeft );
            this.direction.normalize(); 
        
            if ( this.moveForward || this.moveBackward ) this.velocity.z -= this.direction.z * 400.0 * this.delta;
            if ( this.moveLeft || this.moveRight ) this.velocity.x -= this.direction.x * 400.0 * this.delta;
            this.npcEventHandeler()
            this.wallEventHandeler()
            
            this.controls.moveRight( - this.velocity.x * this.delta );
            this.controls.moveForward( - this.velocity.z * this.delta );
            this.controls.getObject().position.y += ( this.velocity.y * this.delta );
        }
        this.prevTime = this.time;
        this.render();
    
    }
}