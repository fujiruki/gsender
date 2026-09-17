# セッション引き継ぎ資料 (Hikitsugi_LATEST)

| 項目 | 内容 |
|:--|:--|
| プロジェクト | gSender日本語化フォーク (`C:\Fujiruki\Projects\gSender`) |
| 作成日 | 2026-09-17 |
| 引き継ぎ理由 | コンテキストクリアのためセッション区切り（作業自体は継続中、次にやるべきことは確認不要で進めてよい） |

---

## 完了した作業

- **ブランチ戦略7項目調査**（前セッションから継続）完了、カンガルー07番に記録
- **`integration/dev-ja`構築が全完了**: Phase1(軽中度5コミット)・Phase2(M1本体`9c8b6e92c`)・Phase3(M2`53e1e399a`+M3-a`c52b994dc`)まで統合済み。M3-aは事前調査で「cherry-pick不可、新規に近い再wrap必要」と判定されていたが、実際は全65ファイル中62ファイルが機械的に解消でき想定より順調だった
- **F-05: Homing安全性修正**（実機の安全インシデント対応）: `master`・`integration/dev-ja`両方に実装、実機で偶然ホーミング失敗が起き確認ダイアログの動作を発注者が確認済み(2026-09-17)。さらに残課題だった`Jogging/index.tsx`の`canClick`/`canClickShortcut`へのhasHomed組み込みも完了（`$22`Homing無効機体は除外、ブロック時は赤字注意文表示。**既知の限界**: `JogWheel`等マウス長押しジョグは`canClick`を実行時ガードに使っておらず未然にブロックされない。キーボード/ゲームパッドのみ確実にブロック。この既存ギャップへの対応は別タスクとして残っている）
- **F-06: 改善要望送信機能(フィードバックウィジェット)**を`master`限定で実装完了（藤田建具店フォーク限定のオリジナル機能、本家PR対象外。既存の`configstore`を再利用、新規DB依存なし）
- **F-07: Electron本体のWindows起動修正**: `bash -lc`依存を`scripts/wait-for-url.mjs`（追加依存なしのNode標準実装）に置き換え、`master`に実装済み。**ウィンドウの実起動確認は未実施**（後述）
- **本家PR送信3件**（全て事前承認済みの本家貢献方針に基づく）:
  - [#953](https://github.com/Sienci-Labs/gsender/pull/953) F-05 Homing安全性修正
  - [#954](https://github.com/Sienci-Labs/gsender/pull/954) pendant:electron:devのbash -lc修正
  - [#955](https://github.com/Sienci-Labs/gsender/pull/955) check-typesスクリプトのパス修正
  - 送信履歴は`docs/spec/05_技術設計.md`に表で記録
- **運用改善**:
  - カンガルー運用方針の訂正: 通常の実装記録・調査結果はSdDDの`docs/spec`・`docs/handover`に書き、カンガルーは他AI(ChatGPT等)への明示的な申し送りのみに限定する方針にユーザーから訂正された
  - 並列化+Codex積極活用の方針を明示指示され、以後この方針で運用（機械的な実装/調査はCodexへ、文脈判断が要るものはClaude Agentへ）
  - 通常のcommit/pushは指揮AI判断で確認不要と明示された（破壊的操作・本家PR送信は従来通り慎重に）
  - Codexジョブ監視を仕組み化: `~/.claude/scripts/wait-codex-job.mjs`を新規作成（グローバル、全プロジェクト共通）。`phase`が`done`/`failed`/`cancelled`のいずれかになるまでポーリングし、exit codeで結果を返す

## トラブルシューティングの教訓（重要、メモリにも記録済み）

- **Codexジョブが2回、メインチェックアウト(`C:\Fujiruki\Projects\gSender`本体)を誤って別ブランチへcheckoutしてしまう事故が発生**（worktree isolationが破られる）。データ損失はなかったが、task.md等が「見つからない」形で気づいた。**Codexジョブ完了後は必ず`git status --short`・`git branch --show-current`をメインチェックアウトで確認する習慣を徹底すること**
- Codexのサンドボックス環境はネットワーク制限があり、実装（cherry-pick等）は完了してもpush・`gh pr create`が失敗することが多い。その場合はClaude Agentに実装内容を引き継いでpush/PR作成をやり直す運用で対応した
- Codexジョブのレコードが`running`のまま更新されず停滞することがある（実際はとっくに完了していた）。`wait-codex-job.mjs`でタイムアウトした場合は、ジョブのログファイル（`C:\Users\fjtsu\.claude\plugins\data\codex-openai-codex\state\<slug>-<hash>\jobs\<job-id>.log`）を直接確認すると実際の完了状況が分かる

## 進行中・待ち状態

なし。直前までの全タスクはコミット・push済み、`master`はorigin/masterと同期済み。

## 次にやるべきこと（優先順、発注者指定、確認不要で進めてよい）

1. **F-07: Electronウィンドウの実起動確認**。前回はこのマシン上で`npm run electron:hot`を起動したところ、開発サーバーが実機CNC接続用サーバーと同じ**ポート8000**を使う構成だったため、衝突を避けて即座に停止し確認を見送った。実機が接続されていないタイミングでの確認方法、または一時的に別ポートで起動できる仕組みを検討してから進めること
2. **既存の未翻訳25件の翻訳**（Visualizer options、プラグインbackup先設定等）。`integration/dev-ja`上でM2/M3-aのスコープ外として残っていたもの
3. **Plugin SDK配下のUI日本語化**。カンガルー07番調査で本家`upstream/dev`のPlugin管理UI・サンプルPluginに約300〜355件の翻訳対象があると判明済み。現行の`scripts/i18n-sync.mjs`は完全一致方式でglob非対応のため、`DATA_SOURCES`（または走査ルート）の拡張実装が前提。詳細は`docs/spec/05_技術設計.md`参照
4. **Operator Plugin構想**。本家`packages/plugin-sdk/`上に構築する具体アプリ（CNC作業標準化、ステートマシン管理、Workflow定義から画面・手順書自動生成）。まだ何も着手していない大きな将来構想なので、まず仕様策定（Phase2）から始める。CLAUDE.mdの新機能追加方針（まずアドオン的アプローチを検討→本体改造は最終手段）に従うこと

## 注意点・ハマりポイント

- **実機CNC接続用サーバーがポート8000を使用中**（このマシン上、`node ./bin/gsender -p 8000`、`start-gsender.bat`経由）。Electron起動テスト等でポート8000を使う操作は必ず事前に`netstat -ano | grep ":8000"`で確認し、衝突するなら実行しない
- **「すり合わせ」と言われたら絶対にファイル編集せず、まず理解確認のみ行う**（メモリ`feedback-sumiawase-no-edit-first`参照）
- **AI間共有地点は「カンガルー」**（Google Drive `AI共有庫 カンガルー`）。通常の実装記録には使わない、他AIへの明示的な申し送りのみ
- Codexへの調査委託は`codex:codex-rescue`エージェント経由。完了確認は`node "<codex-companion.mjsのパス>" status <task-id> --json --cwd <該当worktreeパス>`、または仕組み化した`wait-codex-job.mjs`を使う
- worktree運用: 並列作業には`git worktree`を使う。削除に失敗する場合（別ユーザー権限で作成されたもの等）は無理せず放置してよい、`.gitignore`に`/.claude/worktrees/`を追加済みなのでコミットには混入しない
- 開発サーバー起動は`start-gsender.bat`（ポート8000）。実機CNC接続確認に使われている可能性があるため、むやみに再起動・停止しないこと
- 本家への実際の発信（PR/issue/コメント）は3パターン（①日本語化共有=控えめ、②バグ修正PR=淡々、③Plugin活用+提案=提案調）の使い分けを徹底し、GitHub初心者の発注者に代わって指揮AIがマナー面をチェックする
- ユーザーの運用方針: 「自社開発なので指揮AIの判断でどんどん進めてよい。ただし後戻りコストが高い設計判断はfableに相談すること」「並列化・Codex活用でトークン節約」「通常のcommit/pushは確認不要」

## 現在のブランチ状態（2026-09-17時点）

- `master`: origin/masterと同期済み（最新コミット`c6acf3708`）
- `integration/dev-ja`: F-01〜F-05拡張まで統合済み、origin/integration/dev-jaと同期済み
- 本家PR: #953, #954, #955送信済み（未マージ、メンテナーの反応待ち。催促しない）

## i18n:sync現在状態（直近確認時点、`integration/dev-ja`）

```
keys: 1655前後  new: 0  untranslated: 20  orphans: 20
```
