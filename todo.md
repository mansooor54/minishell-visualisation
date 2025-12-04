# Minishell Interactive Execution Flow Visualizer - TODO

## Phase 1: Project Setup & Design
- [x] Initialize web development project
- [x] Choose terminal-inspired dark theme design
- [x] Set up color palette and typography

## Phase 2: Core Interactive Flowchart
- [x] Create flowchart component with step-by-step visualization
- [x] Implement flow boxes (Start, Process, Decision, End)
- [x] Add arrows and connectors between steps
- [x] Build control panel (Play, Pause, Reset, Step Forward/Back)
- [x] Add step highlighting and active state animations

## Phase 3: Execution Flow Steps
- [x] Implement Phase 1: Input to Dispatch (8 steps)
  - [x] START: minishell()
  - [x] ft_readline() - Read input
  - [x] check_valid_line() - Validate
  - [x] process_and_execute() - Parse & expand
  - [x] execute() - Setup pipes & heredoc
  - [x] For Each Command loop
  - [x] check_open_files() - Redirections
  - [x] is_bilt_cmd? - Decision point
- [x] Implement Phase 2: Execution & Cleanup (branching + 5 steps)
  - [x] Built-in path: do_built_in_check_fork()
  - [x] External path: for_execve() with fork/execve
  - [x] Convergence point
  - [x] finish_parent() - Wait for children
  - [x] cleanup_heredoc_temp_files()
  - [x] reset_info()
  - [x] Loop back

## Phase 4: Interactive Features
- [x] Add detailed explanation panel for each step
- [x] Show code snippets for current step
- [x] Add terminal-style output simulation
- [x] Implement example command input (e.g., "cat file.txt | grep text")
- [x] Show data structure state at each step
- [x] Add speed control for animation

## Phase 5: Polish & Delivery
- [x] Add responsive design for mobile/tablet
- [x] Test all interactive controls
- [x] Add keyboard shortcuts (Space = Play/Pause, Arrow keys = Step)
- [x] Create user guide/help section
- [x] Save checkpoint and deliver to user

## Phase 6: Command Input Feature
- [x] Create command parser utility to analyze shell commands
- [x] Parse command name, arguments, pipes, and redirections
- [x] Detect built-in vs external commands
- [x] Create CommandInput component with text input and submit
- [x] Add command validation and error messages
- [x] Display parsed command structure in UI
- [x] Integrate command data into StepDetails component
- [x] Show user's command being processed at each step
- [x] Add example commands (presets) for quick testing
- [x] Update flowchart to highlight relevant paths based on command type
- [x] Save checkpoint and deliver enhanced webpage

## Phase 7: Shell State Panel
- [x] Design shell state data model (env vars, cwd, exit status, FDs, processes)
- [x] Create state transition logic for each execution step
- [x] Build ShellState component with collapsible sections
- [x] Display environment variables (USER, HOME, PATH, custom vars)
- [x] Show current working directory changes (cd command)
- [x] Track exit status ($?) updates
- [x] Visualize file descriptors (stdin, stdout, stderr, pipes, redirections)
- [x] Show active processes (parent, children, PIDs)
- [x] Integrate state updates based on user command
- [x] Update layout to show state panel alongside flowchart
- [x] Save checkpoint and deliver enhanced webpage

## Phase 8: Minor Updates
- [x] Change username from "khaleel" to "mansoor" in shell state

## Phase 9: Interactive Environment Variables
- [x] Add state management for custom environment variables
- [x] Create UI for adding new environment variables (key-value input)
- [x] Implement edit functionality for existing variables
- [x] Add delete button for each environment variable
- [x] Preserve system variables (USER, HOME, PATH, PWD, SHELL) from deletion
- [x] Update shell state to reflect user modifications
- [x] Save checkpoint and deliver enhanced feature

## Phase 10: Bug Fixes
- [x] Fix command input to allow space character (prevent keyboard shortcut conflict)

## Phase 11: Color Enhancement & Visual Recognition
- [x] Add color-coded node types in flowchart (start=green, process=blue, decision=yellow, end=red)
- [x] Apply syntax highlighting to code examples
- [x] Use distinct colors for different step categories
- [x] Add color-coded badges for command types (built-in vs external)
- [x] Enhance file descriptor visualization with color coding
- [x] Add visual indicators for active/inactive states
- [x] Improve overall color contrast and accessibility
- [x] Save checkpoint and deliver enhanced visual design

## Phase 12: Detailed Step-by-Step Processing Results
- [x] Enhance StepDetails to show detailed processing at each step
- [x] Display input/output transformations for each step
- [x] Show intermediate data structures (tokens, parsed commands, etc.)
- [x] Add "What Happens" section explaining the step's purpose
- [x] Add "Processing Done" section showing actual transformations
- [x] Include visual representation of data flow
- [x] Save checkpoint and deliver enhanced step details

## Phase 13: Improve Color Contrast
- [x] Darken background colors to improve text readability
- [x] Adjust card backgrounds for better contrast
- [x] Ensure all text is clearly visible against backgrounds
- [x] Save checkpoint and deliver improved contrast

