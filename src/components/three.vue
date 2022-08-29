<template>
	<crosshair/>
	<div id="blocker">
			<div id="instructions">
				<p>
					click me to start
				</p>
			</div>
    </div>
	<div id="dialogue">dialogue test</div>
</template>

<script>
import init from '../utils/index.js'
import crosshair from './crosshair.vue';
export default {
	components:{
		crosshair
	},
	data(){
		return{
			obj:{},
		}
	},
	mounted(){
		this.obj =new init()
		console.log(this.obj.controls)
	}
}
</script>

