import React, { useState, useRef, useEffect, useCallback } from 'react';
import { calculateLayout } from '../utils/layout';
import { parseHierarchicalText } from '../utils/parser';
import { parseEmmFile } from '../utils/emmParser';

const INITIAL_NODES = [
    { id: 'root', text: 'Central Topic', parentId: null, color: '#3b82f6' },
    { id: '1', text: 'Introduction', parentId: 'root', color: '#10b981' },
    { id: '2', text: 'Core Ideas', parentId: 'root', color: '#f59e0b' },
];

const MindMap = () => {
    const [nodes, setNodes] = useState(() => calculateLayout(INITIAL_NODES));
    const [viewBox, setViewBox] = useState({ x: -400, y: -300, w: 800, h: 600 });
    const containerRef = useRef(null);
    const fileInputRef = useRef(null);
    const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
    const [draggingNodeId, setDraggingNodeId] = useState(null);
    const [dragOverId, setDragOverId] = useState(null);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
    const [editingNodeId, setEditingNodeId] = useState(null);
    const [editingText, setEditingText] = useState('');
    const [selectedNodeId, setSelectedNodeId] = useState('root');

    const updateLayout = useCallback((currentNodes) => {
        const positionedNodes = calculateLayout(currentNodes);
        setNodes(positionedNodes);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const { clientWidth, clientHeight } = containerRef.current;
                setViewBox(prev => ({ ...prev, w: clientWidth, h: clientHeight }));
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (editingNodeId) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleEditSubmit();
                    const currentNode = nodes.find(n => n.id === editingNodeId);
                    if (currentNode && currentNode.parentId) addNode(currentNode.parentId);
                    else if (currentNode) addNode(currentNode.id);
                }
                if (e.key === 'Tab') {
                    e.preventDefault();
                    handleEditSubmit();
                    addNode(editingNodeId);
                }
                return;
            }

            if (selectedNodeId) {
                if (e.key === 'Enter') {
                    const currentNode = nodes.find(n => n.id === selectedNodeId);
                    if (currentNode && currentNode.parentId) addNode(currentNode.parentId);
                    else addNode(selectedNodeId);
                }
                if (e.key === 'Tab') {
                    e.preventDefault();
                    addNode(selectedNodeId);
                }
                if (e.key === 'Delete' || e.key === 'Backspace') {
                    if (selectedNodeId !== 'root') deleteNode(selectedNodeId);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [nodes, selectedNodeId, editingNodeId, updateLayout]);

    useEffect(() => {
        const handlePaste = (e) => {
            if (editingNodeId) return;
            const text = e.clipboardData.getData('text');
            if (!text) return;

            const pastedNodes = parseHierarchicalText(text);
            if (pastedNodes.length === 0) return;

            const targetParentId = selectedNodeId || 'root';
            const newNodes = [...nodes];
            const idMap = {};

            const toAdd = pastedNodes.map(node => {
                const oldId = node.id;
                const newId = Math.random().toString(36).substr(2, 9);
                idMap[oldId] = newId;
                return { ...node, id: newId, _oldParentId: node.parentId };
            });

            toAdd.forEach(node => {
                node.parentId = node._oldParentId ? (idMap[node._oldParentId] || targetParentId) : targetParentId;
                delete node._oldParentId;
                newNodes.push(node);
            });

            updateLayout(newNodes);
        };

        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [nodes, selectedNodeId, updateLayout, editingNodeId]);

    const handleMouseDown = (e) => {
        if (e.target.tagName === 'svg' || e.target.closest('.canvas-bg')) {
            setIsDraggingCanvas(true);
            setLastMousePos({ x: e.clientX, y: e.clientY });
            setEditingNodeId(null);
            setSelectedNodeId(null);
        }
    };

    const handleMouseMove = (e) => {
        const dx = e.clientX - lastMousePos.x;
        const dy = e.clientY - lastMousePos.y;

        if (isDraggingCanvas) {
            setViewBox(prev => ({ ...prev, x: prev.x - dx, y: prev.y - dy }));
        }
        setLastMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
        if (draggingNodeId && dragOverId && draggingNodeId !== dragOverId) {
            // Re-parenting check for cycles
            const isDescendant = (childId, potentialParentId) => {
                let curr = nodes.find(n => n.id === potentialParentId);
                while (curr && curr.parentId) {
                    if (curr.parentId === childId) return true;
                    curr = nodes.find(n => n.id === curr.parentId);
                }
                return false;
            };

            if (!isDescendant(draggingNodeId, dragOverId)) {
                const updated = nodes.map(n => n.id === draggingNodeId ? { ...n, parentId: dragOverId } : n);
                updateLayout(updated);
            }
        }
        setIsDraggingCanvas(false);
        setDraggingNodeId(null);
        setDragOverId(null);
    };

    const centerNode = (node) => {
        setSelectedNodeId(node.id);
        const targetX = node.x - viewBox.w / 2;
        const targetY = node.y - viewBox.h / 2;
        const startX = viewBox.x;
        const startY = viewBox.y;
        const duration = 500;
        const startTime = performance.now();
        const animate = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            setViewBox(prev => ({
                ...prev,
                x: startX + (targetX - startX) * ease,
                y: startY + (targetY - startY) * ease
            }));
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    };

    const addNode = (parentId) => {
        const newNode = {
            id: Math.random().toString(36).substr(2, 9),
            text: 'New Topic',
            parentId: parentId,
            color: `hsl(${Math.random() * 360}, 70%, 60%)`
        };
        updateLayout([...nodes, newNode]);
    };

    const deleteNode = (id) => {
        if (id === 'root') return;
        const idsToDelete = new Set();
        const collect = (pId) => {
            idsToDelete.add(pId);
            nodes.filter(n => n.parentId === pId).forEach(n => collect(n.id));
        };
        collect(id);
        updateLayout(nodes.filter(n => !idsToDelete.has(n.id)));
    };

    const handleEditSubmit = () => {
        const updated = nodes.map(n => n.id === editingNodeId ? { ...n, text: editingText } : n);
        updateLayout(updated);
        setEditingNodeId(null);
    };

    const handleExport = () => {
        const blob = new Blob([JSON.stringify(nodes, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mind-map.json';
        a.click();
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const imported = await parseEmmFile(file);
            updateLayout(imported);
            const root = imported.find(n => !n.parentId);
            if (root) centerNode(root);
        } catch (err) { alert(`Import failed: ${err.message}`); }
    };

    const renderConnection = (node) => {
        if (!node.parentId) return null;
        const parent = nodes.find(n => n.id === node.parentId);
        if (!parent || isNaN(parent.x) || isNaN(node.x)) return null;

        const startX = parent.x + (parent.width / 2);
        const endX = node.x - (node.width / 2);
        const midX = (startX + endX) / 2;

        return (
            <path key={`c-${node.id}`}
                d={`M ${startX} ${parent.y} C ${midX} ${parent.y}, ${midX} ${node.y}, ${endX} ${node.y}`}
                fill="none" stroke="url(#lineGradient)" strokeWidth="2" className="opacity-40"
            />
        );
    };

    return (
        <div
            ref={containerRef}
            className="w-full h-full bg-[#0f172a] cursor-grab active:cursor-grabbing overflow-hidden relative"
            onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
        >
            <div className="absolute inset-0 pointer-events-none opacity-20 canvas-bg" style={{
                backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)',
                backgroundSize: '40px 40px',
                transform: `translate(${-viewBox.x % 40}px, ${-viewBox.y % 40}px)`
            }} />

            <svg width="100%" height="100%" viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`} className="select-none">
                <defs>
                    <linearGradient id="lineGradient"><stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#10b981" /></linearGradient>
                    <filter id="glow"><feGaussianBlur stdDeviation="3" /><feComposite in="SourceGraphic" operator="over" /></filter>
                </defs>

                <g>{nodes.map(renderConnection)}</g>

                {nodes.map(node => (
                    <g key={node.id} transform={`translate(${node.x}, ${node.y})`} className="group"
                        onClick={(e) => { e.stopPropagation(); centerNode(node); }}
                        onDoubleClick={(e) => { e.stopPropagation(); setEditingNodeId(node.id); setEditingText(node.text); }}
                        onMouseDown={(e) => { e.stopPropagation(); if (node.id !== 'root') setDraggingNodeId(node.id); }}
                        onMouseEnter={() => draggingNodeId && setDragOverId(node.id)}
                        onMouseLeave={() => setDragOverId(null)}
                    >
                        <rect x={-node.width / 2} y="-25" width={node.width} height="50" rx="12" fill={node.color || '#475569'}
                            className={`transition-all duration-200 stroke-2 ${selectedNodeId === node.id ? 'stroke-blue-400' : 'stroke-transparent'} ${dragOverId === node.id && draggingNodeId !== node.id ? 'stroke-emerald-400 scale-110' : ''}`}
                            filter="url(#glow)"
                        />
                        {editingNodeId === node.id ? (
                            <foreignObject x={-node.width / 2 + 10} y="-15" width={node.width - 20} height="30">
                                <input autoFocus className="w-full h-full bg-transparent text-white text-sm text-center outline-none"
                                    value={editingText} onChange={(e) => setEditingText(e.target.value)}
                                    onBlur={handleEditSubmit} onKeyDown={(e) => e.key === 'Enter' && handleEditSubmit()}
                                />
                            </foreignObject>
                        ) : (
                            <text textAnchor="middle" dominantBaseline="middle" fill="white" className="text-sm font-semibold pointer-events-none">{node.text}</text>
                        )}

                        <g className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <circle cx={node.width / 2 + 15} cy="0" r="10" fill="#334155" className="hover:fill-blue-500 cursor-pointer" onClick={(e) => { e.stopPropagation(); addNode(node.id); }} />
                            <text x={node.width / 2 + 15} y="1" textAnchor="middle" dominantBaseline="middle" fill="white" className="text-xs pointer-events-none">+</text>
                            {node.id !== 'root' && (
                                <g onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }}>
                                    <circle cx={-node.width / 2 - 15} cy="0" r="10" fill="#334155" className="hover:fill-red-500 cursor-pointer" />
                                    <text x={-node.width / 2 - 15} y="0" textAnchor="middle" dominantBaseline="middle" fill="white" className="text-xs pointer-events-none">×</text>
                                </g>
                            )}
                        </g>
                    </g>
                ))}
            </svg>

            {draggingNodeId && (
                <div className="fixed pointer-events-none z-50 animate-pulse" style={{ left: lastMousePos.x, top: lastMousePos.y }}>
                    <div className="w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_15px_#3b82f6]" />
                </div>
            )}

            <div className="absolute top-6 left-6 pointer-events-none">
                <h1 className="text-white text-3xl font-black bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">MindCanvas</h1>
                <p className="text-slate-500 text-[10px] font-mono tracking-widest uppercase">Stable v0.6</p>
            </div>

            <div className="absolute top-6 right-6 flex gap-2">
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                <button onClick={() => fileInputRef.current.click()} className="bg-slate-800/80 px-4 py-2 rounded-xl text-white text-xs border border-slate-700 hover:border-blue-500 shadow-lg backdrop-blur-md">Import</button>
                <button onClick={handleExport} className="bg-slate-800/80 px-4 py-2 rounded-xl text-white text-xs border border-slate-700 hover:border-emerald-500 shadow-lg backdrop-blur-md">Export</button>
                <button onClick={() => updateLayout(INITIAL_NODES)} className="bg-slate-800/80 px-4 py-2 rounded-xl text-slate-400 text-xs border border-slate-700 hover:text-white shadow-lg backdrop-blur-md">Reset</button>
            </div>

            <div className="absolute bottom-6 right-6 flex flex-col items-end gap-3">
                {draggingNodeId && (
                    <div className="bg-emerald-500/20 text-emerald-400 text-xs px-4 py-2 rounded-full border border-emerald-500/30 animate-pulse mb-2 font-mono uppercase tracking-wider">
                        Drop on node to attach
                    </div>
                )}
                <div className="bg-slate-800/90 backdrop-blur-2xl p-5 rounded-3xl border border-slate-700 shadow-2xl text-slate-300">
                    <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-[11px] font-semibold uppercase tracking-tight">
                        <div className="flex items-center gap-3"><kbd className="bg-slate-700 px-2 py-0.5 rounded text-white shadow-sm">Tab</kbd> <span>New Child</span></div>
                        <div className="flex items-center gap-3"><kbd className="bg-slate-700 px-2 py-0.5 rounded text-white shadow-sm">Enter</kbd> <span>New Sibling</span></div>
                        <div className="flex items-center gap-3"><kbd className="bg-slate-700 px-2 py-0.5 rounded text-white shadow-sm">Ctrl+V</kbd> <span>Smart Paste</span></div>
                        <div className="flex items-center gap-3"><kbd className="bg-slate-700 px-2 py-0.5 rounded text-white shadow-sm">Drag</kbd> <span>Move Map</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MindMap;
