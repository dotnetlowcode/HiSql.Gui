import { createFromIconfontCN } from '@ant-design/icons-vue';
import config from '@/serverApi/config';

export const MyIcon = createFromIconfontCN({
  scriptUrl: config.HIcon, // ε¨ iconfont.cn δΈηζ
});
