import Mock from 'mockjs';
import { List } from 'linqts';
import { DataBaseType } from '../../columsTypes/fromEdit/fromEditViewModel';
import { ColumnStruct } from '../../../serverApi/models/columnStruct';

/**
 * 去除代码开头和结尾的无用换行
 * @param codeStr
 * @returns
 */
export const trimCodeBeginAndEnd = (codeStr: string) => {
  return codeStr.replace(/(^\n)|(\n(\s){0,}$)/, ``);
};

export const codeWapre = (codeStr: string, lan: string) => {
  return `\`\`\`${lan}\r\n${trimCodeBeginAndEnd(codeStr)}\r\n\`\`\``;
};
// 生成类型模拟值
export const getDateTypeRandomValue = (
  filed: ColumnStruct,
  option?: { defaultValue?: boolean },
) => {
  let fieldValue = ``;
  const setDefaultValue = option?.defaultValue ?? false;
  switch (filed.FieldType) {
    case DataBaseType.date:
      fieldValue = setDefaultValue ? `new Date()` : `"${Mock.mock(`@Date`)}"`;
      break;
    case DataBaseType.dateTime:
      fieldValue = setDefaultValue ? `new Date()` : `"${Mock.mock(`@Date`)}T${Mock.mock(`@Time`)}"`;
      break;
    case DataBaseType.bool:
      fieldValue = setDefaultValue ? `false` : Mock.mock(`@Bool`);
      break;
    case DataBaseType.nvarchar:
    case DataBaseType.text:
      fieldValue = setDefaultValue ? `""` : `"${Mock.Random.csentence(5, 7)}"`;
      break;
    case DataBaseType.int:
    case DataBaseType.bigInt:
    case DataBaseType.char:
      fieldValue = setDefaultValue ? `0` : `${Mock.Random.integer(2, 4)}`;
      break;
    default:
      fieldValue = setDefaultValue ? `""` : `"${Mock.Random.integer(1, 2)}"`;
      break;
  }
  return fieldValue;
};

// 生成TS字段类型
export const getFieldTypesciptType = (filed: ColumnStruct) => {
  let fieldTypeStr = ``;
  switch (filed.FieldType) {
    case DataBaseType.date:
    case DataBaseType.dateTime:
      fieldTypeStr = `Date | String`;
      break;
    case DataBaseType.bool:
      fieldTypeStr = `Boolean`;
      break;
    case DataBaseType.nvarchar:
    case DataBaseType.text:
    case DataBaseType.char:
      fieldTypeStr = `String`;
      break;
    case DataBaseType.int:
    case DataBaseType.bigInt:
      fieldTypeStr = `Number`;
      break;
    default:
      fieldTypeStr = `String`;
      break;
  }
  return fieldTypeStr;
};

// 生成C#字段类型
export const getFieldCSharpType = (filed: ColumnStruct) => {
  let fieldTypeStr = ``;
  switch (filed.FieldType) {
    case DataBaseType.date:
    case DataBaseType.dateTime:
      fieldTypeStr = `DateTime`;
      break;
    case DataBaseType.bool:
      fieldTypeStr = `bool`;
      break;
    case DataBaseType.nvarchar:
    case DataBaseType.text:
    case DataBaseType.char:
      fieldTypeStr = `string`;
      break;
    case DataBaseType.int:
      fieldTypeStr = `int`;
      break;
    case DataBaseType.bigInt:
      fieldTypeStr = `long`;
      break;
    default:
      fieldTypeStr = `string`;
      break;
  }
  return fieldTypeStr;
};

