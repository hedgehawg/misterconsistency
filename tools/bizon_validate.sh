#!/usr/bin/env bash
# BIZON post-upgrade validation: 2x RTX PRO 6000
# Usage: bash bizon_validate.sh [burn_seconds]   (default 1800 = 30 min)
# Runs config checks, a sustained dual-GPU burn, and a kernel-log scan.
# Everything is logged to ~/bizon_validation_<timestamp>.log and a PASS/FAIL
# summary is printed at the end.

BURN_SECS="${1:-1800}"
TS="$(date +%Y%m%d_%H%M%S)"
LOG="$HOME/bizon_validation_${TS}.log"
FAIL=0
note() { echo -e "$@" | tee -a "$LOG"; }

kmsg() {  # kernel log, best effort without assuming sudo works
  sudo -n dmesg 2>/dev/null || dmesg 2>/dev/null || journalctl -k --no-pager 2>/dev/null
}

note "=== BIZON VALIDATION $(date) — burn ${BURN_SECS}s ==="

# --- 1. GPU enumeration -----------------------------------------------------
note "\n--- nvidia-smi -L ---"
nvidia-smi -L 2>&1 | tee -a "$LOG"
GPUS=$(nvidia-smi -L 2>/dev/null | grep -c "RTX PRO 6000")
if [ "$GPUS" -ne 2 ]; then
  note "FAIL: expected 2x RTX PRO 6000, found ${GPUS}"
  FAIL=1
else
  note "OK: 2x RTX PRO 6000 present"
fi

note "\n--- nvidia-smi (full) ---"
nvidia-smi 2>&1 | tee -a "$LOG"
if nvidia-smi | grep -q "ERR!"; then
  note "FAIL: nvidia-smi shows ERR! sensor readings (the July failure signature)"
  FAIL=1
else
  note "OK: no ERR! readings at idle"
fi

note "\n--- driver / CUDA ---"
nvidia-smi --query-gpu=index,name,driver_version,memory.total,temperature.gpu,power.draw \
  --format=csv 2>&1 | tee -a "$LOG"

note "\n--- ECC aggregate baseline ---"
nvidia-smi -q -d ECC 2>/dev/null | grep -A4 "Aggregate" | tee -a "$LOG"

# --- 2. kernel-log baseline -------------------------------------------------
BASELINE=$(kmsg | grep -ciE "NVRM|Xid")
note "\nKernel NVRM/Xid lines before burn: ${BASELINE}"

# --- 3. locate or build gpu-burn -------------------------------------------
GB=""
for c in ./gpu_burn "$HOME/gpu-burn/gpu_burn" /opt/gpu-burn/gpu_burn /usr/local/bin/gpu_burn; do
  [ -x "$c" ] && GB="$c" && break
done
if [ -z "$GB" ]; then
  F=$(find "$HOME" /opt -maxdepth 3 -name gpu_burn -type f 2>/dev/null | head -1)
  [ -n "$F" ] && GB="$F"
fi
if [ -z "$GB" ]; then
  note "gpu_burn not found — cloning and building..."
  git clone -q https://github.com/wilicc/gpu-burn "$HOME/gpu-burn" 2>&1 | tee -a "$LOG"
  (cd "$HOME/gpu-burn" && make >>"$LOG" 2>&1) && GB="$HOME/gpu-burn/gpu_burn"
fi
if [ -z "$GB" ] || [ ! -x "$GB" ]; then
  note "FAIL: could not locate or build gpu_burn — stopping before burn."
  note "=== VERDICT: FAIL (setup) — log: $LOG ==="
  exit 1
fi
note "Using gpu_burn at: $GB"

# --- 4. temperature logger + burn ------------------------------------------
( while true; do
    nvidia-smi --query-gpu=index,temperature.gpu,power.draw,utilization.gpu \
      --format=csv,noheader >> "${LOG}.temps" 2>/dev/null
    sleep 30
  done ) & TLOG=$!

note "\n--- gpu-burn ${BURN_SECS}s on both GPUs (started $(date +%H:%M:%S)) ---"
(cd "$(dirname "$GB")" && "./$(basename "$GB")" "$BURN_SECS" 2>&1 | tee -a "$LOG" | tail -25)
BURN_RC=$?
kill $TLOG 2>/dev/null

# --- 5. post-burn analysis --------------------------------------------------
if grep -q "FAULTY" "$LOG"; then
  note "FAIL: gpu-burn flagged a FAULTY GPU"
  FAIL=1
fi
ERRLINES=$(grep -oE "errors: [0-9]+" "$LOG" | awk '{s+=$2} END {print s+0}')
note "gpu-burn cumulative reported errors: ${ERRLINES}"
[ "$ERRLINES" -gt 0 ] && { note "FAIL: gpu-burn reported compute errors"; FAIL=1; }
[ $BURN_RC -ne 0 ] && { note "FAIL: gpu_burn exited non-zero (${BURN_RC})"; FAIL=1; }

AFTER=$(kmsg | grep -ciE "NVRM|Xid")
note "Kernel NVRM/Xid lines after burn: ${AFTER} (baseline ${BASELINE})"
if [ "$AFTER" -gt "$BASELINE" ]; then
  note "FAIL: new NVRM/Xid kernel messages appeared during burn:"
  kmsg | grep -iE "NVRM|Xid" | tail -15 | tee -a "$LOG"
  FAIL=1
else
  note "OK: no new NVRM/Xid kernel messages"
fi

note "\n--- peak temps/power during burn ---"
sort -t, -k2 -rn "${LOG}.temps" 2>/dev/null | head -4 | tee -a "$LOG"

note "\n--- post-burn nvidia-smi ---"
nvidia-smi 2>&1 | tail -20 | tee -a "$LOG"
nvidia-smi | grep -q "ERR!" && { note "FAIL: ERR! readings after burn"; FAIL=1; }

note "\n--- ECC aggregate after ---"
nvidia-smi -q -d ECC 2>/dev/null | grep -A4 "Aggregate" | tee -a "$LOG"

# --- 6. verdict -------------------------------------------------------------
note "\n==============================================="
if [ "$FAIL" -eq 0 ]; then
  note "=== VERDICT: PASS — both GPUs survived ${BURN_SECS}s burn cleanly ==="
else
  note "=== VERDICT: FAIL — see items marked FAIL above ==="
fi
note "Full log: $LOG"
note "==============================================="
