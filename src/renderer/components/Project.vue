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
        <el-form-item label="结构类型" :label-width="formLabelWidth" prop="type">
          <el-input
            v-model="editItem.type"
            size="small"
            style="width:100%;"
          ></el-input>
        </el-form-item>
        <el-form-item label="建筑面积" :label-width="formLabelWidth" prop="area">
          <el-input
            v-model.number="editItem.area"
            type="number"
            min="0"
            size="small"
            style="width:100%;"
          ></el-input>
        </el-form-item>
        <el-form-item label="总收入" :label-width="formLabelWidth" prop="income">
          <el-input
            v-model.number="editItem.income"
            type="number"
            min="0"
            size="small"
            style="width:100%;"
          ></el-input>
        </el-form-item>
        <el-form-item label="前期及地下四大块" :label-width="formLabelWidth" prop="module1Cost">
          <el-input
              v-model.number="editItem.module1Cost"
              type="number"
              min="0"
              size="small"
              style="width:100%;"
            ></el-input>
        </el-form-item>
        <el-form-item label="地下车库土建" :label-width="formLabelWidth" prop="module2Cost">
          <el-input
              v-model.number="editItem.module2Cost"
              type="number"
              min="0"
              size="small"
              style="width:100%;"
            ></el-input>
        </el-form-item>
        <el-form-item label="主楼土建" :label-width="formLabelWidth" prop="module3Cost">
          <el-input
              v-model.number="editItem.module3Cost"
              type="number"
              min="0"
              size="small"
              style="width:100%;"
            ></el-input>
        </el-form-item>
        <el-form-item label="其他专业分包" :label-width="formLabelWidth" prop="module4Cost">
          <el-input
              v-model.number="editItem.module4Cost"
              type="number"
              min="0"
              size="small"
              style="width:100%;"
            ></el-input>
        </el-form-item>
        <el-form-item label="其他费用" :label-width="formLabelWidth" prop="module5Cost">
          <el-input
              v-model.number="editItem.module5Cost"
              type="number"
              min="0"
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

    <el-row>
      <el-col :span="24" style="text-align: left; margin-bottom: 10px">
        <el-button 
          type="text"
          size="small"
          icon="el-icon-plus"
          @click="handleAddProject()">
        </el-button>
        <el-button 
          type="text"
          size="small"
          icon="el-icon-edit"
          v-if="current.objectId"
          @click="handleEditProject()">
        </el-button>
        <el-button 
          type="text"
          size="small"
          icon="el-icon-delete"
          v-if="current.objectId"
          @click="handleDelProject()">
        </el-button>
      </el-col>
    </el-row>
    <el-row class="tb">
      <el-col :span="2">
        <el-tag effect="plain">项目名称</el-tag>
      </el-col>
      <el-col :span="4">
        <el-select size="small" v-model="objectId" placeholder="请选择" @change="selectProject($event)" style="margin-left: 10px; margin-right: 10px">
          <el-option 
            v-for="item in tableData"
            :key="item.objectId"
            :label="item.name"
            :value="item.objectId">
          </el-option>
        </el-select>
      </el-col>
      <el-col :span="2">
        <el-tag effect="plain">结构类型</el-tag>
      </el-col>
      <el-col :span="4">
        <span>{{ current.type }}</span>
      </el-col>
      <el-col :span="2">
        <el-tag effect="plain">建安成本</el-tag>
      </el-col>
      <el-col :span="4">
        <span>{{ current.jaCost | numFilter }}</span>
      </el-col>
      <el-col :span="2">
        <el-tag effect="plain">建筑面积</el-tag>
      </el-col>
      <el-col :span="4">
        <span>{{ current.area | numFilter }}</span>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="4">
        <el-button class="row-btn" type="primary" @click="handleQueryPrice" :disabled="!current.objectId">总成本</el-button>
      </el-col>
      <el-col :span="4" v-for="(value, name) in flag" :key="name">
        <el-button class="row-btn" @click="handleQueryPrice" :module-name="name" :disabled="!current.objectId">{{name}}</el-button>
      </el-col>
    </el-row>
  </el-container>
</template>

<script>
import AV from 'leancloud-storage'
const query = new AV.Query('Project');
const Project = AV.Object.extend("Project");

