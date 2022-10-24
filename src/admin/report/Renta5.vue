<template>
	<v-form header="Exportar" > 
		<div class="v-form"> 
			<div>
			<v-uploader domain="https://web.regionancash.gob.pe" v-on:input="upload"/>
			</div>
			<v-fieldset v-if="o.fileName">
				<label>Archivo:</label>
				<div>{{o.fileName}}</div>
				<div>
					<div class="c-6 v-form">
						<label>Pestaña:</label>
						<input v-model="o.tab"/>
					</div>
					<div class="c-6 v-form">
						<label>Mes:</label>
						<select v-model="o.month">
							<option v-for="(m,i) in month" v-bind:key="i" v-bind:value="i">{{m}}</option>
						</select>
					</div>
				</div>
				<div class="right margin-t">
					<v-button value="Descargar" icon="fa-download" v-on:click="saveAs('/api/siaf/renta5',o)"/>
				</div>
			</v-fieldset>
		</div>
	</v-form>
</template>
<script>
import axios from 'axios';
import Vue from 'vue';
export default window.ui({
	data(){return {o:{pages:null,fileName:null,month:new Date().getMonth(),tab:null},month:['ENERO','FEBRERO','FEBRERO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE']};},
	methods:{
		upload(e){
			var me=this,o=me.o;
			o.fileName=e.fileName;
			axios.post('/api/siaf/renta5',e).then(e=>{
				o=Vue.mergeDeep(o,e.data);
				o.tab=0;
				me.o=o;
			});
		}
	}
});
</script>
<style>
	.c-6{
		width:50%;
		display:inline-block;
	}
</style>