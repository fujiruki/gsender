# セッション引き継ぎ資料 (Hikitsugi_LATEST)

| 項目 | 内容 |
|:--|:--|
| プロジェクト | gSender日本語化フォーク (`C:\Fujiruki\Projects\gSender`) |
| 作成日 | 2026-10-27 |
| 引き継ぎ理由 | 次回セッションは`C:\Fujiruki\Projects\gSender`ディレクトリでClaude Codeを新規に起動する想定のため（作業自体は継続中、次にやるべきことは確認不要で進めてよい） |

---

## 重要: Agentは全員セッション終了済み

前回までOperator Pluginの実装・デバッグを担当していたAgent(`gsender-operator-plugin-t1`等)は、このセッションが長期間空いた間に全員セッション終了している(`ListAgents`で確認済み、2026-10-27時点でteammateゼロ)。次回作業を再開する際は、**過去のコンテキストはこの引き継ぎ資料・`task.md`・`docs/spec/`から読み直し、新規にAgentを起動する**必要がある。

また、このセッション自体の名前が`oldgsender`になっている（新しいgsenderセッションが既に別に存在する可能性がある）。次回起動時に`ListAgents`で確認すること。

## 完了した作業(前回2026-09-18分からの続き、ロードマップ6・7番目)

- **ロードマップ6番目「Plugin SDK配下のUI日本語化」完了**。Plugin管理UI本体(`features/Plugins/`)を`t()`化、サンプルPlugin・SDK本体は対象外というスコープで実装・コミット済み
- **Operator Plugin構想フェーズ1(ロードマップ7番目)を仕様策定〜実装〜実機試験まで推進**。流れ:
  1. 発注者ヒアリング(加工原点保存・復元、プローブ、安全チェックリスト、ルーチンモード、管理者モード)→ fable調査(Plugin SDKの機能範囲、本体UIロックの限界)→ kaigi的な再検討を経て仕様確定
  2. 発注者が実際にCNCjsで使っていたプローブマクロ(XYZ/XY/Zの3種、具体的な数値含む)を`.cncrc`から発掘し、これを正本として移植する方針に転換
  3. fableが詳細設計(G92問題の解明、ステートマシン設計、復元フロー)を作成、`docs/spec/07_OperatorPlugin.md`として正式化
  4. 実装Agent(`gsender-operator-plugin-t1`)がT1〜T7を順次実装（足場→ステートマシン→原点保存復元→プローブ移植→朝の起動Workflow→安全チェックリスト→ルーチンモード）。すべて`integration/dev-ja`ブランチ、`plugins/operator-plugin/`配下
  5. **真っ白バグ発見・修正**: Tools→Operatorを開くと画面が真っ白になる重大バグが発生。原因はReactの二重バンドル（各Pluginの`vite.config.ts`が書いていた`rollupOptions.external`配列が、SDKの自動外部化処理を上書きしていた）。**operator-plugin固有ではなくSDK全体・README記載の公式手順自体のバグ**と判明し、5つのPlugin全部とREADMEを修正
  6. **Operator Plugin UI日本語化完了**（本体は日本語化済みだがPlugin自体は英語のままだったため）
  7. **T8実機試験を開始**、以下のバグを発見・修正(いずれも「実機でしか顕在化しない」系統):
     - 原点復元が`ORIGIN_MISMATCH`(実測値0,0,0)になる → `restoreOrigin.ts`のレースコンディション(feeder経由の`sendGcode`と直接書き込みの`query`が別チャネルで競合)。`query()`一本に統一して修正(コミット`0869da28d`)
     - 復元成功後も「原点未確認」のまま表示が進まない → `useWorkflowState.ts`が原点スロット一覧を独自ロジック(デフォルト空配列)で読んでいて、`restoreOrigin.ts`側の正しいデフォルト値と食い違っていた単純な実装ミス。`listOriginSlots()`に統一して修正(コミット`6e32a4905`)
     - ステッパーが「原点復元」で止まり「準備完了」に進まない件 → **これは仕様通り**(READYにはファイルロードも必要)。ただしUIが分かりにくかったため案内文を追加(コミット`9f83f78c3`)
     - **朝の起動Workflow、実機フルフロー確認完了**（接続→安全確認→ホーミング→原点復元→準備完了まで到達、発注者確認済み）
     - プローブ(Zのみ)で同じ「検証の$#応答にG54の行がない」エラー発生 → `runProbe.ts`にも`restoreOrigin.ts`と同じレースコンディションがあり修正(コミット`4e38aefa0`)。**副次的に、G38.2失敗時のALARM応答を`query()`が正しく終端として認識できておらず、「1回目の失敗が誤って成功扱いになる」安全上重要なバグも発見・修正**。「error:9」連続通知の原因(ALARM中もfeederが残り行を送り続けていた)も解明・解消

