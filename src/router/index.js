import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: 'login'
  },
  {
    path: '/login',
    name: 'login',
    component: resolve => require(['../components/Login.vue'], resolve)
  },
  {
    path: '/home',
    name: 'Home',
    component: resolve => require(['../components/Home.vue'], resolve),
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        name: 'Welcome',
        component: resolve => require(['../components/Welcome.vue'], resolve)
      },
      {
        path: '/users',
        name: 'Users',
        component: resolve => require(['../components/user/Users.vue'], resolve)
      },
      {
        path: '/rights',
        name: 'Rights',
        component: resolve => require(['../components/power/Rights.vue'], resolve)
      },
      {
        path: '/roles',
        name: 'Roles',
        component: resolve => require(['../components/power/Roles.vue'], resolve)
      },
      {
        path: '/categories',
        name: 'Cate',
        component: resolve => require(['../components/goods/Cate.vue'], resolve)
      },
      {
        path: '/params',
        name: 'Params',
        component: resolve => require(['../components/goods/Params.vue'], resolve)
      },
      {
        path: '/goods',
        name: 'List',
        component: resolve => require(['../components/goods/List.vue'], resolve)
      },
      {
        path: '/goods/add',
        name: 'Add',
        component: resolve => require(['../components/goods/Add.vue'], resolve)
      },
      {
        path: '/orders',
        name: 'Order',
        component: resolve => require(['../components/order/Order.vue'], resolve)
      },
      {
        path: '/reports',
        name: 'Report',
        component: resolve => require(['../components/report/Report.vue'], resolve)
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

// 挂在路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径跳转过来
  // next 是一个函数，表示放行
  // next() 放行 next('/login') 强制跳转

  if (to.path === '/login') return next()
  // 获取 token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})
export default router
