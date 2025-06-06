<template>
  <div class="card content-box">
    <!-- 策略注册按钮 -->
    <div style="text-align: right; margin-bottom: 10px">
      <el-button type="primary" @click="dialogVisible = true">策略注册</el-button>
    </div>

    <!-- 策略注册弹窗 -->
    <el-dialog v-model="dialogVisible" width="800px" :close-on-click-modal="false" class="strategy-dialog">
      <!-- 自定义标题 -->
      <template #header>
        <div class="dialog-header">
          <span class="el-dialog__title">策略注册</span>
        </div>
      </template>

      <!-- 弹窗内容 -->
      <div class="dialog-content">
        <!-- 策略信息输入 -->
        <el-form :model="form" label-width="100px">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="策略名称">
                <el-input v-model="form.strategyName" placeholder="请输入策略名称" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="数据提供方">
                <el-select v-model="form.dataProvider" placeholder="请选择">
                  <el-option v-for="item in dataProviders" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="有效期">
                <el-select v-model="form.validityPeriod" placeholder="请选择">
                  <el-option v-for="item in validityPeriods" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>

        <div style="text-align: center; margin-bottom: 20px">
          <el-button type="primary" @click="openAddPolicyDialog">添加策略信息</el-button>
        </div>

        <!-- 待注册策略列表 -->
        <el-table :data="pendingStrategies" border style="width: 100%">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="dataUser" label="数据使用方" width="180" />
          <el-table-column prop="accessFields" label="访问字段" />
          <el-table-column label="操作" width="100">
            <template #default="{ $index }">
              <el-button link type="danger" @click="removeStrategy($index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 弹窗底部 -->
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancel">取消</el-button>
          <el-button type="primary" @click="save">保存</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 策略详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" title="策略明细" width="1000px" :close-on-click-modal="false">
      <el-table :data="detailData" border style="width: 100%">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="dataUser" label="数据使用方" width="180" />
        <el-table-column prop="userCategory" label="用户归口" width="180" />
        <el-table-column prop="accessFields" label="访问字段" />
        <el-table-column prop="dataProvider" label="数据提供方" width="180" />
      </el-table>
    </el-dialog>

    <!-- 策略列表表格 -->
    <ProTable ref="proTable" :columns="columns" :data-callback="dataCallback" :request-api="getStrategyList">
      <template #operation="scope">
        <el-button type="primary" link @click="showDetail(scope.row)">查看详情</el-button>
        <el-button type="danger" link @click="invalidStrategy(scope.row.strategyCode)">作废</el-button>
      </template>
    </ProTable>

    <!-- 添加策略子弹窗 -->
    <el-dialog v-model="addPolicyDialogVisible" title="添加策略详情" width="500px" :close-on-click-modal="false">
      <el-form :model="addPolicyForm" label-width="100px">
        <el-form-item label="数据使用方">
          <el-select v-model="addPolicyForm.dataUser" placeholder="请选择">
            <el-option v-for="item in dataUsers" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="访问字段">
          <el-input v-model="addPolicyForm.accessFields" placeholder="请输入访问字段" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addPolicyDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAddPolicy">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, nextTick } from "vue";
import ProTable from "@/components/ProTable/index.vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { ColumnProps, ProTableInstance } from "@/components/ProTable/interface";
import axios from "axios";
import { useRouter } from "vue-router";

// 详情状态
const detailDialogVisible = ref(false);
const detailData = ref<any[]>([]);
const proTable = ref<ProTableInstance | null>(null);
// 策略注册弹窗状态
const dialogVisible = ref(false);
// 表单数据
const form = reactive({
  strategyName: "",
  dataProvider: "",
  validityPeriod: ""
});
// 待注册策略列表
const pendingStrategies = reactive<any[]>([]);

// 下拉选项
const dataProviders = ref<any[]>([]);
const dataUsers = ref<any[]>([]);

