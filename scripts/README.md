# Setup Scripts

Helper scripts to bootstrap the Next.js frontend. They handle dependency installation, port validation, and starting the dev server.

## Prerequisites

Before running the scripts, ensure you have:

* **Node.js:** [Download here](https://nodejs.org/) (LTS recommended).
* **Package Manager:** `npm` (included with Node), `yarn`, or `pnpm`.

> **Note:** The setup scripts support `npm`, `yarn`, and `pnpm`. If you encounter issues with `yarn` or `pnpm`, please use `npm` as a fallback.
## Quick Start

**Windows**
```cmd
cd scripts
setup.bat
```

**Linux/macOS**
```bash
cd scripts
chmod +x setup.sh  # First time only
./setup.sh
```

## Usage

```bash
./setup.sh [PORT] [FLAGS]
```

**Arguments:**
* `PORT` - Optional. Overrides default port 3000.
* `--help` - Shows help message.

**Examples:**
```bash
./setup.sh          # Start on default port 3000
./setup.sh 4000     # Start on port 4000
```

## Configuration

Settings can be toggled at the top of `setup.bat` or `setup.sh`.

### Strict Mode (`STRICT_MODE`)
* `0` (Default): If the port is busy, Next.js finds the next available one.
* `1`: The script exits if the port is busy. (Useful for CI/CD or strict backend mapping).

### Package Manager Cache
The script caches your choice (npm/yarn/pnpm) in `.setup-cache`.
To force a re-selection, delete the file:
```bash
rm scripts/.setup-cache
```

## Troubleshooting

* **"Node.js is not installed":** The script requires Node to run. See the [Prerequisites](#prerequisites) section.
* **"Port already in use":** The script will warn you. You can ignore it (and let Next.js find a free port) or specify a different port manually.
* **Connection Issues:** The script checks for internet connectivity to install packages. If you are offline but already have `node_modules`, the script will proceed anyway.