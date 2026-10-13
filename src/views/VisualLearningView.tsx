import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Lightbulb,
  Compass
} from 'lucide-react';
import { DiagramData } from '../types/index.js';
import { MermaidRenderer } from '../components/MermaidRenderer.js';

interface VisualLearningViewProps {
  initialTopic?: string;
}

export const VisualLearningView: React.FC<VisualLearningViewProps> = ({ initialTopic }) => {
  const [topicInput, setTopicInput] = useState(initialTopic || 'Page Fault Handling Flow in Virtual Memory');
  const [diagram, setDiagram] = useState<DiagramData | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const curatedTopics = [
    { label: 'OS: Page Fault Handling', topic: 'Page Fault Handling Flow in Virtual Memory' },
    { label: 'Economics: Keynesian Multiplier', topic: 'Keynesian Multiplier & Aggregate Demand Expansion' },
    { label: 'Biology: DNA Replication Fork', topic: 'DNA Replication Fork Molecular Machinery' }
  ];

  const fetchDiagram = async (topicToLoad: string) => {
    setLoading(true);
    setIsPlaying(false);
    setCurrentStepIndex(0);

    try {
      const res = await fetch('/api/diagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topicToLoad })
      });
      if (!res.ok) throw new Error('Failed to load flowchart');
      const data: DiagramData = await res.json();
      setDiagram(data);
    } catch (err) {
      alert('Error loading flowchart: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagram(topicInput);
  }, []);

  // Auto-play animation timer
  useEffect(() => {
    if (isPlaying && diagram && diagram.steps.length > 0) {
      timerRef.current = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev >= diagram.steps.length - 1) {
            setIsPlaying(false);
            return 0; // Loop or stop
          }
          return prev + 1;
        });
      }, 3500);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, diagram]);

  const activeStep = diagram?.steps[currentStepIndex];

  return (
    <div className="space-y-8 pb-12">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Visual Learning & Interactive Flowcharts
          </h1>
          <p className="text-sm text-slate-500">
            Animated Mermaid.js state machines explaining complex textbook mechanisms step-by-step.
          </p>
        </div>

        {/* Curated Preset Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {curatedTopics.map((ct, idx) => (
            <button
              key={idx}
              onClick={() => {
                setTopicInput(ct.topic);
                fetchDiagram(ct.topic);
              }}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              {ct.label}
            </button>
          ))}
        </div>
      </div>

      {/* Topic Query Bar */}
      <div className="flex gap-2">
        <input
          type="text"
          value={topicInput}
          onChange={e => setTopicInput(e.target.value)}
          placeholder="Enter any academic topic or process to visualize with Mermaid..."
          className="flex-1 px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-xs"
        />
        <button
          onClick={() => fetchDiagram(topicInput)}
          disabled={loading || !topicInput.trim()}
          className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm flex items-center gap-1.5 whitespace-nowrap"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Generate Diagram</span>
        </button>
      </div>

      {/* Main Two-Zone Stage: Flowchart Canvas on Left, Companion Step Deck on Right */}
      {diagram && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Zone (7 cols): Interactive Visual Canvas */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{diagram.title}</h3>
                <p className="text-xs text-slate-500">{diagram.description}</p>
              </div>
              <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-medium">
                Step {currentStepIndex + 1} of {diagram.steps.length}
              </span>
            </div>

            {/* Mermaid SVG Diagram Area */}
            <div className="bg-slate-50/60 rounded-xl border border-slate-100 min-h-[360px] flex items-center justify-center p-2">
              <MermaidRenderer
                chart={diagram.mermaidCode}
                activeNodeId={activeStep?.highlightedNode}
              />
            </div>

            {/* Animation Playback Controller */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors shadow-xs ${
                    isPlaying
                      ? 'bg-amber-600 text-white hover:bg-amber-700'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlaying ? 'Pause' : 'Play Animation'}</span>
                </button>

                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentStepIndex(0);
                  }}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Restart from Step 1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentStepIndex(prev => Math.max(0, prev - 1));
                  }}
                  disabled={currentStepIndex === 0}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentStepIndex(prev => Math.min(diagram.steps.length - 1, prev + 1));
                  }}
                  disabled={currentStepIndex === diagram.steps.length - 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40"
                >
                  <span>Next</span>
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Zone (5 cols): Step-by-Step Concept Deck */}
          <div className="lg:col-span-5 space-y-4">
            {/* Active Step Highlight Card */}
            {activeStep && (
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                    Stage {activeStep.stepNumber} of {diagram.steps.length}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Node: [{activeStep.highlightedNode}]
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {activeStep.title}
                </h3>

                <p className="text-sm text-slate-700 leading-relaxed font-sans">
                  {activeStep.description}
                </p>

                {activeStep.formulaOrAnalogy && (
                  <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs leading-relaxed space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                      <span>Exam Formula / Real-World Analogy</span>
                    </div>
                    <p className="font-serif italic text-slate-800">
                      {activeStep.formulaOrAnalogy}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step Sequence Overview */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                All Mechanism Stages:
              </h4>

              <div className="space-y-1.5">
                {diagram.steps.map((st, i) => (
                  <button
                    key={st.stepNumber}
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentStepIndex(i);
                    }}
                    className={`w-full p-2.5 rounded-lg text-left text-xs transition-all flex items-center justify-between ${
                      i === currentStepIndex
                        ? 'bg-indigo-50 border border-indigo-200 text-indigo-900 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <span>
                      {st.stepNumber}. {st.title}
                    </span>
                    <span className="font-mono text-slate-400">[{st.highlightedNode}]</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
