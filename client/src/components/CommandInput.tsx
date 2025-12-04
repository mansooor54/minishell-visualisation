import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { parseCommand, ParsedCommand } from "@/lib/commandParser";
import { Terminal, AlertCircle, CheckCircle2, Lightbulb } from "lucide-react";

interface CommandInputProps {
  onCommandSubmit: (parsed: ParsedCommand) => void;
}

const EXAMPLE_COMMANDS = [
  { label: "Simple command", cmd: "ls -la" },
  { label: "Built-in", cmd: "cd /home" },
  { label: "Pipe", cmd: "cat file.txt | grep text" },
  { label: "Redirection", cmd: "echo hello > output.txt" },
  { label: "Heredoc", cmd: "cat << EOF" },
  { label: "Complex", cmd: "export VAR=value && echo $VAR | grep value > result.txt" },
];

export default function CommandInput({ onCommandSubmit }: CommandInputProps) {
  const [input, setInput] = useState("");
  const [parsed, setParsed] = useState<ParsedCommand | null>(null);
  const [showExamples, setShowExamples] = useState(false);

  const handleInputChange = (value: string) => {
    setInput(value);
    if (value.trim()) {
      const result = parseCommand(value);
      setParsed(result);
    } else {
      setParsed(null);
    }
  };

  const handleSubmit = () => {
    if (parsed && parsed.isValid) {
      onCommandSubmit(parsed);
    }
  };

  const handleExampleClick = (cmd: string) => {
    setInput(cmd);
    handleInputChange(cmd);
    setShowExamples(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && parsed?.isValid) {
      handleSubmit();
    }
  };

  return (
    <Card className="p-6 bg-card border-border">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Terminal className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-primary">Command Input</h2>
        </div>

        {/* Input Field */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              type="text"
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter a shell command (e.g., cat file.txt | grep text)"
              className="font-mono text-sm bg-muted border-border text-foreground pr-10"
            />
            {parsed && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {parsed.isValid ? (
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
              </div>
            )}
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!parsed?.isValid}
            variant="default"
          >
            Process
          </Button>
        </div>

        {/* Validation Message */}
        {parsed && !parsed.isValid && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded text-sm">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
            <div className="text-destructive">
              <strong>Error:</strong> {parsed.error}
            </div>
          </div>
        )}

        {/* Parsed Command Info */}
        {parsed && parsed.isValid && (
          <div className="space-y-3 p-4 bg-muted/50 border border-border rounded">
            <div className="flex items-center gap-2 text-sm font-bold text-accent">
              <CheckCircle2 className="h-4 w-4" />
              <span>Parsed Command Structure</span>
            </div>

            {parsed.commands.map((cmd, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Command {idx + 1}:</span>
                  <span className="font-bold text-foreground">{cmd.name}</span>
                  {cmd.isBuiltIn && (
                    <span className="px-2 py-0.5 bg-primary/20 text-primary rounded text-[10px] font-bold">
                      BUILT-IN
                    </span>
                  )}
                </div>
                {cmd.args.length > 0 && (
                  <div className="text-muted-foreground ml-4">
                    Args: {cmd.args.join(", ")}
                  </div>
                )}
                {cmd.redirections.length > 0 && (
                  <div className="text-accent ml-4">
                    Redirections:{" "}
                    {cmd.redirections.map((r) => `${r.type} ${r.target}`).join(", ")}
                  </div>
                )}
              </div>
            ))}

            <div className="flex gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
              {parsed.hasPipes && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-accent rounded-full"></span>
                  Pipes detected
                </span>
              )}
              {parsed.hasRedirection && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-accent rounded-full"></span>
                  Redirections detected
                </span>
              )}
              {parsed.hasHeredoc && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-accent rounded-full"></span>
                  Heredoc detected
                </span>
              )}
            </div>
          </div>
        )}

        {/* Examples */}
        <div className="pt-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowExamples(!showExamples)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            <Lightbulb className="h-3 w-3 mr-1" />
            {showExamples ? "Hide" : "Show"} Example Commands
          </Button>

          {showExamples && (
            <div className="grid grid-cols-2 gap-2 mt-3">
              {EXAMPLE_COMMANDS.map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => handleExampleClick(example.cmd)}
                  className="text-left p-2 bg-muted hover:bg-muted/70 border border-border rounded text-xs transition-colors"
                >
                  <div className="font-bold text-accent mb-1">{example.label}</div>
                  <code className="text-foreground text-[10px]">{example.cmd}</code>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
