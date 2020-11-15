<template>
  <el-container style="border: 1px solid #eee">
    <el-container>
      <el-header style="text-align: right; font-size: 12px">
        <el-dropdown v-if="user" @command="handleCommand">
          <i class="el-icon-setting" style="margin-right: 15px"></i>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="logout">退出</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <span v-if="user">{{user.username}}</span>
      </el-header>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import AV from 'leancloud-storage'

export default {
  name: "index-page",
  methods: {
    handleCommand(command) {
      if (command === 'logout') {
        this.logout();
      }
    },
    logout() {
      console.log("logout");
      AV.User.logOut();
      this.user = undefined;
      this.$router.replace({ path: '/login' });
    }
  },
  mounted() {
    const currentUser = AV.User.current();
    if (currentUser) {
      console.log('currentUser is', currentUser.toJSON());
      this.user = currentUser.toJSON();
      this.$router.push({ path: '/project' });
    } else {
      console.log('mounted, no user, to login page.');
      this.$router.replace({ path: '/login' });
    }
  },
  data() {
    return {
      user: undefined
    }
  }
};
</script>

<style>
.el-header {
  background-color: #B3C0D1;
  color: #333;
  line-height: 60px;
}

.el-aside {
  color: #333;
}
</style>
