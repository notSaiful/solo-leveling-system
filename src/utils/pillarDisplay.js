export const PILLAR_LABELS = {
  deen: 'Deen',
  body: 'Physical Power',
  money: 'Money',
  ummah: 'Ummah Service',
  all: 'All',
};

export function getPillarLabel(pillar) {
  return PILLAR_LABELS[pillar] || pillar || '';
}

export function getPillarDisplayKey(pillar) {
  return getPillarLabel(pillar).toUpperCase();
}
