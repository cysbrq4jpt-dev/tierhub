#!/bin/bash
# session-start.sh
# SessionStart ホーク: worker-service.cjs の "Worker did not become ready" エラー修正
#
# 問題: Cursor プラグインが登録する UserPromptSubmit ホーク:
#   bun "${CLAUDE_PLUGIN_ROOT}/scripts/worker-service.cjs" hook claude-code session-init
# が CLAUDE_PLUGIN_ROOT 未設定の環境で失敗し、15秒タイムアウトになる。
#
# 対策:
#   1) CLAUDE_PLUGIN_ROOT が空の場合、プロジェクトの .claude/ に fallback を設定
#   2) 変数展開済みパス /scripts/ にもスタブを直接配置（レースコンディション対策）
set -euo pipefail

STUB="${CLAUDE_PROJECT_DIR}/.claude/scripts/worker-service.cjs"

# --- (1) CLAUDE_PLUGIN_ROOT 環境変数の fallback ---
# 既に設定されている場合（Cursor 環境など）は上書きしない
if [ -z "${CLAUDE_PLUGIN_ROOT:-}" ]; then
  if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
    echo "export CLAUDE_PLUGIN_ROOT=\"${CLAUDE_PROJECT_DIR}/.claude\"" >> "$CLAUDE_ENV_FILE"
  fi
  export CLAUDE_PLUGIN_ROOT="${CLAUDE_PROJECT_DIR}/.claude"
fi

# --- (2) /scripts/ への直接配置 ---
# CLAUDE_PLUGIN_ROOT が空の場合、shell 展開で /scripts/worker-service.cjs になるため、
# そのパスにもスタブを配置する（mkdir や cp に権限がない場合は無視）
if [ -f "$STUB" ]; then
  mkdir -p /scripts 2>/dev/null || true
  cp "$STUB" /scripts/worker-service.cjs 2>/dev/null || true
fi
