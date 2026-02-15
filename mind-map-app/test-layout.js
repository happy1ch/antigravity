import { calculateLayout } from './src/utils/layout.js';

const INITIAL_NODES = [
    { id: 'root', text: 'Central Topic', parentId: null, color: '#3b82f6' },
    { id: '1', text: 'Introduction', parentId: 'root', color: '#10b981' },
];

try {
    const result = calculateLayout(INITIAL_NODES);
    console.log('Layout successful:', JSON.stringify(result, null, 2));
} catch (e) {
    console.error('Layout failed:', e);
}
