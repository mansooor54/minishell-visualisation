import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Play, 
  Code2, 
  Terminal,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { errorScenarios, getCategorizedScenarios, ErrorScenario } from "@/lib/errorScenarios";

interface ErrorSimulatorProps {
  onScenarioSelect: (scenario: ErrorScenario) => void;
}

export default function ErrorSimulator({ onScenarioSelect }: ErrorSimulatorProps) {
  const [selectedScenario, setSelectedScenario] = useState<ErrorScenario | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = getCategorizedScenarios();
  const categoryInfo = {
    syntax: { icon: "🔤", color: "bg-red-100 text-red-800 border-red-300", count: categories.syntax.length },
    exit: { icon: "🚪", color: "bg-orange-100 text-orange-800 border-orange-300", count: categories.exit.length },
    signals: { icon: "⚡", color: "bg-yellow-100 text-yellow-800 border-yellow-300", count: categories.signals.length },
    redirections: { icon: "📁", color: "bg-blue-100 text-blue-800 border-blue-300", count: categories.redirections.length },
    pipes: { icon: "🔗", color: "bg-purple-100 text-purple-800 border-purple-300", count: categories.pipes.length },
    builtins: { icon: "⚙️", color: "bg-green-100 text-green-800 border-green-300", count: categories.builtins.length },
    memory: { icon: "💾", color: "bg-pink-100 text-pink-800 border-pink-300", count: categories.memory.length },
    quotes: { icon: "💬", color: "bg-indigo-100 text-indigo-800 border-indigo-300", count: categories.quotes.length },
  };

  const handleScenarioClick = (scenario: ErrorScenario) => {
    setSelectedScenario(scenario);
    setShowResult(false);
    setIsExecuting(false);
  };

  const handleExecute = () => {
    if (!selectedScenario) return;
    
    setIsExecuting(true);
    setShowResult(false);
    
    // Simulate execution delay
    setTimeout(() => {
      setIsExecuting(false);
      setShowResult(true);
      onScenarioSelect(selectedScenario);
    }, 1500);
  };

  const getScenariosForCategory = (category: string) => {
    return categories[category as keyof typeof categories] || [];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-orange-300 bg-gradient-to-r from-orange-50 to-red-50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-black flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            Error Scenario Simulator
          </CardTitle>
          <p className="text-sm text-gray-700 mt-2">
            Explore how minishell v0.29 handles edge cases, errors, and special scenarios. 
            Select a scenario to see detailed error handling behavior.
          </p>
        </CardHeader>
      </Card>

      {/* Category Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-black">
            Select Error Category ({errorScenarios.length} scenarios)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(categoryInfo).map(([key, info]) => (
              <Button
                key={key}
                variant={selectedCategory === key ? "default" : "outline"}
                className={`h-auto py-3 px-4 flex flex-col items-center gap-2 ${
                  selectedCategory === key ? "ring-2 ring-offset-2" : ""
                }`}
                onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
              >
                <span className="text-2xl">{info.icon}</span>
                <span className="text-xs font-semibold capitalize">{key}</span>
                <Badge variant="secondary" className="text-xs">
                  {info.count}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scenario List */}
      {selectedCategory && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-black capitalize">
              {selectedCategory} Scenarios ({getScenariosForCategory(selectedCategory).length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {getScenariosForCategory(selectedCategory).map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => handleScenarioClick(scenario)}
                  className={`text-left p-4 rounded-lg border-2 transition-all ${
                    selectedScenario?.id === scenario.id
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-black mb-1">{scenario.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{scenario.description}</p>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded text-black">
                        $ {scenario.command}
                      </code>
                      {scenario.v029Fix && (
                        <Badge className="mt-2 bg-green-100 text-green-800 border-green-300">
                          <Sparkles className="w-3 h-3 mr-1" />
                          v0.29 Fix
                        </Badge>
                      )}
                    </div>
                    <Badge className={categoryInfo[scenario.category as keyof typeof categoryInfo].color}>
                      {categoryInfo[scenario.category as keyof typeof categoryInfo].icon}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Scenario Details */}
      {selectedScenario && (
        <Card className="border-2 border-blue-300">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-xl font-bold text-black mb-2">
                  {selectedScenario.title}
                </CardTitle>
                <p className="text-sm text-gray-700">{selectedScenario.description}</p>
              </div>
              <Button
                onClick={handleExecute}
                disabled={isExecuting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isExecuting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Execute Scenario
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Command */}
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                Command
              </h4>
              <code className="block bg-gray-900 text-green-400 px-4 py-3 rounded font-mono text-sm">
                $ {selectedScenario.command}
              </code>
            </div>

            {/* Expected Behavior */}
            <div>
              <h4 className="font-semibold text-sm text-blue-700 mb-2 flex items-center gap-2">
                <Code2 className="w-4 h-4" />
                Expected Behavior
              </h4>
              <p className="text-sm text-gray-700 bg-blue-50 border border-blue-200 rounded px-3 py-2">
                {selectedScenario.expectedBehavior}
              </p>
            </div>

            {/* v0.29 Fix (if applicable) */}
            {selectedScenario.v029Fix && (
              <Alert className="bg-green-50 border-green-300">
                <Sparkles className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-sm text-green-800">
                  <strong>v0.29 Improvement:</strong> {selectedScenario.v029Fix}
                </AlertDescription>
              </Alert>
            )}

            {/* Execution Result */}
            {showResult && (
              <div className="space-y-3 pt-4 border-t-2 border-gray-200">
                <h4 className="font-semibold text-lg text-black flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Execution Result
                </h4>

                {/* Error Message */}
                {selectedScenario.errorMessage && (
                  <div>
                    <h5 className="font-semibold text-sm text-red-700 mb-1 flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      Error Message
                    </h5>
                    <code className="block bg-red-50 border border-red-300 text-red-800 px-3 py-2 rounded text-sm">
                      {selectedScenario.errorMessage}
                    </code>
                  </div>
                )}

                {/* Exit Code */}
                <div>
                  <h5 className="font-semibold text-sm text-gray-700 mb-1">Exit Code</h5>
                  <Badge className={
                    selectedScenario.exitCode === 0
                      ? "bg-green-100 text-green-800 border-green-300"
                      : "bg-red-100 text-red-800 border-red-300"
                  }>
                    {selectedScenario.exitCode}
                  </Badge>
                </div>

                {/* Affected Steps */}
                <div>
                  <h5 className="font-semibold text-sm text-gray-700 mb-2">Affected Execution Steps</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedScenario.affectedSteps.map((step) => (
                      <Badge key={step} variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                        Step {step}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Recovery Action */}
                <div>
                  <h5 className="font-semibold text-sm text-green-700 mb-2 flex items-center gap-2">
                    <ArrowRight className="w-4 h-4" />
                    Recovery Action
                  </h5>
                  <p className="text-sm text-gray-700 bg-green-50 border border-green-200 rounded px-3 py-2">
                    {selectedScenario.recoveryAction}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!selectedCategory && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="py-12 text-center text-gray-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-semibold mb-2">Select a Category to Begin</p>
            <p className="text-sm">
              Choose an error category above to explore different edge cases and error scenarios.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
