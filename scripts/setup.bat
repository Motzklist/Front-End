@echo off
setlocal enabledelayedexpansion enableextensions

REM ============================================
REM   CONFIGURATION
REM ============================================
REM Set to 1 to halt on port conflicts, 0 to warn and continue
set STRICT_MODE=0

REM Default port for Next.js dev server
set DEFAULT_PORT=3000

REM Cache file location
set CACHE_FILE=%~dp0.setup-cache
set SCRIPT_DIR=%~dp0

REM ============================================
REM   ENABLE VIRTUAL TERMINAL PROCESSING
REM ============================================
REM Try to enable ANSI color support (Windows 10+)
for /f "tokens=2 delims==" %%a in ('wmic os get Caption /value 2^>nul') do set OS_CAPTION=%%a
echo %OS_CAPTION% | findstr /i "Windows 10 Windows 11" >nul 2>&1
if not errorlevel 1 (
    REM Windows 10/11 detected - enable virtual terminal
    reg add HKCU\Console /v VirtualTerminalLevel /t REG_DWORD /d 1 /f >nul 2>&1
)

REM Create ESC character for ANSI codes
for /F %%a in ('echo prompt $E ^| cmd') do set "ESC=%%a"

REM Define color codes
set "RED=%ESC%[91m"
set "GREEN=%ESC%[92m"
set "YELLOW=%ESC%[93m"
set "BLUE=%ESC%[94m"
set "RESET=%ESC%[0m"

REM ============================================
REM   HELP
REM ============================================
if "%1"=="--help" goto :show_help
if "%1"=="-h" goto :show_help

REM ============================================
REM   PARSE PORT ARGUMENT
REM ============================================
set "PORT=%DEFAULT_PORT%"
if not "%1"=="" (
    set "PORT=%~1"
)

REM Validate PORT is numeric only (prevent command injection)
echo !PORT!| findstr /r "^[0-9][0-9]*$" >nul 2>&1
if errorlevel 1 (
    echo %RED%Error: Invalid port number "!PORT!".%RESET%
    echo Port must be a numeric value.
    exit /b 1
)

REM Validate PORT is in valid range (1-65535)
if !PORT! LSS 1 (
    echo %RED%Error: Port number must be at least 1.%RESET%
    exit /b 1
)
if !PORT! GTR 65535 (
    echo %RED%Error: Port number must be at most 65535.%RESET%
    exit /b 1
)

REM ============================================
REM   MAIN EXECUTION
REM ============================================
echo %BLUE%========================================%RESET%
echo %BLUE%   Next.js Project Setup%RESET%
echo %BLUE%========================================%RESET%
echo.

REM Check network connectivity
echo %YELLOW%[1/6]%RESET% Checking network connectivity...
ping 8.8.8.8 -n 1 -w 1000 >nul 2>&1
if errorlevel 1 (
    echo %YELLOW%Warning: No internet connection detected.%RESET%
    echo %YELLOW%You may need internet to install dependencies.%RESET%
    echo.
) else (
    echo %GREEN%Network connection OK%RESET%
    echo.
)

