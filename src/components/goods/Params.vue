<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图区域-->
    <el-card>
      <el-alert title="注意:只允许修改第三级分类的相关参数！" type="warning" :closable="false" show-icon>
      </el-alert>
      <!--选择商品分类区域-->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类:</span>
          <!--选择商品分类级联选择框-->
          <el-cascader v-model="selectedKeys" :options="cateList" :props="cateProps" @change="handleChange">
          </el-cascader>
        </el-col>
      </el-row>
      <!--tab 页签-->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!--添加动态参数的面板-->
        <el-tab-pane label="动态参数" name="many">
          <!--添加动态参数的按钮-->
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="showAddParamsDialog">添加参数</el-button>
          <!--动态参数表格-->
          <el-table :class="'cat_opt'" :data="manyTableData" border stripe>
            <!--展开行-->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!--循环渲染Tag标签-->
                <el-tag v-for="(item,index) in scope.row.attr_vals" closable @close="handleClose(index,scope.row)"
                  :key="index">
                  {{item}}
                </el-tag>
                <!--输入的文本框-->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue"
                  ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)">
                </el-input>
                <!--添加的按钮-->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag
                </el-button>
              </template>
            </el-table-column>
            <!--索引行-->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑
                </el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleParams(scope.row.attr_id)">删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!--添加静态属性的面板-->
        <el-tab-pane label="静态属性" name="only">
          <!--添加静态属性的按钮-->
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="showAddParamsDialog">添加属性</el-button>
          <!--静态属性表格-->
          <el-table :class="'cat_opt'" :data="onlyTableData" border stripe>
            <!--展开行-->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!--循环渲染Tag标签-->
                <el-tag v-for="(item,index) in scope.row.attr_vals" closable @close="handleClose(index,scope.row)"
                  :key="index">
                  {{item}}
                </el-tag>
                <!--输入的文本框-->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue"
                  ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)">
                </el-input>
                <!--添加的按钮-->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag
                </el-button>
              </template>
            </el-table-column>
            <!--索引行-->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑
                </el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleParams(scope.row.attr_id)">删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数对话框 -->
    <el-dialog :title="activeName==='many'?'添加动态参数':'添加静态属性'" :visible.sync="addParamsDialogVisible" width="50%"
      @close="addDialogClosed">
      <!--添加参数表单-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="activeName==='many'?'参数名称':'属性名称'" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!--修改参数对话框-->
    <el-dialog title="修改" :visible.sync="editParamsDialogVisible" width="50%" @close="editDialogClosed">
      <!--添加参数表单-->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="activeName==='many'?'参数名称':'属性名称'" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 所有列表数据
      cateList: [],
      // 级联选择框的配置对象
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联选择框双向绑定数组
      selectedKeys: [],
      // 被激活的页签名称
      activeName: 'many',
      // 动态参数数据数组
      manyTableData: [],
      // 静态属性的数据
      onlyTableData: [],
      // 控制添加参数对话框显示与隐藏
      addParamsDialogVisible: false,
      // 添加表单数据对象
      addForm: {
        attr_name: ''
      },
      // 添加表单验证规则
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', triger: 'blur' }
        ]
      },
      // 控制修改对话框显示与隐藏
      editParamsDialogVisible: false,
      // 修改表单数据对象
      editForm: {},
      // 修改表单验证规则
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', triger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取所有商品列表分类
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败!')
      } else {
        this.cateList = res.data
        console.log(this.cateList)
      }
    },
    // 监听级联选择框改变
    async handleChange () {
      this.getParamsData()
    },
    // tab页签点击事件处理函数
    handleTabClick () {
      console.log(this.activeName)
      this.getParamsData()
    },
    // 获取参数列表数据
    async getParamsData () {
      // 证明选中不是三级菜单
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return this.$message.error('请选择三级分类!')
      } else {
        // 根据分类Id和当前所处的面板，获取对应参数
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
        if (res.meta.status !== 200) {
          return this.$message.error('获取参数列表失败！')
        } else {
          res.data.forEach(item => {
            item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
            // 控制文本框的显示与隐藏
            item.inputVisible = false
            // 文本框中输入的值
            item.inputValue = ''
          })
          console.log(res.data)
          if (this.activeName === 'many') {
            this.manyTableData = res.data
          } else {
            this.onlyTableData = res.data
          }
        }
      }
    },
    // 打开添加参数对话框事件
    showAddParamsDialog () {
      this.addParamsDialogVisible = true
    },
    // 监听添加参数对话框关闭事件
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 添加参数事件
    addParams () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return false
        } else {
          const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, { attr_name: this.addForm.attr_name, attr_sel: this.activeName })
          if (res.meta.status !== 201) {
            return this.$message.error('添加参数失败!')
          } else {
            this.$message.success('添加参数成功!')
            this.addParamsDialogVisible = false
            this.getParamsData()
          }
        }
      })
    },
    // 点击按钮显示修改对话框
    async showEditDialog (id) {
      this.editParamsDialogVisible = true
      // 查询当前参数的信息
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${id}`, { params: { attr_sel: this.activeName } })
      if (res.meta.status !== 200) {
        return this.$message.error('查询信息失败!')
      } else {
        this.editForm = res.data
      }
    },
    // 监听修改对话框关闭事件
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 点击按钮修改参数信息
    editParams () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return false
        } else {
          const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, { attr_name: this.editForm.attr_name, attr_sel: this.activeName })
          if (res.meta.status !== 200) {
            return this.$message.error('修改失败!')
          } else {
            this.$message.success('修改参数成功!')
            this.getParamsData()
            this.editParamsDialogVisible = false
          }
        }
      })
    },
    // 删除参数事件
    async deleParams (id) {
      const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消该操作')
      } else {
        const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除参数失败!')
        } else {
          this.$message.success('删除参数成功!')
          this.getParamsData()
        }
      }
    },
    // 文本框失去焦点或按下enter键
    async handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        console.log('false...')
        return false
      } else {
        row.attr_vals.push(row.inputValue.trim())
        row.inputValue = ''
        row.inputVisible = false
        this.saveAttrVals(row)
      }
    },
    // 删除对应的参数可选项
    handleClose (index, row) {
      console.log(row)
      row.attr_vals.splice(index, 1)
      this.saveAttrVals(row)
    },
    // 将对att_vals的操作保存到数据库
    async saveAttrVals (row) {
      // 需要发起请求存储到数据库
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(',')
      })
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数项失败!')
      } else {
        this.$message.success('修改参数成功!')
      }
    },
    showInput (row) {
      row.inputVisible = true
      // 让文本框自动获得焦点
      // $nextTick 方法作用，当页面上元素被重新渲染之后，才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    }
  },
  computed: {
    // 如果按钮需要被禁用返回false，否则返回true
    isBtnDisabled () {
      if (this.selectedKeys.length !== 3) {
        return true
      } else {
        return false
      }
    },
    // 当前选中的三级分类的ID
    cateId () {
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[2]
      } else {
        return null
      }
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 10px;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 120px;
}
</style>
