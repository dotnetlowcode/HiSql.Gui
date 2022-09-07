import { HiApiParamEntity } from '@/serverApi/models/tableModel/hiApiFields';

export interface BlockParam {
  BlockId: string;
  BlockName: string;
  // InParam: Array<HiApiParamEntity>;
  OutParam: Array<HiApiParamEntity>;
}

// export class ParamRefViewModel {
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   blockToDropList(blocks: Array<BlockParam>) {}
// }
