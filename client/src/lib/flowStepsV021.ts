// Updated execution flow for minishell v0.21
// Reflects the new modular structure with separate directories for each component

export interface FlowStep {
  id: number;
  title: string;
  description: string;
  type: "start" | "process" | "decision" | "end";
  category: "control" | "parsing" | "execution" | "cleanup";
  module: string; // New: shows which source directory/module
  file: string; // New: shows the actual source file
}

export const flowStepsV021: FlowStep[] = [
  {
    id: 0,
    title: "START: main()",
    description: "Entry point: Initialize shell, setup signals, terminal, and history",
    type: "start",
    category: "control",
    module: "src/",
    file: "main.c"
  },
  {
    id: 1,
    title: "init_shell()",
    description: "Initialize shell structure with environment variables",
    type: "process",
    category: "control",
    module: "src/core/",
    file: "shell_utils.c"
  },
  {
    id: 2,
    title: "setup_signals()",
    description: "Configure signal handlers for SIGINT and SIGQUIT",
    type: "process",
    category: "control",
    module: "src/signals/",
    file: "signals.c"
  },
  {
    id: 3,
    title: "init_terminal()",
    description: "Disable ECHOCTL to prevent ^C display (bash-like behavior)",
    type: "process",
    category: "control",
    module: "src/core/",
    file: "shell_utils.c"
  },
  {
    id: 4,
    title: "shell_loop()",
    description: "Main REPL loop: Read, Evaluate, Print, Loop",
    type: "process",
    category: "control",
    module: "src/core/",
    file: "shell_loop.c"
  },
  {
    id: 5,
    title: "read_logical_line()",
    description: "Read user input using readline library",
    type: "process",
    category: "parsing",
    module: "src/core/",
    file: "read_logical_line.c"
  },
  {
    id: 6,
    title: "Empty line check",
    description: "Check if line is empty or all whitespace",
    type: "decision",
    category: "parsing",
    module: "src/core/",
    file: "shell_loop.c"
  },
  {
    id: 7,
    title: "history_add_line()",
    description: "Add non-empty line to command history",
    type: "process",
    category: "parsing",
    module: "src/history/",
    file: "history.c"
  },
  {
    id: 8,
    title: "process_line()",
    description: "Process the input line: tokenize, parse, expand, execute",
    type: "process",
    category: "parsing",
    module: "src/core/",
    file: "shell_utils.c"
  },
  {
    id: 9,
    title: "check_unclosed_quotes()",
    description: "Validate quote pairing before tokenization",
    type: "process",
    category: "parsing",
    module: "src/lexer/",
    file: "lexer_quotes.c"
  },
  {
    id: 10,
    title: "lexer()",
    description: "Tokenize input into tokens (words, operators, redirections)",
    type: "process",
    category: "parsing",
    module: "src/lexer/",
    file: "lexer.c"
  },
  {
    id: 11,
    title: "validate_syntax()",
    description: "Check for syntax errors (unclosed quotes, invalid operators)",
    type: "decision",
    category: "parsing",
    module: "src/parser/",
    file: "parser_syntax.c"
  },
  {
    id: 12,
    title: "parser()",
    description: "Build pipeline structure from tokens",
    type: "process",
    category: "parsing",
    module: "src/parser/",
    file: "parser.c"
  },
  {
    id: 13,
    title: "expander()",
    description: "Expand variables ($VAR, $?), remove quotes, handle wildcards",
    type: "process",
    category: "execution",
    module: "src/expander/",
    file: "expander.c"
  },
  {
    id: 14,
    title: "executor()",
    description: "Execute the pipeline: setup pipes, fork processes, run commands",
    type: "process",
    category: "execution",
    module: "src/executor/",
    file: "executor.c"
  },
  {
    id: 15,
    title: "Is built-in?",
    description: "Check if command is a shell built-in (cd, echo, export, etc.)",
    type: "decision",
    category: "execution",
    module: "src/executor/",
    file: "executor_commands.c"
  },
  {
    id: 16,
    title: "execute_builtin()",
    description: "Execute built-in command in parent process",
    type: "process",
    category: "execution",
    module: "src/builtins/",
    file: "builtins.c"
  },
  {
    id: 17,
    title: "execute_external()",
    description: "Fork child process and execute external command via execve()",
    type: "process",
    category: "execution",
    module: "src/executor/",
    file: "executor_external.c"
  },
  {
    id: 18,
    title: "wait_pipeline()",
    description: "Wait for all child processes to complete",
    type: "process",
    category: "cleanup",
    module: "src/executor/",
    file: "executor_pipeline.c"
  },
  {
    id: 19,
    title: "free_pipeline()",
    description: "Free all allocated memory for pipeline structure",
    type: "process",
    category: "cleanup",
    module: "src/parser/",
    file: "parser_free.c"
  },
  {
    id: 20,
    title: "LOOP BACK",
    description: "Return to shell_loop() for next command",
    type: "end",
    category: "control",
    module: "src/core/",
    file: "shell_loop.c"
  }
];
