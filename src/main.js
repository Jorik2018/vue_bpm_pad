import Vue from 'vue'
import Router from 'vue-router'
import IsobitUI from 'isobit-ui'
import App from './App.vue'
import Ionic from '@ionic/vue';
import VForm from "./v-form.vue";
import '@ionic/core/css/ionic.bundle.css';
import moment from 'moment-timezone';

Vue.config.productionTip = false;
Vue.use(Router);
Vue.use(IsobitUI);
Vue.use(Ionic);
Vue.config.ignoredElements = [/^ion-/, /^v-/];   // add this line
Vue.config.productionTip = false;
Vue.component("v-form", VForm);

Vue.filter('formatDate', function (value) {
	if (value) {
		let dateUTC = moment.utc(String(value), 'YYYY-MM-DDTHH:mm:ssZ');
		// Agregar un desplazamiento de +5 horas a la fecha UTC
		dateUTC.subtract(5, 'hours');
		// Formatear la fecha y hora en el formato deseado
		return dateUTC.format('DD/MM/YYYY HH:mm:ss');
	}
});

const router = new Router({
	mode: 'history',
	routes: [
		{
			path: '/admin',
			component: r => require.ensure([], () => r(require('./Admin.vue')), 'big-pages'),
			children: [
				{
					path: '',
					component: r => require.ensure([], () => r(require('./admin/bpm/run/List.vue')), 'big-pages')
				},
				{
					path: 'bpm',
					component: r => require.ensure([], () => r(require('./admin/bpm/run/List.vue')), 'big-pages')
				},
				{
					path: 'bpm/run',
					component: r => require.ensure([], () => r(require('./admin/bpm/run/List.vue')), 'big-pages')
				},
				{
					path: 'bpm/run/create',
					component: r => require.ensure([], () => r(require('./admin/bpm/run/Create.vue')), 'big-pages')
				},
				{
					path: 'bpm/run/:id/edit', props: true,
					component: r => require.ensure([], () => r(require('./admin/bpm/run/Create.vue')), 'big-pages')
				},
				{
					path: 'bpm/run/dispatch/:dispatch', props: true,
					component: r => require.ensure([], () => r(require('./admin/bpm/run/Create.vue')), 'big-pages')
				},
				{
					path: 'bpm/run/:id', props: true,
					component: r => require.ensure([], () => r(require('./admin/bpm/run/View.vue')), 'big-pages')
				},
				{
					path: 'setting',
					component: r => require.ensure([], () => r(require('./admin/Setting.vue')), 'big-pages')
				},
				{
					path: 'profile',
					component: r => require.ensure([], () => r(require('./admin/Profile.vue')), 'big-pages')
				}
			]
		},
		{
			path: '/login',
			component: r => require.ensure([], () => r(require('./Login.vue')), 'big-pages')
		},
		{
			path: '/password',
			component: r => require.ensure([], () => r(require('./Password.vue')), 'big-pages')
		}, {
			path: '/search', props: true,
			component: r => require.ensure([], () => r(require('./Search.vue')), 'search'),
		}
	]
});
var axios = window.axios;
var url = new URL(window.location);
var location = window.location;
var code = url.searchParams.get("code");
axios.defaults.baseURL = process.env.VUE_APP_BASE_URL;
(async function () {
	if (code) {
		let response
		try {
			response = await axios.post(process.env.VUE_APP_BASE_URL +
				'/api/auth/token', code,{headers: {'Content-Type': 'text/plain'},
				});
			const session = response.data;
			session.perms=session.perms.reduce((a,current)=>{
				a[current]=1;return a;
			},{});
			localStorage.setItem('session', session);
			axios.defaults.headers.common = {
			Authorization: `Bearer ${session.token}`
			};
			//next();
		} catch (e) {
			console.error(e);
			response = null;
		}
		/*localStorage.setItem('token', token);
		var session = { token: token, connected: true, perms: [] };
		axios.defaults.headers.common = { 'Authorization': `Bearer ` + token };
		const aa = await axios.get('/api/bpm/perms');
		var perm = {};
		aa.data.forEach(e => {
			perm[e.name] = 1;
		});
		session.perms = perm;
		localStorage.setItem('session', JSON.stringify(session));
		window.location = location.protocol + '//' + location.host + location.pathname*/
	}

	router.beforeEach((to, from, next) => {
		var session = localStorage.getItem('session');
		if (to.path == '/logout') {
			if (session) {
				window.$app.session = null;
				window.axios.config = {};
				localStorage.removeItem('session');

			}
			next('/');
			return;
		}
		if (session) session = JSON.parse(session);
		if (to.path == '/login' && session) {
			next('/admin');
		} else if (to.path !== '/login' && !session) {
			if (to.path == '/register' || to.path == '/password') {
				next();
			} else {
				// Change produccion
				location.href=`${process.env.VUE_APP_OAUTH_URL}/authorize?response_type=code&client_id=${process.env.VUE_APP_OAUTH_CLIENT_ID}&scope=profile`;
			}
		} else if (to.path == '/') {
			next('/admin');
		} else {
			next();
		}
	});

	new Vue({
		router,
		render: h => h(App),
		created() { window.$app = this; }
	}).$mount('#app')
})();
