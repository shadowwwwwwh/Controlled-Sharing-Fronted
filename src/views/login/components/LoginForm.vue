<template>
  <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" size="large">
    <el-form-item prop="username">
      <el-input v-model="loginForm.username" placeholder="请输入用户名">
        <template #prefix>
          <el-icon class="el-input__icon">
            <user />
          </el-icon>
        </template>
      </el-input>
    </el-form-item>
    <el-form-item prop="password">
      <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" show-password autocomplete="new-password">
        <template #prefix>
          <el-icon class="el-input__icon">
            <lock />
          </el-icon>
        </template>
      </el-input>
    </el-form-item>
    <el-form-item prop="captcha">
      <el-row>
        <el-col :span="8">
          <el-input v-model="loginForm.captcha" placeholder="验证码" autocomplete="off" style="margin-top: 10%" />
        </el-col>
        <el-col :span="8" style="margin-left: 10%">
          <div class="login-code" @click="refreshCode">
            <img v-if="identifyCode" :src="identifyCode" alt="Captcha" />
          </div>
        </el-col>
      </el-row>
    </el-form-item>
  </el-form>
  <div class="login-btn">
    <el-button :icon="CircleClose" round size="large" @click="resetForm(loginFormRef)"> 重置 </el-button>
    <el-button :icon="UserFilled" round size="large" type="primary" :loading="loading" @click="login(loginFormRef)">
      登录
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { HOME_URL } from "@/config";
// import { getTimeState } from "@/utils";
import { Login } from "@/api/interface";
import { ElMessage } from "element-plus";
import { getCaptchaId, loginApi } from "@/api/modules/login";
import { useUserStore } from "@/stores/modules/user";
import { useTabsStore } from "@/stores/modules/tabs";
import { useKeepAliveStore } from "@/stores/modules/keepAlive";
import { initDynamicRouter } from "@/routers/modules/dynamicRouter";
import { CircleClose, UserFilled } from "@element-plus/icons-vue";
import type { ElForm } from "element-plus";

const router = useRouter();
const userStore = useUserStore();
const tabsStore = useTabsStore();
const keepAliveStore = useKeepAliveStore();

type FormInstance = InstanceType<typeof ElForm>;
const loginFormRef = ref<FormInstance>();
const loginRules = reactive({
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
  captcha: [{ required: true, message: "请输入验证码", trigger: "blur" }]
});

const loading = ref(false);
const loginForm = reactive<Login.ReqLoginForm>({
  username: "",
  password: "",
  captcha: ""
});
//const identifyCodes = "1234abc";
const identifyCode = ref<string | null | undefined>(null);

// login
const login = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (!valid) return;
    loading.value = true;
    try {
      // 1.执行登录接口
      const data = await loginApi({ ...loginForm });
      if (data.statusCode !== 200) {
        ElMessage.error("登录失败");
        resetForm(formEl);
        loading.value = false;
        return;
      }
      userStore.setToken("token");
      type UserState = {
        userInfo: {
          name: string;
        };
      };

      const userInfo: UserState["userInfo"] = {
        name: loginForm.username
      };
      userStore.setUserInfo(userInfo);
      // 2.添加动态路由
      await initDynamicRouter();

      // 3.清空 tabs、keepAlive 数据
      await tabsStore.setTabs([]);
      await keepAliveStore.setKeepAliveName([]);

      // 4.跳转到首页
      await router.push(HOME_URL);
    } catch (error) {
      console.error("登录失败:", error);
      ElMessage.error("登录失败");
      resetForm(formEl);
    } finally {
      loading.value = false;
    }
  });
};

// resetForm
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  refreshCode();
};

const makecode = async () => {
  try {
    const response = await getCaptchaId(); // 发送请求到后端
    return response || null;
  } catch (error) {
    console.error("获取验证码失败:", error);
    return null; // 失败时返回 null
  }
};

//刷新验证码
// const refreshCode = () => {
//   identifyCode.value = makecode();
// };
const refreshCode = async () => {
  identifyCode.value = await makecode();
};
onMounted(() => {
  refreshCode();
  // 监听 enter 事件（调用登录）
  document.onkeydown = (e: KeyboardEvent) => {
    if (e.code === "Enter" || e.code === "enter" || e.code === "NumpadEnter") {
      if (loading.value) return;
      login(loginFormRef.value);
    }
  };
});

onBeforeUnmount(() => {
  document.onkeydown = null;
});
</script>

<style scoped lang="scss">
@import "../index";
</style>
