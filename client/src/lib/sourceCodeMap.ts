// Mapping of execution steps to their corresponding source code files and functions
export interface SourceCodeInfo {
  step: number;
  stepName: string;
  files: {
    path: string;
    displayName: string;
    functions: string[];
    description: string;
  }[];
}

export const sourceCodeMap: SourceCodeInfo[] = [
  {
    step: 0,
    stepName: "START: main()",
    files: [
      {
        path: "/source/main/main.c",
        displayName: "src/main/main.c",
        functions: ["main"],
        description: "Entry point: Initialize shell, setup signals, run main loop"
      }
    ]
  },
  {
    step: 1,
    stepName: "init_shell()",
    files: [
      {
        path: "/source/core/shell_utils.c",
        displayName: "src/core/shell_utils.c",
        functions: ["init_shell", "init_env"],
        description: "Initialize shell structure with environment variables"
      },
      {
        path: "/source/environment/env_utils.c",
        displayName: "src/environment/env_utils.c",
        functions: ["copy_env", "get_env_value"],
        description: "Environment variable management utilities"
      }
    ]
  },
  {
    step: 2,
    stepName: "setup_signals()",
    files: [
      {
        path: "/source/signals/signals.c",
        displayName: "src/signals/signals.c",
        functions: ["setup_signals", "handle_sigint", "handle_sigquit"],
        description: "Configure signal handlers for SIGINT (Ctrl+C) and SIGQUIT (Ctrl+\\)"
      }
    ]
  },
  {
    step: 3,
    stepName: "history_init()",
    files: [
      {
        path: "/source/history/history.c",
        displayName: "src/history/history.c",
        functions: ["history_init", "history_load", "get_history_path"],
        description: "Initialize command history from ~/.minishell_history file"
      }
    ]
  },
  {
    step: 4,
    stepName: "shell_loop()",
    files: [
      {
        path: "/source/core/shell_loop.c",
        displayName: "src/core/shell_loop.c",
        functions: ["shell_loop", "process_line"],
        description: "Main REPL loop: Read, Evaluate, Print, Loop"
      }
    ]
  },
  {
    step: 5,
    stepName: "read_logical_line()",
    files: [
      {
        path: "/source/core/read_logical_line.c",
        displayName: "src/core/read_logical_line.c",
        functions: ["read_logical_line", "read_continuation"],
        description: "Read user input using readline library with prompt"
      },
      {
        path: "/source/core/join_continuation.c",
        displayName: "src/core/join_continuation.c",
        functions: ["join_continuation_lines"],
        description: "Handle multi-line input with backslash continuation"
      }
    ]
  },
  {
    step: 6,
    stepName: "Empty line check",
    files: [
      {
        path: "/source/core/shell_loop.c",
        displayName: "src/core/shell_loop.c",
        functions: ["is_empty_line", "is_whitespace_only"],
        description: "Check if line is NULL (EOF) or empty/whitespace only"
      }
    ]
  },
  {
    step: 7,
    stepName: "history_add_line()",
    files: [
      {
        path: "/source/history/history.c",
        displayName: "src/history/history.c",
        functions: ["history_add_line", "add_history"],
        description: "Add non-empty line to command history"
      }
    ]
  },
  {
    step: 8,
    stepName: "process_line()",
    files: [
      {
        path: "/source/core/shell_loop.c",
        displayName: "src/core/shell_loop.c",
        functions: ["process_line"],
        description: "Main processing: tokenize → parse → expand → execute"
      }
    ]
  },
  {
    step: 9,
    stepName: "check_unclosed_quotes()",
    files: [
      {
        path: "/source/lexer/lexer_unclose.c",
        displayName: "src/lexer/lexer_unclose.c",
        functions: ["check_unclosed_quotes", "find_matching_quote"],
        description: "Validate quote pairing before tokenization"
      }
    ]
  },
  {
    step: 10,
    stepName: "lexer()",
    files: [
      {
        path: "/source/lexer/lexer.c",
        displayName: "src/lexer/lexer.c",
        functions: ["lexer", "tokenize_input", "create_token"],
        description: "Tokenize input into tokens (words, operators, redirections)"
      },
      {
        path: "/source/lexer/lexer_operator.c",
        displayName: "src/lexer/lexer_operator.c",
        functions: ["handle_operator", "get_operator_type"],
        description: "Handle operators (|, ||, &&, ;, <, >, <<, >>)"
      }
    ]
  },
  {
    step: 11,
    stepName: "validate_syntax()",
    files: [
      {
        path: "/source/parser/parser_syntax_check.c",
        displayName: "src/parser/parser_syntax_check.c",
        functions: ["validate_syntax", "check_operator_syntax"],
        description: "Check for syntax errors (invalid operators, unclosed quotes)"
      },
      {
        path: "/source/parser/parser_error.c",
        displayName: "src/parser/parser_error.c",
        functions: ["syntax_error", "print_syntax_error"],
        description: "Report syntax errors with appropriate messages"
      }
    ]
  },
  {
    step: 12,
    stepName: "parser()",
    files: [
      {
        path: "/source/parser/parser.c",
        displayName: "src/parser/parser.c",
        functions: ["parser", "parse_pipeline", "build_ast"],
        description: "Build pipeline structure from token list"
      },
      {
        path: "/source/parser/parser_pipeline.c",
        displayName: "src/parser/parser_pipeline.c",
        functions: ["create_pipeline", "add_command_to_pipeline"],
        description: "Create and manage pipeline data structures"
      }
    ]
  },
  {
    step: 13,
    stepName: "expander()",
    files: [
      {
        path: "/source/expander/expander_core.c",
        displayName: "src/expander/expander_core.c",
        functions: ["expander", "expand_variables", "expand_wildcards"],
        description: "Expand variables ($VAR, $?), remove quotes, handle wildcards"
      },
      {
        path: "/source/expander/expander_quotes.c",
        displayName: "src/expander/expander_quotes.c",
        functions: ["remove_quotes", "handle_quote_expansion"],
        description: "Handle quote removal and expansion within quotes"
      }
    ]
  },
  {
    step: 14,
    stepName: "executor()",
    files: [
      {
        path: "/source/executor/executor.c",
        displayName: "src/executor/executor.c",
        functions: ["executor", "execute_pipeline", "setup_pipes"],
        description: "Execute pipeline: setup pipes, fork processes, run commands"
      },
      {
        path: "/source/executor/executor_commands.c",
        displayName: "src/executor/executor_commands.c",
        functions: ["execute_command", "setup_redirections"],
        description: "Execute individual commands with redirections"
      }
    ]
  },
  {
    step: 15,
    stepName: "Is built-in?",
    files: [
      {
        path: "/source/executor/executor_commands.c",
        displayName: "src/executor/executor_commands.c",
        functions: ["is_builtin", "get_builtin_type"],
        description: "Check if command is a shell built-in"
      }
    ]
  },
  {
    step: 16,
    stepName: "execute_builtin()",
    files: [
      {
        path: "/source/builtins/builtin_cd.c",
        displayName: "src/builtins/builtin_cd.c",
        functions: ["builtin_cd", "change_directory"],
        description: "Built-in: cd - Change directory"
      },
      {
        path: "/source/builtins/builtin_echo.c",
        displayName: "src/builtins/builtin_echo.c",
        functions: ["builtin_echo"],
        description: "Built-in: echo - Print arguments"
      },
      {
        path: "/source/builtins/builtin_exit.c",
        displayName: "src/builtins/builtin_exit.c",
        functions: ["builtin_exit", "parse_exit_arg"],
        description: "Built-in: exit - Exit shell with status code"
      }
    ]
  },
  {
    step: 17,
    stepName: "execute_external()",
    files: [
      {
        path: "/source/executor/executor_child_run.c",
        displayName: "src/executor/executor_child_run.c",
        functions: ["execute_external", "find_executable_path"],
        description: "Fork child process and execute external command via execve()"
      },
      {
        path: "/source/executor/executor_child_fds.c",
        displayName: "src/executor/executor_child_fds.c",
        functions: ["setup_child_fds", "dup_file_descriptors"],
        description: "Setup file descriptors for child process"
      }
    ]
  },
  {
    step: 18,
    stepName: "wait_pipeline()",
    files: [
      {
        path: "/source/executor/executor.c",
        displayName: "src/executor/executor.c",
        functions: ["wait_pipeline", "wait_for_children"],
        description: "Wait for all child processes to complete"
      }
    ]
  },
  {
    step: 19,
    stepName: "free_pipeline()",
    files: [
      {
        path: "/source/parser/parser.c",
        displayName: "src/parser/parser.c",
        functions: ["free_pipeline", "free_command", "free_tokens"],
        description: "Free all allocated memory for pipeline structure"
      },
      {
        path: "/source/utils/memory_utils.c",
        displayName: "src/utils/memory_utils.c",
        functions: ["safe_free", "free_string_array"],
        description: "Memory management utilities"
      }
    ]
  },
  {
    step: 20,
    stepName: "LOOP BACK",
    files: [
      {
        path: "/source/core/shell_loop.c",
        displayName: "src/core/shell_loop.c",
        functions: ["shell_loop"],
        description: "Return to shell_loop() for next command"
      }
    ]
  }
];

// Helper function to get source code info for a specific step
export function getSourceCodeForStep(step: number): SourceCodeInfo | undefined {
  return sourceCodeMap.find(item => item.step === step);
}

// Helper function to get all unique file paths
export function getAllSourceFiles(): string[] {
  const files = new Set<string>();
  sourceCodeMap.forEach(item => {
    item.files.forEach(file => files.add(file.path));
  });
  return Array.from(files);
}
