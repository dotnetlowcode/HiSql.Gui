import { StringHelper } from '@/helper/stringHelper';
import { tableDataAdd, tableDataDelete } from '@/serverApi/tableDataAPIs';
import { ColumnStruct } from '@/serverApi/models/columnStruct';
import { DataBaseType } from '@/components/columsTypes/fromEdit/fromEditViewModel';
import { SearchUIModelType } from '@/components/columsTypes/searchFrom/searchFromViewModel';
import { SyncEach } from '@/helper/arrayHelper';

type RoleTables = `Hi_Group` | `Hi_Module` | `Hi_ModuleTypeOperate` | `Hi_Role`;

export class PageViewModel {
  dataYml = ``;

  Value = ``;

  async Save() {
    const modules = this.dataYml.split(`\n\n`);
    //
    let i = 0;
    const tableNames: Array<RoleTables> = [
      `Hi_Group`,
      `Hi_Module`,
      `Hi_ModuleTypeOperate`,
      `Hi_Role`,
    ];
    await SyncEach(tableNames, async tableName => {
      await this.ClearTable(tableName);
      return true;
    });
    await SyncEach(modules, async (moduleStr: string) => {
      await this.SaveModule(moduleStr.split(`\n`));
      this.currentSaveModuleOperate = `${i}/${modules.length}`;
      i += 1;
      return true;
    });
  }

  currentSaveModuleIndex = ``;

  currentSaveModuleOperate = ``;

  private async SaveModule(moduleLines: Array<string>) {
    // moduleLines.forEach(lineStr => {});
    let rootModuleId = ``;
    let currentModuleId = ``;
    let currentRoleId = ``;
    let i = 0;
    await SyncEach(moduleLines, async lineStr => {
      i += 1;
      const [tableContent, id, tableName] = lineStr.split(`-`);
      let objKey: string | null = id;
      if (id === '') {
        objKey = null;
      }
      //
      switch (tableName as RoleTables) {
        case 'Hi_Module':
          if (rootModuleId === '') {
            rootModuleId = await this.SaveHiModuelTable(tableContent, objKey, ``);
          } else {
            currentModuleId = await this.SaveHiModuelTable(tableContent, objKey, rootModuleId);
          }
          break;
        case 'Hi_ModuleTypeOperate':
          this.SaveHiModuleTypeOperate(tableContent, objKey, currentModuleId);
          break;
        case 'Hi_Role':
          currentRoleId = await this.SaveHiRole(tableContent, objKey);
          break;
        case 'Hi_Group':
          this.SaveHiGroup(tableContent, objKey, currentRoleId);
          break;
      }
      this.currentSaveModuleOperate = `${i}/${moduleLines.length}`;

      return true;
    });
  }

  async SaveHiGroup(tableContent: string, id: string | null, rId: string) {
    const row = {
      GId: id ?? StringHelper.genGuid(),
      RId: rId,
      Name: tableContent.trim(),
      CreateTime: new Date(),
    };
    await tableDataAdd(`Hi_Group`, [row]);
  }

  async SaveHiRole(tableContent: string, id: string | null) {
    const row = {
      RId: id ?? StringHelper.genGuid(),
      Name: tableContent.trim(),
      CreateTime: new Date(),
    };
    await tableDataAdd(`Hi_Role`, [row]);
    return row.RId;
  }

  private async SaveHiModuleTypeOperate(tableContent: string, id: string | null, mId: string) {
    let objKey = StringHelper.genGuid();
    if (id != null) {
      if (mId === '') {
        objKey = `${id}`;
      } else {
        objKey = `${mId}-${id}`;
      }
    }
    const row = {
      MOperateId: objKey,
      MId: mId,
      Name: tableContent.trim(),
      CreateTime: new Date(),
    };
    await tableDataAdd(`Hi_ModuleTypeOperate`, [row]);
    let fieldName = row.MOperateId.replace(/-/gi, '');
    fieldName = fieldName.substring(0, 1).toUpperCase() + fieldName.substring(1);
    console.log(`public static string ${fieldName} ="${row.MOperateId}";//[${row.Name}]`);
  }

  private async SaveHiModuelTable(tableContent: string, id: string | null, pId: string) {
    let mid = StringHelper.genGuid();
    if (id != null) {
      if (pId === '') {
        mid = `${id}`;
      } else {
        mid = `${pId}-${id}`;
      }
    }
    const row = {
      MId: mid,
      Name: tableContent.trim(),
      ParentMid: pId,
      RefTab: `Hi_ModuleTypeOperate`,
      RefTextField: `Name`,
      RefField: `MOperateId`,
      RefWhere: `MId='${mid}'`,
      CreateTime: new Date(),
    };
    if (pId === ``) {
      Object.assign(row, {
        RefTab: ``,
        RefTextField: ``,
        RefField: ``,
        RefWhere: ``,
      });
    }
    await tableDataAdd(`Hi_Module`, [row]);
    return row.MId;
  }

  private async ClearTable(tableName: string) {
    await tableDataDelete(tableName, {}, true);
  }
}

export const selectRefTable: ColumnStruct = ColumnStruct.GetColumnStruct({
  FieldName: 'SourcesTable',
  FieldDesc: '数据表表',
  FieldType: DataBaseType.nvarchar,
  SearchUIModel: SearchUIModelType.MultiCheckBox,
  IsRefTab: true,
  RefTab: `Hi_ModuleTypeOperate`,
  RefField: 'MOperateId',
  RefFields: 'MOperateId,Name',
  RefFieldDesc: 'Id,权限名',
  RefWhere: `MId='eb9ae39e-8922-4585-bd60-245e06d1775c'`,
});
