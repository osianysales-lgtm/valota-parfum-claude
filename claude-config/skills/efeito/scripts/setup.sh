#!/usr/bin/env bash
# Instalação única da skill /efeito (chamada por: bash scripts/efeito setup). Pode rodar de novo à vontade.
# Funciona no Claude Code (Mac/Linux) e no Claude do navegador (máquina Linux na nuvem).
# Última linha: PRONTO | PRECISA_PYTHON
# Tudo vai para ~/.efeito: Python com MediaPipe, ffmpeg (se faltar), Node (se faltar) e o @napi-rs/canvas.
set -e
SKILL="$(cd "$(dirname "$0")/.." && pwd)"
FX="${EFEITO_HOME:-$HOME/.efeito}"; mkdir -p "$FX/bin"
export PATH="$FX/venv/bin:$FX/bin:$PATH"

ok() {
  local py; py="$(cat "$FX/python" 2>/dev/null)" || return 1
  [ -x "$py" ] && "$py" -c "import mediapipe, cv2, numpy, PIL" 2>/dev/null && command -v ffmpeg >/dev/null 2>&1 \
    && command -v node >/dev/null 2>&1 && [ -d "$FX/node/node_modules/@napi-rs/canvas" ]
}
if ok; then echo "PRONTO"; exit 0; fi
echo "Instalando (só na primeira vez, de 2 a 5 minutos)..."

# 1. Python 3.9 a 3.12 (exigência do MediaPipe 0.10.14), num ambiente separado em ~/.efeito/venv
PY=""
if [ ! -x "$FX/venv/bin/python" ]; then
  if command -v uv >/dev/null 2>&1; then
    uv venv -q --seed -p 3.12 "$FX/venv"
  else
    for v in python3.12 python3.11 python3.10 python3.9 python3; do
      if command -v "$v" >/dev/null 2>&1 && "$v" -c 'import sys; sys.exit(0 if (3, 9) <= sys.version_info[:2] <= (3, 12) else 1)' 2>/dev/null; then PY="$v"; break; fi
    done
    [ -z "$PY" ] && { echo "PRECISA_PYTHON"; exit 1; }
    "$PY" -m venv "$FX/venv" 2>/dev/null || true
  fi
fi
if [ -x "$FX/venv/bin/python" ] && "$FX/venv/bin/python" -m pip --version >/dev/null 2>&1; then
  PYX="$FX/venv/bin/python"; EXTRA=""
else
  # sem venv (algumas máquinas Linux não têm o módulo venv): instala para o usuário
  PYX="$(command -v "${PY:-python3}")"; EXTRA="--user"
fi
PIPX() { "$PYX" -m pip install -q $EXTRA "$@" || { [ -n "$EXTRA" ] && "$PYX" -m pip install -q $EXTRA --break-system-packages "$@"; }; }
PIPX -r "$SKILL/requirements.txt"
echo "$PYX" > "$FX/python"

# 2. ffmpeg: usa o do sistema; se não houver, um pronto que vem pelo pip
if ! command -v ffmpeg >/dev/null 2>&1; then
  PIPX imageio-ffmpeg
  ln -sf "$("$PYX" -c 'import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())')" "$FX/bin/ffmpeg"
fi

# 3. Node 18+: usa o do sistema; se não houver, um que vem pelo pip
if ! command -v node >/dev/null 2>&1 || ! node -e 'process.exit(+process.versions.node.split(".")[0] >= 18 ? 0 : 1)' 2>/dev/null; then
  PIPX nodejs-wheel
  for b in node npm npx; do
    p="$(dirname "$PYX")/$b"; [ -x "$p" ] || p="$("$PYX" -c 'import site,os; print(os.path.join(site.getuserbase(), "bin"))')/$b"
    [ -x "$p" ] && ln -sf "$p" "$FX/bin/$b"
  done
fi

# 4. o desenho dos efeitos: @napi-rs/canvas (canvas do navegador, sem navegador)
mkdir -p "$FX/node"
( cd "$FX/node" && { [ -f package.json ] || echo '{"name":"efeito-render","private":true}' > package.json; } \
  && npm install --silent --no-audit --no-fund @napi-rs/canvas@1 >/dev/null )

ok && echo "PRONTO"
