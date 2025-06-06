<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" size="450px" title="应用注册">
    <el-form
      ref="ruleFormRef"
      label-width="100px"
      label-suffix=" :"
      :rules="rules"
      :disabled="drawerProps.isView"
      :model="registerProps"
    >
      <el-form-item label="应用名" prop="applicationsName">
        <el-input v-model="registerProps.applicationName" placeholder="请填写应用名" clearable></el-input>
      </el-form-item>
      <el-form-item label="业务域" prop="businessDomain">
        <el-input v-model="registerProps.businessDomain" placeholder="请填写业务域" clearable></el-input>
      </el-form-item>
      <el-form-item label="业务部门" prop="businessUnit">
        <el-input v-model="registerProps.businessUnit" placeholder="请填写业务部门" clearable></el-input>
      </el-form-item>
      <el-form-item label="责任人" prop="manager">
        <el-input v-model="registerProps.manager" placeholder="请填写责任人" clearable></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="drawerVisible = false">取消</el-button>
      <el-button v-show="!drawerProps.isView" type="primary" @click="handleSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="AppRegister">
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
  applicationName: string;
  businessDomain: string;
  businessUnit: string;
  manager: string;
}
const registerProps = ref<RegisterProps>({
  applicationName: "",
  businessDomain: "",
  businessUnit: "",
  manager: ""
});
const rules = reactive({
  applicationName: [{ required: true, message: "请填写应用名" }],
  businessDomain: [{ required: true, message: "请填写业务域3" }],
  businessUnit: [{ required: true, message: "请填写业务部门" }],
  manager: [{ required: true, message: "请填写责任人" }]
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
      // 清空表单数据
      registerProps.value = {
        applicationName: "",
        businessDomain: "",
        businessUnit: "",
        manager: ""
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