const validityPeriods = [
  { value: "30", label: "一周" },
  { value: "90", label: "一月" },
  { value: "180", label: "一年" }
];

// 添加策略子弹窗状态
const addPolicyDialogVisible = ref(false);
// 添加策略子弹窗表单数据
const addPolicyForm = reactive({
  dataUser: "",
  accessFields: ""
});

// 打开添加策略子弹窗
const openAddPolicyDialog = () => {
  if (!form.strategyName || !form.dataProvider || !form.validityPeriod) {
    ElMessage.warning("请填写完整的策略信息");
    return;
  }
  addPolicyDialogVisible.value = true;
};

// 确认添加策略
const confirmAddPolicy = () => {
  if (!addPolicyForm.dataUser || !addPolicyForm.accessFields) {
    ElMessage.warning("请填写完整的策略详情信息");
    return;
  }
  pendingStrategies.push({
    ...addPolicyForm,
    strategyName: form.strategyName,
    dataProvider: form.dataProvider,
    validityPeriod: form.validityPeriod
  });
  addPolicyDialogVisible.value = false;
  addPolicyForm.dataUser = "";
  addPolicyForm.accessFields = "";
};

// 删除策略
const removeStrategy = (index: number) => {
  pendingStrategies.splice(index, 1);
};

// 保存策略
const save = async () => {
  try {
    if (pendingStrategies.length === 0) {
      ElMessage.warning("请先添加策略");
      return;
    }

    // 处理有效期
    let lifespan;
    if (form.validityPeriod === "30") {
      lifespan = "一周";
    } else if (form.validityPeriod === "90") {
      lifespan = "一月";
    } else {
      lifespan = "一年";
    }

    const policyInfo = pendingStrategies.map(strategy => [strategy.dataUser, strategy.accessFields]);

    const policies = {
      policyName: form.strategyName,
      dataOwner: form.dataProvider,
      lifespan: lifespan,
      policyInfo: policyInfo
    };

    console.log("policies:", policies);
    const response = await axios.post("/api/policy/register", policies, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (response.data.statusCode === 200) {
      ElMessage.success(response.data.statusContent);
      dialogVisible.value = false;
      pendingStrategies.splice(0, pendingStrategies.length);
      // 清空 form 表单数据
      form.strategyName = "";
      form.dataProvider = "";
      form.validityPeriod = "";
      // 清空 addPolicyForm 表单数据
      addPolicyForm.dataUser = "";
      addPolicyForm.accessFields = "";
      // 刷新策略列表
      await nextTick();
      if (proTable.value) {
        await proTable.value.getTableList();
      }
    } else {
      ElMessage.error("策略注册失败，请稍后重试");
    }
  } catch (error) {
    console.error("策略注册出错:", error);
    ElMessage.error("策略注册失败，数据使用方访问字段不存在");
  }
};

// 取消
const cancel = () => {
  dialogVisible.value = false;
  pendingStrategies.splice(0, pendingStrategies.length);
};

// 查看详情方法
const showDetail = async (row: any) => {
  try {
    const response = await axios.post(
      "/api/policy/detail",
      {
        policyCode: row.strategyCode
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    if (response.data.statusCode === 200) {
      const detailDataList = response.data.dataUser.map((user: string, index: number) => ({
        dataUser: user,
        userCategory: response.data.userDepartment[index],
        accessFields: response.data.accessField[index],
        dataProvider: response.data.dataOwner,
        policyName: response.data.policyName,
        lifespan: response.data.lifespan
      }));

      detailData.value = detailDataList;
      detailDialogVisible.value = true;
    } else {
      ElMessage.error("获取策略详情失败，请稍后重试");
    }
  } catch (error) {
    console.error("获取策略详情出错:", error);
    ElMessage.error("获取策略详情失败，请检查网络或联系管理员");
  }
};
// 作废方法
const initParam = reactive({ type: 1 });
const invalidStrategy = async (id: number) => {
  console.log("作废id", id);
  ElMessageBox.confirm("确认要作废该策略吗？", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      try {
        await axios.post(
          "/api/policy/abort",
          {
            policyCode: id
          },
          {
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
        ElMessage.success("作废成功");
        // 刷新策略列表
        await nextTick();
        if (proTable.value) {
          await proTable.value.getTableList();
        }
      } catch (error) {
        ElMessage.error("作废策略失败");
      }
    })
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    .catch(() => {});
};

// 原有表格配置保持不变
const columns = reactive<ColumnProps<any>[]>([
  { type: "index", label: "序号", width: 80 },
  { prop: "strategyName", label: "策略名称" },
  { prop: "dataProvider", label: "数据提供方" },
  {
    prop: "strategyCode",
    label: "策略码"
  },
  { prop: "registerTime", label: "注册时间" },
  { prop: "validityPeriod", label: "有效期" },
  { prop: "status", label: "状态" },
  { prop: "operation", label: "操作", width: 330, fixed: "right", slot: "operation" }
]);

const dataCallback = (data: any) => ({ list: data.list, total: data.total });

// 获取策略列表
const getStrategyList = async (params: any) => {
  try {
    const response = await axios.post("/api/policy/getPolicyInfo", {
      pageIndex: params.pageIndex || 1,
      pageSize: params.pageSize || 3
    });

    // 确保 PolicyInfo 至少是个空数组
    const policyList = response.data?.policyInfo || [];
    // 映射数据字段
    const mappedList = policyList.map((item: any) => ({
      strategyName: item.Name,
      dataProvider: item.Provider,
      strategyCode: item.Code,
      registerTime: item.ResgisterationTime,
      validityPeriod: item.Expiration,
      status: item.Status
    }));
    const newRes = {
      data: {
        list: mappedList,
        total: response.data?.totalCount || 0
      },
      success: true
    };

    return newRes;
  } catch (error) {
    console.error("请求出错", error);
    ElMessage.error("获取策略列表失败");
    return { data: { list: [], total: 0 }, success: false };
  }
};

// 获取数据提供方和数据使用方
const fetchUserInfo = async () => {
  try {
    const response = await axios.post("/api/policy/getUserInfo");
    console.log("用户信息", response.data);

    // 处理数据提供方
    dataProviders.value = response.data.dataOwner.map(item => ({ value: item, label: item }));

    // 处理数据使用方
    dataUsers.value = response.data.dataUser
      .filter((item: string[]) => item[0] && item[0].trim() !== "")
      .map((item: string[]) => ({ value: item[0], label: item[0] }));
  } catch (error) {
    console.error("请求出错:", error);
    ElMessage.error("获取用户信息失败");
  }
};
const router = useRouter(); // 获取 router 实例

// 使用导航守卫 beforeEach 在每次路由切换前调用 fetchUserInfo 函数
router.beforeEach(async () => {
  await fetchUserInfo();
});
onMounted(() => {
  fetchUserInfo();
});
</script>

<style scoped lang="scss">
.dialog-header {
  text-align: center;
  font-weight: bold;
}

.dialog-content {
  max-height: 60vh;
  overflow-y: auto;
}

.strategy-dialog {
  .el-dialog__header {
    border-bottom: 1px solid #eee;
  }

  .el-dialog__body {
    padding: 20px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

/* 按钮间距 */
.el-button + .el-button {
  margin-left: 8px;
}

/* 详情表格样式 */
.el-table {
  margin: 10px 0;

  ::v-deep(.el-table__header) th {
    background-color: #f5f7fa;
  }
}

/* 弹窗标题居中 */
::v-deep(.el-dialog__header) {
  text-align: center;
  border-bottom: 1px solid #eee;
}

/* 弹窗底部按钮 */
::v-deep(.el-dialog__footer) {
  padding-top: 20px;
  border-top: 1px solid #eee;
}
</style>
