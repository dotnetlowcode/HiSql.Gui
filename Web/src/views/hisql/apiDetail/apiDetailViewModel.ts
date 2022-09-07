import hljs from 'highlight.js';
import { List } from 'linqts';
import { Dictionary, SyncEach } from '@/helper/arrayHelper';
import ValidatorSchema, { Rules } from 'async-validator';
import { ApiSave, ApiTestExcute, getApi } from '@/serverApi/databaseAPIs';
import { HiApiParamEntity, ParamFieldType } from '@/serverApi/models/tableModel/hiApiFields';
import { HiApiEntity } from '@/serverApi/models/tableModel/hiApiModel';
import { HiApiBlockEntity } from '@/serverApi/models/tableModel/hiApiBlockEntity';
import { ApiBlockViewModel } from './apiComponents/apiBlock/apiBlockViewModel';

export type fieldType = `String` | `Number` | `DateTime`;

export class ApiDetailViewModel {
  constructor() {
    // this.AddNewNode();
    const p1 = new HiApiParamEntity();
    p1.ApiBodyId = '0';
    p1.Title = `LoginUId`;
    p1.IsRequired = false;
    p1.Description = `登录人用户Id`;
    p1.Type = ParamFieldType.String;
    this.MainParam.push(p1);
  }

  activeKey = ref(0);

  /**
   * API主体信息
   */
  ApiObj: HiApiEntity = reactive(new HiApiEntity());

  /**
   * 全局参数
   */
  MainParam: Array<HiApiParamEntity> = reactive([]);

  /**
   * 模块集合
   */
  BlockList: Array<ApiBlockViewModel> = reactive([]);

  /**
   * 保存API信息
   */
  async Save() {
    const paramList: Array<HiApiParamEntity> = [...this.MainParam];
    const blocks: Array<HiApiBlockEntity> = [];
    this.BlockList.forEach(r => {
      paramList.push(...r.ApiInParamList, ...r.ApiOutParamList);
      blocks.push(r.BlockObj);
    });
    const objVerify = await this.verifyObj(this.ApiObj);
    if (!objVerify.isPass) {
      throw objVerify.errorMessage;
    }
    const mainParamVerify = await this.verifyApiParamList(this.MainParam);
    if (!mainParamVerify.isPass) {
      throw mainParamVerify.errorMessage;
    }

    let blockIndex = -1;
    // 验证模块数据
    let blockPass = true;
    let errorMessage = ``;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const resultKeyMap: Dictionary<string, boolean> = {};
    await SyncEach(this.BlockList, async blockObj => {
      blockIndex += 1;
      const blockVerify = await this.verifyBlock(
        blockObj.BlockObj,
        blockObj.ApiInParamList,
        blockObj.ApiOutParamList,
        blockIndex,
      );
      if (!blockVerify.isPass) {
        blockPass = false;
        errorMessage = blockVerify.errorMessage;
        return false;
      }
      if (resultKeyMap[blockObj.BlockObj.BlockName ?? ``]) {
        blockPass = false;
        errorMessage = `模块${blockIndex + 1}的结果键名字重复,请设置其他名字!`;
        return false;
      }
      if (blockObj.BlockObj.OutResult) {
        resultKeyMap[blockObj.BlockObj.BlockName ?? ``] = true;
      }
      return true;
    });
    if (!blockPass) {
      self.activeKey.value = blockIndex;
      throw errorMessage;
    }
    const isAdd = !this.ApiObj.ApiId;
    const saveResult = await ApiSave(this.ApiObj, blocks, paramList);
    if (this.ApiObj.ApiId && isAdd) {
      console.log(`A`);
    }
    return true;
  }

  async verify(schema: Rules, obj: any) {
    const apiObjVerify = new ValidatorSchema(schema);
    try {
      const result = await apiObjVerify.validate(obj);

      console.log(result);
      return {
        isPass: true,
        errorMessage: ``,
      };
    } catch (vObj: any) {
      const { errors } = vObj as {
        errors: Array<{
          field: string; // "InFields.0.Description"
          fieldValue: string;
          message: string;
        }>;
      };
      const errorMessage = errors[0].message;
      console.log(errorMessage);
      return {
        isPass: false,
        errorMessage,
      };
    }
  }

  /**
   * 验证结构主体信息
   */
  async verifyObj(obj: HiApiEntity) {
    const apiObjSchema: Rules = {
      Name: {
        type: 'string',
        validator: (r, v: string, callback) => {
          let errorTip: string | undefined;
          if (v.length < 1) {
            errorTip = '请补充ApiUrl!';
          } else if (!/[a-zA-Z]/gi.test(v)) {
            errorTip = 'ApiUrl只能包含纯字母!';
          }
          callback(errorTip);
        },
      },
      GroupName: {
        type: 'string',
        validator: (r, v: string, callback) => {
          let errorTip: string | undefined;
          if (v.length < 1) {
            errorTip = '请填写API组名!';
          }
          callback(errorTip);
        },
      },
    };
    return this.verify(apiObjSchema, obj);
  }

