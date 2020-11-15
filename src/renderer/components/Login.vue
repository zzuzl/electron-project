<template>
  <el-container class="inner">
    <el-card class="box-card" shadow="hover" style="margin: 100px auto; padding: 50px;">
      <div slot="header" class="clearfix" style="text-align:center;">
        <span>用户登录</span>
      </div>

      <el-form
        :model="ruleForm"
        :rules="rules"
        ref="ruleForm"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="ruleForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密 码" prop="password">
          <el-input v-model="ruleForm.password" type="password"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm('ruleForm')"
            >登 录</el-button>
          <el-button @click="resetForm('ruleForm')">重 置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </el-container>
</template>

<script>
import AV from "leancloud-storage";

export default {
  name: "login-page",
  components: {},
  methods: {
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    submitForm(formName) {
      const _this = this;
      this.$refs[formName].validate((valid) => {
        if (valid) {
          var username = _this.ruleForm.username;
          var password = _this.ruleForm.password;

          AV.User.logIn(username, password).then(function (loginedUser) {
            console.log("login success:", loginedUser.toJSON());
            _this.$router.replace({ path: '/' });
          }, function (error) {
            _this.displayError(error);
            return false;
          });
        } else {
          _this.displayError("param missing");
          return false;
        }
      });
    },
    displayError(e) {
      if (typeof(e) == "string") {
        this.$message.error(e);
      } else {
        this.$message.error(e.message);
      }
    }
  },
  data() {
    return {
      ruleForm: {
        username: "",
        password: "",
      },
      rules: {
        username: [
          { required: true, message: "请输入", trigger: "blur" },
          { min: 1, max: 50, message: "长度在 1 到 50 个字符", trigger: "blur" },
        ],
        password: [
          { required: true, message: "请输入", trigger: "blur" },
        ]
      },
    };
  },
};
</script>

<style>
.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both
}

.box-card {
  width: 480px;
}
</style>
