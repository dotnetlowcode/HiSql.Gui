<template>
  <div class="p-20px w-full h-full box-border viewDesignV2 flex flex-col">
    <div class="pl-10px flex items-center justify-between mb-10px">
      <div class="flex justify-start items-center">
        <span class="w-60px mr-5px">视图名:</span>
        <div class="w-200px">
          <a-input
            v-model:value="viewModel.TableViewName"
            :disabled="isEdit"
            placeholder="请输入视图名..."
          />
        </div>
      </div>
      <div>
        <a-button @click="saveViewTable">保存</a-button>
      </div>
    </div>
    <div class="flex-1 overflow-y-auto">
      <div>
        <div
          v-for="(item, index) in viewModel.JoinTables"
          :key="item.Table.TableName"
          class="flex flex-row p-20px relative item"
        >
          <div class="w-30px min-h-32px">
            <play-square-two-tone
              class="icon"
              two-tone-color="#2c50ee"
              style="font-size: 32px; cursor: pointer"
              @click="excuteSql(index)"
            />
          </div>
          <div class="w-3px h-full bg-[#eeeeee] absolute z-1 left-81px top-38px"></div>
          <div class="w-60px relative">
            <div
              class="w-15px h-15px rounded-1 border-[2px] border-[#3144f5] absolute z-2 left-25px top-8px bg-[#ffffff]"
            ></div>
          </div>
          <div class="w-60px h-32px leading-32px">{{ index === 0 ? '主表：' : '连接表：' }}</div>
          <template v-if="index === 0">
            <div class="flex-1 flex flex-row">
              <div class="w-100px overflow-hidden" :title="item.Table.TableName">
                <h-ref-table
                  class="w-full"
                  :hide-select-value="true"
                  :column-struct="SelectTable"
                  :is-multi-value="false"
                  @change="selectTable($event, index)"
                >
                  <a-button
                    :disabled="viewModel.JoinTables.length > 1"
                    type="primary"
                    class="rounded-r-none"
                  >
                    <div class="w-70px overflow-hidden overflow-ellipsis">
                      {{ item.Table.TableName ? item.Table.TableName : '选择表格' }}
                    </div>
                  </a-button>
                </h-ref-table>
              </div>
              <div>
                <a-popover trigger="click" placement="bottom">
                  <template #content>
                    <div>
                      <div class="mx-10px mb-10px pb-10px border-b-[1px] border-[#eeeeee]">
                        <a-checkbox
                          v-model:checked="item.CheckAll"
                          :indeterminate="indeterminate"
                          @change="onCheckAllChange($event, item)"
                        >
                          全选
                        </a-checkbox>
                      </div>
                      <div class="max-h-400px overflow-y-auto">
                        <div
                          v-for="(child, childIndex) in item.FieldList"
                          :key="childIndex"
                          class="mx-10px mb-10px"
                        >
                          <a-checkbox
                            v-model:checked="child.Select"
                            @change="updateSelectFields(item)"
                          >
                            {{ child.Title }}
                          </a-checkbox>
                        </div>
                      </div>
                    </div>
                  </template>
                  <a-button type="primary" class="align-top rounded-l-none ml-1px">
                    <template #icon>
                      <table-outlined />
                    </template>
                  </a-button>
                </a-popover>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="flex-1 flex flex-row">
              <div
                class="w-100px overflow-hidden"
                :title="viewModel.JoinTables[index - 1].Table.TableName"
              >
                <a-button type="primary" class="w-100px">
                  <div class="w-70px overflow-hidden overflow-ellipsis">
                    {{ viewModel.JoinTables[index - 1].Table.TableName }}
                  </div>
                </a-button>
              </div>
              <div class="w-30px text-center mx-10px text-[20px] leading-32px">
                <a-popover v-model:visible="visibleJoinType" trigger="click" placement="bottom">
                  <template #content>
                    <div>
                      <div
                        v-for="joinTypeitem in JoinTypeList"
                        :key="joinTypeitem.value"
                        class="h-30px leading-30px text-center cursor-pointer text-size-[#181818] hover:text-size-[#2c50ee]"
                        :style="{
                          color:
                            joinTypeitem.value === item.JoinType
                              ? '#2c50ee!important'
                              : '#181818!important',
                        }"
                        @click="selectJoinType(item, joinTypeitem)"
                      >
                        {{ joinTypeitem.label }}
                      </div>
                    </div>
                  </template>
                  <hi-icon
                    v-if="item.JoinType === JoinType.LeftJoin"
                    title="左连接"
                    style="color: #2c50ee"
                    icon-name="icon-left-join"
                  />
                  <hi-icon
                    v-if="item.JoinType === JoinType.InnerJoin"
                    title="右连接"
                    style="color: #2c50ee"
                    icon-name="icon-inner-join"
                  />
                  <hi-icon
                    v-if="item.JoinType === JoinType.RightJoin"
                    title="内连接"
                    style="color: #2c50ee"
                    icon-name="icon-right-join"
                  />
                </a-popover>
              </div>
              <div class="w-100px overflow-hidden" :title="item.Table.TableName">
                <h-ref-table
                  class="w-full"
                  :hide-select-value="true"
                  :column-struct="SelectTable"
                  :is-multi-value="false"
                  @change="selectTable($event, index)"
                >
                  <a-button
                    :disabled="viewModel.JoinTables.length > index + 1"
                    type="primary"
                    class="rounded-r-none w-100px"
                  >
                    <div class="w-70px overflow-hidden overflow-ellipsis">
                      {{ item.Table.TableName ? item.Table.TableName : '选择表格' }}
                    </div>
                  </a-button>
                </h-ref-table>
              </div>
              <div>
                <a-popover trigger="click" placement="bottom">
                  <template #content>
                    <div>
                      <div class="mx-10px mb-10px pb-10px border-b-[1px] border-[#eeeeee]">
                        <a-checkbox
                          v-model:checked="item.CheckAll"
                          :indeterminate="indeterminate"
                          @change="onCheckAllChange($event, item)"
                        >
                          全选
                        </a-checkbox>
                      </div>
                      <div class="max-h-400px overflow-y-auto">
                        <div
                          v-for="(child, childIndex) in item.FieldList"
                          :key="childIndex"
                          class="mx-10px mb-10px"
                        >
                          <a-checkbox
                            v-model:checked="child.Select"
                            @change="updateSelectFields(item)"
                          >
                            {{ child.Title }}
                          </a-checkbox>
                        </div>
                      </div>
                    </div>
                  </template>
                  <a-button type="primary" class="align-top rounded-l-none ml-1px">
                    <template #icon>
                      <table-outlined />
                    </template>
                  </a-button>
                </a-popover>
              </div>
              <div class="h-32px leading-32px mx-20px">关联字段</div>
              <div class="">
                <div
                  v-for="(conditionItem, conditionIndex) in item.Conditions"
                  :key="conditionItem.Left.FieldName + conditionItem.Right.FieldName"
                  class="overflow-hidden mt-10px"
                  :style="{ marginTop: conditionIndex === 0 ? '0px' : '10px' }"
                >
                  <div class="float-left">
                    <a-select
                      v-model:value="conditionItem.Left.FieldName"
                      :title="conditionItem.Left.FieldName"
                      :field-names="{
                        label: 'FieldName',
                        value: 'Id',
                        options: 'ChildList',
                      }"
                      show-search
                      style="width: 120px"
                      :options="item.FieldListLeftOptions"
                      @change="changeconditionItem($event, item, conditionIndex, 'Left')"
                    ></a-select>
                  </div>
                  <div class="float-left h-32px leading-32px mx-10px">=</div>
                  <div class="float-left">
                    <a-select
                      v-model:value="conditionItem.Right.FieldName"
                      :field-names="{
                        label: 'FieldName',
                        value: 'Id',
                        options: 'ChildList',
                      }"
                      style="width: 120px"
                      show-search
                      :options="item.FieldListRightOptions"
                      @change="changeconditionItem($event, item, conditionIndex, 'Right')"
                    ></a-select>
                  </div>
                  <div class="float-left leading-32px icon">
                    <plus-outlined
                      v-if="
                        conditionItem.Left.FieldName &&
                        conditionItem.Right.FieldName &&
                        conditionIndex === item.Conditions.length - 1
                      "
                      title="添加"
                      style="color: #3144f5; margin-left: 10px; cursor: pointer"
                      @click="addConditionItem(item)"
                    />
                    <close-outlined
                      v-if="conditionIndex !== 0 && conditionIndex === item.Conditions.length - 1"
                      title="删除"
                      style="color: red; margin-left: 10px; cursor: pointer"
                      @click="deleteConditionItem(item)"
                    />
                  </div>
                </div>
              </div>
              <div class="flex-1 text-right mr-10px icon">
                <delete-outlined class="deleteIcon" @click="deleteJoinTable(item)" />
              </div>
            </div>
          </template>
        </div>
      </div>
      <div class="ml-160px mt-20px cursor-pointer hover:text-size-[#3144f5]">
        <a-button
          type="text"
          :disabled="viewModel.JoinTables[viewModel.JoinTables.length - 1].Table.TableName === ''"
          @click="addJoinTable"
        >
          <plus-outlined />
          添加表连接
        </a-button>
      </div>
      <div class="ml-160px mt-20px">
        <a-button type="primary" @click="excuteSql(undefined)">
          <caret-right-outlined />
          执行
        </a-button>
      </div>
    </div>
    <div class="mt-20px flex-1 overflow-y-auto">
      <a-table
        size="small"
        style="width: 100%; height: 100%"
        :columns="viewModel.Headers"
        :data-source="viewModel.Data"
        :scroll="{
          x: 'max-content',
          y: 'max-content',
        }"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import {
  PlusOutlined,
  CaretRightOutlined,
  PlaySquareTwoTone,
  TableOutlined,
  DeleteOutlined,
  CloseOutlined,
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { useRoute } from 'vue-router';
import { ViewDesignV2ViewModel, JoinTable, JoinTypeObj } from './viewDesignV2ViewModel';

