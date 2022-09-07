<template>
  <div class="w-full h-full flex flex-col">
    <div class="text-size-[#191919] text-16px font-bold mb-24px">角色信息</div>
    <div class="overflow-hidden mb-32px">
      <div class="float-left h-30px leading-30px text-size-[#191919] text-12px">角色名称：</div>
      <div class="float-left">
        <ASelect
          v-model:value="selectRolesRId"
          size="middle"
          style="width: 320px"
          :options="rolesList"
          :field-names="{ label: 'Name', value: 'RId' }"
          @change="selectRoles"
        ></ASelect>
      </div>
    </div>
    <div class="text-size-[#191919] text-16px font-bold mb-24px">操作权限</div>
    <div class="overflow-hidden">
      <ATabs v-model:activeKey="activeKey" @change="selectType">
        <ATabPane v-for="(item, index) in typeList" :key="index" :tab="item.Name"></ATabPane>
      </ATabs>
    </div>
    <div class="overflow-hidden">
      <div class="float-left">
        <HRefTable
          :hide-select-value="true"
          :column-struct="SelectTable"
          :is-multi-value="true"
          @change="
                (tableName:string) => {
                 selectTables(tableName);
                }
              "
        >
          <AButton
            :disabled="selectRolesRId ? false : true"
            :title="selectRolesRId ? '' : '请先选择角色！！！'"
            class="cursor-pointer"
          >
            <HiIcon class="text-16px" icon-name="icon-baocun1" />
            添加表
          </AButton>
        </HRefTable>
      </div>
      <div class="float-left ml-10px">
        <AButton class="cursor-pointer" @click="batchEdit">
          <HiIcon class="text-16px" icon-name="icon-baocun1" />
          批量管理权限
        </AButton>
      </div>
      <div class="float-right ml-10px">
        <AButton class="cursor-pointer" @click="loadRoleResList">
          <HiIcon class="text-16px" icon-name="icon-baocun1" />
          刷新
        </AButton>
      </div>
      <div class="float-right">
        <AInput
          v-model:value="tableViewName"
          style="width: 240px"
          placeholder="请输入关键字搜索"
          @input="searchConfiguredList"
        />
      </div>
    </div>
    <div class="flex-1 mt-16px">
      <ATable
        class="h-full w-full"
        :row-selection="{ selectedRowKeys: selectedRowKey, onChange: onSelectChange }"
        :columns="(columns as any)"
        :data-source="configuredList"
        :row-key="
          (record, index) => {
            return record.ResId;
          }
        "
        :pagination="false"
      >
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.dataIndex === 'operation'">
            <div class="editable-row-operations">
              <ATypographyLink @click="openConfigured(record)">权限管理</ATypographyLink>
              <ATypographyLink class="ml-50px" @click="deleteConfigured(record.ResId)">
                删除
              </ATypographyLink>
            </div>
          </template>
          <template v-else>{{ text }}</template>
        </template>
      </ATable>
    </div>
  </div>
  <AModal
    v-model:visible="isVisible"
    width="80%"
    :body-style="{ height: '60vh' }"
    title="权限操作"
    :mask-closable="false"
    :keyboard="false"
    @ok="saveRoleAuth"
  >
    <EditPermission
      v-if="isVisible"
      ref="editPermissionRef"
      :table-name-list="addTableNameList"
      :selected-type="selectedType"
      :is-edit="isEdit"
      :update-table-name-info="updateTableNameInfo"
    ></EditPermission>
  </AModal>
</template>

<script setup lang="ts">
import { message, Modal } from 'ant-design-vue';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { createVNode } from 'vue';
import {
  PermissionManagementModel,
  ModuleType,
  RoleInfo,
  ConfiguredInfo,
} from './permissionManagementModel';
import { SelectTable } from '@/views/hisql/exportExcel/exportExcelViewModel';

const isVisible = ref(false);
const isEdit = ref(false);

const editPermissionRef = ref(null);

const activeKey = ref(0);
const rolesList = ref<Array<RoleInfo>>([]);
const typeList = ref<Array<ModuleType>>([]);
const configuredList = ref<Array<ConfiguredInfo>>([]);
const initconfiguredList = ref<Array<ConfiguredInfo>>([]);
const addTableNameList = ref<Array<string>>([]); // 新增表名权限，可多个操作
const updateTableNameInfo = ref(); // 编辑表名权限，单个操作对象
const tableViewName = ref('');
const selectRolesInfo = ref(); // 选择的角色信息
const selectRolesRId = ref(''); // 选择的角色ID