export default {
  name: "project-page",
  components: {},
  filters: {
    numFilter(value) {
      if (!value) {
        return value;
      }
      return parseFloat(value).toFixed(2);
    }
  },
  methods: {
    selectProject(data) {
      if (!data) {
        this.current = {};
        return;
      }
      const _this = this;
      var found = false;
      this.tableData.forEach(function(project) {
        if (project.objectId == data) {
          _this.current = project;
          found = true;
        }
      })

      if (!found) {
        console.error("not found project.");
        return;
      }

      _this.current.jaCost = _this.current.module1Cost + _this.current.module2Cost + _this.current.module3Cost + _this.current.module4Cost + _this.current.module5Cost;
    },
    handleQueryPrice(event) {
      if (!event || !event.currentTarget) {
        return;
      }
      var type = event.currentTarget.getAttribute('module-name');
      if (!this.current || !this.current.objectId) {
        return;
      }
      if (type) {
        this.$router.push({ name: 'item-page', params: { pid: this.current.objectId, mName: type }});
      } else {
        this.$router.push({ name: 'module-page', params: { pid: this.current.objectId }});
      }
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
        if (row.objectId) {
          _this.updateItem(row);
        } else {
          _this.addItem(row);
        }
      });
    },
    handleEditProject() {
      if (!this.current || !this.current.objectId) {
        return;
      }
      this.dialogFormVisible = true;
      this.editItem = this.current;
    },
    handleDelProject() {
      if (!this.current || !this.current.objectId) {
        return;
      }
      const _this = this;
      this.$confirm('此操作将永久删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const item = AV.Object.createWithoutData('Project', this.current.objectId);
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
      this.moduleFormVisible = false;
      if (succ) {
        this.fetchProjects();
      }
    },
    addItem(row) {
      const currentUser = AV.User.current();
      if (currentUser) {
        console.log("current:", currentUser.toJSON());
      }
      
      const _this = this;
      const item = new Project();
      item.set("name", row.name);
      item.set("type", row.type);
      item.set("area", row.area);
      item.set("income", row.income);
      item.set("module1Cost", row.module1Cost);
      item.set("module2Cost", row.module2Cost);
      item.set("module3Cost", row.module3Cost);
      item.set("module4Cost", row.module4Cost);
      item.set("module5Cost", row.module5Cost);
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
      item.set("type", row.type);
      item.set("area", row.area);
      item.set("income", row.income);
      item.set("module1Cost", row.module1Cost);
      item.set("module2Cost", row.module2Cost);
      item.set("module3Cost", row.module3Cost);
      item.set("module4Cost", row.module4Cost);
      item.set("module5Cost", row.module5Cost);
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
        var found = false;
        _this.tableData = result.map((obj) => {
          var o = obj.toJSON()
          if (o.objectId == _this.objectId) {
            found = true;
            _this.selectProject(_this.objectId);
          }
          return o;
        });
        if (!found) {
          _this.objectId = "";
          _this.selectProject(_this.objectId);
        }
      }, error => {
        _this.loading = false;
        _this.displayError(error);
      })
    },
    emptyFlags() {
      return {
        '前期及地下四大块': 'module1',
        '地下车库土建': 'module2',
        '主楼土建': 'module3',
        '其他专业分包': 'module4',
        '其他费用': 'module5'
      }
    }
  },
  created() {
    this.fetchProjects();
    this.flag = this.emptyFlags();
  },
  data() {
    return {
      tableData: [],
      editItem: {},
      editModule: {},
      dialogFormVisible: false,
      moduleFormVisible: false,
      formLabelWidth: '160px',
      rules: {
        name: [
          { required: true, message: '请输入', trigger: 'blur' },
          { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请输入', trigger: 'blur' },
          { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
        ],
        area: [
          { type: 'number', message: '必须为数字值'},
          { required: true, message: '请输入', trigger: 'blur' }
        ],
        income: [
          { type: 'number', message: '必须为数字值'},
          { required: true, message: '请输入', trigger: 'blur' }
        ],
        module1Cost: [
          { type: 'number', message: '必须为数字值'},
          { required: true, message: '请输入', trigger: 'blur' }
        ],
        module2Cost: [
          { type: 'number', message: '必须为数字值'},
          { required: true, message: '请输入', trigger: 'blur' }
        ],
        module3Cost: [
          { type: 'number', message: '必须为数字值'},
          { required: true, message: '请输入', trigger: 'blur' }
        ],
        module4Cost: [
          { type: 'number', message: '必须为数字值'},
          { required: true, message: '请输入', trigger: 'blur' }
        ],
        module5Cost: [
          { type: 'number', message: '必须为数字值'},
          { required: true, message: '请输入', trigger: 'blur' }
        ]
      },
      loading: false,
      current: {},
      objectId: '',
      flag: {}
    };
  },
};
</script>

<style>
.inner .el-header { 
  background-color: #ffffff;
  line-height: 20px;
}
.tb .el-col {
  border: 1px solid #000000;
  text-align: center;
  height: 40px;
  line-height: 40px;
}
.row-btn {
  width: 100%;
  height: 100%;
}
.item {
  margin: 4px;
}
</style>
