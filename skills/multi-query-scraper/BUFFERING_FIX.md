# Buffering Issue Fix

## Problem
Output buffering delays when running Python scripts, especially with subprocess calls.

## Solution
Use Python's `-u` (unbuffered) flag + flush=True in print statements.

## How to Run

```bash
# Option 1: Use the wrapper script
./run_kuliner.sh

# Option 2: Direct command with -u flag
python3 -u coba_kuliner.py

# Option 3: Unbuffered imports
PYTHONUNBUFFERED=1 python3 coba_kuliner.py
```

## Changes Made
1. Added `flush=True` to all print statements
2. Fixed async/await syntax in JavaScript (removed top-level async)
3. Added session cleanup with proper sleep delays
4. Created run_kuliner.sh wrapper with `-u` flag

## Result
- Immediate output display
- Better debugging visibility
- More responsive subprocess feedback
