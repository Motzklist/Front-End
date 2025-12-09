#!/bin/bash

# ============================================
#   CONFIGURATION
# ============================================
# Set to 1 to halt on port conflicts, 0 to warn and continue
STRICT_MODE=0

# Default port for Next.js dev server
DEFAULT_PORT=3000

# Cache file location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CACHE_FILE="$SCRIPT_DIR/.setup-cache"

# ============================================
#   COLOR CODES
# ============================================
RED='\033[0;91m'
GREEN='\033[0;92m'
YELLOW='\033[0;93m'
BLUE='\033[0;94m'
RESET='\033[0m'

# ============================================
#   HELP
# ============================================
show_help() {
    echo ""
    echo "USAGE:"
    echo "  ./setup.sh [PORT] [--help]"
    echo ""
    echo "ARGUMENTS:"
    echo "  PORT        Port number for dev server (default: 3000)"
    echo "  --help, -h  Show this help message"
    echo ""
    echo "EXAMPLES:"
    echo "  ./setup.sh          Start on default port 3000"
    echo "  ./setup.sh 3001     Start on port 3001"
    echo ""
    echo "CONFIGURATION:"
    echo "  STRICT_MODE  Edit at top of script. 0=warn on port conflict, 1=halt"
    echo "  Cache file   scripts/.setup-cache stores package manager choice"
    echo "  Clear cache  Delete scripts/.setup-cache to re-select package manager"
    echo ""
    exit 0
}