## 進行中・待ち状態

- **Operator Plugin T8実機試験、プローブ修正後の再検証待ち**: 上記`runProbe.ts`修正(コミット`4e38aefa0`)後、発注者に「Zのみプローブ」の再検証をお願いしたところで時間が空いた。`task.md`の該当タスクも未チェックのまま。**次回セッション開始時、まず発注者に進捗(試したかどうか)を確認すること**
- **未処理の要望が`docs/requests.md`に残っている(未コミット差分)**: 2026-10-19受付「SdDD v1.0 を v1.0 に更新する」。他プロジェクト横展開の一環で、`git diff docs/requests.md`で確認できる。内容: `/sddd-update`を実行し、更新元`C:\Fujiruki\Projects\SDDD`の`templates`から反映。新設`docs/quality.md`・`docs/adr/ADR-0000-template.md`も追加。晴樹さん承認済み(2026-10-18)、まずLISUで試験運用し問題なければ他プロジェクトへ、という位置づけ

## 次にやるべきこと（優先順、確認不要で進めてよい）

1. **`docs/requests.md`のSdDD v1.0アップデート要望に対応**（上記参照。`/sddd-update`を実行）
2. **Operator Plugin T8実機試験の続き**（発注者と一緒に進める）:
   - a. 「Zのみプローブ」修正の実機再検証（G54が正しく表示されるか）
   - b. 「XYのみ」「XYZ一括」プローブも同じ修正が適用済みなので確認
   - c. 意図的にALARM:5を起こした場合、即座に案内が出て`error:9`連続通知が出ないことも確認
   - d. 安全チェックリストの実機動作確認(まだ未実施)
   - e. ルーチンモードの実機動作確認(まだ未実施、サイクルカウンター・短縮チェックリスト・長押し離脱・管理者PIN)
   - f. T8完了後、T9(実機試験から見つかった不足APIを整理し本家提案を検討するか判断)に進む
3. T8が一段落したら、Operator Plugin構想のフェーズ2(商品レシピDB、まだ仕様策定すらしていない)も発注者と相談

## 注意点・ハマりポイント

- **gSenderを起動するには`C:\Fujiruki\Projects\gSender\gSender開発版を起動.bat`をダブルクリック**（`integration/dev-ja`のworktree`.claude\worktrees\agent-af3adeb91b76d108d`で`npm run dev:electron`を実行、既存プロセスの後片付けも自動）。**バッチファイルの中身は絶対に日本語を含めないこと**（UTF-8で書くとWindowsのデフォルトコードページで文字化けし、コマンド自体が壊れて実行不能になる実例あり）
- **原点復元・プローブ共通の教訓**: `machine.command`(feederキュー経由、送信完了のみ保証)と`machine.query`(シリアル直接書き込み、実際の応答を待つ)という2つの独立した送信経路があり、これらを混在させるとレースコンディションになる。**今後Operator Plugin内で新しい送信処理を書く際は、`query()`に統一する**のが安全（`restoreOrigin.ts`/`runProbe.ts`で実例あり）
- **`machine.query()`でG38.2(プローブ)のような失敗時に"ALARM:n"を返すコマンドを送る場合、デフォルトのok-or-error終端パターンでは検知できない**。ALARM応答も終端として認識するカスタムパターンが必要（`runProbe.ts`参照）
- `.claude/worktrees/agent-aa3c45ae337d7315f`(`contrib/homing-safety-fix`用)は過去にゾンビ化していたworktree。発注者判断で当面放置中、触る際は`git pull --ff-only`が必要
- 実機CNC接続用サーバーがポート8000を使うことがあるため、開発サーバー起動前は`netstat`で衝突確認する習慣を継続
- 「すり合わせ」と言われたら絶対にファイル編集せず、まず理解確認のみ行う（メモリ`feedback-sumiawase-no-edit-first`参照）
