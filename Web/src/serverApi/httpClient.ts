import axios from 'axios';
import webConfig from './config';

class ServerHttpClient {
  Token = ``;

  private tokenKey = `HiSqlToken`;

  constructor() {
    this.Token = localStorage.getItem(this.tokenKey) ?? '';
  }

  clearLoginInfo() {
    this.Token = ``;
    sessionStorage.clear();
    localStorage.clear();
  }

  async getItalkToken(): Promise<string> {
    console.log(this);
    return ``;
  }

  SetTokenResult(token: string) {
    this.Token = token;
    localStorage.setItem(this.tokenKey, token);
  }

  async Post<T = any>(
    url: string,
    postData: any,
    option: {
      IsAuth: boolean;
    },
  ): Promise<T> {
    const postUrl = url.indexOf(`http`) === 0 ? url : `${webConfig.ApiConfig.ApiHost}/${url}`;
    try {
      const result = await axios.post<T>(postUrl, postData, {
        headers: { Authorization: this.Token },
      });
      return result.data;
    } catch (error: any) {
      if (error?.response?.status !== 403 && error?.message) {
        throw error.message;
      }
      if (error.response.status === 403) {
        this.Token = ``;
        // eslint-disable-next-line no-restricted-globals
        location.href = `${location.href.split('#')[0]}#/`;
        // location.href = '/#/';
      }
      return {} as any;
    }
  }
}
const serverApiClient = new ServerHttpClient();
export default serverApiClient;