if [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
    show_help
fi

# ============================================
#   PARSE PORT ARGUMENT
# ============================================
PORT=${1:-$DEFAULT_PORT}

# Validate PORT is numeric only (prevent command injection)
if ! [[ "$PORT" =~ ^[0-9]+$ ]]; then
    echo -e "${RED}Error: Invalid port number \"$PORT\".${RESET}"
    echo "Port must be a numeric value."
    exit 1
fi

# Validate PORT is in valid range (1-65535)
if [ "$PORT" -lt 1 ] || [ "$PORT" -gt 65535 ]; then
    echo -e "${RED}Error: Port number must be between 1 and 65535.${RESET}"
    exit 1
fi

# ============================================
#   MAIN EXECUTION
# ============================================
echo -e "${BLUE}========================================${RESET}"
echo -e "${BLUE}   Next.js Project Setup${RESET}"
echo -e "${BLUE}========================================${RESET}"
echo ""

# Check network connectivity
echo -e "${YELLOW}[1/6]${RESET} Checking network connectivity..."
if ping -c 1 -W 1 8.8.8.8 >/dev/null 2>&1 || ping -c 1 -W 1 1.1.1.1 >/dev/null 2>&1; then
    echo -e "${GREEN}Network connection OK${RESET}"
    echo ""
else
    echo -e "${YELLOW}Warning: No internet connection detected.${RESET}"
    echo -e "${YELLOW}You may need internet to install dependencies.${RESET}"
    echo ""
fi

# Check for Node.js
echo -e "${YELLOW}[2/6]${RESET} Checking for Node.js..."
if ! command -v node >/dev/null 2>&1; then
    echo -e "${RED}Error: Node.js is not installed.${RESET}"
    echo ""
    echo "Please install Node.js from: https://nodejs.org/"
    echo "Recommended: LTS version"
    exit 1
fi

NODE_VERSION=$(node --version)
echo -e "${GREEN}Node.js found: $NODE_VERSION${RESET}"
echo ""

# Detect package managers (only those with lock files)
echo -e "${YELLOW}[3/6]${RESET} Detecting package managers..."
PKG_MANAGERS=()
cd "$SCRIPT_DIR/.."

# Check for npm (package-lock.json)
if [ -f "package-lock.json" ]; then
    if command -v npm >/dev/null 2>&1; then
        PKG_MANAGERS+=("npm")
    fi
fi

# Check for yarn (yarn.lock)
if [ -f "yarn.lock" ]; then
    if command -v yarn >/dev/null 2>&1; then
        PKG_MANAGERS+=("yarn")
    fi
fi

# Check for pnpm (pnpm-lock.yaml)
if [ -f "pnpm-lock.yaml" ]; then
    if command -v pnpm >/dev/null 2>&1; then
        PKG_MANAGERS+=("pnpm")
    fi
fi

PKG_COUNT=${#PKG_MANAGERS[@]}

if [ $PKG_COUNT -eq 0 ]; then
    echo -e "${RED}Error: No compatible package manager found.${RESET}"
    echo ""
    echo "Looking for lock files in project:"
    [ -f "package-lock.json" ] && echo "  - package-lock.json found (need npm)"
    [ -f "yarn.lock" ] && echo "  - yarn.lock found (need yarn)"
    [ -f "pnpm-lock.yaml" ] && echo "  - pnpm-lock.yaml found (need pnpm)"
    [ ! -f "package-lock.json" ] && [ ! -f "yarn.lock" ] && [ ! -f "pnpm-lock.yaml" ] && echo "  - No lock files found"
    echo ""
    echo "Install the required package manager:"
    echo "  npm:  Comes with Node.js from https://nodejs.org/"
    echo "  yarn: npm install -g yarn"
    echo "  pnpm: npm install -g pnpm"
    exit 1
fi

# Check cache or prompt for selection
SELECTED_PKG_MANAGER=""
if [ -f "$CACHE_FILE" ]; then
    SELECTED_PKG_MANAGER=$(cat "$CACHE_FILE")
    echo -e "${GREEN}Using cached package manager: $SELECTED_PKG_MANAGER${RESET}"
    echo ""
else
    if [ $PKG_COUNT -eq 1 ]; then
        SELECTED_PKG_MANAGER="${PKG_MANAGERS[0]}"
        echo -e "${GREEN}Found package manager: $SELECTED_PKG_MANAGER${RESET}"
        echo "$SELECTED_PKG_MANAGER" > "$CACHE_FILE"
        echo ""
    else
        echo "Multiple package managers found. Select one:"
        for i in "${!PKG_MANAGERS[@]}"; do
            echo "  $((i+1)). ${PKG_MANAGERS[$i]}"
        done
        echo ""
        read -p "Enter selection (1-$PKG_COUNT): " CHOICE

        IDX=$((CHOICE-1))
        if [ $IDX -ge 0 ] && [ $IDX -lt $PKG_COUNT ]; then
            SELECTED_PKG_MANAGER="${PKG_MANAGERS[$IDX]}"
            echo "$SELECTED_PKG_MANAGER" > "$CACHE_FILE"
            echo -e "${GREEN}Selected: $SELECTED_PKG_MANAGER${RESET}"
            echo ""
        else
            echo -e "${RED}Invalid selection.${RESET}"
            exit 1
        fi
    fi
fi

# Check for node_modules and install dependencies
echo -e "${YELLOW}[4/6]${RESET} Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Dependencies not installed.${RESET}"
    read -p "Install dependencies with $SELECTED_PKG_MANAGER? (y/n): " INSTALL_DEPS
    if [[ "$INSTALL_DEPS" =~ ^[Yy]$ ]]; then
        echo ""
        echo -e "${BLUE}Running: $SELECTED_PKG_MANAGER install${RESET}"
        echo ""
        $SELECTED_PKG_MANAGER install
        if [ $? -ne 0 ]; then
            echo -e "${RED}Failed to install dependencies.${RESET}"
            exit 1
        fi
        echo ""
        echo -e "${GREEN}Dependencies installed successfully.${RESET}"
        echo ""
    else
        echo -e "${YELLOW}Skipping dependency installation.${RESET}"
        echo ""
    fi
else
    echo -e "${GREEN}Dependencies already installed.${RESET}"
    echo ""
fi

# Check if port is available
echo -e "${YELLOW}[5/6]${RESET} Checking port $PORT..."
PORT_IN_USE=false

# Try lsof first (more reliable)
if command -v lsof >/dev/null 2>&1; then
    if lsof -i :"$PORT" >/dev/null 2>&1; then
        PORT_IN_USE=true
    fi
# Fallback to netstat
elif command -v netstat >/dev/null 2>&1; then
    if netstat -an | grep -E "[:.]$PORT\\s" | grep -q LISTEN; then
        PORT_IN_USE=true
    fi
# Fallback to ss (modern Linux)
elif command -v ss >/dev/null 2>&1; then
    if ss -ln | grep -E ":$PORT\\s" >/dev/null 2>&1; then
        PORT_IN_USE=true
    fi
fi

if [ "$PORT_IN_USE" = true ]; then
    echo -e "${YELLOW}Warning: Port $PORT is already in use.${RESET}"
    if [ $STRICT_MODE -eq 1 ]; then
        echo -e "${RED}STRICT_MODE is enabled. Cannot start server.${RESET}"
        echo ""
        echo "To change this behavior, edit STRICT_MODE in $(basename "$0")"
        exit 1
    else
        echo -e "${YELLOW}Attempting to start server anyway...${RESET}"
        echo -e "${YELLOW}The server may assign a different port.${RESET}"
        echo ""
    fi
else
    echo -e "${GREEN}Port $PORT is available.${RESET}"
    echo ""
fi

# Start the development server
echo -e "${YELLOW}[6/6]${RESET} Starting development server..."
echo -e "${BLUE}Running: $SELECTED_PKG_MANAGER run dev -p $PORT${RESET}"
echo ""
echo -e "${GREEN}Server starting... Press Ctrl+C to stop.${RESET}"
echo ""

case "$SELECTED_PKG_MANAGER" in
    npm)
        npm run dev -- -p "$PORT"
        ;;
    yarn)
        yarn dev -p "$PORT"
        ;;
    pnpm)
        pnpm dev -p "$PORT"
        ;;
esac

exit 0