import { ViewDesignViewModel } from '../viewDesignViewModel';
import { SelectTable } from '@/views/hisql/exportExcel/exportExcelViewModel'; // 初始默认添加一个主表，值默认为空

const props = defineProps({
  viewName: {
    type: String,
    required: false,
    default: '',
  },
});

const indeterminate = ref(false);
const viewDesignViewModel = reactive(new ViewDesignViewModel());

const JoinType = reactive(new JoinTypeObj());
const visibleJoinType = ref(false);
const JoinTypeList = reactive([
  {
    label: '左连接',
    value: 'LeftJoin',
  },
  {
    label: '右连接',
    value: 'RightJoin',
  },
  {
    label: '内连接',
    value: 'InnerJoin',
  },
]);

const viewModel = reactive(new ViewDesignV2ViewModel());
viewModel.AddJoinTable();

// const route = useRoute(); // 页面路由参数
// const { viewName } = route.params;
const isEdit = ref(false); // 是否为编辑状态
if (props.viewName) {
  isEdit.value = true;
  // 如果是编辑视图就加载视图设计信息
  viewModel.TableViewName = unref(props.viewName);
  viewModel.LoadTableView();
}

/**
 * 选择表
 * @param tableName
 * @param curIndex
 */
const selectTable = async (tableName: string, curIndex: number) => {
  viewDesignViewModel.AddTables(tableName);
  console.log(viewModel.JoinTables[curIndex].FieldList);
  viewModel.JoinTables[curIndex].Table.TableName = tableName;
  viewModel.JoinTables[curIndex].Table.TableDesc = tableName;
  viewModel.JoinTables[curIndex].Conditions = [];
  await viewModel.ChangeTableName(viewModel.JoinTables[curIndex], tableName);
  console.log(viewModel.JoinTables);
  viewModel.groupFieldList(viewModel.JoinTables[curIndex], curIndex);
};