const selectedConfiguredInfo = ref(); // 选中的表名配置信息
const selectedType = ref(); // 选择的顶级模块信息

const columns = ref([
  {
    title: '表名',
    dataIndex: 'ResId',
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: 300,
    align: 'right',
  },
]);
const selectedTableRows = ref<Array<any>>([]);
const selectedRowKey = ref([]);

// 选择批量操作权限
const onSelectChange = (selectedRowKeys: any, selectedRows: any) => {
  selectedRowKey.value = selectedRowKeys;
  selectedTableRows.value = selectedRows;
};

const viewModel = new PermissionManagementModel();
(async () => {
  rolesList.value = await viewModel.getRoles();
  typeList.value = await viewModel.getRoleAuthTabs();
  if (typeList.value && typeList.value.length > 0) {
    // eslint-disable-next-line prefer-destructuring
    selectedType.value = typeList.value[0];
  }
})();

// 获取已配置权限的表列表
const loadRoleResList = async () => {
  if (!selectRolesInfo.value?.RId) {
    message.warning('请先选择角色');
    return;
  }
  if (!selectedType.value?.MId) {
    message.warning('请先选择模块');
    return;
  }
  configuredList.value = await viewModel.loadRoleResList(
    selectRolesInfo.value.RId,
    selectedType.value.MId,
  );
  initconfiguredList.value = JSON.parse(JSON.stringify(configuredList.value || '[]'));
};
// 选择角色
const selectRoles = async () => {
  const lst = rolesList.value.filter((r: RoleInfo) => {
    return r.RId === selectRolesRId.value;
  });
  // eslint-disable-next-line prefer-destructuring
  selectRolesInfo.value = lst[0];
  configuredList.value = [];
  initconfiguredList.value = [];
  selectedConfiguredInfo.value = {};
  updateTableNameInfo.value = {};
  selectedTableRows.value = [];
  loadRoleResList();
  onSelectChange([], []);
};

// 选择顶级模块
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const selectType = async () => {
  selectedType.value = typeList.value[activeKey.value];
  if (selectRolesInfo.value?.RId) {
    selectedConfiguredInfo.value = {};
    updateTableNameInfo.value = {};
    selectedTableRows.value = [];
    loadRoleResList();
    onSelectChange([], []);
  } else {
    message.warning('请先选择角色');
  }
};
const openConfigured = (tableObj: any) => {
  isVisible.value = true;
  updateTableNameInfo.value = tableObj;
  addTableNameList.value = [tableObj.ResId];
  isEdit.value = true;
};

// 删除配置
const deleteConfigured = async (resId: string) => {
  if (!resId) {
    return;
  }
  Modal.confirm({
    title: '提示',
    icon: createVNode(ExclamationCircleOutlined),
    content: '确认是否删除？',
    async onOk() {
      const res = await viewModel.delteRespAuth(selectRolesInfo.value.RId, resId);
      if (res) {
        loadRoleResList();
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onCancel() {},
  });
};

// 选择新增的表名
const selectTables = (tableNames: string) => {
  if (tableNames && tableNames !== undefined) {
    addTableNameList.value = tableNames.split(',');
    isVisible.value = true;
    isEdit.value = false;
  } else {
    addTableNameList.value = [];
  }
};

// 批量配置
const batchEdit = () => {
  console.log(selectedTableRows.value);
  if (!selectedTableRows.value || selectedTableRows.value.length === 0) {
    message.warning('请先选择需要编辑的表！');
    return;
  }
  addTableNameList.value = [];
  selectedTableRows.value.forEach(item => {
    addTableNameList.value.push(item.ResId);
  });
  isVisible.value = true;
  isEdit.value = false;
};
// 保存权限配置
const saveRoleAuth = async () => {
  if (editPermissionRef.value) {
    const res = await viewModel.submitRoleAuth({
      RId: selectRolesInfo.value.RId,
      MId: selectedType.value.MId,
      tableNameList: (editPermissionRef.value as any).addTableNameList,
      selectedPermission: (editPermissionRef.value as any).selectedPermission,
    });
    if (res) {
      isVisible.value = false;
      loadRoleResList();
    }
  }
};

// 搜索
const searchConfiguredList = () => {
  if (tableViewName.value) {
    configuredList.value = initconfiguredList.value.filter((r: { ResId: string }) => {
      return r.ResId.indexOf(tableViewName.value) >= 0;
    });
  } else {
    configuredList.value = initconfiguredList.value;
  }
};
</script>

<style lang="less" scoped>
.active {
  background-color: #eff0f9;
  color: #3144f5;
}
</style>