REM Check for Node.js
echo %YELLOW%[2/6]%RESET% Checking for Node.js...
where node >nul 2>&1
if errorlevel 1 (
    echo %RED%Error: Node.js is not installed.%RESET%
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Recommended: LTS version
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version 2^>nul') do set NODE_VERSION=%%i
echo %GREEN%Node.js found: %NODE_VERSION%%RESET%
echo.

REM Detect package managers (only those with lock files)
echo %YELLOW%[3/6]%RESET% Detecting package managers...
set PKG_COUNT=0
set PKG_MANAGERS=
cd /d "%SCRIPT_DIR%.."

REM Check for npm (package-lock.json)
if exist "package-lock.json" (
    where npm >nul 2>&1
    if not errorlevel 1 (
        set /a PKG_COUNT+=1
        set PKG_MANAGERS=!PKG_MANAGERS! npm
    )
)

REM Check for yarn (yarn.lock)
if exist "yarn.lock" (
    where yarn >nul 2>&1
    if not errorlevel 1 (
        set /a PKG_COUNT+=1
        set PKG_MANAGERS=!PKG_MANAGERS! yarn
    )
)

REM Check for pnpm (pnpm-lock.yaml)
if exist "pnpm-lock.yaml" (
    where pnpm >nul 2>&1
    if not errorlevel 1 (
        set /a PKG_COUNT+=1
        set PKG_MANAGERS=!PKG_MANAGERS! pnpm
    )
)

if %PKG_COUNT%==0 (
    echo %RED%Error: No compatible package manager found.%RESET%
    echo.
    echo Looking for lock files in project:
    if exist "package-lock.json" echo   - package-lock.json found ^(need npm^)
    if exist "yarn.lock" echo   - yarn.lock found ^(need yarn^)
    if exist "pnpm-lock.yaml" echo   - pnpm-lock.yaml found ^(need pnpm^)
    if not exist "package-lock.json" if not exist "yarn.lock" if not exist "pnpm-lock.yaml" echo   - No lock files found
    echo.
    echo Install the required package manager:
    echo   npm:  Comes with Node.js from https://nodejs.org/
    echo   yarn: npm install -g yarn
    echo   pnpm: npm install -g pnpm
    exit /b 1
)

REM Check cache or prompt for selection
set SELECTED_PKG_MANAGER=
if exist "%CACHE_FILE%" (
    set /p SELECTED_PKG_MANAGER=<"%CACHE_FILE%"
    echo %GREEN%Using cached package manager: !SELECTED_PKG_MANAGER!%RESET%
    echo.
) else (
    if %PKG_COUNT%==1 (
        for %%p in (%PKG_MANAGERS%) do set SELECTED_PKG_MANAGER=%%p
        echo %GREEN%Found package manager: !SELECTED_PKG_MANAGER!%RESET%
        echo !SELECTED_PKG_MANAGER!>"%CACHE_FILE%"
        echo.
    ) else (
        echo Multiple package managers found. Select one:
        set IDX=1
        for %%p in (%PKG_MANAGERS%) do (
            echo   !IDX!. %%p
            set /a IDX+=1
        )
        echo.
        set /p CHOICE="Enter selection (1-%PKG_COUNT%): "

        set IDX=1
        for %%p in (%PKG_MANAGERS%) do (
            if "!CHOICE!"=="!IDX!" (
                set SELECTED_PKG_MANAGER=%%p
                echo !SELECTED_PKG_MANAGER!>"%CACHE_FILE%"
            )
            set /a IDX+=1
        )

        if "!SELECTED_PKG_MANAGER!"=="" (
            echo %RED%Invalid selection.%RESET%
            exit /b 1
        )
        echo %GREEN%Selected: !SELECTED_PKG_MANAGER!%RESET%
        echo.
    )
)

REM Check for node_modules and install dependencies
echo %YELLOW%[4/6]%RESET% Checking dependencies...
if not exist "node_modules\" (
    echo %YELLOW%Dependencies not installed.%RESET%
    set /p INSTALL_DEPS="Install dependencies with !SELECTED_PKG_MANAGER!? (y/n): "
    if /i "!INSTALL_DEPS!"=="y" (
        echo.
        echo %BLUE%Running: !SELECTED_PKG_MANAGER! install%RESET%
        echo.
        call !SELECTED_PKG_MANAGER! install
        if errorlevel 1 (
            echo %RED%Failed to install dependencies.%RESET%
            exit /b 1
        )
        echo.
        echo %GREEN%Dependencies installed successfully.%RESET%
        echo.
    ) else (
        echo %YELLOW%Skipping dependency installation.%RESET%
        echo.
    )
) else (
    echo %GREEN%Dependencies already installed.%RESET%
    echo.
)

REM Check if port is available
echo %YELLOW%[5/6]%RESET% Checking port %PORT%...
powershell -Command "Get-NetTCPConnection -LocalPort ([int]%PORT%) -ErrorAction SilentlyContinue" >nul 2>&1
if not errorlevel 1 (
    echo %YELLOW%Warning: Port %PORT% is already in use.%RESET%
    if %STRICT_MODE%==1 (
        echo %RED%STRICT_MODE is enabled. Cannot start server.%RESET%
        echo.
        echo To change this behavior, edit STRICT_MODE in %~nx0
        exit /b 1
    ) else (
        echo %YELLOW%Attempting to start server anyway...%RESET%
        echo %YELLOW%The server may assign a different port.%RESET%
        echo.
    )
) else (
    echo %GREEN%Port %PORT% is available.%RESET%
    echo.
)

REM Start the development server
echo %YELLOW%[6/6]%RESET% Starting development server...
set "DISPLAY_CMD="
if "!SELECTED_PKG_MANAGER!"=="npm" (
    set "DISPLAY_CMD=npm run dev -- -p %PORT%"
) else if "!SELECTED_PKG_MANAGER!"=="yarn" (
    set "DISPLAY_CMD=yarn dev -p %PORT%"
) else if "!SELECTED_PKG_MANAGER!"=="pnpm" (
    set "DISPLAY_CMD=pnpm dev -p %PORT%"
)
echo %BLUE%Running: !DISPLAY_CMD%%RESET%
echo.
echo %GREEN%Server starting... Press Ctrl+C to stop.%RESET%
echo.

if "!SELECTED_PKG_MANAGER!"=="npm" (
    call npm run dev -- -p %PORT%
) else if "!SELECTED_PKG_MANAGER!"=="yarn" (
    call yarn dev -p %PORT%
) else if "!SELECTED_PKG_MANAGER!"=="pnpm" (
    call pnpm dev -p %PORT%
)

exit /b 0

REM ============================================
REM   HELP FUNCTION
REM ============================================
:show_help
echo.
echo USAGE:
echo   setup.bat [PORT] [--help]
echo.
echo ARGUMENTS:
echo   PORT        Port number for dev server (default: 3000)
echo   --help, -h  Show this help message
echo.
echo EXAMPLES:
echo   setup.bat           Start on default port 3000
echo   setup.bat 3001      Start on port 3001
echo.
echo CONFIGURATION:
echo   STRICT_MODE  Edit at top of script. 0=warn on port conflict, 1=halt
echo   Cache file   scripts\.setup-cache stores package manager choice
echo   Clear cache  Delete scripts\.setup-cache to re-select package manager
echo.
exit /b 0

