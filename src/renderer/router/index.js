import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  mode: 'hash',
  routes: [
    {
      path: '/',
      name: 'index-page',
      component: require('@/components/Index').default,
      children: [
        {
          path: 'project',
          name: 'project-page',
          component: require('@/components/Project').default
        },
        {
          path: 'module',
          name: 'module-page',
          component: require('@/components/Module').default
        },
        {
          path: 'item',
          name: 'item-page',
          component: require('@/components/Item').default
        }
      ]
    },
    {
      path: '/login',
      name: 'login-page',
      component: require('@/components/Login').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
