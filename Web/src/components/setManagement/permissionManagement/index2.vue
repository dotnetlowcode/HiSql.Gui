<template>
  <div class="w-full h-full">
    <div class="body box-border overflow-hidden flex flex-row w-full">
      <div class="w-200px h-full overflow-y-auto border-r-1px border-[#eeeeee] text-center">
        <div
          v-for="item in rolesList"
          :key="item.RId"
          class="h-40px leading-40px border-b-1px border-[#eeeeee] cursor-pointer"
          :class="selectRolesInfo?.RId == item.RId ? 'active' : ''"
          @click="selectRoles(item)"
        >
          {{ item.Name }}
        </div>
      </div>
      <div class="flex-1 h-full border-r-1px border-[#eeeeee] text-center flex flex-col">
        <div class="h-40px overflow-hidden border-b-1px border-[#eeeeee]">
          <div
            v-for="item in typeList"
            :key="item.MId"
            class="float-left h-40px leading-40px px-10px cursor-pointer border-r-1px border-[#eeeeee]"
            :class="selectedType?.MId == item.MId ? 'active' : ''"
            @click="selectType(item)"
          >
            {{ item.Name }}
          </div>
        </div>
        <div class="flex-1 flex flex-row w-full h-full">
          <div class="w-200px h-full flex flex-col border-r-1px border-[#eeeeee]">
            <!-- <div class="text-right m-10px">
              <h-ref-table
                :hide-select-value="true"
                :column-struct="SelectTable"
                :is-multi-value="true"
                @change="
                (tableName:string) => {
                 selectTables(tableName);
                }
              "
              >
                <a-button class="mr-10px">
                  <PlusCircleOutlined />
                  添加表
                </a-button>
              </h-ref-table>
            </div> -->
            <div class="m-10px">
              <a-input
                v-model:value="tableViewName"
                @input="searchConfiguredList"
                placeholder="请输入关键字搜索"
              />
            </div>
            <div class="flex-1 overflow-y-auto border-t-1px border-[#eeeeee]">
              <div
                v-for="item in configuredList"
                :key="item.ResId"
                class="h-40px leading-40px border-b-1px border-[#eeeeee] overflow-ellipsis w-full text-left px-10px cursor-pointer"
                :class="selectedConfiguredInfo?.ResId == item.ResId ? 'active' : ''"
                @click="selectConfigured(item)"
              >
                {{ item.ResId }}
              </div>
            </div>
          </div>
          <div class="flex-1 h-full">
            <div
              class="w-full border-b-1px border-[#eeeeee] text-left px-10px box-border h-53px overflow-x-auto"
            >
              <!-- <div
                v-for="item in addTableNameList"
                :key="item"
                class="h-40px leading-40px border-r-1px border-[#eeeeee] cursor-pointer float-left px-10px"
              >
                {{ item }}
                <span
                  title="移除"
                  class="pl-10px text-size-[#aaaaaa] inline-block"
                  @click="deleteTable(item)"
                >
                  <CloseCircleOutlined />
                </span>
              </div> -->
              <template v-for="tag in addTableNameList" :key="tag">
                <a-tooltip :title="tag">
                  <a-tag closable @close="deleteTable(tag)">
                    {{ tag }}
                  </a-tag>
                </a-tooltip>
              </template>
              <div class="text-right m-10px inline-block">
                <h-ref-table
                  :hide-select-value="true"
                  :column-struct="SelectTable"
                  :is-multi-value="true"
                  @change="
                (tableName:string) => {
                 selectTables(tableName);
                }
              "
                >
                  <a-tag>添加表</a-tag>
                  <!-- <a-button class="mr-10px">
                    <PlusCircleOutlined />
                    添加表
                  </a-button> -->
                </h-ref-table>
              </div>
            </div>
            <div class="text-right m-10px">
              <a-button class="cursor-pointer" type="primary" @click="saveRoleAuth">
                <hi-icon class="text-16px" icon-name="icon-baocun1" />
                保存
              </a-button>
            </div>
            <div class="flex-1 p-30px box-border overflow-y-auto">
              <div v-for="item in resAuthList" :key="item" class="mb-40px">
                <div class="font-bold text-[16px] text-size-[#666666] mb-15px text-left">
                  {{ item.Name }}
                </div>
                <div>
                  <hRefTableSelect
                    v-if="isReRender"
                    ref="hRefTableSelectRef"
                    v-model:value="refValue"
                    :ref-config="{
                      RefTab: item.RefTab,
                      RefTextField: item.RefTextField,
                      RefValueField: item.RefField,
                      RefWhere: item.RefWhere,
                    }"
                    :handle-type="item.Name"
                    @change="changeValue"
                  ></hRefTableSelect>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LeftOutlined, CloseCircleOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { Dictionary } from '@/helper/arrayHelper';
