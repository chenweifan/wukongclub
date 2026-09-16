/**
 * Repository 出口（协议架构铁律 1：业务代码只 import 这里，永不直接 fetch）。
 * 阶段 2 起每个业务域在这里追加导出的 repo 实例。
 */
export { demoProbeRepo } from '@/data/repositories/demoProbeRepo';
export type { DemoProbeRepository } from '@/data/repositories/demoProbeRepo';
export { authRepo } from '@/data/repositories/authRepo';
export type { AuthRepository } from '@/data/repositories/authRepo';
export { growthRepo } from '@/data/repositories/growthRepo';
export type { GrowthRepository } from '@/data/repositories/growthRepo';
export { encyclopediaRepo } from '@/data/repositories/encyclopediaRepo';
export type { EncyclopediaRepository } from '@/data/repositories/encyclopediaRepo';
export { newsRepo } from '@/data/repositories/newsRepo';
export type { NewsRepository } from '@/data/repositories/newsRepo';
export { guideRepo } from '@/data/repositories/guideRepo';
export type { GuideRepository } from '@/data/repositories/guideRepo';
