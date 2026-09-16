# セッション引き継ぎ資料 (Hikitsugi_LATEST)

| 項目 | 内容 |
|:--|:--|
| プロジェクト | gSender日本語化フォーク (`C:\Fujiruki\Projects\gSender`) |
| 作成日 | 2026-09-16（同日中に複数回追記あり） |
| 引き継ぎ理由 | セッション区切り（作業自体は継続中） |

---

## 完了した作業（最新追記: カンガルー移行・ブランチ戦略すり合わせ・安全インシデント対応）

- AI間情報共有地点の名称が「保管庫」から「**カンガルー**」に変わり、保存場所もGitHub `fujiruki/AiFujiiuki`からGoogle Drive `AI共有庫 カンガルー`フォルダへ移行したことを確認。入口ファイルは`AI共有庫カンガルーの使い方.md`。「カンガルー」の話が出たときだけ最初にこれを読み、通常時は読まない運用
- カンガルー`02`番（ChatGPT＋晴樹さんの決定「gSender日本語化・PluginSDK・OperatorPlugin開発方針」）を読み、以下を把握:
  - 日本語化(1639キー・未翻訳0件)は自社実用品として維持、独自`t()`実装自体は本家へそのままPRしない
  - Plugin SDKは本家`dev`に実装が進行中（Plugin System PR#919、storage PR#928、Controller Events PR#941が`dev`にマージ済み。安定版1.6.xには未搭載、`v1.7.0-Edge-1`がプレリリース）
  - Operator Plugin構想（CNC作業標準化、ステートマシン管理、Workflow定義から画面・手順書を生成）
- カンガルー`04`番として、`fujiruki/gsender`の実態調査結果（本家`upstream/dev`から539コミット遅れ、Plugin SDK一式が現フォーク未導入）を自分で調査・保存
- カンガルー`05`番（ChatGPT＋晴樹さんの決定「本家追従・日本語安定版・PR運用のブランチ設計」）を読み、**3線ブランチ運用**を把握:
  - `master`＝現場安定線（現状維持）／`integration/dev-ja`＝`upstream/dev`起点の次期本命線（新規作成予定、日本語化資産を再適用）／`contrib/<topic>`＝本家PR専用線
  - 現`master`の24 aheadコミットをA(日本語化中核)/B(開発支援)/C(履歴のみ)/D(本家へ返せる汎用修正候補、`10e2166`のcheck-types修正が最有力)に分類する方針
  - 「Claude Codeに次に依頼する作業」7項目が指定されているが**まだ未着手**（下記参照）
- 上記を踏まえ、プロジェクト仕様書の整合性を是正: `docs/spec/05_技術設計.md`に3線ブランチ運用・本家コミュニティへの発信3パターンを追加、`upstream/main`→`upstream/dev`の誤記訂正、rebase→merge運用への転換を明記。`docs/spec/06_変更履歴.md`・`CLAUDE.md`（Plugin SDK認識の誤記訂正）も更新
- **`hikitsugi`運用ルールを変更**: `Hikitsugi_LATEST.md`の最終更新日が今日と異なる場合はリネームしてアーカイブしてから新規作成する方式に、`C:\Fujiruki\Projects\CLAUDE.md`へ全プロジェクト共通ルールとして追記済み（今回は同日中の追記のためリネームなし）
- **安全インシデント発生**: 実機でX軸リミットスイッチが物理破損。GRBLログ解析で`ALARM:8 (Homing fail)`と`[MSG:Check Limits]`を発見し、ユーザーが「ホーミングした」と認識していたが実際は失敗していたと判明。Codex(`codex:codex-rescue`)へ調査委託し、**核心的な欠陥**を特定:
  - `controller.hasHomed`は`$H`送信後、次に届いたステータスが`Alarm`でも`true`になりうる実装(`GrblController.js:727,1913`)
  - ジョグ許可判定(`canClick`/`canClickShortcut`、`Jogging/index.tsx:124,135`)はそもそも`hasHomed`を参照していない
  - 対策案A〜G（優先順位付き、詳細は`docs/requests.md`）を取得済み、コード変更はまだ行っていない
  - 他軸のリミットスイッチは点検済み・異常なし