/**
 * //添加连接表
 */
const addJoinTable = async () => {
  await viewModel.AddJoinTable();
  await viewModel.ChangeTableName(
    viewModel.JoinTables[viewModel.JoinTables.length - 1],
    viewModel.JoinTables[viewModel.JoinTables.length - 1].Table.TableName,
  );
  console.log(viewModel.JoinTables[viewModel.JoinTables.length - 1].FieldList);
};

/**
 * 选择连接方式
 * @param item
 * @param JoinTypeItem
 */
const selectJoinType = (item: JoinTable, JoinTypeItem: any) => {
  item.JoinType = JoinTypeItem.value;
  visibleJoinType.value = false;
};

/**
 * 添加关联字段条件
 * @param curIndex
 */
const addConditionItem = (item: JoinTable) => {
  const obj = JSON.parse(JSON.stringify(item.Conditions[0]));
  obj.Left.FieldName = '';
  obj.Right.FieldName = '';
  item.Conditions.push(obj);
};

const deleteConditionItem = (item: JoinTable) => {
  item.Conditions.splice(item.Conditions.length - 1, 1);
};

/**
 * 选择关联字段条件
 * @param e
 * @param item
 * @param conditionIndex
 */
const changeconditionItem = (e: any, item: JoinTable, conditionIndex: number, type: string) => {
  if (type === 'Left') {
    for (let index = 0; index < item.FieldListLeftOptions.length; index++) {
      const element = item.FieldListLeftOptions[index];
      if (!!element.ChildList?.length && element.ChildList.some(r => r.Id === e)) {
        item.Conditions[conditionIndex].Left.TableName = element.FieldName;
        break;
      }
    }
  } else if (type === 'Right') {
    item.Conditions[conditionIndex].Right.TableName = item.FieldListRightOptions[0].FieldName; // 给表名赋值
  }
};

