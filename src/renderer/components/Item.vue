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
          >模块管理</el-breadcrumb-item
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
          <span>{{scope.row.area}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="ci" label="含量指数" width="150">
        <template slot-scope="scope">
          <span>{{scope.row.ci}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="unit" label="单位" width="100">
        <template slot-scope="scope">
          <span>{{scope.row.unit}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="quantity" label="分项工程量" width="150">
        <template slot-scope="scope">
          <span>{{scope.row.quantity}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="qPrice" label="分项单价（元/单位）" width="150">
        <template slot-scope="scope">
          <span>{{scope.row.qPrice}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="sumPrice" label="合价" width="150">
      </el-table-column>
      <el-table-column prop="perPrice" label="方指标（元/m^2）" width="150">
      </el-table-column>
      <el-table-column prop="percent" label="合价占比（%）" width="150"> </el-table-column>
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

export default {
  name: "item-page",
  components: {},
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
        mId: this.mId,
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
      });
      if (row.objectId) {
        this.updateItem(row);
      } else {
        this.addItem(row);
      }
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
      query.equalTo("mId", this.mId);
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
              oo.children = child[oo.objectId];
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
          { value: "人工费" },
          { value: "材料费" },
          { value: "专业分包工程" },
        ],
        地下车库土建: [
          { value: "人工费" },
          { value: "材料费" },
          { value: "专业分包工程" },
        ],
        主楼土建: [
          { value: "人工费" },
          { value: "材料费" },
          { value: "专业分包工程" },
        ],
        其他专业分包: [
          { value: "人工费" },
          { value: "材料费" },
          { value: "专业分包工程" },
        ],
        其他费用: [
          { value: "人工费" },
          { value: "材料费" },
          { value: "专业分包工程" },
        ],
      };
    },
  },
  created() {
    if (this.$route.params.mid) {
      this.mId = this.$route.params.mid;
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
      mId: "",
      mName: "",
      formInline: {
        user: "",
        region: "",
      },
      restaurants: [],
      dialogFormVisible: false,
      formLabelWidth: '200px',
      editItem: {},
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