- **本家貢献方針をユーザーとすり合わせ**: 日本語化(`t()`+`ja.json`)自体はPRせず「参考にどうぞ」的な共有に留め、日本語化以外の汎用的な改善(Plugin SDK関連バグ修正等)は`contrib/<topic>`経由で能動的にPRする、という切り分けで合意。本家への発信は3パターン（①日本語化共有=控えめ、②バグ修正PR=淡々、③Plugin活用+機能提案=提案調でメンテナーの設計判断を尊重）に整理し、GitHub初心者のユーザーに代わって指揮AIがマナー面をチェックする運用を`05_技術設計.md`に明記
- **重要な行動修正**: ユーザーから「すり合わせしたいと言ったときはファイル編集せずまず理解を確認させてほしい」と指摘を受けた。以後「すり合わせ」に類する発言では、まず理解をテキストで示し承認を得てから編集する（メモリ`feedback-sumiawase-no-edit-first`に記録済み）

## 進行中・待ち状態

- **ブランチ戦略7項目の調査**（カンガルー05番「Claude Codeに次に依頼する作業」）: **ユーザーの「進めて」の合図待ちで本セッション終了**。内容は次のやるべきこと参照
- **安全性修正(`hasHomed`判定バグ等)**: ブランチ戦略7項目完了後に着手する、とユーザーと合意済み（未着手）
- 旧「AiFujiiuki保管庫」経由の共有は使われなくなった（カンガルーに統合）
- 本家PR送付可否は今回のセッションで方針確定（日本語化は参考共有のみ、汎用修正はPR）。個別のPR実行はまだ先

## 次にやるべきこと（優先順）

1. ユーザーから進行の合図があれば、**ブランチ戦略7項目**の調査に着手する:
   1. 現`master`の24 aheadコミットを全件分類し、カンガルー05番のA/B/C/D分類に漏れがないか確認
   2. 最新`upstream/dev`を基点にした`integration/dev-ja`作成手順を具体化
   3. 日本語化の中核コミットについて、最新devへの適用難易度・変更ファイル重複・コンフリクト見込みを調査
   4. `ja.json`1639件を新devへ移す際のキー再利用率を確認
   5. 本家devで新たに増えたUI文字列を、日本語化機構がどう拾うべきか整理
   6. `10e2166`のcheck-types修正を最新本家dev上で再現・検証し、本家PR候補として妥当か確認
   7. ここまでをカンガルーへ`status: 調査`として返す
   - **この段階ではmasterの履歴改変・default branch変更・大規模merge・本家PR送信はまだ行わない**（決定文書の制約）
2. ブランチ戦略の土台(`integration/dev-ja`)ができた後、安全性修正に着手。Codexの推奨順は「①`hasHomed`の成功判定修正→②ALARM 6-9受信時に`hasHomed`をfalseへリセット→③`ALARM:8`解除前の確認モーダル追加」
3. 本家への実際の発信（issue #877へのコメント、`check-types`PR等）を行う際は3パターンの使い分けとGitHubマナーチェックを徹底し、必ず晴樹さんの明示的承認を得る
4. （継続・未着手）`docs/requests.md`記載の既存要望2件: Electron本体がWindowsで起動しない問題、キーボードジョグの高速化機能

## 注意点・ハマりポイント

