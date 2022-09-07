import iconJsUrl from '../assets/iconfont/iconfont.js?url';

const isDevModel = import.meta.env.VITE_IsDevModel;
const envApiHost = import.meta.env.VITE_ApiHost;
class WebConfig {
  ApiConfig = {
    ApiHost: `..`,
    AppId: ``,
  };

  HIcon = iconJsUrl; // `//at.alicdn.com/t/font_3229941_3qbqis3st1i.js`;

  constructor() {
    if (isDevModel === 'true') {
      // 如果是开发模式;
      this.ApiConfig.ApiHost = envApiHost;
    }
  }

  /**
   *  tabs页签的最大长度
   */

  MaxTabsLength = 10;
}
export default new WebConfig();
