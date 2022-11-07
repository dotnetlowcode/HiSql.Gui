import ApiResultModel from '@/serverApi/apiModels/apiResultModel';
import serverApiClient from '@/serverApi/httpClient';
import { AddUserRequest, AddUserResponse } from './addUserInfoRequest';
import { ChangePasswordRequest, ChangePasswordResponse } from './changePasswordRequest';
import { UserLoginRequest, UserLoginResponse } from './userLoginRequest';

/**
 * 用户登录
 * @param userName
 * @param password
 * @returns
 */
export const userLogin = async (userName: string, password: string) => {
  const req = new UserLoginRequest();
  req.UserName = userName;
  req.Password = password;
  const url = `hidata/oauth/login`;
  const loginResult = await serverApiClient.Post<ApiResultModel<UserLoginResponse>>(url, req, {
    IsAuth: false,
  });
  return loginResult;
};

/**
 * 修改密码
 */
export const changePassword = async (newPassword: string) => {
  const req = new ChangePasswordRequest();
  req.NewPassword = newPassword;
  const url = `hidata/oauth/changePassword`;
  const resp = await serverApiClient.Post<ApiResultModel<ChangePasswordResponse>>(url, req, {
    IsAuth: true,
  });
  if (resp.StatusCode === 0) {
    return true;
  }
  throw resp.ErrorMessage;
};

/**
 * 新建用户
 * @param userInfo
 * @returns
 */
export const addUserInfo = async (userInfo: AddUserRequest) => {
  const url = `hidata/oauth/addUser`;
  const resp = await serverApiClient.Post<ApiResultModel<AddUserResponse>>(url, userInfo, {
    IsAuth: true,
  });
  if (resp.StatusCode === 0) {
    return true;
  }
  throw resp.ErrorMessage;
};
