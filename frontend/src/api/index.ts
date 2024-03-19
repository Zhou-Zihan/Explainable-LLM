import fireAjax from './base'

// export const initData = () => fireAjax('POST', '/init', {})
export const fetchUsmleData = () => fireAjax('GET', '/usmle', {})
export const fetchQustionData = (dataset) => fireAjax('GET', '/select_usmle_topic', { dataset })
export const fetchChat = (dataset) => fireAjax('POST', '/chat', { dataset })
