<template>
  <!-- <a-page-header title="Api" sub-title="API设计器"> -->

  <a-page-header class="h-full" title="" sub-title="">
    <div v-if="loadIng" class="loadingWaper">
      <a-spin size="large" />
    </div>
    <div v-else class="apiBody">
      <div class="border-b pb-10px flex justify-end">
        <a-button class="" type="primary" :disabled="saveIng" @click="saveApiInfo">
          {{ saveIng ? `保存中...` : `保存` }}
        </a-button>
      </div>
      <div class="mainParam">
        <h3 class="text-[16px] text-size-[#191919] mt-10px font-bold h-40px leading-40px">
          API接口设置
        </h3>
      </div>
      <!-- <a-button class="addNodeBtn" type="primary" @click="addNewNode">增加节点</a-button>
      <a-button class="saveBtn" type="primary" :disabled="saveIng" @click="saveApiInfo">
        {{ saveIng ? `保存中...` : `保存` }}
      </a-button> -->
      <div class="mb-10px min-h-60px">
        <div class="flex flex-col justify-between">
          <div class="flex mb-8px">
            <div class="mr-34px text-size-[#191919]">API接口地址:</div>
            <div class="urlTip">注意:只能输入纯英文,不能包含其他符号</div>
          </div>
          <div class="mb-10px">
            <code class="!ml-0px ml-10px mr-2px" v-text="`${config.ApiConfig.ApiHost}/tableApi/`" />
            <a-input
              v-model:value="ApiObj.Name"
              class="!w-150px"
              placeholder="如:GetUserInfoApi"
            ></a-input>
          </div>
          <div>
            <div class="mb-8px text-size-[#191919]">Api组名:</div>
            <a-input
              v-model:value="ApiObj.GroupName"
              class="!w-458px"
              placeholder="如:UserGroup"
            ></a-input>
          </div>
        </div>
      </div>
      <div class="mainBody">
        <div class="mainParam">
          <h3 class="text-[16px] text-size-[#191919] mt-10px font-bold h-40px leading-40px">
            全局参数
          </h3>
          <ApiParam
            :param-list="MainParam"
            :is-ref-param="false"
            :block-list="[]"
            :api-body-id="`0`"
            @update:param-list="mainParamChange"
          ></ApiParam>
        </div>
        <div class="apiBlocks">
          <h3 class="text-[16px] text-size-[#191919] mt-10px font-bold h-40px leading-40px">
            模块
          </h3>
          <div class="mb-16px">
            <a-button class="addparamclass mr-10px" size="middle" @click="addNewNode">
              <template #icon>
                <MyIcon class="text-[#3144F5]" type="icon-a-HiSqlGUIICON_zengjia" />
              </template>
              增加模块
            </a-button>
            <a-button
              class="addparamclass mr-10px"
              size="middle"
              @click="
                () => {
                  viewModel.DeleteBlock();
                }
              "
            >
              <template #icon>
                <MyIcon class="text-[#3144F5]" type="icon-shanchu" />
              </template>
              删除模块
            </a-button>
          </div>
          <div class="bg-[#FCFCFC]">
            <div class="apitestTab">
              <a-tabs
                v-model:activeKey="activeKey"
                class="bg-[#ffffff]"
                type="card"
                :tab-bar-gutter="0"
              >
                <a-tab-pane
                  v-for="(block, index) in BlockList"
                  :key="index"
                  :tab="`模块${index + 1}`"
                />
              </a-tabs>
            </div>

            <ApiBlock
              v-if="showBlockBody"
              ref="apiBlockRef"
              class="pl-10px pr-10px"
              :block-index="activeKey"
              :block-data="BlockList[activeKey]"
              :block-list="blockList"
              @change="v => change(v)"
              @delete-block="v => viewModel.DeleteBlock()"
            />
          </div>
        </div>
      </div>
    </div>
  </a-page-header>