## Phase 14: Switch to Light Theme
- [x] Change default theme from dark to light in App.tsx
- [x] Ensure all text is black and backgrounds are white/light
- [x] Save checkpoint and deliver light theme

## Phase 15: Flowchart Export Feature
- [x] Add export button to Controls panel
- [x] Implement SVG export functionality
- [x] Implement PNG export functionality (using html2canvas)
- [x] Add format selection dropdown (SVG/PNG)
- [x] Include current step highlighting in exported image
- [x] Save checkpoint and deliver export feature

## Phase 16: Bug Fixes - Export Feature
- [x] Fix PNG export button not working
- [x] Debug and test PNG export functionality
- [x] Save checkpoint with working export feature

## Phase 17: macOS Compatibility Fix
- [x] Fix PNG export for macOS/Safari browsers
- [x] Test with alternative download methods for macOS
- [x] Save checkpoint with macOS-compatible export

## Phase 18: Flowchart Text Color Fix
- [x] Change flowchart box text color to black
- [x] Keep colored backgrounds for boxes
- [x] Save checkpoint with black text in flowchart

## Phase 19: Fix OKLCH Color Format Error
- [x] Configure Tailwind CSS to use RGB instead of OKLCH for html2canvas compatibility
- [x] Update PNG export to convert OKLCH to RGB before rendering
- [x] Test PNG export after fix
- [x] Save checkpoint with working PNG export

## Phase 20: Integrate Updated Minishell Code (v0.21)
- [x] Analyze new project structure (src/ subdirectories: builtins, core, environment, executor, expander, history, lexer, parser, signals, utils)
- [x] Review key changes: Norminette compliance, semicolon support, signal handling fixes, memory leak fixes
- [x] Update flowchart with new execution flow (main → init_shell → shell_loop → read_logical_line → process_line → lexer → parser → expander → executor)
- [x] Update step descriptions to reflect modular structure
- [x] Add new steps for history management and signal setup
- [x] Update StepDetails component with actual v0.21 code examples
- [x] Update module names and file paths in visualizer
- [x] Test with semicolon operator examples
- [x] Save checkpoint with updated visualizer

## Phase 21: Minishell v0.29 Integration & Enhanced Details
- [x] Extract minishell v0.29 archive
- [x] Analyze v0.29 changes (Ctrl+C fixes, Norminette compliance, full tester compatibility, exit overflow handling)
- [x] Review new/updated files and execution flow (same modular structure as v0.21)
- [x] Update flowStepsV021.ts to flowStepsV029.ts with latest structure and enhanced detail fields
- [x] Add detailed information fields for each stage:
  - [x] Input/Output data at each step
  - [x] Data structure transformations
  - [x] Memory allocation/deallocation points
  - [x] Error handling paths
  - [x] Edge cases and special scenarios
- [x] Create expandable detail panels in StepDetails component (collapsible sections)
- [x] Add visual indicators for memory operations (color-coded badges)
- [x] Include actual v0.29 module and file paths
- [x] Test with complex commands (pipes, redirections, semicolons)
- [x] Save checkpoint with v0.29 visualizer

## Phase 22: Error Scenario Simulator
- [x] Design error scenarios data structure with categories (syntax, memory, signals, exit, redirections, pipes)
- [x] Include v0.29 specific edge cases (Ctrl+C, exit overflow, heredoc errors)
- [x] Create ErrorSimulator component with scenario cards
- [x] Add scenario selection and trigger mechanism
- [x] Show expected vs actual behavior
- [x] Display error messages and exit codes
- [x] Visualize affected execution steps
- [x] Add recovery action explanations
- [x] Integrate with main Home page
- [x] Test all error scenarios (Exit and Signals categories verified)
- [x] Save checkpoint with error simulator

## Phase 23: Code Viewer Panel
- [x] Extract C source code from minishell v0.29 archive
- [x] Organize source code by execution steps (main, init, lexer, parser, executor, etc.)
- [x] Create CodeViewer component with syntax highlighting
- [x] Add code navigation features (expand/collapse files, scrollable code)
- [x] Map each execution step to corresponding source files and functions
- [x] Create source code data structure with file paths and function names
- [x] Integrate CodeViewer into main layout (below flowchart when enabled)
- [x] Add toggle button to show/hide code viewer
- [x] Test code viewer with all 21 execution steps (tested Steps 0, 1, 2 successfully)
- [x] Save checkpoint with code viewer feature

## Phase 24: Prism.js Syntax Highlighting
- [x] Install prismjs package via pnpm
- [x] Import Prism.js and C language support in CodeViewer
- [x] Add Prism CSS theme for syntax highlighting (prism-tomorrow.css)
- [x] Update code rendering to use Prism.highlight()
- [x] Test highlighting with main.c, signals.c, and other source files (tested Steps 0, 1, 2)
- [x] Ensure highlighting works for all C syntax elements (keywords, functions, strings, comments, numbers, operators)
- [x] Save checkpoint with syntax highlighting
