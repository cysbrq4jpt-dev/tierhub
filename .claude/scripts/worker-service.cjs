// worker-service.cjs - Fallback stub
//
// Cursor の Claude Code プラグインが登録する UserPromptSubmit ホーク:
//   bun "${CLAUDE_PLUGIN_ROOT}/scripts/worker-service.cjs" hook claude-code session-init
// は CLAUDE_PLUGIN_ROOT が未設定の環境（リモート・cloud等）で失敗する。
//
// このスタブは "Worker did not become ready within 15 seconds (port 37777)" エラーを
// 防止するために、正常終了（exit 0）で即時応答する。
//
// Cursor 環境で本物の worker-service.cjs が存在する場合、CLAUDE_PLUGIN_ROOT は
// Cursor 側で正しく設定されるため、このスタブは実行されない。
process.exit(0);
