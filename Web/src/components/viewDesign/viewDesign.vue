<template>
  <div class="viewDesign">
    <div class="headerToolBar">
      <div class="toolLeft pl-10px">
        <span class="w-80px mr-5px">视图名:</span>
        <a-input v-model:value="viewModel.TableViewName" placeholder="请输入视图名..." />
      </div>
      <div class="toolRight">
        <h-ref-table
          :hide-select-value="true"
          :column-struct="SelectTable"
          :is-multi-value="true"
          @change="
          (tableName: string) => {
            viewModel.AddTables(tableName);
          }
        "
        >
          <a-button class="mr-10px">
            <PlusCircleOutlined />
            添加表
          </a-button>
        </h-ref-table>
        <a-button type="primary" class="mr-10px" @click="ganerateSql">预览SQL</a-button>
        <a-button type="primary" class="mr-10px" @click="save">保存视图</a-button>
      </div>
    </div>
    <div class="bodyContian">
      <div class="bodyLeft">
        <div class="h-450px w-full">
          <ERGraph
            ref="erGraphObj"
            @remove-table="
              tableName => {
                viewModel.RemoveTable(tableName);
              }
            "
            :data="viewModel.RenderData"
            @view-json-change="jsonUpdate"
          />
        </div>
        <div class="flex-grow">
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
      <div class="bodyRight">
        <template v-if="viewModel.Sql.length > 0">
          <pre class="sqlView break-normal" v-text="viewModel.Sql"></pre>
          <div class="sqlToolBar">
            <a-button type="primary" class="mr-10px" @click="excuteSql">执行SQL</a-button>
          </div>
        </template>
        <template v-else>
          <div class="min-h-100px flex justify-center items-center noSqlPrev">
            <span>设计好表关系和字段后点击预览SQL</span>
          </div>
        </template>
        <div>
          <tableFieldMap
            :ref="(obj: any) => {
            viewModel.TableFieldMapInstance = obj;
          }"
            :res-id="viewModel.TableViewName"
            :type="`TableView`"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { PlusCircleOutlined } from '@ant-design/icons-vue/lib/icons';
import markdownit from 'markdown-it/lib';
import hljs from 'highlight.js';
import { message } from 'ant-design-vue';
import ERGraph from '@/components/viewDesign/x6/ERGraph/ERGraph.vue';
import editCell from '../columsTypes/editCell.vue';

import { ViewDesignViewModel } from './viewDesignViewModel';
import { SelectTable } from '@/views/hisql/exportExcel/exportExcelViewModel';
import tableFieldMap from '../tableFieldMap/tableFieldMap.vue';

// eslint-disable-next-line no-undef
const router = useRouter(); // 页面跳转路由;
const erGraphObj = ref();
const viewModel = reactive(new ViewDesignViewModel());
viewModel.InitRenderData();
const save = () => {
  viewModel.IsLoad = true;
  viewModel
    .SaveTableView()
    .then(isOK => {
      if (isOK) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        message.success(`保存成功`, undefined, () => {
          router.push({
            name: `tableViewDetail`,
            params: {
              viewName: viewModel.TableViewName,
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
// const source = ref(``);
// const md = markdownit({ html: true });
// md.set({
//   highlight(str: any, lang: any) {
//     if (lang && hljs.getLanguage(lang)) {
//       try {
//         return `<pre class="hljs"><code>${hljs.highlight(lang, str, true).value}</code></pre>`;
//       } catch (err) {
//         console.log(err);
//       }
//     }
//     return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
//   },
// });
const jsonUpdate = (viewJson: any) => {
  viewModel.UpdateViewJson(viewJson);
};
const ganerateSql = () => {
  erGraphObj.value.save();
};
const excuteSql = () => {
  viewModel.ExcuteSql();
};
</script>
<style scoped lang="less">
@import '../../assets/css/baseValue.less';

.viewDesign {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.headerToolBar {
  height: 50px;
  width: 100%;
  border-top: solid 1px #e5e7eb;
  border-bottom: solid 1px #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: right;

  .toolLeft,
  .toolRight {
    display: flex;
    align-items: center;
  }
}

.bodyContian {
  position: relative;
  flex-grow: 1;
  @leftWidth: 850px;

  .bodyLeft {
    position: absolute;
    left: 0;
    top: 0;
    width: @leftWidth;
    height: 100%;
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    border-right: solid 1px #e5e7eb;
  }

  .bodyRight {
    position: absolute;
    width: calc(100% - @leftWidth);

    right: 0;
    top: 0;
    height: 100%;

    .sqlToolBar {
      display: flex;
      justify-content: end;
    }
  }

  .noSqlPrev {
    border-bottom: solid 1px @borderColor;
  }
}
</style>
