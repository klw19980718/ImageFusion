// API 基础配置
const API_CONFIG = {
  VIDOR_AI_BASE: 'https://svc.imagefusionai.com',
  APP_ID: 'ai_image_fusion',
};

// 通用请求头
const getHeaders = (includeAuth = true) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-appid': API_CONFIG.APP_ID,
  };

  if (includeAuth) {
    const token = localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// 通用错误处理
const handleApiError = async (response: Response) => {
  // 首先检查 HTTP 状态码
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`HTTP Error ${response.status}: ${errorData || response.statusText}`);
  }
  
  // 解析 JSON 响应
  const result = await response.json();
  
  // 检查业务错误码
  if (result.code && result.code !== 200) {
    throw new Error(`API Business Error ${result.code}: ${result.message || result.msg || 'Unknown error'}`);
  }
  
  return result;
};

// 用户认证相关接口
export const authApi = {
  // 用户登录同步接口 - 对应原来的 userRegisterOrUpdate
  syncUser: async (userData: {
    uuid: string;
    email: string;
    nickname?: string;
    avatar?: string;
    from_login: string;
    token: string; // 新增 token 参数
  }) => {
    const response = await fetch(`${API_CONFIG.VIDOR_AI_BASE}/api/user/loginAuth`, {
      method: 'POST',
      headers: getHeaders(false), // 登录接口不需要Authorization
      body: JSON.stringify(userData),
    });

    const result = await handleApiError(response);
    
    // 保存token到localStorage
    if (result.code === 200 && result.data) {
      localStorage.setItem('access_token', result.data.access_token);
      localStorage.setItem('refresh_token', result.data.refresh_token);
      localStorage.setItem('token_expire_at', result.data.expire_at.toString());
    }
    
    return result;
  },

  // 检查token是否有效
  isTokenValid: (): boolean => {
    const token = localStorage.getItem('access_token');
    const expireAt = localStorage.getItem('token_expire_at');
    
    if (!token || !expireAt) return false;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return parseInt(expireAt) > currentTime;
  },

  // 清除token
  clearTokens: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expire_at');
  },
};

// 用户信息相关接口
export const userApi = {
  // 获取用户信息 - 对应原来的 userInfo
  getUserInfo: async () => {
    const response = await fetch(`${API_CONFIG.VIDOR_AI_BASE}/api/user/info`, {
      headers: getHeaders(),
    });

    return handleApiError(response);
  },

  // 获取用户作品列表 - 对应原来的 opusList
  getUserOpusList: async (page: number = 1, pageSize: number = 30, status: number = 0) => {
    const response = await fetch(
      `${API_CONFIG.VIDOR_AI_BASE}/api/user/opus_list?page=${page}&page_size=${pageSize}&status=${status}`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

    return handleApiError(response);
  },

  // 获取用户积分记录
  getTimesLog: async (page: number = 1, pageSize: number = 10) => {
    const response = await fetch(
      `${API_CONFIG.VIDOR_AI_BASE}/api/user/times_log?page=${page}&page_size=${pageSize}`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

    return handleApiError(response);
  },
};

// 支付相关接口
export const paymentApi = {
  // Stripe支付 - 对应原来的 stripeSubscriptionCreate
  createStripeSubscription: async (priceId: string) => {
    const response = await fetch(`${API_CONFIG.VIDOR_AI_BASE}/api/pay/stripe`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        price_id: priceId,
      }),
    });

    return handleApiError(response);
  },

  // 获取价格列表
  getPriceList: async () => {
    const response = await fetch(`${API_CONFIG.VIDOR_AI_BASE}/api/website/pricelist`, {
      method: 'GET',
      headers: getHeaders(false), // 不需要认证
    });

    return handleApiError(response);
  },

  // 获取订阅记录
  getSubscriptions: async () => {
    const response = await fetch(`${API_CONFIG.VIDOR_AI_BASE}/api/pay/subscriptions`, {
      method: 'GET',
      headers: getHeaders(),
    });

    return handleApiError(response);
  },

  // 取消订阅
  cancelSubscription: async (id: number) => {
    const response = await fetch(`${API_CONFIG.VIDOR_AI_BASE}/api/pay/subscription/cancel`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        id: id,
      }),
    });

    return handleApiError(response);
  },
};

