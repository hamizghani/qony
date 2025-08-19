'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Plus, Play, Save, Settings, Zap, Database, Mail, Calendar, FileText, Globe } from 'lucide-react';

interface NodeType {
  id: string;
  type: string;
  label: string;
  icon: any;
  color: string;
  x: number;
  y: number;
  inputs: number;
  outputs: number;
}

interface ConnectionType {
  id: string;
  from: string;
  to: string;
}

export default function Whiteboard() {
  const [nodes, setNodes] = useState<NodeType[]>([]);
  const [connections, setConnections] = useState<ConnectionType[]>([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [draggedNode, setDraggedNode] = useState(null);
  const [connecting, setConnecting] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  const nodeTypes = [
    { type: 'trigger', label: 'Webhook', icon: Zap, color: 'bg-green-500' },
    { type: 'action', label: 'HTTP Request', icon: Globe, color: 'bg-blue-500' },
    { type: 'action', label: 'Email', icon: Mail, color: 'bg-red-500' },
    { type: 'action', label: 'Database', icon: Database, color: 'bg-purple-500' },
    { type: 'action', label: 'Schedule', icon: Calendar, color: 'bg-orange-500' },
    { type: 'action', label: 'File', icon: FileText, color: 'bg-gray-500' },
  ];

  const addNode = (nodeType: { type: string; label: string; icon: any; color: string }, x = 100, y = 100) => {
    const newNode = {
      id: `node_${Date.now()}`,
      type: nodeType.type,
      label: nodeType.label,
      icon: nodeType.icon,
      color: nodeType.color,
      x: x,
      y: y,
      inputs: nodeType.type === 'trigger' ? 0 : 1,
      outputs: 1,
    };
    console.log('Adding node:', newNode);
    setNodes([...nodes, newNode]);
  };

  const moveNode = (nodeId: string, newX: number, newY: number) => {
    setNodes(nodes.map(node => 
      node.id === nodeId ? { ...node, x: newX, y: newY } : node
    ));
  };

  const deleteNode = (nodeId: string) => {
    setNodes(nodes.filter(node => node.id !== nodeId));
    setConnections(connections.filter(conn => 
      conn.from !== nodeId && conn.to !== nodeId
    ));
  };

  const startConnection = (nodeId: string, isOutput: boolean) => {
    if (isOutput) {
      setConnecting({ from: nodeId, to: null });
    }
  };

  const completeConnection = (nodeId) => {
    if (connecting && connecting.from !== nodeId) {
      const newConnection = {
        id: `conn_${Date.now()}`,
        from: connecting.from,
        to: nodeId,
      };
      setConnections([...connections, newConnection]);
      setConnecting(null);
    }
  };

  const handleNodeMouseDown = (e, node) => {
    e.preventDefault();
    setDraggedNode(node.id);
    setSelectedNode(node.id);
  };

  const handleMouseMove = (e) => {
    if (draggedNode) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;
      moveNode(draggedNode, x - 75, y - 30);
    }
  };

  const handleMouseUp = () => {
    setDraggedNode(null);
  };

  const getConnectionPath = (fromNode, toNode) => {
    const startX = fromNode.x + 150;
    const startY = fromNode.y + 30;
    const endX = toNode.x;
    const endY = toNode.y + 30;
    
    const controlX1 = startX + 50;
    const controlX2 = endX - 50;
    
    return `M ${startX} ${startY} C ${controlX1} ${startY}, ${controlX2} ${endY}, ${endX} ${endY}`;
  };

  const Node = ({ node }) => {
    const IconComponent = node.icon;
    
    return (
      <div
        className={`absolute select-none cursor-move border-2 rounded-lg bg-gray-800 shadow-xl transition-all duration-200 ${
          selectedNode === node.id ? 'border-blue-400 shadow-blue-500/20' : 'border-gray-600'
        }`}
        style={{
          left: node.x,
          top: node.y,
          width: '150px',
          height: '60px',
        }}
        onMouseDown={(e) => handleNodeMouseDown(e, node)}
        onDoubleClick={() => deleteNode(node.id)}
      >
        {/* Input connector */}
        {node.inputs > 0 && (
          <div
            className="absolute w-3 h-3 bg-gray-500 rounded-full cursor-pointer hover:bg-gray-300 transition-colors"
            style={{ left: '-6px', top: '24px' }}
            onClick={() => completeConnection(node.id)}
          />
        )}
        
        {/* Node content */}
        <div className="flex items-center h-full px-3">
          <div className={`w-8 h-8 rounded ${node.color} flex items-center justify-center mr-2`}>
            <IconComponent size={16} className="text-white" />
          </div>
          <span className="text-sm font-medium text-gray-100 truncate">{node.label}</span>
        </div>
        
        {/* Output connector */}
        {node.outputs > 0 && (
          <div
            className="absolute w-3 h-3 bg-gray-500 rounded-full cursor-pointer hover:bg-gray-300 transition-colors"
            style={{ right: '-6px', top: '24px' }}
            onClick={() => startConnection(node.id, true)}
          />
        )}
        
        {/* Settings icon */}
        <button
          className="absolute top-1 right-1 w-4 h-4 opacity-0 hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedNode(node.id);
          }}
        >
          <Settings size={12} className="text-gray-400" />
        </button>
      </div>
    );
  };

  return (
    <div className="w-full h-screen bg-gray-900 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-100">Workflow Editor</h1>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center space-x-1">
              <Play size={14} />
              <span>Execute</span>
            </button>
            <button className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center space-x-1">
              <Save size={14} />
              <span>Save</span>
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Zoom:</span>
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
            className="px-2 py-1 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition-colors"
          >
            -
          </button>
          <span className="text-sm font-mono text-gray-200">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(Math.min(2, zoom + 0.1))}
            className="px-2 py-1 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition-colors"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 p-4">
          <h3 className="font-semibold text-gray-100 mb-4">Add Nodes</h3>
          <div className="space-y-2">
            {nodeTypes.map((nodeType, index) => {
              const IconComponent = nodeType.icon;
              return (
                <button
                  key={index}
                  onClick={() => addNode(nodeType, Math.random() * 300 + 100, Math.random() * 200 + 100)}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors border border-gray-600"
                >
                  <div className={`w-8 h-8 rounded ${nodeType.color} flex items-center justify-center`}>
                    <IconComponent size={16} className="text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-200">{nodeType.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <div
            ref={canvasRef}
            className="w-full h-full relative bg-gray-900"
            style={{
              backgroundImage: `radial-gradient(circle, #4b5563 1px, transparent 1px)`,
              backgroundSize: '20px 20px',
              cursor: draggedNode ? 'grabbing' : 'default',
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {/* Transform container for zoom and pan */}
            <div
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: '0 0',
                width: '100%',
                height: '100%',
              }}
            >
              {/* SVG for connections */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                {connections.map((connection) => {
                  const fromNode = nodes.find(n => n.id === connection.from);
                  const toNode = nodes.find(n => n.id === connection.to);
                  if (!fromNode || !toNode) return null;
                  
                  return (
                    <path
                      key={connection.id}
                      d={getConnectionPath(fromNode, toNode)}
                      stroke="#9ca3af"
                      strokeWidth="2"
                      fill="none"
                      className="drop-shadow-sm"
                    />
                  );
                })}
              </svg>

              {/* Nodes */}
              {nodes.map((node) => (
                <Node key={node.id} node={node} />
              ))}

              {/* Empty state */}
              {nodes.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <Plus size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Start building your workflow</p>
                    <p className="text-sm">Add nodes from the sidebar to get started</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}