import axios, {type AxiosRequestConfig} from "axios"

const baseURL = window.config.apiAddress

const instance = axios.create({
  baseURL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json"
  }
})

instance.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    console.error("请求错误：", error)

    if (error.code === "ECONNABORTED") {
      return Promise.reject(new Error("请求超时，请稍后重试"))
    }

    if (error.response) {
      return Promise.reject(new Error(`请求失败：${error.response.status}`))
    }

    return Promise.reject(new Error("网络异常，请检查后端服务是否正常"))
  }
)
const http = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return instance.get(url, config) as Promise<T>
  },

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return instance.post(url, data, config) as Promise<T>
  },

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return instance.put(url, data, config) as Promise<T>
  },

  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return instance.delete(url, config) as Promise<T>
  },
  //处理流式数据接口
  async streamPost(
    url: string,
    data?: any,
    options?: {
      signal?: AbortSignal
    }
  ): Promise<Response> {
    const res = await fetch(`${baseURL}${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      signal: options?.signal,
      body: JSON.stringify(data)
    })

    if (!res.ok) {
      throw new Error(`请求失败：${res.status}`)
    }

    return res
  }
}
export default http
