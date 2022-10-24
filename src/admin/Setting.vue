<template>
	<ion-content :scroll-events="true">
		<v-form class="v-form" header="Configuración" store="setting">
			<div :key="k">
				<v-button icon="fa fa-sync" value="Recuperar Datos Maestros" @click="load" style="width:-webkit-fill-available;"/>
				<label>Red:</label>
				<v-select v-model="o.red"
					ref="redSelect"
					:label="o.regionName?o.regionName:'---'"
					v-on:input="$refs.microredSelect.load({Codigo_Red:o.red})">
					<option value="">Seleccionar Opción</option>
					<v-options store="red" display-field="name" value-field="code"/>
				</v-select>
				<label>Microred:</label>
				<v-select autoload="false" :disabled="!o.red" ref="microredSelect" v-model="o.microred" 
						:required="true" @input="$refs.establishment.load({Codigo_Cocadenado:o.microred})"> 
					<option>Select One...</option> 
					<v-options store="microred" display-field="name" value-field="code"/>
				</v-select> 
				<label>Establecimiento:</label>
				<v-select ref="establishment" v-model="o.establishment" :autoload="false" :disabled="!o.microred" :required="true"> 
					<option>Select One...</option> 
					<v-options store="establishment" display-field="name" value-field="code"/>
				</v-select>
				<label>Departamento:</label>
				<v-select v-model="o.region"
					ref="regionSelect"
					:label="o.regionName?o.regionName:'---'"
					v-on:input="$refs.provinceSelect.load({code:o.region?o.region.code:'*'})">
					<option value="">Seleccionar Opción</option>
					<v-options store="region" display-field="name"/>
				</v-select>
				<label>Provincia:</label>
				<v-select :label="o.provinceName?o.provinceName:'---'"
					autoload="false" :disabled="!o.region" ref="provinceSelect" v-model="o.province" 
					@input="$refs.districtSelect.load({code:o.province?o.province.code:'*'})">
					<option value="">Seleccionar Opción</option>
					<v-options store="province" display-field="name"/>
				</v-select>
				<label>Distrito:</label>
				<v-select 
					autoload="false" :label="o.districtName?o.districtName:'---'" :disabled="!o.province" 
					@input="$refs.cpSelect.load({code:o.district?o.district.code:'*'})"
					ref="districtSelect" v-model="o.district" >
					<option value="">Seleccionar Opción</option>
					<v-options store="district" display-field="name"/>
				</v-select>
				<label>Centro Poblado:</label>
				<v-select 
					autoload="false" :label="o.districtName?o.districtName:'---'" :disabled="!o.district" 
					ref="cpSelect" v-model="o.town" >
					<option value="">Seleccionar Opción</option>
					<v-options store="sample" display-field="name"/>
				</v-select>
				<v-button icon="fa fa-save" value="Guardar Seleccion" @click="save" style="margin-top:10px;width:-webkit-fill-available;"/>
			
			</div>

		</v-form>
	</ion-content>
</template>
<script>
import {IonContent} from '@ionic/vue';
export default window._.ui({
	components:{IonContent},
	props:['id'],
	data(){
		return{k:0,o:{red:null,microred:null,region:null,province:null}
	}},
	mounted(){
		var me=this;
		this.$refs.redSelect.$el.children[0].onclick=function(){
			if(me.k==0)me.k++;
		};
	},
	methods:{
		load(){
			window.axios.get('/admin/desarrollo-social/api/red/0/0').then(function(r){
				var db=window._.db,objectStore =db.transaction(["red"], "readwrite").objectStore("red");
				var data=r.data;
				for (var i in data)objectStore.add(data[i]);
			});
			window.axios.get('/admin/desarrollo-social/api/microred/0/0').then(function(r){
				var db=window._.db,objectStore =db.transaction(["microred"], "readwrite").objectStore("microred");
				var data=r.data;
				for (var i in data)objectStore.add(data[i]);
			});
			window.axios.get('/admin/desarrollo-social/api/establishment/0/0').then(function(r){
				var db=window._.db,objectStore =db.transaction(["establishment"], "readwrite").objectStore("establishment");
				var data=r.data;
				for (var i in data)objectStore.add(data[i]);
			});
			window.axios.get('/admin/directory/api/district/0/0').then(function(r){
				var db=window._.db,objectStore =db.transaction(["district"], "readwrite").objectStore("district");
				var data=r.data;
				for (var i in data)objectStore.add(data[i]);
			});
			window.axios.get('/admin/directory/api/region/0/0').then(function(r){
				var db=window._.db,objectStore =db.transaction(["region"], "readwrite").objectStore("region");
				var data=r.data;
				for (var i in data)objectStore.add(data[i]);
			});
			window.axios.get('/admin/directory/api/province/0/0').then(function(r){
				var db=window._.db,objectStore =db.transaction(["province"], "readwrite").objectStore("province");
				var data=r.data;
				for (var i in data){
					var request =objectStore.add(data[i]);
					request.onerror = function(event) {
						console.log(event);
					}
				}
			});
			this.k=0;
		},
		save(){
			var me=this,o=me.o,db=window._.db,objectStore =db.transaction(["setting"], "readwrite").objectStore("setting");
			o.code='config';
			var item = objectStore.get(o.code);
			item.onsuccess = function() {
				var result;
				if(item.result){
					result=objectStore.put(o);
				}else{
					result=objectStore.add(o);
				}
				result.onsuccess = function() {me.app.toast('Configuración grabada!');}
			};
			item.onerror = function ()  {
				me.MsgBox('Error saving config!');
			};
		}
	}
});
</script>
<style scope>
	.table input{
		width:100% !important;
	}
	.table td{
		padding:2px;
	}
	.ww > a:not(:last-child){
		margin-bottom:20px;
	}
	.ww > a{
		display:block;
		border:1px solid gray;
		padding:10px;
	}
	.ww span{
		font-size:16px;
		font-weight:bolder;
	}
	.ww i{
		font-size:14px;
		color:gray;
		display:block;
	}
	.ww div{
		display: inline-block;
		width: calc(100% - 100px);
		padding-top: 20px;
		float: left;
	}
	.ww img{
		width:100px;
	}
	img.error{
		padding: 30% !important;
		width: 40% !important;
		background-color: transparent;
	}
	.cart-control > *{
		display:block;
		width:90%;
	}
	.cart-control > *:not(:last-child){
		margin-bottom:10px;
	}
	.controls a:not(:last-child){
		display:inline-block;
		margin-right:10px;
	}
	.product{
		padding:20px;background-color: white;
		position:relative;
	}
	.product-list iframe{
		width:100%;
	}
	.controls{
		position:relative;
	}
	.controls > *:not(:last-child){
		margin-right:10px;
	}
	.view{
		margin:15px 0px;
	}
	.inner-scroll{
		--padding:10px;
	}
	.v-fieldset {
		border: 1px solid #0f62ac;
	}
	.v-controls{
		font-size:30px;
	}
</style>