/**
 * 删除连接表
 * @param item
 */
const deleteJoinTable = (item: JoinTable) => {
  viewModel.DeleteJoinTable(item);
};
/**
 *更新选中的字段
 * @param item
 */
const updateSelectFields = (item: JoinTable) => {
  item.SelectFields = item.FieldList.filter(r => {
    return r.Select;
  });
  if (item.SelectFields.length > 0) {
    if (item.SelectFields.length === item.FieldList.length) {
      indeterminate.value = false;
      item.CheckAll = true;
    } else {
      indeterminate.value = true;
    }
  } else {
    indeterminate.value = false;
    item.CheckAll = false;
  }
};
// 全选
const onCheckAllChange = (e: any, item: JoinTable) => {
  if (e.target.checked) {
    item.FieldList.forEach(ele => {
      ele.Select = true;
    });
  } else {
    item.FieldList.forEach(ele => {
      ele.Select = false;
    });
  }
  updateSelectFields(item);
};
const saveIng = ref(false);
/**
 * 执行
 * @param curIndex
 */
const excuteSql = (curIndex: number | undefined) => {
  if (saveIng.value) {
    return;
  }
  saveIng.value = true;
  viewModel
    .ExcuteSql(curIndex)
    .then(r => {
      message.success('已执行!');
    })
    .catch(err => {
      message.error(err);
    })
    .finally(() => {
      saveIng.value = false;
    });
};

const saveViewTable = () => {
  if (saveIng.value) {
    return;
  }
  saveIng.value = true;
  viewModel
    .SaveTableView()
    .then(r => {
      message.success('已保存!');
    })
    .catch(err => {
      message.error(err);
    })
    .finally(() => {
      saveIng.value = false;
    });
};
// const props = defineProps({});
// const emits = defineEmits([]);
// write some code
</script>
<style scoped lang="less">
.deleteIcon {
  font-size: 20px;
  color: red;
  cursor: pointer;
  position: absolute;
  top: 50%;
  margin-top: -10px;
  z-index: 1;
}
.item .icon {
  display: none;
}
.item:hover {
  background: #efefef;

  & .icon {
    display: block;
  }
}

.viewDesignV2 .ant-btn-primary {
  color: #fff !important;
  border-color: #2c50ee !important;
  background: #2c50ee !important;
  border-radius: 0 !important;
}
</style>
