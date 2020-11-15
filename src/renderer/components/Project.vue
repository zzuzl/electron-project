<template>
  <el-container class="inner">
    <el-header style="font-size: 12px" height="20px">
      <el-breadcrumb separator="/project">
        <el-breadcrumb-item>项目管理</el-breadcrumb-item>
      </el-breadcrumb>
    </el-header>

    <el-dialog title="添加/编辑项目" :visible.sync="dialogFormVisible">
      <el-form :model="editItem" :rules="rules" ref="ruleForm">
        <el-form-item label="项目名称" :label-width="formLabelWidth" prop="name">
          <el-input
            v-model="editItem.name"
            size="small"
            style="width:100%;"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCancel()">取 消</el-button>
        <el-button type="primary" @click="handleSaveEdit()">确 定</el-button>
      </div>
    </el-dialog>

    <el-table :data="tableData" v-loading="loading" height="700">
      <el-table-column prop="name" label="项目名称" fixed>
      </el-table-column>
      <el-table-column prop="creator" label="创建人"> 
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间">
      </el-table-column>
      <el-table-column label="操作" fixed="right">
        <template slot="header">
          <el-button 
            type="primary"
            size="small"
            icon="el-icon-plus"
            @click="handleAddProject()">
          </el-button>
        </template>
        <template slot-scope="scope">
          <el-button 
            type="text"
            size="small"
            icon="el-icon-view"
            @click="handleQueryPrice(scope.row)">
          </el-button>
          <el-button 
            type="text"
            size="small"
            icon="el-icon-edit"
            @click="handleEditProject(scope.row)">
          </el-button>
          <el-button 
            type="text"
            size="small"
            icon="el-icon-delete"
            @click="handleDelProject(scope.row)">
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-container>
</template>

<script>
import AV from 'leancloud-storage'
const query = new AV.Query('Project');
const Project = AV.Object.extend("Project");

export default {
  name: "project-page",
  components: {},
  methods: {
    handleQueryPrice(row) {
      this.$router.push({ name: 'module-page', params: { pid: row.objectId }});
    }, 
    handleAddProject() {
      if (this.dialogFormVisible) {
        return;
      }

      this.editItem = {};
      this.dialogFormVisible = true;
    },
    handleCancel() {
      this.dialogFormVisible = false;
      this.editItem = {};
    },
    handleSaveEdit() {
      var row = this.editItem;
      const _this = this;
      this.$refs['ruleForm'].validate((valid) => {
        if (!valid) {
          _this.displayError("form validation error");
          return;
        }
      });
      if (row.objectId) {
        this.updateItem(row);
      } else {
        this.addItem(row);
      }
    },
    handleEditProject(row) {
      this.dialogFormVisible = true;
      this.editItem = row;
    },
    handleDelProject(row) {
      const _this = this;
      this.$confirm('此操作将永久删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const item = AV.Object.createWithoutData('Project', row.objectId);
        item.destroy().then(
          (result) => {
            _this.fetchProjects();
          },
          (error) => {
            _this.displayError(error);
          }
        );
      }).catch(() => {
        
      });
    },
    afterEdit(succ) {
      this.dialogFormVisible = false;
      if (succ) {
        this.fetchProjects();
      }
    },
    addItem(row) {
      const currentUser = AV.User.current();
      console.log("current:", currentUser.toJSON());
      const _this = this;
      const item = new Project();
      item.set("name", row.name);
      if (currentUser) {
        item.set("creator", currentUser.toJSON().username);
      }
      item.save().then(
        (result) => {
          _this.afterEdit(true);
        },
        (error) => {
          _this.displayError(error);
          _this.afterEdit(false);
        }
      );
    },
    updateItem(row) {
      const _this = this;
      const item = AV.Object.createWithoutData("Project", row.objectId);
      item.set("name", row.name);
      item.save().then(
        (result) => {
          console.log(`update project succ：`, result);
          _this.afterEdit(true);
        },
        (error) => {
          _this.displayError(error);
          _this.afterEdit(false);
        }
      );
    },
    displayError(e) {
      if (typeof(e) == "string") {
        this.$message.error(e);
      } else {
        this.$message.error(e.message);
      }
    },
    fetchProjects() {
      const _this = this;
      this.loading = true;
      query.descending('createdAt');
      query.find().then(result => {
        _this.loading = false;
        _this.tableData = result.map((obj) => obj.toJSON());
      }, error => {
        _this.loading = false;
        _this.displayError(error);
      })
    }
  },
  created() {
    this.fetchProjects();
  },
  data() {
    return {
      tableData: [],
      editItem: {},
      dialogFormVisible: false,
      formLabelWidth: '100px',
      rules: {
        name: [
          { required: true, message: '请输入', trigger: 'blur' },
          { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
        ]
      },
      loading: false
    };
  },
};
</script>

<style>
.inner .el-header { 
  background-color: #ffffff;
  line-height: 20px;
}
</style>
