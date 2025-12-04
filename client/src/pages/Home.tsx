import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Download } from "lucide-react";
import html2canvas from "html2canvas";
import { APP_TITLE } from "@/const";
import FlowChart from "@/components/FlowChart";
import StepDetailsV029 from "@/components/StepDetailsV029";
import CommandInput from "@/components/CommandInput";
import ShellStatePanel from "@/components/ShellStatePanel";
import ErrorSimulator from "@/components/ErrorSimulator";
import CodeViewer from "@/components/CodeViewer";
import { ParsedCommand } from "@/lib/commandParser";
import { getInitialState, getStateAtStep } from "@/lib/shellState";
import { ErrorScenario } from "@/lib/errorScenarios";

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000); // milliseconds per step
  const [userCommand, setUserCommand] = useState<ParsedCommand | null>(null);
  const [showErrorSimulator, setShowErrorSimulator] = useState(false);
  const [selectedErrorScenario, setSelectedErrorScenario] = useState<ErrorScenario | null>(null);
  const [showCodeViewer, setShowCodeViewer] = useState(false);

  const [customEnvVars, setCustomEnvVars] = useState<Record<string, string>>({});
  
  const initialState = useMemo(() => {
    const baseState = getInitialState();
    return {
      ...baseState,
      environmentVars: { ...baseState.environmentVars, ...customEnvVars }
    };
  }, [customEnvVars]);
  
  const currentState = useMemo(
    () => getStateAtStep(currentStep, userCommand, initialState),
    [currentStep, userCommand, initialState]
  );

  // Auto-advance when playing
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= 20) {
          // 21 total steps (0-20)
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, speed);

    return () => clearInterval(timer);
  }, [isPlaying, speed]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const handlePrevious = () => {
    setIsPlaying(false);
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setIsPlaying(false);
    setCurrentStep((prev) => Math.min(20, prev + 1));
  };

  const handleStepClick = (step: number) => {
    setIsPlaying(false);
    setCurrentStep(step);
  };

  const handleCommandSubmit = (parsed: ParsedCommand) => {
    setUserCommand(parsed);
    setCurrentStep(0);
    setIsPlaying(true);
    setShowErrorSimulator(false);
    setSelectedErrorScenario(null);
  };

  const handleErrorScenarioSelect = (scenario: ErrorScenario) => {
    setSelectedErrorScenario(scenario);
    // Jump to the first affected step
    if (scenario.affectedSteps.length > 0) {
      setCurrentStep(scenario.affectedSteps[0]);
      setIsPlaying(false);
    }
  };

  const handleExport = async (format: 'svg' | 'png') => {
    const flowchartElement = document.getElementById('flowchart-container');
    if (!flowchartElement) {
      console.error('Flowchart container not found');
      return;
    }

    try {
      if (format === 'svg') {
        // Export as SVG (HTML as SVG)
        const svgElement = flowchartElement.cloneNode(true) as HTMLElement;
        const svgString = new XMLSerializer().serializeToString(svgElement);
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `minishell-flowchart-step-${currentStep + 1}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        // Export as PNG using html2canvas
        // Clone the element and convert OKLCH colors to RGB for html2canvas compatibility
        const clone = flowchartElement.cloneNode(true) as HTMLElement;
        const convertOklchToRgb = (element: HTMLElement) => {
          const computedStyle = window.getComputedStyle(element);
          const bgColor = computedStyle.backgroundColor;
          const color = computedStyle.color;
          
          // Apply computed colors directly to override OKLCH
          if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
            element.style.backgroundColor = bgColor;
          }
          if (color) {
            element.style.color = color;
          }
          
          // Recursively process children
          Array.from(element.children).forEach(child => {
            convertOklchToRgb(child as HTMLElement);
          });
        };
        
        convertOklchToRgb(clone);
        document.body.appendChild(clone);
        clone.style.position = 'absolute';
        clone.style.left = '-9999px';
        
        const canvas = await html2canvas(clone, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
          logging: false,
          allowTaint: true,
          windowWidth: clone.scrollWidth,
          windowHeight: clone.scrollHeight,
        });
        
        document.body.removeChild(clone);
        
        // Use toDataURL for better Safari/macOS compatibility
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `minishell-flowchart-step-${currentStep + 1}.png`;
        link.style.display = 'none';
        document.body.appendChild(link);
        
        // Trigger download with a slight delay for Safari
        setTimeout(() => {
          link.click();
          setTimeout(() => {
            document.body.removeChild(link);
          }, 100);
        }, 100);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore keyboard shortcuts when user is typing in input fields
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        handlePlayPause();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        handlePrevious();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.code === "KeyR") {
        e.preventDefault();
        handleReset();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isPlaying, currentStep]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container py-6">
          <h1 className="text-4xl font-bold text-primary mb-2">{APP_TITLE}</h1>
          <p className="text-muted-foreground text-sm">
            Interactive step-by-step visualization of the minishell execution pipeline
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Toggle between Command Input and Error Simulator */}
        <div className="mb-6">
          <div className="flex gap-4 mb-4">
            <Button
              onClick={() => setShowErrorSimulator(false)}
              variant={!showErrorSimulator ? "default" : "outline"}
              size="lg"
            >
              Command Input
            </Button>
            <Button
              onClick={() => setShowErrorSimulator(true)}
              variant={showErrorSimulator ? "default" : "outline"}
              size="lg"
            >
              Error Scenario Simulator
            </Button>
          </div>
          
          {!showErrorSimulator ? (
            <CommandInput onCommandSubmit={handleCommandSubmit} />
          ) : (
            <ErrorSimulator onScenarioSelect={handleErrorScenarioSelect} />
          )}
        </div>

        {/* Code Viewer Toggle */}
        <div className="mb-4">
          <Button
            onClick={() => setShowCodeViewer(!showCodeViewer)}
            variant={showCodeViewer ? "default" : "outline"}
            size="lg"
          >
            {showCodeViewer ? "Hide" : "Show"} Source Code
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left: FlowChart (2 columns) */}
          <div className="xl:col-span-2">
            <Card className="p-6 bg-card border-border">
              <FlowChart 
                currentStep={currentStep} 
                onStepClick={handleStepClick}
                userCommand={userCommand}
              />
            </Card>
            
            {/* Code Viewer (below flowchart when enabled) */}
            {showCodeViewer && (
              <div className="mt-6">
                <CodeViewer currentStep={currentStep} />
              </div>
            )}
          </div>

          {/* Middle: Controls & Details (1 column) */}
          <div className="space-y-6">
            {/* Control Panel */}
            <Card className="p-6 bg-card border-border">
              <h2 className="text-xl font-bold text-primary mb-4">Controls</h2>
              
              <div className="flex gap-2 mb-4">
                <Button
                  onClick={handlePlayPause}
                  variant="default"
                  size="lg"
                  className="flex-1"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Play
                    </>
                  )}
                </Button>
                <Button onClick={handleReset} variant="outline" size="lg">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex gap-2 mb-4">
                <Button
                  onClick={handlePrevious}
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  disabled={currentStep === 0}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                <Button
                  onClick={handleNext}
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  disabled={currentStep === 15}
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              {/* Speed Control */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Animation Speed
                </label>
                <input
                  type="range"
                  min="500"
                  max="3000"
                  step="500"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-muted-foreground text-center">
                  {speed}ms per step
                </div>
              </div>

              {/* Export Buttons */}
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-sm font-bold text-foreground mb-2">
                  Export Flowchart
                </h3>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleExport('png')}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Download className="mr-2 h-3 w-3" />
                    PNG
                  </Button>
                  <Button
                    onClick={() => handleExport('svg')}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Download className="mr-2 h-3 w-3" />
                    SVG
                  </Button>
                </div>
              </div>

              {/* Keyboard Shortcuts */}
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-sm font-bold text-foreground mb-2">
                  Keyboard Shortcuts
                </h3>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Play/Pause</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-foreground">
                      Space
                    </kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Previous Step</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-foreground">
                      ←
                    </kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Next Step</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-foreground">
                      →
                    </kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Reset</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-foreground">
                      R
                    </kbd>
                  </div>
                </div>
              </div>
            </Card>

            {/* Step Details */}
            <Card className="p-6 bg-card border-border">
              <StepDetailsV029 
                currentStep={currentStep}
                userCommand={userCommand}
              />
            </Card>
          </div>

          {/* Right: Shell State Panel (1 column) */}
          <div>
            <ShellStatePanel 
              state={currentState}
              onEnvVarChange={(vars) => {
                // Extract only custom vars (non-system vars)
                const systemVars = getInitialState().environmentVars;
                const custom: Record<string, string> = {};
                Object.entries(vars).forEach(([key, value]) => {
                  if (systemVars[key] !== value || !systemVars[key]) {
                    custom[key] = value;
                  }
                });
                setCustomEnvVars(custom);
              }}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-12">
        <div className="container py-6 text-center text-sm text-muted-foreground">
          <p>
            Based on the 42 School minishell project | Created with React + TypeScript
          </p>
        </div>
      </footer>
    </div>
  );
}
