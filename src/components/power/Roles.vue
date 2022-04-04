<template>
  <div>
    <!--面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图-->
    <el-card>
      <!--添加角色按钮区域-->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddRoleDialog">
            添加角色
          </el-button>
        </el-col>
      </el-row>

      <!--角色列表区域-->
      <el-table :data="roleList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="['bdbottom',index ===0?'bdtop':'','display-align-items']"
              v-for="(item,index) in scope.row.children" :key="item.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item.id)">{{item.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!--通过for循环嵌套渲染二级权限-->
                <el-row :class="['bdtop',index2 === 0?'':'bdtop','display-align-items']"
                  v-for="(item2,index2) in item.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(scope.row,item2.id)">
                      {{item2.authName}}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag type="warning" v-for="(item3) in item2.children" :key="item3.id" closable
                      @close="removeRightById(scope.row,item3.id)">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!--索引列-->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template width="300px" slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showRoleInfo(scope.row.id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteRight(scope.row)">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClose">
      <el-tree ref="treeRef" show-checkbox :data="rightsList" :props="rightProps" node-key="id"
        :default-expand-all="true" :default-checked-keys="defKeys">
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="addroleDialogVisible" width="50%">
      <!--添加角色主体-->
      <el-form ref="addRolesFormRef" :rules="addRolesFormRules" :model="addRolesForm" label-width="80px">
        <el-form-item label="用户名" prop="roleName">
          <el-input v-model="addRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="用户描述">
          <el-input v-model="addRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addroleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!--编辑对话框-->
    <el-dialog ref="editRoleFormRef" :rules="addRolesFormRules" title="修改角色" :visible.sync="editDialogVisible"
      width="30%">
      <el-form :model="editForm" ref="editFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 所有角色列表数据
      roleList: [],
      // 控制分配权限对话框
      setRightDialogVisible: false,
      // 所有权限的数据
      rightsList: [],
      // 树形控件的绑定对象
      rightProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点ID值数组
      defKeys: [],
      // 当前展开的分配权限的角色id
      roleId: [],
      // 添加角色对话框
      addroleDialogVisible: false,
      // 添加角色表单数据
      addRolesForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加角色表单验证
      addRolesFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ]
      },
      // 编辑角色信息数据
      editForm: {},
      // 控制编辑角色对话框
      editDialogVisible: false
    }
  },
  created () {
    this.getRoleList()
  },
  methods: {
    // 获取角色列表数据
    async getRoleList () {
      const { data: res } = await this.$http.get('roles')

      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      } else {
        this.roleList = res.data
        console.log(this.roleList)
      }
    },
    // 根据id删除权限
    async removeRightById (role, rightId) {
      // 弹框提示用户是否删除

      const confirmResult = await this.$confirm('此操作将永久删除该用户的此权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消该操作')
      } else {
        const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('删除失败')
        } else {
          role.children = res.data
          return this.$message.success('删除成功')
        }
      }
    },
    // 展示分配权限事件
    async showSetRightDialog (role) {
      // 获取所有权限数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败')
      } else {
        this.roleId = role.id
        // 递归获取三级节点
        console.log(role)
        this.getLeafKeys(role, this.defKeys)
        // 把获取到的权限数据保存到data中
        this.setRightDialogVisible = true
        this.rightsList = res.data
        // console.log(this.rightsList)
      }
    },
    // 通过递归形式，获取角色下所有三级权限的id
    // ,并保存到defKeys数组当中
    getLeafKeys (node, arr) {
      // 如果当前node节点不包括children属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item =>
        this.getLeafKeys(item, arr))
    },
    // 监听分配权限关闭事件
    setRightDialogClose () {
      this.defKeys = []
    },
    // 点击确定为角色分配权限
    async allotRights () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      console.log(keys)
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限成功')
      } else {
        this.getRoleList()
        this.setRightDialogVisible = false
        return this.$message.success('分配权限成功')
      }
    },
    // 删除角色
    async deleteRight (role) {
      const deleteConfirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (deleteConfirmResult !== 'confirm') {
        return this.$message.info('已取消该操作')
      } else {
        const { data: res } = await this.$http.delete(`roles/${role.id}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除失败')
        } else {
          this.getRoleList()
          return this.$message.success('删除成功')
        }
      }
    },
    // 控制添加角色对话框
    showAddRoleDialog () {
      this.addroleDialogVisible = true
    },
    // 添加角色点击事件
    addRole () {
      this.$refs.addRolesFormRef.validate(async valid => {
        if (!valid) {
          return false
        } else {
          var { data: res } = await this.$http.post('roles', this.addRolesForm)
          if (res.meta.status !== 201) {
            return this.$message.error('添加角色失败')
          } else {
            this.$message.success('添加角色成功')
            this.addroleDialogVisible = false
            this.getRoleList()
          }
        }
      })
    },
    // 展示角色信息
    async showRoleInfo (id) {
      const { data: res } = await this.$http.get(`roles/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('查询角色信息失败')
      } else {
        this.editForm = res.data
        this.editDialogVisible = true
      }
    },
    // 修改角色信息
    editRoleInfo () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return false
        } else {
          const { data: res } = await this.$http.put(`roles/${this.editForm.roleId}`, { roleName: this.editForm.roleName, roleDesc: this.editForm.roleDesc })
          if (res.meta.status !== 200) {
            return this.$message.error('修改角色失败!')
          } else {
            this.$message.success('修改成功!')
            this.getRoleList()
            this.editDialogVisible = false
          }
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.display-align-items {
  display: flex;
  align-items: center;
}
.el-table {
  margin-top: 15px;
}
</style>
