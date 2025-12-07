"use client";

import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Position,
  Handle,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { Lightbulb, AlertTriangle, Target, FileText, ShieldAlert, Rocket, TrendingUp } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

// --- Updated Types ---
type Initiative = {
  title: string;
  description: string;
  impact: string;
  difficulty: string;
};

type AnalysisPillar = {
  category: string;
  goal: string;
  key_findings: string[];
  metrics: string[];
  initiatives: Initiative[]; // New field
};

export type AnalysisResult = {
  diagram_title: string;
  core_problem: string;
  hypothesis: string;
  analysis_pillars: AnalysisPillar[];
  implementation_risks: string[];
};

// --- Custom Node Components ---
const CustomNode = ({ data }: any) => {
  const icons: any = {
    problem: <AlertTriangle className="w-5 h-5 text-red-600" />,
    hypothesis: <Lightbulb className="w-5 h-5 text-green-600" />,
    pillar: <Target className="w-5 h-5 text-blue-600" />,
    evidence: <FileText className="w-4 h-4 text-slate-500" />,
    risk: <ShieldAlert className="w-4 h-4 text-orange-600" />,
    solution: <Rocket className="w-4 h-4 text-purple-600" />, // New Icon
  };

  const styles: any = {
    problem: "bg-red-50 border-red-200",
    hypothesis: "bg-green-50 border-green-200",
    pillar: "bg-white border-blue-200 shadow-md",
    evidence: "bg-slate-50 border-slate-200 text-slate-600",
    risk: "bg-orange-50 border-orange-200",
    solution: "bg-purple-50 border-purple-200 shadow-sm", // New Style
  };

  return (
    <div className={twMerge("px-4 py-3 rounded-lg border-2 w-[280px] text-xs transition-all hover:shadow-lg", styles[data.type])}>
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />
      
      {/* Header */}
      <div className="flex items-center gap-2 mb-2 border-b pb-2 border-gray-200/50">
        {icons[data.type]}
        <span className="font-bold uppercase tracking-wider text-gray-700">{data.label}</span>
      </div>
      
      {/* Content */}
      <div className="text-gray-600 leading-relaxed">
        {data.content}
      </div>

      {/* Extra Data for Solutions */}
      {data.subContent && (
        <div className="mt-2 pt-2 border-t border-purple-200 flex items-center gap-1 text-purple-700 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>{data.subContent}</span>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
    </div>
  );
};

const nodeTypes = { custom: CustomNode };

// --- Layout Logic ---
const getLayoutedElements = (nodes: any[], edges: any[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  // Increased ranksep for better vertical spacing with new nodes
  dagreGraph.setGraph({ rankdir: 'TB', nodesep: 60, ranksep: 120 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 280, height: 150 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.position = {
      x: nodeWithPosition.x - 140,
      y: nodeWithPosition.y - 75,
    };
    return node;
  });

  return { nodes: layoutedNodes, edges };
};

interface WhiteboardProps {
  data: AnalysisResult | null;
}

export default function ConsultantWhiteboard({ data }: WhiteboardProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (!data) return;

    const initialNodes: any[] = [];
    const initialEdges: any[] = [];
    let nodeId = 1;

    // 1. Core Problem
    const problemId = `node-${nodeId++}`;
    initialNodes.push({
      id: problemId,
      type: 'custom',
      data: { type: 'problem', label: 'Core Problem', content: data.core_problem },
      position: { x: 0, y: 0 },
    });

    // 2. Hypothesis
    const hypothesisId = `node-${nodeId++}`;
    initialNodes.push({
      id: hypothesisId,
      type: 'custom',
      data: { type: 'hypothesis', label: 'Hypothesis', content: data.hypothesis },
      position: { x: 0, y: 0 },
    });
    initialEdges.push({ id: `e-prob-hyp`, source: problemId, target: hypothesisId, type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } });

    // 3. Pillars
    data.analysis_pillars.forEach((pillar, index) => {
      const pillarId = `node-${nodeId++}`;
      initialNodes.push({
        id: pillarId,
        type: 'custom',
        data: { type: 'pillar', label: pillar.category, content: pillar.goal },
        position: { x: 0, y: 0 },
      });
      initialEdges.push({ id: `e-hyp-${pillarId}`, source: hypothesisId, target: pillarId, type: 'smoothstep' });

      // 4. Evidence (Leaf nodes for Pillar)
      pillar.metrics.slice(0, 2).forEach((metric) => {
        const evidenceId = `node-${nodeId++}`;
        initialNodes.push({
          id: evidenceId,
          type: 'custom',
          data: { type: 'evidence', label: 'Evidence', content: metric },
          position: { x: 0, y: 0 },
        });
        initialEdges.push({ id: `e-${pillarId}-${evidenceId}`, source: pillarId, target: evidenceId, type: 'default' });
      });

      // 5. NEW: Solutions (Leaf nodes for Pillar)
      if (pillar.initiatives) {
        pillar.initiatives.forEach((init) => {
            const solId = `node-${nodeId++}`;
            initialNodes.push({
                id: solId,
                type: 'custom',
                data: { 
                    type: 'solution', 
                    label: 'Solution', 
                    content: init.title + ": " + init.description,
                    subContent: init.impact // Pass impact to the specific UI slot
                },
                position: { x: 0, y: 0 },
            });
            // Dashed purple line for solutions
            initialEdges.push({ 
                id: `e-${pillarId}-${solId}`, 
                source: pillarId, 
                target: solId, 
                type: 'smoothstep', 
                style: { stroke: '#9333ea', strokeWidth: 2, strokeDasharray: '5,5' } 
            });
        });
      }
    });

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [data, setNodes, setEdges]);

  return (
    <div className="w-full h-full bg-slate-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background gap={20} color="#e1e4e8" />
        <Controls />
      </ReactFlow>
    </div>
  );
}