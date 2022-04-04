<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图区域-->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!--表格-->
      <tree-table :class="'tree-table'" :data="cateList" :show-index="true" :show-row-hover="false" border
        index-text="#" :columns="columns" :expand-type="false" :selection-type="false">
        <!--是否有效-->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" style="color:green" v-if="scope.row.cat_deleted === false"></i>
          <i class="el-icon-error" style="color:red" v-else></i>
        </template>

        <!--排序-->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>

        <!--操作-->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditCate(scope.row.cat_id)">编辑
          </el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteCate(scope.row.cat_id)">删除
          </el-button>
        </template>
      </tree-table>

      <!--分页区域-->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15, 20]" :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>
    <!--添加分类对话框-->
    <el-dialog title="添加分类" :visible.sync="addCatevisible" width="50%" @close="addCateRest">
      <!--添加分类表单-->
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:">
          <!-- options用来指定数据源 -->
          <!-- props用来配置指定对象 -->
          <el-cascader clearable :props="cascaderProps" v-model="selectedKeys" :options="parentCateList"
            @change="parentCateChanged">
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCatevisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!--编辑分类对话框-->
    <el-dialog title="编辑分类" :visible.sync="editCateDialogVisible" width="30%">
      <el-form :model="editCateForm" :rules="editCateFormRules" ref="editCateFormRef" label-width="100px">
        <el-form-item label="分类等级">
          <el-input v-model="editCateForm.cat_level" disabled></el-input>
        </el-form-item>
        <el-form-item label="分类ID">
          <el-input v-model="editCateForm.cat_id" disabled></el-input>
        </el-form-item>
        <el-form-item label="分类名称">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCateSubmit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类的数据
      cateList: [],
      // 总数据条数
      total: 0,
      // 为table指定列
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 将当前列定义为模板列
          type: 'template',
          // 表示当前这一列的模板名称
          template: 'isok'
        },
        {
          label: '排序',
          // 将当前列定义为模板列
          type: 'template',
          // 表示当前这一列的模板名称
          template: 'order'
        },
        {
          label: '操作',
          // 将当前列定义为模板列
          type: 'template',
          // 表示当前这一列的模板名称
          template: 'opt'
        }
      ],
      // 控制添加对话框的显示与隐藏
      addCatevisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        // 将要添加的分类名称
        cat_name: '',
        // 将要添加的分类等级 默认为一级分类
        cat_level: 0,
        // 父级分类ID 默认为一级
        cat_pid: 0
      },
      // 添加分类表单的校验规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', triger: 'blur' }
        ],
        cat_level: [
          { required: true, message: '请输入分类等级', triger: 'blur' }
        ]
      },
      // 父级分类列表
      parentCateList: [],
      // 指定级联选择器配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true,
        expandTrigger: 'hover'
      },
      // 选中的父级分类ID数组
      selectedKeys: [],
      // 控制编辑分类对话框显示与隐藏
      editCateDialogVisible: false,
      // 编辑分类表单数据
      editCateForm: [],
      // 编辑分类的校验规则
      editCateFormRules: {
        cat_name: [
          { required: true, message: '请填写分类名称', triger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据
    async getCateList () {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败!')
      } else {
        // 把数据列表赋值给cateList
        this.cateList = res.data.result
        // 为总数据条数赋值
        this.total = res.data.total
      }
    },
    // 监听pagesize改变的事件
    handleSizeChange (newsize) {
      this.queryInfo.pagesize = newsize
      // 拿到新值后请求刷新页面
      this.getCateList()
    },
    // 监听pagenum改变事件
    handleCurrentChange (newnum) {
      this.queryInfo.pagenum = newnum
      // 拿到新值请求刷新页面
      this.getCateList()
    },
    // 打开添加分类对话框事件
    showAddCateDialog () {
      // 先获取父级分类列表
      this.getParentCateList()
      // 再打开添加对话框
      this.addCatevisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类失败!')
      } else {
        this.parentCateList = res.data
      }
    },
    // 选择项发生变化触发此函数
    parentCateChanged () {
      console.log(this.selectedKeys)
      // 如果selectedKeys 数组大于0,证明选中的父级分类
      // 反之说明没有选择任何父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类ID
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        // 父级分类ID
        this.addCateForm.cat_pid = 0
        // 当前分类的等级赋值
        this.addCateForm.cat_level = 0
      }
    },
    // 检测对话框关闭事件清空表单
    addCateRest () {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    // 点击按钮添加新的分类
    addCate () {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) {
          return false
        } else {
          const { data: res } = await this.$http.post('categories', this.addCateForm)
          if (res.meta.status !== 201) {
            return this.$message.error('添加分类失败!')
          } else {
            this.$message.success('添加分类成功')
            this.getCateList()
            this.addCatevisible = false
          }
        }
      })
    },
    // 打开编辑分类对话框
    async showEditCate (id) {
      const { data: res } = await this.$http.get(`categories/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('获取编辑菜单数据失败')
      } else {
        this.editCateForm = res.data
        this.editCateDialogVisible = true
      }
    },
    // 提交编辑事件
    async editCateSubmit () {
      const { data: res } = await this.$http.put(`categories/${this.editCateForm.cat_id}`, { cat_name: this.editCateForm.cat_name })
      if (res.meta.status !== 200) {
        return this.$message.error('编辑分类名称失败!')
      } else {
        this.$message.success('编辑分类名称成功!')
        this.editCateDialogVisible = false
        this.getCateList()
      }
    },
    // 删除分类事件
    async deleteCate (id) {
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult === 'confirm') {
        const { data: res } = await this.$http.delete(`categories/${id}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除失败!')
        } else {
          this.$message.success('删除成功!')
          this.getCateList()
        }
      } else {
        return this.$message.info('已取消该操作')
      }
    }
  }
}
</script>

<style lang="less" scoped>
.tree-table {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
.el-radio__input {
  display: none !important;
}
</style>
