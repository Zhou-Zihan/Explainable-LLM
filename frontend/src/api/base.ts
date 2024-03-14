import axios from 'axios'
import qs from 'qs'

const prefix = '/api'

export default function fireAjax(method: string, URL: string, data: any) {
  if (method === 'POST') {
    return axios
      .post(prefix + URL, data)
      .then(({ data }) => ({ data: data }))
      .catch((error) => {
        throw error
      })
  } else if (method === 'GET') {
    return axios
      .get(prefix + URL, {
        params: {
          ...data
        },
        paramsSerializer: (params) => {
          return qs.stringify(params, { indices: false })
        }
      })
      .then(({ data }) => ({ data: data }))
      .catch((error) => {
        throw error
      })
  }
}
