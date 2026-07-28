export function getLevelAndXp(totalXp: number) {
  let level = 1;
  let nextLevelXp = 100;
  let currentLevelBase = 0;

  if (totalXp >= 20000) {
    level = 50;
    nextLevelXp = 20000;
    currentLevelBase = 20000;
  } else if (totalXp >= 4200) {
    level = 20;
    nextLevelXp = 5000;
    currentLevelBase = 4200;
  } else {
    let cumulative = 0;
    let base = 0;
    let span = 100;

    for (let l = 1; l <= 50; l++) {
      base = cumulative;
      span = 100 + (l - 1) * 50;
      cumulative += span;
      if (totalXp < cumulative) {
        level = l;
        nextLevelXp = cumulative;
        currentLevelBase = base;
        break;
      }
    }
  }

  const xpInLevel = Math.max(0, totalXp - currentLevelBase);
  const xpSpan = Math.max(1, nextLevelXp - currentLevelBase);
  const progressPercent = Math.min(100, Math.max(0, Math.round((xpInLevel / xpSpan) * 100)));

  return { level, xpInLevel, xpSpan, progressPercent };
}