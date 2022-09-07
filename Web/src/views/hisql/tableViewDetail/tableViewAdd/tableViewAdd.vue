<template>
  <view-design />
</template>
<script lang="ts" setup>
import { message } from 'ant-design-vue';
import viewDesign from '@/components/viewDesign/viewDesign.vue';
import { TableViewAddViewModel } from './tableViewAddViewModel';

// eslint-disable-next-line no-undef
const router = useRouter(); // 页面跳转路由;
const viewModel = reactive(new TableViewAddViewModel());
viewModel.Init();
// write some code
const saveTableView = () => {
  viewModel.IsLoad = true;
  viewModel
    .saveTableView()
    .then(isOK => {
      if (isOK) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        message.success(`保存成功`, undefined, () => {
          router.push({
            name: `tableViewDetail`,
            params: {
              viewName: viewModel.TableName,
            },
          });
        });
      } else {
        message.error(`保存失败!`);
      }
    })
    .catch(err => {
      message.error(err);
    })
    .finally(() => {
      viewModel.IsLoad = false;
    });
};
</script>
<style scoped lang="less">
.mainPage {
  position: relative;
  padding-top: 10px;
  .block {
    padding-top: 10px;
    margin-bottom: 10px;
  }
}
</style>
