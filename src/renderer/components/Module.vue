<template>
  <el-container class="inner">
		<el-header style="font-size: 12px" height="20px">
			<el-breadcrumb separator="/">
				<el-breadcrumb-item :to="{ path: '/project' }" :replace=true>项目管理</el-breadcrumb-item>
				<el-breadcrumb-item>总成本</el-breadcrumb-item>
			</el-breadcrumb>
		</el-header>

    <el-dialog title="编辑模块" :visible.sync="dialogFormVisible">
      <el-form :model="editItem" :rules="rules" ref="ruleForm">
        <el-form-item label="模块名称" :label-width="formLabelWidth" prop="type">
          <label>{{editItem.type}}</label>
        </el-form-item>
        <el-form-item label="成本（元）" :label-width="formLabelWidth" prop="cost">
          <el-input
            v-model.number="editItem.cost"
            type="number"
            min="0"
            size="small"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCancel()">取 消</el-button>
        <el-button type="primary" @click="handleSaveEdit()">确 定</el-button>
      </div>
    </el-dialog>
		
    <el-table :data="tableData" v-loading="loading" height="700">
      <el-table-column prop="type" label="名称" fixed> </el-table-column>
      <el-table-column prop="cost" label="成本（元）">
        <template slot-scope="scope">
          <span v-if="scope.row.type === '利润率'">{{ scope.row.cost | numFilter | percent }}</span>
          <span v-else>{{ scope.row.cost | numFilter }}</span>
        </template>
      </el-table-column>
			<el-table-column prop="perPrice" label="单方指标（元/m^2）">
        <template slot-scope="scope">
          <span>{{ scope.row.perPrice | numFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right">
        <template slot-scope="scope" v-if="project.objectId && !scope.row.notShow">
          <el-button 
            type="text"
            size="small"
            icon="el-icon-view"
            v-if="!scope.row.detail"
            @click="handleQueryItems(scope.row)">
          </el-button>
          <el-button 
            type="text"
            size="small"
            icon="el-icon-edit"
            @click="handleEditModule(scope.row)">
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-container>
</template>

<script>
import AV from "leancloud-storage";
const query = new AV.Query('Project');
const Project = AV.Object.extend("Project");
const Mapping = {
  '前期及地下四大块': 'module1',
  '地下车库土建': 'module2',
  '主楼土建': 'module3',
  '其他专业分包': 'module4',
  '其他费用': 'module5'
};

export default {
  name: "module-page",
  components: {},
  filters: {
    numFilter(value) {
      if (!value) {
        return value;
      }
      return parseFloat(value).toFixed(2);
    },
    percent(value) {
      if (value != undefined) {
        return value + '%';
      }
      return value;
    }
  },
  methods: {
    handleQueryItems(row) {
      this.$router.push({ name: 'item-page', params: { mName: row.type, pid: this.project.objectId}});
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
        if (row.type == '总收入' || Mapping[row.type]) {
          _this.updateItem(row);
        }
      });
    },
    handleEditModule(row) {
      this.dialogFormVisible = true;
      this.editItem = row;
    },
    handleDelModule(row) {
      const _this = this;
      this.$confirm('此操作将永久删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const item = AV.Object.createWithoutData('Module', row.objectId);
        item.destroy().then(
          (result) => {
            _this.fetchModules();
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
        this.fetchModules();
      }
    },
    updateItem(row) {
      const _this = this;
      const item = AV.Object.createWithoutData("Project", this.project.objectId);
      if (row.type == "总收入") {
        item.set("income", row.cost);
      } else if (Mapping[row.type]) {
        item.set(Mapping[row.type] + "Cost", row.cost);
      } else {
        return;
      }
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
    fetchModules() {
      const _this = this;
      this.loading = true;
      query.get(this.proId).then(
        (result) => {
          _this.loading = false;
          _this.tableData = [];
          var obj = result.toJSON();
          _this.project = obj;
          var sumCost = 0;
          var key = "";
          for (key in Mapping) {
            var o = {
              type: key,
              cost: obj[Mapping[key] + "Cost"]
            };
            if (o.cost) {
              sumCost += o.cost;
            }
            if (o.cost && obj.area) {
              o.perPrice = o.cost / obj.area;
            }
            _this.tableData.push(o);
          }
					
					if (_this.tableData.length) {
            var p = {
              type: "利润率",
              notShow: true,
						};
            if (obj.income && sumCost) {
              p.cost = obj.income/sumCost * 100;
            }
						_this.tableData.push({
							type: "总成本合计",
              cost: sumCost,
              notShow: true,
						}, {
              type: "总收入",
              cost: obj.income,
              detail: true
						}, p);
					}
        },
        (error) => {
          _this.loading = false;
          _this.displayError(error);
        }
      );
    },
  },
  created() {
		if (this.$route.params.pid) {
			this.proId = this.$route.params.pid;
			this.fetchModules();
		}
  },
  data() {
    return {
			tableData: [],
      proId: "",
      editItem: {},
      dialogFormVisible: false,
      formLabelWidth: '200px',
      rules: {
        type: [
          { required: true, message: '请输入', trigger: 'blur' },
          { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
        ],
        cost: [
          { type: 'number', message: '必须为数字值'},
          { required: true, message: '请输入', trigger: 'blur' }
        ]
      },
      loading: false,
      project: {}
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