</template>
<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import { ApiDetailViewModel } from './apiDetailViewModel';
import ApiBlock from './apiComponents/apiBlock/apiBlock.vue';
import { ApiBlockViewModel } from './apiComponents/apiBlock/apiBlockViewModel';
import { BlockParam } from './apiComponents/paramRef/paramRefViewModel';
import ApiParam from './apiComponents/apiParam/apiParam.vue';
import { HiApiParamEntity } from '@/serverApi/models/tableModel/hiApiFields';
import config from '@/serverApi/config';
import { MyIcon } from '@/components/Icon/hiIconViewModel';
import { addBlockApiRouterName } from '@/router';

// const props = defineProps({
//   /**
//    * 页面id
//    */
//   propId: {
//     type: String,
//     required: true,
//   },
// });

const viewModel = new ApiDetailViewModel();
const { ApiObj, BlockList, loadIng, MainParam, activeKey } = viewModel;
const routeObj = useRoute();
const apiBlockRef = ref();
// const testExceute = () => {
//   apiBlockRef.value.Test();
// };
ApiObj.ApiId = routeObj.params.id as string;

// ApiObj.ApiId = props.propId as string;
// if (props.propId === addBlockApiRouterName) {
//   ApiObj.ApiId = '';
// }

viewModel.loadApiInfo();
// watch(
//   () => routeObj.params.id,
//   v => {
//     ApiObj.ApiId = '';
//     // eslint-disable-next-line no-undef
//     nextTick(() => {
//       // ApiObj.ApiId = v as string;
//       ApiObj.ApiId = v as string;
//       if (props.propId === addBlockApiRouterName) {
//         ApiObj.ApiId = '';
//       }
//       viewModel.loadApiInfo();
//     });
//   },
// );
const blockList = computed(() => {
  const tempBlockList = reactive<Array<BlockParam>>([
    {
      BlockId: `0`,
      BlockName: `全局参数`,
      OutParam: MainParam,
    },
  ]);
  let i = 0;
  BlockList.forEach(r => {
    i += 1;
    tempBlockList.push({
      BlockId: r.BlockObj.ApiBodyId,
      BlockName: `模块${i}`,
      OutParam: r.ApiOutParamList,
    });
  });
  return tempBlockList;
});

const showBlockBody = ref(true);
const change = async (newObj: ApiBlockViewModel) => {
  Object.assign(BlockList[activeKey.value], newObj);
};
watch(activeKey, () => {
  showBlockBody.value = false;
  // eslint-disable-next-line no-undef
  nextTick(() => {
    showBlockBody.value = true;
  });
});
// const testExceute = async () => {
//   await viewModel.TestExceute();
// };
const addNewNode = () => {
  viewModel.AddNewNode();
};
// const deleteNode = (block: HiApiBlockEntity) => {
//   viewModel.DeleteNode(block);
// };
// const deleteParam = async (index: number) => {
//   viewModel.DeleteParam(index);
// };
// const addNewParam = async () => {
//   viewModel.AddNewParam();
// };

const mainParamChange = (newParamList: Array<HiApiParamEntity>) => {
  MainParam.length = 0;
  newParamList.forEach(r => {
    r.ApiBodyId = `0`;
    r.IsMainParam = true;
  });
  MainParam.push(...newParamList);
};
const saveIng = ref(false);
const saveApiInfo = async () => {
  saveIng.value = true;
  try {
    const isPass = await viewModel.Save();
    if (isPass) {
      message.success(`保存成功!`);
    }
  } catch (error: any) {
    message.error(error, 5);
  }
  saveIng.value = false;
};
</script>
<style lang="less">
@tablebordercolor: #f0f0f0;

