import { ColumnStruct } from '@/serverApi/models/columnStruct';
import { getTableTask, saveTableTask } from '@/serverApi/request/hiTask/hiTableTaskAPIs';
import { HiTaskEntity } from '@/serverApi/request/hiTask/HiTaskEntity';
import { DataBaseType } from '../columsTypes/fromEdit/fromEditViewModel';
import { SearchUIModelType } from '../columsTypes/searchFrom/searchFromViewModel';

export class TableTaskCreateViewModel {
  TaskInfo = new HiTaskEntity();

  ExportSelect: ColumnStruct = ColumnStruct.GetColumnStruct({
    FieldName: 'SourcesTable',
    FieldDesc: '数据表表',
    FieldType: DataBaseType.nvarchar,
    SearchUIModel: SearchUIModelType.SingleInput,
    IsRefTab: true,
    RefTab: `Hi_ExcelExportTemplate`,
    RefField: 'TemplateId',
    RefFields: 'TemplateId,Title',
    RefFieldDesc: 'Id,标题',
    RefWhere: ``,
  });

  async Init(taskId: string) {
    const taskInfo = await getTableTask(taskId);
    if (taskInfo) {
      Object.assign(this.TaskInfo, taskInfo);
    }
  }

  async Save() {
    return saveTableTask(this.TaskInfo);
  }
}
