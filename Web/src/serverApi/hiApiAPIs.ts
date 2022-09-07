import { Dictionary } from '@/helper/arrayHelper';
import ApiResultModel from './apiModels/apiResultModel';
import serverApiClient from './httpClient';
import { HiApiExcuteRequest, HiApiExcuteResponse } from './request/database/hiApiExcuteRequest';

/**
 * 执行HiAPi请求
 * @returns
 */
export const HiApiExcuteApi = async (apiId: string, params: Dictionary<string, any>) => {
  const req = new HiApiExcuteRequest();
  req.ApiId = apiId;
  req.Params = params;
  const url = `hidata/hiApi/${req.ApiId}`;
  const resp = await serverApiClient.Post<ApiResultModel<HiApiExcuteResponse>>(url, req.Params, {
    IsAuth: false,
  });
  return resp.Data?.Tables ?? {};
};
