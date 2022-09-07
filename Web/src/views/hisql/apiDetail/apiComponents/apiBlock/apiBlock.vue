<template>
  <div class="apiBlock">
    <!-- <a class="balockDelete" @click="emits(`deleteBlock`)">
      <MyIcon type="icon-shanchu2" />
    </a> -->
    <h3 class="mb-10px">
      <i class="blockNum" v-text="`${blockIndex + 1}.`"></i>
      处理模块
    </h3>
    <div class="blockSetting">
      <a-checkbox v-model:checked="BlockObj.IsPageList" @change="isPageChange">开启分页</a-checkbox>
      <a-checkbox v-model:checked="BlockObj.OutResult">输出结果</a-checkbox>
      <div v-if="BlockObj.OutResult" class="blockResultKey">
        <span class="mr-5px">=>结果键:</span>
        <a-input v-model:value="BlockObj.BlockName" size="small" class="!w-80px"></a-input>
      </div>
    </div>
    <api-param
      :param-list="ApiInParamList"
      :is-ref-param="true"
      :block-list="blockList"
      :api-body-id="BlockObj.ApiBodyId"
      @update:param-list="v => onChange(v, ApiInParamList)"
    ></api-param>
    <div class="apiSql">
      <a-tabs>
        <a-tab-pane key="1" tab="SQL">
          <h3 class="mb-10px text-size-[#191919]">
            <span class="required">*</span>
            执行SQL[HiSQL]
          </h3>
          <div class="pb-10px">
            <code>
              SQL中的参数用$参数名替换,比如 `select * from Hi_DataElement where Name=@Name or Id in
              ([@Ids])`
              <br />
              @LoginUId 为系统保留参数,当前登录人的Id
            </code>
          </div>
          <a-textarea
            v-model:value="BlockObj.Sql"
            placeholder="请输入HiSQL...."
            :auto-size="{ minRows: 3, maxRows: 5 }"
          />
          <div class="apiOperate">
            <a-button
              type="primary"
              class="mr-10px"
              @click="
                () => {
                  viewModel.TestExceute();
                }
              "
            >
              <CaretRightFilled />
              测试
            </a-button>
          </div>
          <!-- <div v-if="whereColums.length > 0" class="dynamicWhere">
            <span class="block">动态条件</span>
            <div class="pl-20px">
              <div>
                <whereTable :value="``" :table-columns-struct="whereColums" />
              </div>
              <a-input :value="`and Id='123'`"></a-input>
            </div>
          </div> -->
        </a-tab-pane>
        <!-- <a-tab-pane key="2" tab="代码块">
          <CodeBlock ref="codeBlockRef"></CodeBlock>
        </a-tab-pane> -->
        <a-tab-pane key="3" tab="测试" force-render>
          <div class="pb-10px pt-20px min-h-145px">
            <div class="codeBody" v-html="ResultCode"></div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
    <div class="resultTable">
      <h3 class="mb-10px text-size-[#191919] font-bold">结果参数</h3>
      <api-out-param
        v-model:param-list="ApiOutParamList"
        :is-ref-param="false"
        :block-list="blockList"
      ></api-out-param>
    </div>
  </div>
</template>
<script setup lang="ts">
import { PropType } from 'vue';
import { ApiBlockViewModel } from './apiBlockViewModel';
import ApiParam from '../apiParam/apiParam.vue';
import apiOutParam from '../apiParam/apiOutParam.vue';
import { HiApiParamEntity } from '@/serverApi/models/tableModel/hiApiFields';
import { BlockParam } from '../paramRef/paramRefViewModel';

const emits = defineEmits([`deleteBlock`, 'change']);
const props = defineProps({
  blockIndex: { type: Number, required: true },
  blockData: {
    type: ApiBlockViewModel,
    required: true,
  },
  blockList: {
    type: Array as PropType<Array<BlockParam>>,
    required: true,
  },
});
provide('BlockIndex', props.blockIndex);
const viewModel = new ApiBlockViewModel();
viewModel.fill(props.blockData);
console.log(toRaw(viewModel));
const { BlockObj, ApiInParamList, ApiOutParamList, ResultCode } = viewModel;
const onChange = (newList: Array<HiApiParamEntity>, oldList: Array<HiApiParamEntity>) => {
  oldList.length = 0;
  oldList.push(...newList);
};
const isPageChange = () => {
  viewModel.PageChange();
};
watch([BlockObj, ApiInParamList, ApiOutParamList], () => {
  emits('change', viewModel);
});
defineExpose({
  Test() {
    viewModel.TestExceute();
  },
});
</script>
<style scoped lang="less">
.blockSetting {
  position: relative;
  padding-bottom: 10px;
  display: flex;
  .blockResultKey {
    position: relative;
    top: -2px;
  }
}
.apiOperate {
  padding-top: 10px;
  display: flex;
  justify-content: start;
}
</style>
