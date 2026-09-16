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
