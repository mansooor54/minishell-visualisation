import { cn } from "@/lib/utils";
import { ParsedCommand } from "@/lib/commandParser";
import { flowStepsV029, FlowStepV029 } from "@/lib/flowStepsV029";

interface FlowChartProps {
  currentStep: number;
  onStepClick: (step: number) => void;
  userCommand: ParsedCommand | null;
}

interface FlowStep {
  id: number;
  title: string;
  description: string;
  type: "start" | "process" | "decision" | "end";
  category: "control" | "parsing" | "execution" | "cleanup";
  module: string;
  file: string;
  branches?: { yes: number; no: number };
}

// Convert v0.29 steps to FlowChart format
const flowSteps: FlowStep[] = flowStepsV029.map(step => ({
  id: step.id,
  title: step.title,
  description: step.description,
  type: step.type,
  category: step.category,
  module: step.module,
  file: step.file,
  branches: step.id === 15 ? { yes: 16, no: 17 } : undefined // Decision point for built-in check
}));

export default function FlowChart({ currentStep, onStepClick, userCommand }: FlowChartProps) {
  const getStepColor = (step: FlowStep, isCurrent: boolean, isPast: boolean) => {
    // Category-based colors
    const categoryColors = {
      control: {
        current: "border-emerald-500 bg-emerald-500/30 text-black shadow-lg shadow-emerald-500/50",
        past: "border-emerald-500/50 bg-emerald-500/15 text-black",
        future: "border-emerald-500/30 bg-emerald-500/5 text-black/50"
      },
      parsing: {
        current: "border-blue-500 bg-blue-500/30 text-black shadow-lg shadow-blue-500/50",
        past: "border-blue-500/50 bg-blue-500/15 text-black",
        future: "border-blue-500/30 bg-blue-500/5 text-black/50"
      },
      execution: {
        current: "border-purple-500 bg-purple-500/30 text-black shadow-lg shadow-purple-500/50",
        past: "border-purple-500/50 bg-purple-500/15 text-black",
        future: "border-purple-500/30 bg-purple-500/5 text-black/50"
      },
      cleanup: {
        current: "border-orange-500 bg-orange-500/30 text-black shadow-lg shadow-orange-500/50",
        past: "border-orange-500/50 bg-orange-500/15 text-black",
        future: "border-orange-500/30 bg-orange-500/5 text-black/50"
      }
    };

    // Decision nodes get special yellow color
    if (step.type === "decision") {
      if (isCurrent) return "border-yellow-500 bg-yellow-500/30 text-black shadow-lg shadow-yellow-500/50";
      if (isPast) return "border-yellow-500/50 bg-yellow-500/15 text-black";
      return "border-yellow-500/30 bg-yellow-500/5 text-black/50";
    }

    const colors = categoryColors[step.category];
    if (isCurrent) return colors.current;
    if (isPast) return colors.past;
    return colors.future;
  };

  const getCategoryBadge = (category: string) => {
    const badges = {
      control: { bg: "bg-emerald-500/40", text: "text-emerald-100", label: "CONTROL" },
      parsing: { bg: "bg-blue-500/40", text: "text-blue-100", label: "PARSING" },
      execution: { bg: "bg-purple-500/40", text: "text-purple-100", label: "EXECUTION" },
      cleanup: { bg: "bg-orange-500/40", text: "text-orange-100", label: "CLEANUP" }
    };
    
    const badge = badges[category as keyof typeof badges];
    return (
      <span className={cn("text-[9px] px-2 py-0.5 rounded font-bold", badge.bg, badge.text)}>
        {badge.label}
      </span>
    );
  };

  const renderFlowBox = (step: FlowStep) => {
    const isCurrent = currentStep === step.id;
    const isPast = currentStep > step.id;

    return (
      <button
        key={step.id}
        onClick={() => onStepClick(step.id)}
        className={cn(
          "relative border-2 px-6 py-3 min-w-[220px] font-bold text-sm transition-all duration-300 rounded-lg",
          getStepColor(step, isCurrent, isPast),
          "cursor-pointer hover:scale-105",
          isCurrent && "ring-2 ring-offset-2 ring-offset-background"
        )}
      >
        <div className="flex flex-col items-center gap-1.5">
          {getCategoryBadge(step.category)}
          <div className="font-bold text-center">{step.title}</div>
          {step.description && (
            <div className="text-xs opacity-90 text-center">{step.description}</div>
          )}
        </div>
      </button>
    );
  };

  const renderArrow = (isActive: boolean) => (
    <div
      className={cn(
        "text-2xl font-bold transition-all duration-300",
        isActive ? "text-primary" : "text-border"
      )}
    >
      ↓
    </div>
  );

  return (
    <div id="flowchart-container" className="space-y-4">
      {/* Legend */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
        <h2 className="text-xl font-bold text-primary">Execution Flow</h2>
        <div className="flex gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-blue-500 border border-blue-400"></div>
            <span className="text-foreground font-medium">Parsing</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-purple-500 border border-purple-400"></div>
            <span className="text-foreground font-medium">Execution</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-orange-500 border border-orange-400"></div>
            <span className="text-foreground font-medium">Cleanup</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-yellow-500 border border-yellow-400"></div>
            <span className="text-foreground font-medium">Decision</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center space-y-3 py-4">
        {/* Steps 0-7: Linear flow */}
        {flowSteps.slice(0, 8).map((step, index) => (
          <div key={step.id} className="flex flex-col items-center">
            {renderFlowBox(step)}
            {index < 7 && renderArrow(currentStep > step.id)}
          </div>
        ))}

        {/* Branching section (steps 8-11) */}
        <div className="flex justify-center gap-16 my-4">
          {/* Left branch: Built-in */}
          <div className="flex flex-col items-center space-y-3">
            <div className="bg-yellow-500/30 text-yellow-100 font-bold text-sm px-3 py-1 rounded border border-yellow-500">
              YES
            </div>
            {renderFlowBox(flowSteps[8])}
            {renderArrow(currentStep > 8)}
            {renderFlowBox(flowSteps[9])}
          </div>

          {/* Right branch: External */}
          <div className="flex flex-col items-center space-y-3">
            <div className="bg-yellow-500/30 text-yellow-100 font-bold text-sm px-3 py-1 rounded border border-yellow-500">
              NO
            </div>
            {renderFlowBox(flowSteps[10])}
            {renderArrow(currentStep > 10)}
            {renderFlowBox(flowSteps[11])}
          </div>
        </div>

        {/* Convergence */}
        <div className="text-2xl font-bold text-primary">↓ ↓</div>

        {/* Steps 12-15: Cleanup and loop */}
        {flowSteps.slice(12).map((step, index) => (
          <div key={step.id} className="flex flex-col items-center">
            {renderFlowBox(step)}
            {index < 3 && renderArrow(currentStep > step.id)}
          </div>
        ))}

        {/* User Command Info */}
        {userCommand && userCommand.isValid && (
          <div className="mt-6 p-4 bg-primary/10 border-2 border-primary/40 rounded-lg text-sm w-full max-w-md">
            <div className="font-bold text-primary mb-2 flex items-center gap-2">
              <span>Processing Command:</span>
              {userCommand.commands.some(c => c.isBuiltIn) && (
                <span className="text-xs bg-purple-500/30 text-purple-200 px-2 py-0.5 rounded border border-purple-500">
                  BUILT-IN
                </span>
              )}
              {!userCommand.commands.some(c => c.isBuiltIn) && (
                <span className="text-xs bg-cyan-500/30 text-cyan-200 px-2 py-0.5 rounded border border-cyan-500">
                  EXTERNAL
                </span>
              )}
            </div>
            <code className="text-foreground font-mono text-xs bg-background/50 px-2 py-1 rounded block">
              {userCommand.raw}
            </code>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {userCommand.hasPipes && (
                <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded border border-blue-500/50">
                  ✓ Pipes
                </span>
              )}
              {userCommand.hasRedirection && (
                <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded border border-green-500/50">
                  ✓ Redirections
                </span>
              )}
              {userCommand.hasHeredoc && (
                <span className="bg-orange-500/20 text-orange-300 px-2 py-1 rounded border border-orange-500/50">
                  ✓ Heredoc
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
