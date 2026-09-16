import { sectors } from '../data/sectors';
import { supplyModes } from '../data/observatory';
import { pipelineStages } from '../data/site';
import type { OpenStage } from '../data/opportunities';

export function sectorLabel(code: string): string {
  return sectors.find((sector) => sector.code === code)?.label ?? code;
}

export function modeLabel(id: string): string {
  return supplyModes.find((mode) => mode.id === id)?.label ?? id;
}

export function stageLabel(stage: OpenStage): string {
  return pipelineStages.find((item) => item.id === stage)?.label ?? stage;
}
