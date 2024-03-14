import fireAjax from './base'

export const initData = () => fireAjax('POST', '/init', {})
