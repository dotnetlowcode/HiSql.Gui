import { createFromIconfontCN } from '@ant-design/icons-vue';
import config from '@/serverApi/config';

export const MyIcon = createFromIconfontCN({
  scriptUrl: config.HIcon, // 在 iconfont.cn 上生成
});
