<template>
  <el-container class="inner">
    <el-header style="font-size: 12px" height="20px">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/project' }" :replace="true"
          >项目管理</el-breadcrumb-item
        >
        <el-breadcrumb-item
          :to="{ name: 'module-page', params: { pid: proId } }"
          :replace="true"
          >总成本</el-breadcrumb-item
        >
        <el-breadcrumb-item>{{ mName }}</el-breadcrumb-item>
      </el-breadcrumb>
    </el-header>

    <el-dialog title="添加/编辑费用项" :visible.sync="dialogFormVisible">
      <el-form :model="editItem" :rules="rules" ref="ruleForm">
        <el-form-item label="分项名称" :label-width="formLabelWidth" prop="name">
          <el-autocomplete
            v-model="editItem.name"
            :fetch-suggestions="querySearch"
            size="small"
            style="width:100%;"
          ></el-autocomplete>
        </el-form-item>
        <el-form-item label="建筑面积（m^2）" :label-width="formLabelWidth" prop="area">
          <el-input
            v-model.number="editItem.area"
            type="number"
            min="0"
            size="small"
          ></el-input>
        </el-form-item>
        <el-form-item label="含量指数" :label-width="formLabelWidth" prop="ci">
          <el-input
            v-model.number="editItem.ci"
            size="small"
            type="number"
            min="0"
          ></el-input>
        </el-form-item>
        <el-form-item label="单位" :label-width="formLabelWidth" prop="unit">
          <el-select
            v-model="editItem.unit"
            placeholder="请选择"
            size="small"
          >
            <el-option label="元" value="元"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="分项工程量" :label-width="formLabelWidth" prop="quantity">
          <el-input
            v-model.number="editItem.quantity"
            type="number"
            min="0"
            size="small"
          ></el-input>
        </el-form-item>
        <el-form-item label="分项单价（元/单位）" :label-width="formLabelWidth" prop="qPrice">
          <el-input
            v-model.number="editItem.qPrice"
            type="number"
            min="0"
            size="small"
          ></el-input>
        </el-form-item>
        <el-form-item label="备注" :label-width="formLabelWidth">
          <el-input
            v-model="editItem.note" 
          >
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCancel()">取 消</el-button>
        <el-button type="primary" @click="handleSaveEdit()">确 定</el-button>
      </div>
    </el-dialog>

    <el-table 
      :data="tableData" 
      default-expand-all
      row-key="rowKey"
      height="700"
      :cell-style="{padding:'0px'}"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
      <el-table-column prop="name" label="分项名称" width="250" fixed>
        <template slot-scope="scope">
          <span>{{scope.row.name}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="area" label="建筑面积（m^2）" width="150">
        <template slot-scope="scope">
          <span>{{scope.row.area | numFilter}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="ci" label="含量指数" width="150">
        <template slot-scope="scope">
          <span>{{scope.row.ci | numFilter}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="unit" label="单位" width="100">
        <template slot-scope="scope">
          <span>{{scope.row.unit}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="quantity" label="分项工程量" width="150">
        <template slot-scope="scope">
          <span>{{scope.row.quantity | numFilter}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="qPrice" label="分项单价（元/单位）" width="150">
        <template slot-scope="scope">
          <span>{{scope.row.qPrice | numFilter}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="sumPrice" label="合价" width="150">
        <template slot-scope="scope">
          <span>{{scope.row.sumPrice | numFilter}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="perPrice" label="单方指标（元/m^2）" width="150">
        <template slot-scope="scope">
          <span>{{scope.row.perPrice | numFilter}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="percent" label="合价占比（%）" width="150">
        <template slot-scope="scope">
          <span>{{scope.row.percent | numFilter | percent}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="note" label="备注" width="200">
        <template slot-scope="scope">
          <span>{{scope.row.note}}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="150">
        <template slot="header">
          <el-button 
            type="primary"
            size="small"
            icon="el-icon-plus"
            @click="handleAddItem()">
          </el-button>
        </template>
        <template slot-scope="scope">
          <el-button 
            type="text"
            size="small"
            icon="el-icon-edit"
            v-if="scope.row.objectId"
            @click="handleEditRow(scope.row)">
          </el-button>
          <el-button 
            type="text"
            size="small"
            icon="el-icon-delete"
            v-if="scope.row.objectId"
            @click="handleDeleteRow(scope.row)">
          </el-button>
          <el-button 
            type="text"
            size="small"
            icon="el-icon-plus"
            v-if="!scope.row.pId && scope.row.objectId"
            @click="handleAddSubItem(scope.row)">
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-container>
</template>

<script>
import AV from "leancloud-storage";
const query = new AV.Query("Item");
const Item = AV.Object.extend("Item");
const pQuery = new AV.Query('Project');
const Project = AV.Object.extend("Project");
const Mapping = {
  '前期及地下四大块': 'module1',
  '地下车库土建': 'module2',
  '主楼土建': 'module3',
  '其他专业分包': 'module4',
  '其他费用': 'module5'
};

export default {
  name: "item-page",
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
    handleDeleteRow(row) {
      const _this = this;
      this.$confirm('此操作将永久删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const item = AV.Object.createWithoutData('Item', row.objectId);
        item.destroy().then(
          (result) => {
            _this.displaySucc('删除成功');
            _this.fetchItems();
          },
          (error) => {
            _this.displayError(error);
          }
        );
      }).catch(() => {
        
      });
    },
    handleCancel() {
      this.dialogFormVisible = false;
      this.editItem = {};
    },
    handleEditRow(row) {
      this.dialogFormVisible = true;
      this.editItem = row;
    },
    handleAddSubItem(row) {
      if (this.dialogFormVisible) {
        return;
      }
      if (!row.objectId) {
        this.displayError("请先保存大项");
        return
      }
      if (!row.children) {
        row.children = [];
      }
      this.editItem = {
        area: 0,
        unit: "元",
        ci: 0,
        qPrice: 0,
        quantity: 0,
        mId: row.mId,
        proId: row.proId,
        pId: row.objectId
      };
      this.dialogFormVisible = true;
    },
    handleAddItem() {
      if (this.dialogFormVisible) {
        return;
      }

      this.editItem = {
        area: 0,
        unit: "元",
        ci: 0,
        qPrice: 0,
        quantity: 0,
        mId: this.mName,
        proId: this.proId
      };
      this.dialogFormVisible = true;
    },
    handleSaveEdit() {
      var row = this.editItem;
      if (!row.mId || !row.proId) {
        this.displayError("params missing");
        return;
      }
      const _this = this;
      this.$refs['ruleForm'].validate((valid) => {
        if (!valid) {
          _this.displayError("form validation error");
          return;
        }
        if (row.objectId) {
          this.updateItem(row);
        } else {
          this.addItem(row);
        }
      }); 
    },
    afterEdit(succ) {
      this.dialogFormVisible = false;
      if (succ) {
        this.fetchItems();
      }
    },
    addItem(row) {
      const _this = this;
      const item = new Item();
      item.set("mId", row.mId);
      item.set("proId", row.proId);
      item.set("pId", row.pId);
      item.set("name", row.name);
      item.set("area", row.area);
      item.set("ci", row.ci);
      item.set("unit", row.unit);
      item.set("quantity", row.quantity);
      item.set("qPrice", row.qPrice);
      item.set("note", row.note);
      item.save().then(
        (result) => {
          console.log(`add item success：`, result);
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
      const item = AV.Object.createWithoutData("Item", row.objectId);
      item.set("name", row.name);
      item.set("area", row.area);
      item.set("ci", row.ci);
      item.set("unit", row.unit);
      item.set("quantity", row.quantity);
      item.set("qPrice", row.qPrice);
      item.set("note", row.note);
      item.save().then(
        (result) => {
          console.log(`update item succ：`, result);
          _this.afterEdit(true);
        },
        (error) => {
          _this.displayError(error);
          _this.afterEdit(false);
        }
      );
    },
    querySearch(queryString, cb) {
      var restaurants = this.restaurants;
      var results = queryString
        ? restaurants.filter(this.createFilter(queryString))
        : restaurants;
      cb(results);
    },
    createFilter(queryString) {
      return (restaurant) => {
        return (
          restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
        );
      };
    },
    displayError(e) {
      if (typeof(e) == "string") {
        this.$message.error(e);
      } else {
        this.$message.error(e.message);
      }
    },
    displaySucc(msg) {
      this.$message({
        type: 'success',
        message: msg
      });
    },
    fetchItems() {
      const _this = this;
      this.loading = true;
      pQuery.get(this.proId).then(
        (result) => {
          _this.loading = false;
          var obj = result.toJSON();
          _this.project = obj;
          var sumCost = 0;
          var key = "";
          for (key in Mapping) {
            if (obj[Mapping[key] + "Cost"]) {
              sumCost += obj[Mapping[key] + "Cost"];
            }
          }
          _this.project.sumCost = sumCost;
          console.log(_this.project);
          _this.fetchItemsCore();
        },
        (error) => {
          _this.loading = false;
          _this.displayError(error);
        }
      );
    },
    fetchItemsCore() {
      const _this = this;
      _this.loading = true;
      query.equalTo("proId", this.proId);
      query.equalTo("mId", this.mName);
      query.ascending("createdAt");
      query.find().then(
        (result) => {
          _this.loading = false;
          var child = {};
          var newData = [];

          result.forEach(function(obj) {
            var o = obj.toJSON();
            o.rowKey = o.objectId;

            if (o.pId) {
              if (!child[o.pId] || !child[o.pId].length) {
                child[o.pId] = [];
              }
              if (o.ci != undefined && o.quantity != undefined  && o.qPrice != undefined) {
                o.sumPrice = o.ci * o.quantity * o.qPrice;
              }
              if (o.sumPrice != undefined && o.area > 0) {
                o.perPrice = o.sumPrice / o.area;
              }
              var sumCost = _this.project[Mapping[_this.mName] + 'Cost'];
              if (o.sumPrice != undefined && sumCost) {
                o.percent = o.sumPrice / sumCost;
              }
              child[o.pId].push(o);
            } else {
              newData.push(o);
            }
          });
          var sumPrice = 0;
          newData.forEach(function(oo) {
            oo.sumPrice = 0;
            oo.qprice = 0;
            var ch = child[oo.objectId];
            if (ch) {
              ch.forEach(function(e) {
                oo.sumPrice += e.sumPrice;
              });
              if (oo.sumPrice != undefined && oo.area > 0) {
                oo.perPrice = oo.sumPrice / oo.area;
              }
              sumPrice += oo.sumPrice;
              var sumCost = _this.project[Mapping[_this.mName] + 'Cost'];
              if (oo.sumPrice != undefined && sumCost) {
                oo.percent = oo.sumPrice / sumCost;
              }
              oo.children = child[oo.objectId];
            } else {
              if (oo.ci != undefined && oo.quantity != undefined  && oo.qPrice != undefined) {
                oo.sumPrice = oo.ci * oo.quantity * oo.qPrice;
              }
              if (oo.sumPrice != undefined && oo.area > 0) {
                oo.perPrice = oo.sumPrice / oo.area;
              }
              sumPrice += oo.sumPrice;
              var sumCost = _this.project[Mapping[_this.mName] + 'Cost'];
              if (oo.sumPrice != undefined && sumCost) {
                oo.percent = oo.sumPrice / sumCost;
              }
            }
          });
          if (newData.length > 0) {
            newData.push({
              name: "合计",
              sumPrice: sumPrice,
            });
          }
          _this.tableData = newData;
        },
        (error) => {
          _this.loading = false;
          _this.displayError(error);
        }
      );
    },
    loadAll() {
      return {
        前期及地下四大块: [
          { value: "前期工程费" },
          { value: "土方开挖工程" },
          { value: "桩基工程" },
          { value: "土方回填" },
          { value: "基坑支护" },
        ],
        地下车库土建: [
          { value: "人工费" },
          { value: "材料费" },
          { value: "专业分包工程" },
          { value: "机械费" },
        ],
        主楼土建: [
          { value: "人工费" },
          { value: "材料费" },
          { value: "专业分包工程" },
          { value: "机械费" },
          { value: "其他直接费" },
        ],
        其他专业分包: [
          { value: "地上及地下部分安装工程小计" },
          { value: "精装修工程" },
          { value: "设备费" },
          { value: "室外建安工程费用" },
          { value: "配套工程费用（红线以外）" },
          { value: "其他工程费" },
          { value: "设计勘察费" },
          { value: "不可预见费" },
          { value: "小区配套政府收费" },
        ],
        其他费用: [
          { value: "建设单位管理费" },
          { value: "建设项目前期咨询费" },
          { value: "工程勘察费" },
          { value: "工程设计费" },
          { value: "工程监理费" },
          { value: "环境影响咨询服务费" },
          { value: "招标代理费" },
          { value: "测绘生产升本费用定额" },
          { value: "地质灾害危险性评估费" },
          { value: "地震安全评价费" },
          { value: "施工图审查费" },
          { value: "防洪影响咨询服务费" },
          { value: "项目造价咨询评审费" },
          { value: "热电联网集中供热入网费" },
        ],
      };
    },
  },
  created() {
    if (this.$route.params.pid) {
      this.mName = this.$route.params.mName;
      this.proId = this.$route.params.pid;
      this.fetchItems();

      var all = this.loadAll();
      this.restaurants = all[this.mName];
    }
  },
  data() {
    return {
      tableData: [],
      proId: "",
      mName: "",
      formInline: {
        user: "",
        region: "",
      },
      restaurants: [],
      dialogFormVisible: false,
      formLabelWidth: '200px',
      editItem: {},
      project: {},
      rules: {
        name: [
          { required: true, message: '请输入', trigger: 'blur' },
          { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
        ],
        area: [
          { type: 'number', message: '必须为数字值'},
          { required: true, message: '请输入', trigger: 'blur' }
        ],
        ci: [
          { type: 'number', message: '必须为数字值'},
          { required: true, message: '请输入', trigger: 'blur' }
        ],
        quantity: [
          { type: 'number', message: '必须为数字值'},
          { required: true, message: '请输入', trigger: 'blur' }
        ],
        qPrice: [
          { type: 'number', message: '必须为数字值'},
          { required: true, message: '请输入', trigger: 'blur' }
        ],
        unit: [
          { required: true, message: '请选择', trigger: 'change' }
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
