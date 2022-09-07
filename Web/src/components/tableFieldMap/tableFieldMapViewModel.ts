import { Dictionary } from '@/helper/arrayHelper';
import { FieldMapType, getFieldMap, saveFieldMap } from '@/serverApi/tableInfoAPIs';
import { StringHelper } from '@/helper/stringHelper';

export type fieldMapType = Array<{
  Id: string;
  OldTitle: string;
  MapTitle: string;
}>;

export type typeFieldMapVue = {
  /**
   * 保存当前对象的值映射
   */
  Save: () => Promise<
    Array<{
      Id: string;
      OldTitle: string;
      MapTitle: string;
    }>
  >;
  AddField: (fieldName: string) => void;

  GetFieldMap: () => Dictionary<string, string>;
};

export class TableFieldMapViewModel {
  FieldMap: fieldMapType = [];

  private respId = ``;

  private mapType: FieldMapType = 'Table';

  constructor(respId: string, mpaType: FieldMapType) {
    this.respId = respId;
    this.mapType = mpaType;
  }

  async load() {
    const { Data: fieldMapData } = await getFieldMap(this.respId, this.mapType);
    if (fieldMapData) {
      fieldMapData.List.forEach(r => {
        if (this.HasKey(r.FieldKey)) {
          return;
        }
        this.FieldMap.push({
          Id: StringHelper.genGuid(),
          OldTitle: r.FieldKey,
          MapTitle: r.FieldValue,
        });
      });
    }
  }

  private HasKey(key: string) {
    for (let index = 0; index < this.FieldMap.length; index++) {
      const { OldTitle } = this.FieldMap[index];
      if (OldTitle === key) {
        return true;
      }
    }
    return false;
  }

  /**
   * 添加映射字典
   */
  async AddNewFieldMap(fieldName = `字段值`) {
    if (this.HasKey(fieldName)) {
      return;
    }
    this.FieldMap.push({
      Id: StringHelper.genGuid(),
      OldTitle: fieldName,
      MapTitle: `新字段值`,
    });
  }

  /**
   * 删除映射字典
   * @param obj
   */
  async DeleteFieldMap(obj: any) {
    this.FieldMap.splice(this.FieldMap.indexOf(obj), 1);
  }

  async Save() {
    const fieldMap: Dictionary<string, string> = {};
    for (let index = 0; index < this.FieldMap.length; index++) {
      const element = this.FieldMap[index];
      if (fieldMap[element.OldTitle] === undefined) {
        fieldMap[element.OldTitle] = element.MapTitle;
      }
    }
    await saveFieldMap(this.respId, fieldMap, this.mapType);
  }
}
