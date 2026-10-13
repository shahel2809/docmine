import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidRendererProps {
  chart: string;
  activeNodeId?: string;
}

export const MermaidRenderer: React.FC<MermaidRendererProps> = ({ chart, activeNodeId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'neutral',
      securityLevel: 'loose',
      flowchart: {
        htmlLabels: true,
        curve: 'basis'
      }
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    const renderChart = async () => {
      if (!chart.trim()) return;
      try {
        setError(null);
        const uniqueId = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        const { svg } = await mermaid.render(uniqueId, chart);
        if (isMounted) {
          setSvgContent(svg);
        }
      } catch (err) {
        console.warn('Mermaid rendering issue:', err);
        if (isMounted) {
          setError('Failed to render flowchart syntax.');
        }
      }
    };

    renderChart();
    return () => {
      isMounted = false;
    };
  }, [chart]);

  // Apply active node highlight effect to SVG
  useEffect(() => {
    if (!containerRef.current || !activeNodeId) return;

    // Reset previous highlights
    const nodes = containerRef.current.querySelectorAll('.node');
    nodes.forEach(node => {
      (node as HTMLElement).style.filter = '';
      (node as HTMLElement).style.transform = '';
      (node as HTMLElement).style.stroke = '';
      (node as HTMLElement).style.strokeWidth = '';
    });

    // Find node matching activeNodeId (e.g. flowchart node id "B" or "flowchart-B-")
    const activeEl = Array.from(nodes).find(node => {
      const id = node.id || '';
      return id.includes(`-${activeNodeId}-`) || id.endsWith(`-${activeNodeId}`) || id.startsWith(`flowchart-${activeNodeId}`);
    });

    if (activeEl) {
      (activeEl as HTMLElement).style.filter = 'drop-shadow(0 0 8px rgba(79, 70, 229, 0.6))';
      (activeEl as HTMLElement).style.stroke = '#4338ca';
      (activeEl as HTMLElement).style.strokeWidth = '3px';
      (activeEl as HTMLElement).style.transition = 'all 0.3s ease';
    }
  }, [svgContent, activeNodeId]);

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono">
        {error}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full flex items-center justify-center p-4 overflow-x-auto min-h-[280px]"
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};