  /**
   * 验证逻辑块
   * @param obj
   * @param inParam
   * @param blockIndex
   * @returns
   */
  async verifyBlock(
    obj: HiApiBlockEntity,
    inParam: Array<HiApiParamEntity>,
    outParam: Array<HiApiParamEntity>,
    blockIndex: number,
  ) {
    const blockParamVerify = await this.verifyApiParamList(inParam, blockIndex);
    if (!blockParamVerify.isPass) {
      return blockParamVerify;
    }
    const inParamTitleList = new List(inParam).Select(r => r.Title);
    const blockResult = await this.verify(
      {
        Sql: {
          type: 'string',
          required: true,
          validator: (r: any, sql: string, callback: (err?: string) => void) => {
            if (sql.length < 1) {
              callback(`模块${blockIndex + 1}执行SQL不能为空!`);
              return;
            }
            const paramNameReg = /\[\$([0-9a-zA-Z]{1,}?)\$\]/gi;
            // eslint-disable-next-line no-constant-condition
            while (true) {
              const match = paramNameReg.exec(sql);
              if (!match) {
                break;
              }
              const pName = match[1];
              if (!inParamTitleList.Contains(pName)) {
                callback(`模块${blockIndex + 1}的参数中缺少的SQL参${pName}`);
                return;
              }
            }
            callback();
          },
        },
        IsPageList: {
          type: 'boolean',
          required: true,
          validator: (r: any, v: boolean, callback: (err?: string) => void) => {
            if (v) {
              //
              const paramList = new List(inParam).Select(r => r.Title);
              for (let index = 0; index < ApiBlockViewModel.pageFields.length; index++) {
                const fieldObj = ApiBlockViewModel.pageFields[index];
                if (!paramList.Contains(fieldObj.Title)) {
                  callback(`模块${blockIndex + 1}因为开启了分页,不能缺少参数${fieldObj.Title}`);
                  return;
                }
              }
            }
            callback();
          },
        },
      },
      obj,
    );
    if (blockResult.isPass && outParam.length < 1) {
      return {
        isPass: false,
        errorMessage: `模块${blockIndex + 1}结果还为空,请执行一次有结果的测试!`,
      };
    }
    if (obj.OutResult && !obj.BlockName) {
      return {
        isPass: false,
        errorMessage: `模块${blockIndex + 1}选择了输出结果,请设置结果键值!`,
      };
    }
    return blockResult;
  }

  /**
   * 验证参数
   * @param blockIndex 模块索引,全局参数忽略,模块从0开始
   * @param params
   * @returns
   */
  async verifyApiParamList(params: Array<HiApiParamEntity>, blockIndex?: number) {
    return this.verify(
      {
        MainParam: [
          {
            type: 'array',
            required: true,
            validator: (r: any, v: Array<HiApiParamEntity>, callback: (err?: string) => void) => {
              const paramNameMaps: Dictionary<string, boolean> = {};
              let errorTip: string | undefined;
              for (let index = 0; index < v.length; index++) {
                const paramObj = v[index];
                if (!paramObj.Title) {
                  errorTip = `第${index + 1}个参数请填写名字!`;
                  break;
                }
                if (paramNameMaps[paramObj.Title]) {
                  errorTip = `${paramObj.Title}参数名字存在重复!`;
                  break;
                }
                paramNameMaps[paramObj.Title] = true;
                if (blockIndex !== undefined && paramObj.IsRequired && !paramObj.ValueFrom) {
                  errorTip = `${paramObj.Title}请设置值来源!`;
                  break;
                }
                if (!/.{1,}/.test(paramObj.Description ?? '')) {
                  errorTip = `${paramObj.Title}请添加描述!`;
                  break;
                }
              }
              if (errorTip) {
                if (blockIndex !== undefined) {
                  errorTip = `模块${blockIndex + 1}的${errorTip}`;
                } else {
                  errorTip = `全局参数的${errorTip}`;
                }
              }
              callback(errorTip);
            },
          },
        ],
      },
      { MainParam: params },
    );
  }

  AddNewNode() {
    const model = new ApiBlockViewModel();
    const b = new HiApiBlockEntity();
    model.BlockObj = b;
    const p1 = new HiApiParamEntity();
    p1.Title = `fieldName`;
    p1.IsRequired = true;
    p1.Description = `字段描述`;
    p1.Type = ParamFieldType.String;
    p1.ApiBodyId = b.ApiBodyId;
    model.ApiInParamList.push(p1);
    this.BlockList.push(model);
  }

  DeleteBlock() {
    this.BlockList.splice(this.activeKey.value, 1);
  }

  loadIng = ref(true);

  /**
   * 加载API信息
   */
  async loadApiInfo() {
    if (!this.ApiObj.ApiId) {
      this.AddNewNode();
      this.loadIng.value = false;
      return;
    }
    try {
      const { apiObj, apiBlocks, apiParams } = await getApi(this.ApiObj.ApiId);
      Object.assign(this.ApiObj, apiObj);
      const paramList = new List(apiParams);
      const apiInParamGroups = paramList
        .Where(r => r?.FieldType === 'In')
        .Select(r => Object.assign(new HiApiParamEntity(), r))
        .GroupBy(r => r.ApiBodyId);
      const apiOutParamGroups = paramList
        .Where(r => r?.FieldType === 'Out')
        .Select(r => Object.assign(new HiApiParamEntity(), r))
        .GroupBy(r => r.ApiBodyId);
      const mainParam = paramList.Where(r => r?.IsMainParam ?? false).ToArray();
      this.MainParam.length = 0;
      this.MainParam.push(...mainParam);
      this.BlockList.length = 0;
      apiBlocks.forEach(blockObj => {
        const v = this.analysisBlock(blockObj, apiInParamGroups, apiOutParamGroups);
        this.BlockList.push(v);
      });
    } catch (error) {
      console.error(error);
    }
    this.loadIng.value = false;
  }

  analysisBlock(
    blockEntity: HiApiBlockEntity,
    apiInParamGroups: { [key: string]: HiApiParamEntity[] },
    apiOutParamGroups: { [key: string]: HiApiParamEntity[] },
  ) {
    const model = new ApiBlockViewModel();
    model.BlockObj = reactive(blockEntity);
    model.ApiInParamList = reactive(apiInParamGroups[blockEntity.ApiBodyId] ?? []);
    model.ApiOutParamList = reactive(apiOutParamGroups[blockEntity.ApiBodyId] ?? []);
    return model;
  }
}
