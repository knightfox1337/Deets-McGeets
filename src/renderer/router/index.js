import Vue from 'vue';
import Router from 'vue-router';
import Toasted from 'vue-toasted';
Vue.use(Toasted, {
  iconPark: 'material'
});

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'landing-page',
      component: require('@/components/LandingPage').default
    },
    {
      path: '/preferences',
      name: 'preferences',
      component: require('@/components/preferences').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
});
