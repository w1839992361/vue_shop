<template>
  <el-container class="home_container">
    <!--侧边栏区域-->
    <el-aside :width="isCollapse ? '64px' :'200px'">
      <div class="title">
        <span v-if="isCollapse">后台</span>
        <span v-else>后台管理系统</span>
      </div>
      <!--侧边栏菜单区域-->
      <el-menu :default-active="activePath" :collapse="isCollapse" :collapse-transition="false" :unique-opened="true"
        background-color="#3a4268" text-color="#fff" active-text-color="#409BFE" router>
        <!-- 一级菜单 -->
        <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
          <!-- 一级菜单模板 -->
          <template slot="title">
            <!-- 图标 -->
            <i :class="iconObject[item.id]"></i>
            <!-- 文本 -->
            <span>{{item.authName}}</span>
          </template>
          <!-- 二级菜单 -->
          <el-menu-item @click="saveNavState('/'+subItem.path)" :index="'/'+subItem.path+''"
            v-for="subItem in item.children" :key="subItem.id">
            <template slot="title">
              <!-- 图标 -->
              <i class="el-icon-menu"></i>
              <!-- 文本 -->
              <span> {{subItem.authName}}</span>
            </template>
          </el-menu-item>
        </el-submenu>
      </el-menu>
    </el-aside>
    <!--页面主体区域-->
    <el-container>
      <!--头部区域-->
      <el-header>
        <div class="header-left">
          <el-button @click="toggleCollapse" :type="isCollapse?'primary':''"
            :class="isCollapse?'el-icon-s-unfold':'el-icon-s-fold'" style="cursor:pointer;">
          </el-button>
        </div>
        <div class="header-right">
          <el-button type="info" @click="close">退出</el-button>
        </div>
      </el-header>
      <!--右侧内容区域-->
      <el-main>
        <!--路由占位符-->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  created () {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  data () {
    return {
      // 左侧菜单数据
      menulist: [],
      iconObject: {
        125: 'iconfont icon-RectangleCopy5',
        103: 'iconfont icon-RectangleCopy4',
        101: 'iconfont icon-RectangleCopy2',
        102: 'iconfont icon-RectangleCopy9',
        145: 'iconfont icon-RectangleCopy10'

      },
      isCollapse: false,
      // 被激活的链接地址
      activePath: ''
    }
  },
  methods: {
    close () {
      window.sessionStorage.clear()
      this.$router.push('/login')
      return this.$message.success('退出成功')
    },
    async getMenuList () {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menulist = res.data
      console.log(res)
    },
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    },
    saveNavState (activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style lang="less" scoped>
.el-header {
  background-color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.el-aside {
  background-color: #3a4268;
  .title {
    display: flex;
    justify-content: center;
    margin: 5px;
    font-size: 25px;
    font-weight: 600;
    color: #fff;
  }
}
.el-main {
  background-color: #edeff9;
}
.home_container {
  height: 100%;
}
.el-menu {
  border: none;
}
</style>