export const getTableJson = (
  fileds: ColumnStruct[],
  options: {
    /**
     * 是否只显示筛选字段
     */
    isFilter?: boolean;
    /**
     * 是否包含字段描述
     */
    hasFieldDesc?: boolean;
    /**
     * 缩进字符个数
     */
    spaceLen?: number;
  } = {
    isFilter: false,
  },
) => {
  let jsonStr = '';
  const len = fileds.length;
  let befSpaceStr = ``;
  for (let index = 0; index < (options.spaceLen ?? 0); index++) {
    befSpaceStr += ` `;
  }
  for (let index = 0; index < len; index++) {
    const field = fileds[index];
    if ((options.isFilter ?? false) && !field.IsSearch) {
      continue;
    }
    // 是否必填
    const required = field.IsRequire ? '[必填参数]' : '';
    const fieldValue = getDateTypeRandomValue(field);
    if (options.hasFieldDesc ?? true) {
      jsonStr += `${befSpaceStr}  //${field.FieldDesc}${required}\r\n  ${befSpaceStr}"${field.FieldName}": ${fieldValue},`;
    } else {
      jsonStr += `${befSpaceStr}  "${field.FieldName}": ${fieldValue},`;
    }
    if (index < len - 1) {
      jsonStr += '\r\n';
    }
  }
  return `{\r\n${trimCodeBeginAndEnd(jsonStr)}\r\n${befSpaceStr}}`;
};

/**
 * 生成TS实体类
 * @param tableName
 * @param fileds
 * @returns
 */
export const getTableTsClass = (
  tableName: string,
  fileds: ColumnStruct[],
  options?: {
    /**
     * 缩进字符个数
     */
    spaceLen?: number;
  },
) => {
  let jsonStr = '';
  const len = fileds.length;
  let befSpaceStr = `        `;
  for (let index = 0; index < (options?.spaceLen ?? 0); index++) {
    befSpaceStr += ` `;
  }
  for (let index = 0; index < len; index++) {
    const field = fileds[index];
    // 是否必填
    const required = field.IsRequire ? '[必填参数]' : '';
    const fieldValue = getDateTypeRandomValue(field, { defaultValue: true });
    const typeStr = getFieldTypesciptType(field);
    jsonStr += `${befSpaceStr}/**\r\n${befSpaceStr} * ${field.FieldDesc}${required}\r\n ${befSpaceStr}*/\r\n${befSpaceStr}${field.FieldName}: ${typeStr} = ${fieldValue};`;
    if (index < len - 1) {
      jsonStr += '\r\n\r\n';
    }
  }
  return `export class ${tableName}Entity {\r\n${trimCodeBeginAndEnd(jsonStr)}\r\n}`;
};

/**
 * 生成TS实体类
 * @param tableName
 * @param fileds
 * @returns
 */
export const getTableCSharpClass = (
  tableName: string,
  fileds: ColumnStruct[],
  options?: {
    /**
     * 缩进字符个数
     */
    spaceLen?: number;
  },
) => {
  let jsonStr = '';
  const len = fileds.length;
  let befSpaceStr = `        `;
  for (let index = 0; index < (options?.spaceLen ?? 0); index++) {
    befSpaceStr += ` `;
  }
  for (let index = 0; index < len; index++) {
    const field = fileds[index];
    // 是否必填
    const required = field.IsRequire ? '[必填参数]' : '';
    const typeStr = getFieldCSharpType(field);
    jsonStr += `${befSpaceStr}/// <summary>\r\n${befSpaceStr}/// ${field.FieldDesc}${required}\r\n${befSpaceStr}/// <summary>\r\n${befSpaceStr}public ${typeStr} ${field.FieldName} { get; set; }`;
    if (index < len - 1) {
      jsonStr += '\r\n\r\n';
    }
  }
  return `public class ${tableName}Entity {\r\n${trimCodeBeginAndEnd(jsonStr)}\r\n}`;
};

/**
 * 获取可排序字段
 * @param fileds
 * @returns
 */
export const getTableOrderFields = (fileds: ColumnStruct[]) => {
  return new List(fileds)
    .Where(r => r?.IsSearch ?? false)
    .Select(r => r.FieldName)
    .ToArray();
};

// 响应结果
export const responseJsonWapre = (dataJson: string) => {
  return `{
    "StatusCode":200,
    "ErrorMessage":null,
    "Data":${dataJson}
}`;
};
