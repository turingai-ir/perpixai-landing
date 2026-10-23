#!/usr/bin/env bash
# Prepare an ElevenLabs export for the site: trim trailing silence, normalise to -16 LUFS, mono 128k.
# Usage: scripts/prepare-voice.sh <input.mp3> <line-id>   (e.g. greet-1)
set -euo pipefail
in="$1"
id="$2"
out="$(dirname "$0")/../public/audio/fa/${id}.mp3"
ffmpeg -hide_banner -loglevel error -y -i "$in" \
  -af "areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.1,areverse,loudnorm=I=-16:TP=-1.5:LRA=11" \
  -ar 44100 -ac 1 -b:a 128k "$out"
echo "wrote $out"
