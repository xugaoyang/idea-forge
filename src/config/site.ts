/** 工信部 ICP 备案号 */
export const ICP_NUMBER = '粤ICP备2026066828号'

/** 工信部备案查询链接 */
export const ICP_LINK = 'https://beian.miit.gov.cn/'

/** 公安审核期间临时开放访问，审核通过后改回 false 并重新部署 */
export const REVIEW_MODE = import.meta.env.VITE_REVIEW_MODE === 'true'
