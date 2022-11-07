/* eslint-disable no-plusplus */
const SyncEachWarpe = async <T>(
  tempList: Array<T>,
  dataFun: (data: T) => Promise<boolean>,
): Promise<boolean> => {
  const obj = tempList.shift();
  let continueFun = true;
  if (obj) {
    continueFun = await dataFun(obj);
  }
  if (continueFun && tempList.length > 0) {
    return SyncEachWarpe(tempList, dataFun);
  }
  return continueFun;
};

/**
 * 异步遍历集合
 * @param list 遍历的对象
 * @param dataFun 数据处理函数,返回true 继续循环,返回false 停止循环
 */
export const SyncEach = async <T>(list: Array<T>, dataFun: (data: T) => Promise<boolean>) => {
  if (!list || list.length < 1) {
    return;
  }
  const tempList = [...list];
  return SyncEachWarpe(tempList, dataFun);
};

/**
 * 异步遍历对象
 * @param obj 遍历的对象
 * @param dataFun 数据处理函数,返回true 继续循环,返回false 停止循环
 * @param keyNames 要遍历的Keys [可选]
 */
export const SyncEachObj = async <T>(
  obj: { [key: string]: T },
  dataFun: (data: T, key: string) => Promise<boolean>,
  keyNames?: Array<string>,
): Promise<void> => {
  let propNames: string[] = [];
  if (keyNames === undefined) {
    propNames = Object.getOwnPropertyNames(obj);
  } else {
    propNames = keyNames;
  }
  let continueFun = true;
  const key = propNames.shift();
  if (key) {
    const list: any = obj[key];
    continueFun = await dataFun(list, key);
  }
  if (continueFun && propNames.length > 0) {
    return SyncEachObj(obj, dataFun, propNames);
  }
};

/**
 *  * 异步While循环
 * @param mainFun 代码主体 返回`true`继续,`false`跳出
 * @param errorFun 异常处理Function,返回`true`继续,`false`跳出,未定义且有异常时直接跳出
 * @returns
 */
export const SyncWhile = async (
  mainFun: () => Promise<boolean>,
  errorFun: (err: any) => Promise<boolean> | undefined,
) => {
  return new Promise<void>((resolve, reject) => {
    const runFun = async () => {
      try {
        const isContinue = await mainFun();
        if (isContinue) {
          // 避免深度递归导致堆栈溢出
          setTimeout(() => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            runFun();
          }, 0);
        } else {
          resolve();
        }
      } catch (error) {
        if (errorFun && (await errorFun(error))) {
          return;
        }
        reject(error);
      }
    };
  });
};

/**
 * 延时函数
 * @param taskFun
 * @param minLoadTime
 */
export const TimeCount = async <T>(taskFun: () => Promise<T>, minLoadTime = 0) => {
  const startT = new Date().getTime();
  const resultObj = await taskFun();
  const endT = new Date().getTime();
  const diffT = endT - startT;
  if (diffT < minLoadTime) {
    // eslint-disable-next-line no-promise-executor-return
    await new Promise(resolve => setTimeout(resolve, minLoadTime - diffT));
  }
  return resultObj;
};

/**
 * 多线程遍历方法
 * @param list 要遍历的数组
 * @param threadCount 并行执行数
 * @param handlerFun 任务执行函数
 */
export const AnyLimit = async <T>(
  list: Array<T>,
  threadCount: number,
  handlerFun: (obj: T) => Promise<boolean>,
) => {
  return new Promise<void>((resolve, reject) => {
    let index = 0;
    let overCount = 0; // 完成个数
    let isOver = false; // 循环是否已结束
    const len = list.length;
    const wapeFun = async () => {
      if (index >= list.length || isOver) {
        return;
      }
      const obj = list[index];
      index++;
      try {
        const isContinue = await handlerFun(obj);
        if (isOver) {
          return;
        }
        if (!isContinue) {
          isOver = true;
          // eslint-disable-next-line prefer-promise-reject-errors
          reject(`已主动退出!`);
          return;
        }
      } catch (error) {
        console.log(error);
      }
      overCount++;
      if (overCount === len) {
        resolve();
        return;
      }
      await wapeFun();
    };
    const maxThread = len < threadCount ? len : threadCount;
    for (let index = 0; index < maxThread; index++) {
      wapeFun();
    }
  });
};

/**
 * 移除集合中的一个项
 * @param arrayList
 * @param item
 * @returns
 */
export const ArrayRemoveItem = <T>(arrayList: Array<T>, item: T) => {
  const index = arrayList.indexOf(item);
  if (index === -1) {
    return false;
  }
  arrayList.splice(index, 1);
  return true;
};

/**
 * 泛型类型
 */
export type Dictionary<TKey extends string | number | symbol, TValue> = {
  [key in TKey]: TValue;
};