- **「すり合わせ」と言われたら絶対にファイル編集せず、まず理解確認のみ行う**（重要、メモリ`feedback-sumiawase-no-edit-first`参照）
- **AI間共有地点は「カンガルー」**（Google Drive `AI共有庫 カンガルー`）。旧「保管庫」(`fujiruki/AiFujiiuki`)は履歴扱いで正本ではない
- Codexへの調査委託は`codex:codex-rescue`エージェント経由（プロンプト転送のみ、バックグラウンドでCodexタスクが動く）。完了確認は`node "<CLAUDE_PLUGIN_ROOT>/scripts/codex-companion.mjs" status <task-id>`／`result <task-id>`で行う。Claude Code内部の`TaskOutput`ツールとは別物のIDなので注意
- 安全性修正が入るまでは、**Homing未完了状態でのジョグ操作を手動で避けること**（ユーザーに伝達済み）
- 外部（本家issue/PR/コメント）への発信は、内容を問わず晴樹さんの明示的な承認を得てから行う
- **マージ後は必ずブラウザでの実地確認が必要**。`npm run test:app`/`npm run build`では検出できない実行時エラー（重複import等）が実際に起きた
- worktree運用: 並列作業には`git worktree`+`node_modules`をジャンクション共有で使う。**削除時は必ず「ジャンクション解除(`cmd //c rmdir <path>`、非再帰)」→「ディレクトリ削除(`cmd //c rmdir /s /q <path>`)」の2段階**を守ること
- Windowsのバッチファイルは`.gitattributes`で`eol=crlf`を明示していないとLF化されて動かなくなる
- 開発サーバーは`C:\Fujiruki\Projects\gSender\start-gsender.bat`をダブルクリックで起動（ポート8000）。**ユーザーが実機CNC接続の確認に使っている可能性があるため、むやみに再起動・停止しないこと**
- `npm run electron:hot`（本来のElectronアプリ起動）はWindowsでは動かない。ブラウザ表示(`start-dev`)で代替している
- ユーザーの運用方針: 「自社開発なので指揮AIの判断でどんどん進めてよい。ただし後戻りコストが高い設計判断はfableに相談すること」

## 現在のi18n:sync状態（直近確認時点）

```
keys in code: 1639  untranslated: 0
```

## コミット履歴（直近、master）

```
8643916bf docs: update handover notes after PR discussion and vault check
c17440db3 docs: update handover notes after alarm/error translation completion
00ded70d4 docs: record alarm/error description translation completion
0b3a23417 i18n: translate alarm and error descriptions surfaced from server constants
a5872ef3f docs: add session handover (hikitsugi) notes
```

`master`は`origin/master`（`https://github.com/fujiruki/gsender`、Public）へpush済み、未コミット変更なし（2026-09-16時点）。本家`upstream/dev`からは539コミット遅れ・24コミット独自進行。

---

## 過去の完了記録（参考、詳細はgit historyおよび`docs/spec/06_変更履歴.md`）

- SdDD導入、fableへi18n設計相談→kaigi(Sonnet)レビュー→設計確定
- **M0**: i18n基盤＋接続画面日本語化。**M1**: 日常操作画面583件。**M2**: ツール類407件。**M3-a**: 周辺機能352件。**M3-b**: 設定説明文・引き継ぎ分235件。**アラーム/エラー説明文**: 79件。すべてマージ済み、i18nキー1639件・未翻訳0件に到達
- マージ後にVite dev serverでのみ顕在化する重複import(`Rotary/MountingSetup.tsx`)クラッシュを発見・修正（教訓: テスト・ビルドだけでなくブラウザ実地確認が必須）
- `start-gsender.bat`作成（Electron本体がWindowsで起動しないための代替ショートカット）
- `.gitattributes`に`*.bat text eol=crlf`追加、`.gitignore`の`/docs`除外方式変更（SdDD文書をgit管理するため）
- アラームダイアログ本文未翻訳の発見・調査・翻訳（`AlarmDescriptionIcon.tsx`がサーバー側`constants.js`を直接import、`GRBL_ALARMS`/`HAL_ALARMS`/`GRBL_ERRORS`/`HAL_ERRORS`で計79件）
