import { Login } from "@/api/interface/index";
import { PORT1 } from "@/api/config/servicePort";
import authMenuList from "@/assets/json/authMenuList.json";
import authButtonList from "@/assets/json/authButtonList.json";
import http from "@/api";
//import request from "@/api/index";
import axios from "axios";

/**
 * @name 登录模块
 */
// 用户登录
export const loginApi = (params: Login.ReqLoginForm) => {
  return axios
    .post<Login.ResLogin>(`api/system/login`, params)
    .then(response => {
      return response.data;
    })
    .catch(error => {
      throw error;
    }); // 正常 post json 请求  ==>  application/json
};

// 获取菜单列表
export const getAuthMenuListApi = () => {
  //return http.get<Menu.MenuOptions[]>(PORT1 + `/menu/list`, {}, { loading: false });
  // 如果想让菜单变为本地数据，注释上一行代码，并引入本地 authMenuList.json 数据
  return authMenuList;
};

// 获取按钮权限
export const getAuthButtonListApi = () => {
  //return http.get<Login.ResAuthButtons>(PORT1 + `/auth/buttons`, {}, { loading: false });
  // 如果想让按钮权限变为本地数据，注释上一行代码，并引入本地 authButtonList.json 数据
  return authButtonList;
};

// 用户退出登录
export const logoutApi = () => {
  return http.post(PORT1 + `/logout`);
};

//获取验证码
export const getCaptchaId = async (): Promise<string | undefined> => {
  // 返回图片URL
  try {
    const response = await axios.post(
      `api/getCaptcha`,
      {},
      {
        responseType: "blob" // 关键配置项
      }
    );

    // 创建对象URL
    return URL.createObjectURL(response.data as Blob);
  } catch (error) {
    console.error("获取验证码失败:", error);
    return undefined;
  }
};
