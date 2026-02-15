/**
 * Simple tree layout algorithm for mind maps
 * Positions nodes recursively based on their subtree height
 */

const NODE_HEIGHT = 60;
const HORIZONTAL_GAP = 120;
const VERTICAL_GAP = 24;

export const calculateLayout = (nodes) => {
    if (!nodes || nodes.length === 0) return [];

    const root = nodes.find(n => !n.parentId);
    if (!root) return nodes;

    const nodeMap = {};
    nodes.forEach(n => {
        const textLength = n.text ? n.text.length : 0;
        // Dynamic width calculation with minimum bounds
        const width = Math.max(140, textLength * 11 + 60);
        nodeMap[n.id] = { ...n, width, x: 0, y: 0, children: [] };
    });

    nodes.forEach(n => {
        if (n.parentId && nodeMap[n.parentId]) {
            nodeMap[n.parentId].children.push(nodeMap[n.id]);
        }
    });

    // 1. Calculate height of each subtree
    const calculateSubtreeHeight = (node) => {
        if (!node.children || node.children.length === 0) {
            node.subtreeHeight = NODE_HEIGHT;
            return node.subtreeHeight;
        }

        const childrenTotalHeight = node.children.reduce((acc, child) => {
            return acc + calculateSubtreeHeight(child);
        }, 0);

        const gapTotalHeight = (node.children.length - 1) * VERTICAL_GAP;
        node.subtreeHeight = Math.max(NODE_HEIGHT, childrenTotalHeight + gapTotalHeight);
        return node.subtreeHeight;
    };

    calculateSubtreeHeight(nodeMap[root.id]);

    // 2. Position nodes
    const positionNodes = (node, x, y) => {
        node.x = x;
        node.y = y;

        if (node.children && node.children.length > 0) {
            let currentY = y - node.subtreeHeight / 2;
            node.children.forEach(child => {
                const childSubtreeHalf = (child.subtreeHeight || NODE_HEIGHT) / 2;
                const childY = currentY + childSubtreeHalf;

                // X position based on cumulative widths
                const nextX = x + (node.width / 2) + HORIZONTAL_GAP + (child.width / 2);

                positionNodes(child, nextX, childY);
                currentY += (child.subtreeHeight || NODE_HEIGHT) + VERTICAL_GAP;
            });
        }
    };

    try {
        positionNodes(nodeMap[root.id], 0, 0);
    } catch (err) {
        console.error('Positioning error:', err);
    }

    return Object.values(nodeMap).map(({ children, subtreeHeight, ...rest }) => rest);
};
