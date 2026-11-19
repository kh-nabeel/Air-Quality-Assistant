/**
 * @module domain
 *
 * Public barrel export for all domain logic: AQI classification, household
 * risk computation, outdoor window detection, daily routine building, action
 * ranking, exposure estimation, the action catalog, and shared domain types.
 */
export { classifyAqi, getAqiCssClass } from './classifyAqi';
export { computeHouseholdRisk } from './computeHouseholdRisk';
export { findBestOutdoorWindow } from './findBestOutdoorWindow';
export { buildDailyRoutine } from './buildDailyRoutine';
export { rankActions } from './rankActions';
export { estimateExposure } from './estimateExposure';
export { ACTION_CATALOG } from './actionCatalog';
export type * from './types';