.apiBody {
  position: relative;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 150px);
  padding-top: 20px;
  .mainParam {
    position: relative;
    h3 {
      margin-bottom: 10px;
    }
  }
  .urlTip {
    padding-left: 5px;
    font-size: 10px;
    color: #ff6010;
  }
  .table {
    border: solid 1px @tablebordercolor;
    background-color: #fafafa;
    z-index: 10;
    td {
      padding: 5px 5px;
      border-right: solid 1px @tablebordercolor;
      border-bottom: solid 1px @tablebordercolor;
    }

    padding-top: 33px;
    max-height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    border-right: solid 1px @tablebordercolor;
    border-bottom: solid 1px @tablebordercolor;
    .editable-cell-icon {
      cursor: pointer;
      margin-right: 10px;
    }
    td {
      padding: 5px 5px;
      border-right: solid 1px @tablebordercolor;
      border-bottom: solid 1px @tablebordercolor;
      border-left: solid 1px @tablebordercolor;
    }
  }
  .required {
    color: red;
    font-size: 16px;
    vertical-align: text-top;
  }
  .saveBtn,
  .addNodeBtn {
    position: absolute;
    right: 0px;
    top: -55px;
    cursor: pointer;
  }

  .addNodeBtn {
    right: 90px;
  }

  .apiBlocks {
    position: relative;
    min-width: 1135px;
    // border: solid 1px #d9d9d9;
    padding: 10px;
    .apiBlock:last-child {
      .blockIcon {
        display: none;
      }
    }
  }
  .mainBody {
    // height: calc(100vh - 240px);
    flex: 1;
    overflow: auto;
    padding-right: 30px;
  }
  .apiBlock {
    position: relative;
    padding-bottom: 10px;
    padding-top: 10px;

    .balockDelete {
      position: absolute;
      right: 10px;
      top: 10px;
      z-index: 10;
    }
    .blockNum {
      font-size: 20px;
    }
    .blockIcon {
      position: relative;
      font-size: 30px;
      text-align: center;
    }
  }

  .apiParams {
    max-width: 100%;
    position: relative;
    table {
      max-width: 100%;
    }
    margin-bottom: 20px;
  }
  .balockDelete {
    position: relative;
  }
  .apiSql {
    position: relative;
    margin-bottom: 10px;
  }
  code {
    font-size: 14px;
    height: 32px;
    line-height: 32px;
    display: inline-block;
    padding: 0 10px;
    margin-right: 10px;
    border-radius: 3px;
  }

  .codeBody {
    border-radius: 5px;
    overflow-y: auto;
    max-height: 240px;
  }
}
.addparamclass {
  background: #f1f4fb !important;
  color: #3144f5 !important;
  border: none;
  outline: none;
}
</style>
<style lang="less" scoped>
::v-deep(.ant-page-header-heading-title) {
  font-size: 16px;
  color: #191919;
  font-weight: bold;
}
.apitestTab {
  ::v-deep(.ant-tabs-top > .ant-tabs-nav) {
    margin: 0;
  }
  ::v-deep(.ant-tabs-card > .ant-tabs-nav .ant-tabs-tab) {
    background-color: #ffffff;
    border-top-color: transparent;
    border-right-color: transparent;
    border-left-color: transparent;
    position: relative;
    outline: none;
  }
  ::v-deep(.ant-tabs-tab::before) {
    content: '';
    display: block;
    width: 1px;
    height: 20px;
    background: #e5e5e5;
    position: absolute;
    left: -2px;
    top: 10px;
    z-index: 99;
  }
  ::v-deep(.ant-tabs-tab:first-child::before) {
    content: '';
    display: none !important;
  }
  ::v-deep(.ant-tabs-tab-active) {
    background-color: #fcfcfc !important;
    border: 1px solid #f0f0f0 !important;
    border-bottom: 1px solid #fcfcfc !important;
    border-radius: 4px !important;
    outline: none !important;
  }
  ::v-deep(.ant-tabs-tab-active::before) {
    content: '';
    display: none !important;
  }
  ::v-deep(.ant-page-header-content) {
    padding: 0px;
  }
}
</style>
