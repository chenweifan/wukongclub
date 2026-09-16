/**
 * 演示账号的**纯常量**（零依赖模块）。
 *
 * 单独拆出来的理由：登录页只需要展示演示账号与口令，
 * 如果从 user.seed 取，就会把 faker（数百 KB）一起拉进登录页的 chunk。
 * 常量与「造数据的工厂」分开，是这里唯一的目的。
 */
export const DEMO_USER_ID = 'user-tianming';
export const DEMO_USERNAME = 'tianming';
export const DEMO_PASSWORD = 'hmw-demo';
export const DEMO_DISPLAY_NAME = '天命人·小圣';
export const DEMO_AVATAR_GLYPH = '悟';
export const DEMO_TITLE = '初入山门';

/** 演示账号凭据：登录页直接展示（本来就是演示站，不存在泄密问题）。 */
export const DEMO_CREDENTIALS = {
  username: DEMO_USERNAME,
  password: DEMO_PASSWORD,
} as const;
