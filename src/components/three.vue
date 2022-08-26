<template>
      <div id="blocker">
			<div id="instructions">
				<p>
					click me to start
				</p>
			</div>
    </div>
</template>

<script>
import init from '../utils/index.js'

export default {
	data(){
		return{
			obj:{}
		}
	},
	mounted(){
		this.obj =JSON.parse(JSON.stringify(new init())) ;
	}
}
</script>