import {
  PermissionManagementModel,
  ModuleType,
  RoleInfo,
  ConfiguredInfo,
} from './permissionManagementModel';
import { SelectTable } from '@/views/hisql/exportExcel/exportExcelViewModel';
import hRefTableSelect from '@/components/columsTypes/hRefTableSelect/hRefTableSelect.vue';
import { RoleSimpleAuth } from '@/serverApi/hiAuthorityAPIs';

const emits = defineEmits([`closedPermissionManagement`]);

const hRefTableSelectRef = ref(null);

debugger;
const rolesList = ref<Array<RoleInfo>>([]);
const typeList = ref<Array<ModuleType>>([]);
const configuredList = ref<Array<ConfiguredInfo>>([]);
const initconfiguredList = ref<Array<ConfiguredInfo>>([]);
const addTableNameList = ref<Array<string>>([]); // 新增表名权限，可多个操作
const updateTableName = ref(''); // 编辑表名权限，单个操作
const resAuthList = ref<Array<any>>([]);
const tableViewName = ref('');
const isReRender = ref(true);
const selectRolesInfo = ref(); // 选择的角色信息
const selectedConfiguredInfo = ref(); // 选中的表名配置信息
const selectedType = ref(); // 选择的顶级模块信息
const refValue = ref();
const selectedPermission = ref<Dictionary<string, any>>({}); // 选中的权限

const viewModel = new PermissionManagementModel();
(async () => {
  rolesList.value = await viewModel.getRoles();
  typeList.value = await viewModel.getRoleAuthTabs();
})();
// 刷新资源组件
const reRender = () => {
  isReRender.value = false;
  setTimeout(() => {
    isReRender.value = true;
  });
};
// 获取资源
const loadResAuthList = async () => {
  debugger;
  resAuthList.value = await viewModel.loadResAuthList(selectedType.value.MId);
  if (resAuthList.value.length > 0) {
    // 资源选择对象
    resAuthList.value.forEach(item => {
      if (item.Name) {
        Object.assign(selectedPermission.value, { [item.Name]: { text: '', value: '' } });
      }
    });
  } else {
    // eslint-disable-next-line no-const-assign
    selectedPermission.value = {};
  }
  debugger;
};
// 选择角色
const selectRoles = async (item: RoleInfo) => {
  selectRolesInfo.value = item;
  configuredList.value = [];
  initconfiguredList.value = [];
  selectedType.value = {};
  selectedConfiguredInfo.value = {};
  updateTableName.value = '';
  refValue.value = '';
  reRender();
};

// 选择顶级模块
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const selectType = async (item: ModuleType) => {
  if (selectRolesInfo.value?.RId) {
    selectedType.value = item;
    loadResAuthList();
    debugger;
    configuredList.value = await viewModel.loadRoleResList(selectRolesInfo.value.RId, item.MId);
    initconfiguredList.value = JSON.parse(JSON.stringify(configuredList.value || '[]'));
    updateTableName.value = '';
    debugger;
  } else {
    message.warning('请先选择角色');
  }
};

