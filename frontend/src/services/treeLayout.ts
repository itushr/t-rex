import { TreeNode } from "../types/tree";

export const NODE_W = 180;
export const NODE_H = 72;
export const LEVEL_H = 120;
export const SIBLING_GAP = 24;

export interface LayoutLink {
  parentId: number;
  childId: number;
  sx: number;
  sy: number;
  ex: number;
  ey: number;
  my: number;
  isLeft: boolean;
}

export function layoutTree(root: TreeNode): { nodes: TreeNode[]; links: LayoutLink[] } {
  let nextX = 40;

  function assignCoords(node: TreeNode) {
    if (node.is_leaf || (!node.left && !node.right)) {
      node.x = nextX;
      nextX += NODE_W + SIBLING_GAP;
    } else {
      if (node.left) assignCoords(node.left);
      if (node.right) assignCoords(node.right);
      const l = node.left ? (node.left.x ?? 0) : (node.right?.x ?? 0);
      const r = node.right ? (node.right.x ?? 0) : (node.left?.x ?? 0);
      node.x = (l + r) / 2;
    }
    node.y = 40 + node.depth * LEVEL_H;
  }

  assignCoords(root);

  const flatNodes: TreeNode[] = [];
  const flatLinks: LayoutLink[] = [];

  function traverse(node: TreeNode, parent?: TreeNode, isLeft: boolean = true) {
    flatNodes.push(node);
    if (parent && parent.x !== undefined && parent.y !== undefined && node.x !== undefined && node.y !== undefined) {
      const sx = parent.x + NODE_W / 2;
      const sy = parent.y + NODE_H;
      const ex = node.x + NODE_W / 2;
      const ey = node.y;
      flatLinks.push({
        parentId: parent.id,
        childId: node.id,
        sx,
        sy,
        ex,
        ey,
        my: (sy + ey) / 2,
        isLeft,
      });
    }
    if (node.left) traverse(node.left, node, true);
    if (node.right) traverse(node.right, node, false);
  }

  traverse(root);
  return { nodes: flatNodes, links: flatLinks };
}
