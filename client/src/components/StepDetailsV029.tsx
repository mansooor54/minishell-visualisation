import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Database, MemoryStick, AlertTriangle, Code2, FileCode } from "lucide-react";
import { flowStepsV029, FlowStepV029 } from "@/lib/flowStepsV029";
import { ParsedCommand } from "@/lib/commandParser";
import { useState } from "react";

interface StepDetailsV029Props {
  currentStep: number;
  userCommand: ParsedCommand | null;
}

export default function StepDetailsV029({ currentStep, userCommand }: StepDetailsV029Props) {
  const step = flowStepsV029[currentStep];
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    dataStructures: true,
    memoryOps: false,
    errorHandling: false,
    edgeCases: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      control: "bg-emerald-100 text-emerald-800 border-emerald-300",
      parsing: "bg-blue-100 text-blue-800 border-emerald-300",
      execution: "bg-purple-100 text-purple-800 border-purple-300",
      cleanup: "bg-orange-100 text-orange-800 border-orange-300",
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getTypeColor = (type: string) => {
    const colors = {
      start: "bg-green-100 text-green-800 border-green-300",
      process: "bg-blue-100 text-blue-800 border-blue-300",
      decision: "bg-yellow-100 text-yellow-800 border-yellow-300",
      end: "bg-red-100 text-red-800 border-red-300",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-4">
      {/* Main Step Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-xl font-bold text-black mb-2">
                Step {currentStep}: {step.title}
              </CardTitle>
              <p className="text-sm text-gray-700 mb-3">{step.description}</p>
              <div className="flex flex-wrap gap-2">
                <Badge className={getCategoryColor(step.category)}>
                  {step.category.toUpperCase()}
                </Badge>
                <Badge className={getTypeColor(step.type)}>
                  {step.type.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="bg-gray-50 text-gray-700">
                  <FileCode className="w-3 h-3 mr-1" />
                  {step.module}{step.file}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Input/Output Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-black flex items-center gap-2">
            <Code2 className="w-5 h-5" />
            Input & Output Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="font-semibold text-sm text-green-700 mb-1">📥 Input:</h4>
            <code className="block bg-green-50 border border-green-200 rounded px-3 py-2 text-sm text-black">
              {step.inputData}
            </code>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-blue-700 mb-1">📤 Output:</h4>
            <code className="block bg-blue-50 border border-blue-200 rounded px-3 py-2 text-sm text-black">
              {step.outputData}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Data Structures */}
      {step.dataStructures.length > 0 && (
        <Collapsible open={openSections.dataStructures} onOpenChange={() => toggleSection('dataStructures')}>
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                <CardTitle className="text-lg font-semibold text-black flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Data Structures ({step.dataStructures.length})
                  </span>
                  {openSections.dataStructures ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-3">
                {step.dataStructures.map((ds, idx) => (
                  <div key={idx} className="bg-purple-50 border border-purple-200 rounded p-3">
                    <h4 className="font-semibold text-sm text-purple-800 mb-1">{ds.name}</h4>
                    <p className="text-sm text-gray-700 mb-2">{ds.description}</p>
                    {ds.fields && ds.fields.length > 0 && (
                      <ul className="text-xs text-gray-600 space-y-1 ml-4">
                        {ds.fields.map((field, fidx) => (
                          <li key={fidx} className="list-disc">{field}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Memory Operations */}
      {step.memoryOperations.length > 0 && (
        <Collapsible open={openSections.memoryOps} onOpenChange={() => toggleSection('memoryOps')}>
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                <CardTitle className="text-lg font-semibold text-black flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <MemoryStick className="w-5 h-5" />
                    Memory Operations ({step.memoryOperations.length})
                  </span>
                  {openSections.memoryOps ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-2">
                {step.memoryOperations.map((mem, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded p-2">
                    <Badge variant="outline" className={
                      mem.type === 'malloc' ? 'bg-green-100 text-green-800' :
                      mem.type === 'free' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }>
                      {mem.type.toUpperCase()}
                    </Badge>
                    <span className="text-sm text-gray-700">{mem.description}</span>
                  </div>
                ))}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Error Handling */}
      {step.errorHandling.length > 0 && (
        <Collapsible open={openSections.errorHandling} onOpenChange={() => toggleSection('errorHandling')}>
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                <CardTitle className="text-lg font-semibold text-black flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Error Handling ({step.errorHandling.length})
                  </span>
                  {openSections.errorHandling ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-3">
                {step.errorHandling.map((err, idx) => (
                  <div key={idx} className="bg-red-50 border border-red-200 rounded p-3">
                    <h4 className="font-semibold text-sm text-red-800 mb-1">⚠️ {err.condition}</h4>
                    <p className="text-sm text-gray-700">→ {err.action}</p>
                  </div>
                ))}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Edge Cases */}
      {step.edgeCases.length > 0 && (
        <Collapsible open={openSections.edgeCases} onOpenChange={() => toggleSection('edgeCases')}>
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                <CardTitle className="text-lg font-semibold text-black flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    🎯 Edge Cases ({step.edgeCases.length})
                  </span>
                  {openSections.edgeCases ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <ul className="space-y-2">
                  {step.edgeCases.map((edge, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-orange-500 font-bold">•</span>
                      <span>{edge}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Related Functions */}
      {step.relatedFunctions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-black">
              🔗 Related Functions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {step.relatedFunctions.map((func, idx) => (
                <Badge key={idx} variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                  {func}()
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Command Context (if applicable) */}
      {userCommand && (
        <Card className="border-2 border-green-300 bg-green-50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-green-800">
              💡 Your Command: "{userCommand.raw}"
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-700 space-y-2">
            <p>At this step, your command is being processed as follows:</p>
            <ul className="list-disc ml-5 space-y-1">
              {currentStep <= 5 && <li>The shell is initializing and preparing to read your input</li>}
              {currentStep >= 6 && currentStep <= 9 && <li>Your input "{userCommand.raw}" is being validated</li>}
              {currentStep >= 10 && currentStep <= 12 && <li>Tokenizing and parsing: {userCommand.commands.length} command(s) detected</li>}
              {currentStep === 13 && <li>Expanding variables and wildcards in your command</li>}
              {currentStep >= 14 && currentStep <= 18 && (
                <>
                  <li>Executing: {userCommand.commands.map(c => c.name).join(' | ')}</li>
                  {userCommand.hasPipes && <li>Setting up {userCommand.commands.length - 1} pipe(s)</li>}
                  {userCommand.hasRedirection && <li>Handling redirections</li>}
                </>
              )}
              {currentStep >= 19 && <li>Cleaning up resources used by your command</li>}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
