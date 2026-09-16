import {
  ClapperboardIcon,
  Code2Icon,
  HardHatIcon,
  HeadphonesIcon,
  ScaleIcon,
  StethoscopeIcon,
  TrendingUpIcon,
  TruckIcon } from
'lucide-react';
import type { IconComponent } from '../types/icons';

interface SectorVisual {
  icon: IconComponent;
  gradient: string;
}

const gradients = [
'from-gate/30 via-ink-700 to-ink-800',
'from-sky/25 via-ink-700 to-ink-800',
'from-gold/25 via-ink-700 to-ink-800',
'from-gate-deep/50 via-ink-700 to-ink-800',
'from-sky/15 via-gate/10 to-ink-800',
'from-gold/15 via-ink-600 to-ink-800',
'from-gate/20 via-sky/10 to-ink-800',
'from-gold/10 via-gate-deep/25 to-ink-800'];


const sectorOrder = ['83131', '83111', '85999', '86601', '82191', '92390', '85120', '92190'];

const icons: Record<string, IconComponent> = {
  '83131': Code2Icon,
  '83111': TrendingUpIcon,
  '85999': HeadphonesIcon,
  '86601': HardHatIcon,
  '82191': ClapperboardIcon,
  '92390': TruckIcon,
  '85120': StethoscopeIcon,
  '92190': ScaleIcon
};

export function sectorVisual(code: string): SectorVisual {
  const index = sectorOrder.indexOf(code);
  return {
    icon: icons[code] ?? Code2Icon,
    gradient: gradients[index >= 0 ? index % gradients.length : 0]
  };
}
