/**
 * Parses hierarchical text (indented or bulleted) into a flat node structure
 */
export const parseHierarchicalText = (text) => {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    if (lines.length === 0) return [];

    const nodes = [];
    const stack = []; // To keep track of parent nodes at each level

    lines.forEach((line, index) => {
        // Calculate indentation level
        const indentMatch = line.match(/^(\s*)/);
        const indent = indentMatch ? indentMatch[1].length : 0;

        // Clean text (remove bullets like *, -, 1., etc.)
        const cleanText = line.trim().replace(/^([-*+]|\d+\.)\s+/, '');

        const node = {
            id: `pasted-${index}-${Math.random().toString(36).substr(2, 5)}`,
            text: cleanText,
            parentId: null,
            color: `hsl(${Math.random() * 360}, 70%, 60%)`,
            indent: indent
        };

        // Find parent based on indentation
        while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
            stack.pop();
        }

        if (stack.length > 0) {
            node.parentId = stack[stack.length - 1].id;
        }

        nodes.push(node);
        stack.push(node);
    });

    return nodes;
};
