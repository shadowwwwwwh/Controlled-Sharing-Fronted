<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" size="450px" title="属性注册">
    <el-form
      ref="ruleFormRef"
      label-width="100px"
      label-suffix=" :"
      :rules="rules"
      :disabled="drawerProps.isView"
      :model="registerProps"
    >
      <el-form-item label="用户名" prop="applicationsName">
        <el-input v-model="registerProps.userName" placeholder="请填写用户名" clearable></el-input>
      </el-form-item>
      <el-form-item label="用户属性" prop="businessDomain">
        <el-input v-model="registerProps.userAttribute" placeholder="请填写用户属性" clearable></el-input>
      </el-form-item>
      <el-form-item label="用户归口" prop="businessUnit">
        <el-input v-model="registerProps.userOccupation" placeholder="请填写用户归口" clearable></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="drawerVisible = false">取消</el-button>
      <el-button v-show="!drawerProps.isView" type="primary" @click="handleSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="AttributeRegister">
import { reactive, ref } from "vue";
import { ElMessage, FormInstance } from "element-plus";

interface DrawerProps {
  isView: boolean;
  api?: (params: any) => Promise<any>;
  getTableList?: () => void;
}

const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  isView: false
});
interface RegisterProps {
  userName: string;
  userAttribute: string;
  userOccupation: string;
}
const registerProps = ref<RegisterProps>({
  userName: "",
  userAttribute: "",
  userOccupation: ""
});
const rules = reactive({
  userName: [{ required: true, message: "请填写用户名" }],
  userAttribute: [{ required: true, message: "请填写用户属性" }],
  userOccupation: [{ required: true, message: "请填写应用归口" }]
});
// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps) => {
  drawerProps.value = params;
  drawerVisible.value = true;
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    try {
      await drawerProps.value.api!(registerProps.value);
      ElMessage.success({ message: `注册成功！` });
      drawerProps.value.getTableList!();
      registerProps.value = {
        userName: "",
        userAttribute: "",
        userOccupation: ""
      };
      drawerVisible.value = false;
    } catch (error) {
      console.log(error);
    }
  });
};

defineExpose({
  acceptParams
});
</script>
