export const CONTAINER_W = 420;
export const CONTAINER_INITIAL_H = 300;
export const HEADER_H = 56;
export const NODE_CARD_H = 64;
export const NODE_GAP = 8;
export const BODY_PAD_Y = 12;
export const EMPTY_BODY_H = 80;

export function computeContainerHeight(memberCount: number, collapsed: boolean): number {
  if (collapsed) return HEADER_H;
  if (memberCount === 0) return HEADER_H + BODY_PAD_Y * 2 + EMPTY_BODY_H;
  return (
    HEADER_H + BODY_PAD_Y * 2 +
    NODE_CARD_H * memberCount +
    NODE_GAP * Math.max(0, memberCount - 1)
  );
}
