<template>
  <el-container class="inner">
		<el-header style="font-size: 12px" height="20px">
			<el-breadcrumb separator="/">
				<el-breadcrumb-item :to="{ path: '/project' }" :replace=true>项目管理</el-breadcrumb-item>
				<el-breadcrumb-item>模块管理</el-breadcrumb-item>
			</el-breadcrumb>
		</el-header>

    <el-dialog title="添加/编辑模块" :visible.sync="dialogFormVisible">
      <el-form :model="editItem" :rules="rules" ref="ruleForm">
        <el-form-item label="模块名称" :label-width="formLabelWidth" prop="type">
          <el-input
            v-model="editItem.type"
            size="small"
            style="width:100%;"
          ></el-input>
        </el-form-item>
        <el-form-item label="成本（元）" :label-width="formLabelWidth" prop="cost">
          <el-input
            v-model.number="editItem.cost"
            type="number"
            min="0"
            size="small"
          ></el-input>
        </el-form-item>
        <el-form-item label="单方指标（元/m^2）" :label-width="formLabelWidth" prop="perPrice">
          <el-input
            v-model.number="editItem.perPrice"
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
      <el-table-column prop="cost" label="成本（元）"> </el-table-column>
			<el-table-column prop="perPrice" label="单方指标（元/m^2）"> </el-table-column>
      <el-table-column prop="createdAt" label="创建时间"> </el-table-column>
      <el-table-column label="操作" fixed="right">
        <template slot="header">
          <el-button 
            type="primary"
            size="small"
            icon="el-icon-plus"
            @click="handleAddModule()">
          </el-button>
        </template>
        <template slot-scope="scope" v-if="scope.row.proId">
          <el-button 
            type="text"
            size="small"
            icon="el-icon-view"
            @click="handleQueryItems(scope.row)">
          </el-button>
          <el-button 
            type="text"
            size="small"
            icon="el-icon-edit"
            @click="handleEditModule(scope.row)">
          </el-button>
          <el-button 
            type="text"
            size="small"
            icon="el-icon-delete"
            @click="handleDelModule(scope.row)">
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-container>
</template>

<script>
import AV from "leancloud-storage";
const query = new AV.Query("Module");
const Module = AV.Object.extend("Module");

export default {
  name: "module-page",
  components: {},
  methods: {
    handleQueryItems(row) {
      this.$router.push({ name: 'item-page', params: { mid: row.objectId, mName: row.type, pid: row.proId}});
    },
    handleAddModule() {
      if (this.dialogFormVisible) {
        return;
      }

      this.editItem = {
        proId: this.proId,
      };
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
    addItem(row) {
      const _this = this;
      const item = new Module();
      item.set("proId", row.proId);
      item.set("type", row.type);
      item.set("cost", row.cost);
      item.set("perPrice", row.perPrice);
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
      const item = AV.Object.createWithoutData("Module", row.objectId);
      item.set("type", row.type);
      item.set("cost", row.cost);
      item.set("perPrice", row.perPrice);
      item.save().then(
        (result) => {
          console.log(`update module succ：`, result);
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
			query.equalTo("proId", this.proId);
      query.ascending("createdAt");
      query.find().then(
        (result) => {
          _this.loading = false;
					var sumCost = 0;
					_this.tableData = result.map((obj) => {
						var o = obj.toJSON();
						sumCost += o.cost;
						return o;
					});
					if (_this.tableData.length) {
						_this.tableData.push({
							type: "总成本合计",
							cost: sumCost,
							notShow: true,
						}, {
							type: "总收入",
							notShow: true,
						}, {
							type: "利润率",
							notShow: true,
						});
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
        ],
        perPrice: [
          { type: 'number', message: '必须为数字值'},
          { required: true, message: '请输入', trigger: 'blur' }
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