// 选择已配置表名
const selectConfigured = async (item: any) => {
  // eslint-disable-next-line no-use-before-define
  selectedConfiguredInfo.value = item;
  addTableNameList.value = [];
  refValue.value = item.RefValues;
  debugger;
  reRender();
  // 给选中的配置赋值
  updateTableName.value = item.ResId;
  const allList = hRefTableSelectRef.value || [];
  const refValueArr = item.RefValues.split(',');
  const refTextArr = item.RefValueText.split(',');
  if (allList && allList.length > 0) {
    allList.forEach((d1: any, i1) => {
      let valueStr = '';
      let textStr = '';
      refValueArr.forEach((d2: any, i2: any) => {
        if (d1.viewData && d1.viewData.optionList && d1.viewData.optionList.length > 0) {
          d1.viewData.optionList.forEach((d3: { Id: any }) => {
            if (d2 === d3.Id) {
              valueStr += `,${d2}`;
              textStr += `,${refTextArr[i2]}`;
            }
          });
        }
      });
      debugger;
      selectedPermission.value[resAuthList.value[i1].Name].value = valueStr.substring(
        1,
        valueStr.length,
      );
      selectedPermission.value[resAuthList.value[i1].Name].text = textStr.substring(
        1,
        textStr.length,
      );
    });
  }
};

// 选择新增的表名
const selectTables = (tableNames: string) => {
  debugger;
  if (tableNames && tableNames !== undefined) {
    addTableNameList.value = tableNames.split(',');
  } else {
    addTableNameList.value = [];
  }
  selectedConfiguredInfo.value = {};
  refValue.value = '';
  reRender();
};
// 移除新增的表名
const deleteTable = (item: string) => {
  addTableNameList.value = addTableNameList.value.filter(e => {
    return e !== item;
  });
};
// 勾选资源
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const changeValue = (v1: string, v2: string, handleType: string) => {
  debugger;
  for (const key in selectedPermission.value) {
    if (Object.prototype.hasOwnProperty.call(selectedPermission.value, key)) {
      if (key === handleType) {
        const element = selectedPermission.value[key];
        if (v1 && v2) {
          element.value = v1;
          element.text = v2;
        } else {
          element.value = '';
          element.text = '';
        }
      }
    }
  }
};
// 保存权限配置
const saveRoleAuth = async () => {
  const roleId = selectRolesInfo.value.RId;
  const moduleId = selectedType.value.MId;
  const authList: RoleSimpleAuth[] = [];
  let obj = new RoleSimpleAuth();
  if (!roleId) {
    message.warning(`请选择角色!`);
    return;
  }
  if (!moduleId) {
    message.warning(`请选择模块!`);
    return;
  }
  debugger;
  // if (selectedPermission.value.length === 0) {
  //   message.warning(`未配置权限!`);
  //   return;
  // }
  let resText = '';
  let refValues = '';
  for (const key in selectedPermission.value) {
    if (Object.prototype.hasOwnProperty.call(selectedPermission.value, key)) {
      const element = selectedPermission.value[key];
      if (element && element.value) {
        resText += `,${element.text}`;
        refValues += `,${element.value}`;
      }
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  resText = resText.substring(1, resText.length);
  refValues = refValues.substring(1, refValues.length);
  debugger;
  // eslint-disable-next-line prefer-destructuring
  obj.RefValueText = resText;
  // eslint-disable-next-line prefer-destructuring
  obj.RefValues = refValues;
  if (addTableNameList.value.length > 0) {
    // 新增多个表名，批量添加权限
    addTableNameList.value.forEach((ele: string) => {
      obj = JSON.parse(JSON.stringify(obj));
      obj.ResId = ele;
      authList.push(obj);
    });
  } else {
    // 选中表名编辑权限
    if (!updateTableName.value) {
      message.warning(`请选择表名编辑权限!`);
      return;
    }
    obj.ResId = updateTableName.value;
    authList.push(obj);
  }
  debugger;
  const res = await viewModel.saveRoleAuth(roleId, moduleId, authList);
  if (res) {
    message.success(`保存成功!`);
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
