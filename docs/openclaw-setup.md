# OpenClaw セットアップガイド

TierHub プロジェクトで OpenClaw を利用するための環境構築手順です。
Slack または Discord 経由で AI アシスタントと対話できるようになります。

## 前提条件

- Node.js 22 以上
- npm / pnpm / bun いずれか
- Anthropic API キー（Claude を利用する場合）

## 1. OpenClaw のインストール

```bash
npm install -g openclaw@latest
```

インストール確認:

```bash
openclaw --version
```

## 2. 環境変数の設定

```bash
cp openclaw/.env.example openclaw/.env
```

`openclaw/.env` を編集し、各トークンを設定してください。

## 3. Discord チャンネルのセットアップ

### 3.1 Discord Application の作成

1. [Discord Developer Portal](https://discord.com/developers/applications) にアクセス
2. 「New Application」をクリックし、アプリケーション名を入力（例: `TierHub Bot`）
3. 左メニューの「Bot」をクリック

### 3.2 Bot の設定

1. 「Reset Token」をクリックしてトークンを生成し、コピー
2. コピーしたトークンを `openclaw/.env` の `DISCORD_BOT_TOKEN` に設定

### 3.3 Privileged Gateway Intents の有効化

Bot ページ下部の「Privileged Gateway Intents」で以下を有効化:

- **Message Content Intent** — メッセージ内容の読み取りに必須
- **Server Members Intent** — 推奨

### 3.4 Bot をサーバーに招待

1. 左メニューの「OAuth2」→「URL Generator」を開く
2. Scopes: `bot` を選択
3. Bot Permissions: `Read Messages/View Channels`, `Send Messages`, `Add Reactions` を選択
4. 生成された URL をブラウザで開き、対象サーバーに Bot を追加

### 3.5 OpenClaw の設定を有効化

`openclaw/openclaw.json` で Discord を有効にする:

```json
{
  "channels": {
    "discord": {
      "enabled": true
    }
  }
}
```

## 4. Slack チャンネルのセットアップ

### 4.1 Slack App の作成

1. [Slack API](https://api.slack.com/apps) にアクセス
2. 「Create New App」→「From scratch」を選択
3. アプリ名（例: `TierHub Bot`）とワークスペースを選択

### 4.2 Socket Mode の有効化

1. 左メニューの「Socket Mode」をクリックし、トグルを ON
2. 「Basic Information」→「App-Level Tokens」→「Generate Token and Scopes」
3. トークン名を入力し、スコープ `connections:write` を追加
4. 生成された App Token（`xapp-...`）をコピーし、`openclaw/.env` の `SLACK_APP_TOKEN` に設定

### 4.3 Bot Token Scopes の設定

「OAuth & Permissions」→「Bot Token Scopes」に以下を追加:

| スコープ | 用途 |
|---|---|
| `chat:write` | メッセージ送信 |
| `channels:history` | チャンネル履歴の読み取り |
| `channels:read` | チャンネル情報の読み取り |
| `groups:history` | プライベートチャンネル履歴 |
| `groups:read` | プライベートチャンネル情報 |
| `im:history` | DM 履歴の読み取り |
| `im:read` | DM 情報の読み取り |
| `im:write` | DM の送信 |
| `mpim:history` | グループ DM 履歴 |
| `mpim:read` | グループ DM 情報 |
| `users:read` | ユーザー情報の読み取り |
| `app_mentions:read` | アプリへのメンション検出 |
| `reactions:read` | リアクションの読み取り |
| `reactions:write` | リアクションの追加 |
| `files:write` | ファイルのアップロード |

### 4.4 Event Subscriptions の設定

「Event Subscriptions」→ トグルを ON にし、以下の Bot Events を追加:

- `message.channels`
- `message.groups`
- `message.im`
- `message.mpim`
- `app_mention`
- `reaction_added`
- `reaction_removed`

### 4.5 ワークスペースへのインストール

1. 「OAuth & Permissions」→「Install to Workspace」をクリック
2. 権限を確認して許可
3. 生成された Bot User OAuth Token（`xoxb-...`）をコピーし、`openclaw/.env` の `SLACK_BOT_TOKEN` に設定

### 4.6 OpenClaw の設定を有効化

`openclaw/openclaw.json` で Slack を有効にする:

```json
{
  "channels": {
    "slack": {
      "enabled": true
    }
  }
}
```

## 5. 起動

### オンボーディングウィザード（初回推奨）

```bash
openclaw onboard
```

対話形式でゲートウェイ、チャンネル、スキルの設定をガイドしてくれます。

### 手動起動

```bash
# 環境変数を読み込んで起動
cd openclaw
source .env && openclaw gateway start
```

### デーモンとして起動（再起動後も自動起動）

```bash
openclaw onboard --install-daemon
```

- Linux: systemd ユーザーサービスとして登録
- macOS: launchd に登録

## 6. 動作確認

- **Discord**: Bot に DM を送信し、応答があることを確認
- **Slack**: Bot に DM を送信し、応答があることを確認
- ログに `[Discord] Connected` / `[Slack] Connected via Socket Mode` と表示されれば成功

## 7. セキュリティに関する注意事項

- トークンやAPIキーは絶対にコミットしないでください（`.gitignore` で除外済み）
- `dmPolicy: "pairing"` がデフォルトで有効です（未知のユーザーにはペアリングコードが要求されます）
- 本番環境では VM や専用サーバーでの実行を推奨します
- 高リスクスキル（`exec`, `browser`）は承認が必要な設定になっています
- 定期的に `openclaw security audit` を実行してください

## 参考リンク

- [OpenClaw 公式ドキュメント](https://docs.openclaw.ai/)
- [Discord チャンネル設定](https://docs.openclaw.ai/channels/discord)
- [Slack チャンネル設定](https://docs.openclaw.ai/channels/slack)
- [GitHub リポジトリ](https://github.com/openclaw/openclaw)
- [設定ファイル詳細ガイド](https://eastondev.com/blog/en/posts/ai/20260205-openclaw-config-guide/)