// 图片生成相关接口
export const imageApi = {
  // 上传图片接口
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    // 为FormData请求创建特殊的头部（不包含Content-Type，让浏览器自动设置）
    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = {
      'x-appid': API_CONFIG.APP_ID,
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_CONFIG.VIDOR_AI_BASE}/api/common/upload`, {
      method: 'POST',
      headers: headers,
      body: formData,
    });

    return handleApiError(response);
  },

  // 创建AI生成图片任务
  createTask: async (params: {
    file: File;
    prompt: string;
    size: string;
    other_image: string;
  }) => {
    const formData = new FormData();
    formData.append('file', params.file);
    formData.append('prompt', params.prompt);
    formData.append('size', params.size);
    formData.append('other_image', params.other_image);

    // 为FormData请求创建特殊的头部（不包含Content-Type，让浏览器自动设置）
    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = {
      'x-appid': API_CONFIG.APP_ID,
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_CONFIG.VIDOR_AI_BASE}/api/task/create`, {
      method: 'POST',
      headers: headers,
      body: formData,
    });

    return handleApiError(response);
  },

  // 检查任务状态
  checkTaskStatus: async (taskId: string) => {
    const response = await fetch(`${API_CONFIG.VIDOR_AI_BASE}/api/task/check?task_id=${taskId}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    return handleApiError(response);
  },

  // 生成图片 (保留旧接口以备兼容)
  generateImage: async (params: {
    prompt?: string;
    style?: string;
    sourceImage?: File;
    [key: string]: any;
  }) => {
    const formData = new FormData();
    
    // 添加各种参数
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        if (params[key] instanceof File) {
          formData.append(key, params[key]);
        } else {
          formData.append(key, params[key].toString());
        }
      }
    });

    // 为FormData请求创建特殊的头部（不包含Content-Type，让浏览器自动设置）
    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = {
      'x-appid': API_CONFIG.APP_ID,
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_CONFIG.VIDOR_AI_BASE}/api/generateImage/generate`, {
      method: 'POST',
      headers: headers,
      body: formData,
    });

    return handleApiError(response);
  },

  // 检查生成状态 (保留旧接口以备兼容)
  checkGenerationStatus: async (taskId: string) => {
    const response = await fetch(`${API_CONFIG.VIDOR_AI_BASE}/api/generateImage/check?task_id=${taskId}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    return handleApiError(response);
  },
};

// 带重试机制的API调用（用于依赖token的接口）
export const apiWithRetry = async <T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        // 如果没有token，等待一段时间后重试
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      return await apiCall();
    } catch (error) {
      console.error(`API call failed (attempt ${i + 1}/${maxRetries}):`, error);
      
      if (i === maxRetries - 1) {
        throw error;
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('API call failed after maximum retries');
};

// 导出所有API
export const api = {
  auth: authApi,
  user: userApi,
  payment: paymentApi,
  image: imageApi,
  withRetry: apiWithRetry,
};

// 为了向后兼容，也导出旧的格式
export const apiConfig = {
  baseApiUrl: API_CONFIG.VIDOR_AI_BASE,
  userInfo: `${API_CONFIG.VIDOR_AI_BASE}/api/user/info`,
  userRegisterOrUpdate: `${API_CONFIG.VIDOR_AI_BASE}/api/user/loginAuth`, // 更新为新的接口地址
  stripeSubscriptionCreate: `${API_CONFIG.VIDOR_AI_BASE}/api/pay/stripe`,
  opusList: `${API_CONFIG.VIDOR_AI_BASE}/api/user/opus_list`,
  priceList: `${API_CONFIG.VIDOR_AI_BASE}/api/website/pricelist`,
  // 新接口
  uploadImage: `${API_CONFIG.VIDOR_AI_BASE}/api/common/upload`,
  createTask: `${API_CONFIG.VIDOR_AI_BASE}/api/task/create`,
  checkTaskStatus: `${API_CONFIG.VIDOR_AI_BASE}/api/task/check`,
  // 旧接口（保留兼容性）
  generateImage: `${API_CONFIG.VIDOR_AI_BASE}/api/generateImage/generate`,
  checkStatus: `${API_CONFIG.VIDOR_AI_BASE}/api/generateImage/check`,
};
