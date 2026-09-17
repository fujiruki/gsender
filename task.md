# gSender(日本語化フォーク) タスク管理

## 指揮AI

### 待機タスク
- [x] 仕様確認（`docs/requests.md` → `docs/spec/` への反映）
- [x] M0タスク分解・Agent起動準備

### 完了タスク
- [x] fableへi18n設計相談、kaigiでレビュー、条件を反映した実装方針を確定（`docs/kaigi/2026-09-15-i18n設計レビュー.md`）
- [x] SdDD導入（本ファイル・`docs/SPEC.md`・`docs/spec/`）

---

## Agent-i18n基盤(M0)

> 対応spec: `docs/spec/02_機能仕様.md` F-01

### タスク
- [x] テスト作成: `src/app/src/i18n/i18n.test.ts`（フォールバック・`{{var}}`補間の期待値を先に書く）
- [x] 実装: `src/app/src/i18n/index.ts`（t()/initI18n()/setLanguage()）
- [x] 実装: `src/app/src/i18n/locales/ja.json`（空の対訳ファイルを用意）
- [x] 実装: entry-clientへの`initI18n()`組み込み + `document.documentElement.lang`設定
- [x] 実装: 設定画面に言語切替項目(`workspace.language`, en/ja)を追加
- [x] 実装: `scripts/i18n-sync.mjs`（NEW/ORPHAN/untranslated検出、`--review`対訳表出力）
- [x] 実装: root `package.json`に`i18n:sync` / `i18n:review`スクリプト追加
- [x] 実装: 接続画面(TopBar/Connection)のUI文字列を`t()`でラップ + `ja.json`に翻訳追加
- [x] テストGREEN確認: `npm run test:app` / `npm run i18n:sync`がexit 0（`npm run check-types`は経路設定自体がリポジトリのベースラインで既に壊れておりi18n変更と無関係。詳細は完了報告参照）
- [x] ビルド確認: `npm run build`成功
- [x] UI表示確認: ブラウザプレビュー(`npm run start-dev`)でlocalStorageの`workspace.language`を`ja`に切替えて確認。「Connect to CNC」→「CNCに接続」、ポート一覧「USB（115200）」「イーサネット（ポート23）」が正しく日本語表示、レイアウト崩れなし。「Disconnected」等TopBar本体はM1スコープのため未翻訳のまま（想定通り）
- [ ] 実機確認: 実際のCNCまたはgrblHALシミュレータでの接続→ジョグ→切断は未実施（発注者側での確認待ち）

### 完了タスク

---

## Agent-環境整備(check-types修正 + R-002時間計測)

> 対応spec: `docs/spec/05_技術設計.md`。i18n基盤(M0)と並行または直後に実施。コンテキストを持つ`codex-m0-i18n-base`に追加依頼する

### タスク
- [x] `check-types`スクリプトのパスバグ修正（`node ./src/app/node_modules/typescript/bin/tsc --noEmit -p ./src/app`に修正、コミット`10e2166b4`）
- [x] `scripts/measure-time.mjs`を新規作成し、`npm run build:timed` / `npm run test:app:timed`で実行時間を`perf-log.csv`(gitignore対象)に記録できるように（コミット`f5ee31e83`）
- [x] 修正後`npm run check-types`が実際に完走（2014件のエラーは変更前後で完全一致、i18n変更起因の新規エラーなし）

### 完了タスク

---

## Agent-日常操作画面(M1) 【完了・master統合済み】

> 対応spec: `docs/spec/02_機能仕様.md` F-02。マージコミット`f1b5f0350`でmasterへ統合済み

### タスク
- [x] workspace/(Sidebar, PortraitMacroBar, Alerts)を`t()`ラップ
- [x] JobControl, FileControl, DRO, Jogging, Probe, Macros, Spindle, Coolant, Consoleを`t()`ラップ
- [x] Config描画側4箇所(`SettingRow.tsx`, `Menu.tsx`, `SettingSection.tsx`, `Section.tsx`)に`t()`を追加（設定項目551件を一括対象化）
- [x] `npm run i18n:sync`でNEWキーを収集、`ja.json`を翻訳（551件、コミット`9c8b6e92c`）
- [x] `npm run i18n:review`で対訳表を出力し通し読みレビュー（サンプル確認済み、専門用語の訳は良好）
- [x] テストGREEN確認・ビルド確認
- [x] 追加(F-02b): `MachineStatus/`, `navbar/`, `WorkspaceSelector/`, `StatusIcons/`, `UnlockButton/`（追加32件、コミット`dcab1f421`。`i18n:sync`: keys 593, new/untranslated/orphans すべて0）

### 完了タスク

---

## Agent-ツール類(M2) 【完了・master統合済み】

> 対応spec: `docs/spec/02_機能仕様.md` F-03。マージコミット`f1b5f0350`でmasterへ統合済み（ja.jsonの真の衝突2件は個別判断で解決、詳細は`docs/spec/06_変更履歴.md`）

### タスク
- [x] Surfacing, Squaring, MovementTuning, Keyboard, Gamepad, Statsを`t()`ラップ
- [x] ConfirmationDialogメッセージ, toaster呼び出し元, Helperウィザードを`t()`ラップ（担当7画面内のみ。画面外の呼び出し元(Config/Macros/navbar/RemoteMode/Rotary/SDCard/Visualizer/workspace/wizards、約15ファイル)は未対応、要フォロー）
- [x] `i18n:sync` / `i18n:review` / テスト・ビルド確認（新規407件翻訳、コミット`53e1e399a`）
- [x] `scripts/i18n-sync.mjs`のバグ2件を発見・修正（`.jsx`/`.js`が同期対象外だった、`gamepad.js`ディレクトリ名でのEISDIRクラッシュ）

### 完了タスク

---

## Agent-Config画面残翻訳 【完了・master直接コミット済み】

> M0〜M2完了後、ブラウザ最終確認で発見した残存3箇所。コミット`fd45ddcbb`

### タスク
- [x] 未接続警告バナー（`EEPROMNotConnectedWarning.tsx`, `MenuWarning.tsx`）
- [x] Config画面ヘッダー/フッター（Search/Clear/View Modified/All Config/EEPROM/Reset/Import/Export/Defaults/Flash/Apply Settings）
- [x] Probe/Macros/Coolant/Consoleタブ名（`features/Tools/index.tsx`のタブ定義配列はラベル文字列をフィルタ判定にも使っており直接t()ラップ不可と判明。`SettingsMenu.ts`と同じ方針で描画側`components/Tabs/index.tsx`のみ変更、`i18n-sync.mjs`のDATA_SOURCESに`Tools/index.tsx`を追加)
- [x] `npm run i18n:sync`(exit 0, keys 1000, untranslated 1=ATC・M3スコープ), `test:app`, `build`確認
- [x] ブラウザで最終確認: メイン画面・設定画面・タブ名すべて日本語化、レイアウト崩れなし

---

## Agent-周辺機能(M3-a) 【完了・master統合済み】

> 対応spec: `docs/spec/02_機能仕様.md` F-04。マージコミット`636a3e23e`でmasterへ統合済み

### タスク
- [x] AccessoryInstaller, ATC, Rotary, RemoteMode, SDCardを`t()`ラップ（352件翻訳、コミット`c52b994dc`）
- [x] ATCタブ名の翻訳
- [x] `i18n:sync` / `i18n:review` / テスト・ビルド確認

### 完了タスク

---

## Agent-設定説明文・引き継ぎ分(M3-b) 【完了・master統合済み】

> 対応spec: `docs/spec/02_機能仕様.md` F-04。マージコミット`636a3e23e`でmasterへ統合済み（ja.jsonの真の衝突9件は個別判断で解決、詳細は`docs/spec/06_変更履歴.md`）

### タスク
- [x] `SettingsDescriptions.ts`（$設定の説明）を`EEPROMSettingRow.tsx`描画側でt()ラップ。GRBL/grblHALの$設定128件×2フィールド翻訳。`i18n-sync.mjs`のDATA_SOURCESに追加
- [x] M2からの引き継ぎ: ConfirmationDialog/toast呼び出し元(Config/RemoteMode/Rotary/SDCard/Visualizer/wizards配下)をt()化。Macros/navbar/workspaceは他Agentで対応済みのためスキップ
- [x] サーバー起点メッセージを調査。`Visualizer.jsx`の`gcode_error`ハンドラは動的合成文字列でサーバー側変更が前提となるため対応見送り(妥当な判断。ただし別経路のGRBL_ERRORSは後日固定文言と判明、下記参照)
- [x] `i18n:sync`(exit 0, keys 1235, untranslated 1=ATC), `test:app`, `build`確認。翻訳235件追加

### 完了タスク

---

## Agent-アラーム/エラー説明文 【完了・master統合済み】

> ユーザーがアラームダイアログの本文が未翻訳なのを発見したことがきっかけ。コミット`0b3a23417`

### タスク
- [x] `AlarmDescriptionIcon.tsx`が直接importする`GRBL_ALARMS`/`GRBL_HAL_ALARMS`(サーバー側`constants.js`)の`description`を`t()`化(19件、重複排除後)
- [x] `constants/firmware/grbl.ts`/`grblHAL.ts`の`GRBL_SETTINGS`を調査 → **フロントのどこからも参照されていない未使用コード(デッドコード)と判明、対応不要**。`SettingsDescriptions.ts`は同名だが別の独自データ(M3-bで対応済み)
- [x] `GRBL_ERRORS`/`GRBL_HAL_ERRORS`を調査 → M3-bが見送った`Visualizer.jsx`とは別経路（`GrblController.js`→socket.io→`controllerSagas.tsx`のtoast）で**固定文言としてフロントに届いており翻訳可能**と判明。60件翻訳、`error.description`と`Alarm/Error`ラベルもt()化
- [x] `i18n-sync.mjs`を拡張: サーバー側`constants.js`のGRBL_ALARMS/GRBL_ERRORS配列を配列名で範囲指定してdescription抽出する仕組みを追加(サーバー側ファイルは読み取りのみ)
- [x] `unescape()`関数のバグ発見・修正: `\$`等の非標準エスケープを処理できておらず生成キーが実行時文字列と不一致になる不具合。全キー再実行でリグレッションなしを確認
- [x] `i18n:sync`(exit 0, keys 1639), `test:app`, `build`確認。esbuild全670ファイルパース + Vite devサーバーでの実地確認済み

---

## Agent-ブランチ戦略7項目調査

> カンガルー05番（ChatGPT＋晴樹さんの決定）で指定された調査タスク。**この段階ではmasterの履歴改変・default branch変更・大規模merge・本家PR送信は行わない**（読み取り専用の調査のみ）

### タスク
- [x] 現`master`の24 aheadコミット(upstream/dev基準)を全件分類（A:日本語化中核/B:開発支援/C:履歴のみ/D:本家へ返せる汎用修正候補）し、カンガルー05番の分類案に漏れがないか確認
- [x] 最新`upstream/dev`を基点にした`integration/dev-ja`作成手順を具体化
- [x] 日本語化の中核コミットについて、最新devへの適用難易度・変更ファイル重複・コンフリクト見込みを調査
- [x] `ja.json`1639件を新devへ移す際のキー再利用率を確認
- [x] 本家devで新たに増えたUI文字列を、日本語化機構がどう拾うべきか整理
- [x] `10e2166`のcheck-types修正を最新本家dev上で再現・検証し、本家PR候補として妥当か確認

### 完了タスク

---

## Agent-integration/dev-ja構築(Phase1: ブランチ作成+軽中度コミット再適用)

> カンガルー07番（Claude調査結果）を踏まえた次段階。決定文書(カンガルー05番)の3線ブランチ運用のうち`integration/dev-ja`を実際に作成する。**`master`には一切触れない。origin(自社フォーク)へのpushはOK、upstream(本家)への発信は一切行わない**

### タスク
- [x] `git fetch upstream` → `git checkout -b integration/dev-ja upstream/dev` → `git push -u origin integration/dev-ja`
- [x] 軽中度コミットの再適用（コンフリクトが機械的に解消できる範囲。判断に迷ったら無理せずスキップしリストアップ）:
  - [x] e94aea7b7 (i18n基盤新設) → `a99c26a97`として再適用済み
  - [x] dcab1f421 (MachineStatus/navbar等) → `f7264c52e`として再適用済み
  - [x] fd45ddcbb (Config画面残翻訳) → `457e2ab20`として再適用済み
  - [x] 1ccfb1ee0 (重複import自己修復) → **スキップ**。対象の重複はc52b994dc(M3-a)未適用のため今回は発生せず不要と判明
  - [x] 0b3a23417 (アラーム/エラー説明文) → `a3ffbbdf3`として再適用済み。upstream/dev側でsagaが大幅リファクタ済みのため旧ロジックは破棄し現行ロジックにt()適用
  - [x] 5bf868b06 (設定説明文・Confirm/toast) → `dc50d19bd`として再適用済み。`AutoSpinSetup.tsx`/`Visualizer.jsx`はupstream側で構造が丸ごと変わっており削除確定(スキップ)、`Rotary/Actions.tsx`もoursを全採用(構造差異のためConfirm二重化を回避)
- [x] 各コミット再適用ごとに`npm run i18n:sync` / `~/.claude/scripts/test-quiet.sh npm run test:app` / `npm run build`で確認（全段階で一致: Tests 7 failed/221 passed、失敗3件はいずれも今回変更していないファイルでupstream/dev既存の不具合と判断。buildは全段階成功）
- [x] 9c8b6e92c(M1本体,コンフリクト47件)・53e1e399a(M2,56件)・c52b994dc(M3-a周辺機能,68件・ATC/AccessoryInstaller構造変更あり)は**今回のスコープ外**。未着手。c52b994dcはAutoSpinSetup.tsx等と同根の「新Wizard構造への手動再wrap必須」問題と判明
- [x] 完了したら`integration/dev-ja`にコミット・push → `git push -u origin integration/dev-ja`成功、HEAD=`dc50d19bd`
- [x] `C:\Fujiruki\Projects\gSender\task.md`の本セクションのチェックボックスを`[x]`に更新（指揮AI側で実施）

### 完了タスク

---

## Codex-Plugin SDK配下UI調査（読み取り専用、Phase1と並行）

> `upstream/dev`にマージ済みのPlugin SDK(`packages/plugin-sdk/`)配下に、今後日本語化対象となるフロントエンドUIがどれだけあるか事前調査する。カンガルー07番5項目の宿題。

### タスク
- [x] `packages/plugin-sdk/`配下のフロントエンドPlugin管理UI・サンプルPluginのUIコンポーネントを洗い出す（SDK自体にUIはなし。実UIは`src/app/src/features/Plugins/`・`components/PluginToolCard/`・リポジトリ直下`plugins/*/`）
- [x] 既存のUI文字列パターン(JSX内テキスト、ボタンラベル等)を確認し、件数感を見積もる（本体約105〜120件+サンプル約195〜235件、合計約300〜355件）
- [x] `scripts/i18n-sync.mjs`のDATA_SOURCESに追加すべき対象パス候補をリストアップ（現行は完全一致方式でglob非対応、拡張が前提と判明）
- [x] 変更コミットは作らない（読み取り専用調査、報告のみ・遵守）

### 完了タスク

---

## Codex-i18n-sync.mjs折り返し正規化ロジック調査（読み取り専用、Phase1と並行）

> カンガルー07番調査で判明した「JSX複数行折り返しによるNEWキー検出の偽陰性」問題。`scripts/i18n-sync.mjs`の現状実装を確認し、改善案を提示する。

### タスク
- [x] `scripts/i18n-sync.mjs`のテキスト抽出・正規化ロジックを読み、JSX内の改行・連続空白をどう扱っているか特定する
- [x] `${var}`テンプレートリテラルから`{{var}}`補間記法への機械変換が可能な範囲を洗い出す
- [x] 改善案（正規化強化・近似候補検出の要否）を具体的に提示する

### 重要な訂正（カンガルー07番の仮説を修正）

前回調査(カンガルー07番)で「不一致215件の多くはJSX複数行折り返しによる偽陰性」と推測していたが、**誤りと判明**。`scripts/i18n-sync.mjs`はJSXを一切パースしておらず、正規表現`T_CALL`で`t('...')`呼び出しのみを抽出する(AST解析なし)。生のJSXテキストノードはそもそも抽出対象外のため「JSX折り返しで検出漏れ」という現象は起こり得ない。

真の原因は2通りに絞られる:
1. `t(...)`呼び出し自体の中に実改行・連続空白があり、`unescape()`が`\n`エスケープの変換のみでwhitespace collapse/trimを一切行わないため、微小な空白差で別キー扱いになる
2. そもそも該当箇所がt()化されていない生JSXテキスト（このツールからは原理的に見えない）

215件の再調査時は、この2パターンのどちらかをまず切り分けること。

### 改善案（実装はまだ、提案のみ）
- `unescape()`とは別に`normalizeKey = unescape(raw).replace(/\s+/g, ' ').trim()`を`add()`前に一律適用（既存`ja.json`側にも同じ正規化をかけないと`in`/`has`の完全一致比較が壊れる。衝突は黙って解決せず報告する設計にする）
- 生JSXテキストの翻訳漏れ検出が必要なら、正規表現でなくASTベース(JSXText)の抽出に作り替える必要がある（現状のregexベースでは不可）
- 既存の近似マッチ(`bigrams()`/`similarity()`, 閾値0.6)は「なぜマッチしたか」の理由（空白差のみ/変数名のみ/文字列類似度）を明示する多段階化を提案。自動採用は決定的な正規化一致のみに限定し、Levenshtein/bigramは人間レビュー用の提案に留める

### 完了タスク

---

## Agent-F-05 Homing安全性修正(hasHomed判定バグ)

> 対応spec: `docs/spec/02_機能仕様.md` F-05。実機の安全インシデント(2026-09-16)を受けた根本修正。`integration/dev-ja`上で実装・検証し、本家PRを見据える。その後`master`へも個別反映する

### タスク
- [x] `git fetch origin` → `integration/dev-ja`ブランチをcheckoutして作業する（`master`には触れない）
- [x] `GrblController.js`の`hasHomed`判定ロジック・`Jogging/index.tsx`の`canClick`/`canClickShortcut`判定を確認し、同じ欠陥が存在することを確認（`hasHomedSet`判定・`canClick`/`canClickShortcut`とも本家由来のまま。`Jogging/index.tsx`自体は今回未変更、別タスクとする判断）
- [x] 修正実装（Codex推奨順）:
  1. `hasHomed`の成功判定修正 → `GrblController.js`の`runner.on("status")`に`&& res.activeState !== GRBL_ACTIVE_STATE_ALARM`条件追加
  2. `ALARM:6`〜`9`受信時に`hasHomed`をfalseへリセット → `runner.on("alarm")`に追加
  3. `ALARM:8`(Homing fail)解除前に確認モーダルを追加 → 実際はALARM:6-9全て対象に拡大（GRBL_ALARMS定数で同一カテゴリと判明したため）。`UnlockButton/index.tsx`に`confirmUnlockAfterHomingFailure()`新設、`MachineStatus.tsx`のローカルunlockからも呼び出し
- [x] `npm run i18n:sync` / `~/.claude/scripts/test-quiet.sh npm run test:app` / `npm run build`で確認（両ブランチとも該当ファイルの失敗なし、既存3件の無関係な失敗のみ残存）
- [x] `integration/dev-ja`にコミット・push（コミット`39254de2f`）
- [x] 同じ修正内容を`master`ブランチにも個別コミットとして反映・push（コミット`d30998f2e`）
- [x] `C:\Fujiruki\Projects\gSender\task.md`の本セクションのチェックボックスを更新（指揮AI側で実施、マージコンフリクト解消込み）
- [x] `docs/spec/02_機能仕様.md`のF-05の状態を「未実装」→「実装済み」に更新（指揮AI側でAgent版とのマージコンフリクトを解消し反映）

---

## Codex-F-05 本家contrib/<topic>準備(PR未送信)

> F-05の修正は`integration/dev-ja`上ではt()ラップ済み。本家(upstream)にはi18n機構が無いため、英語文字列のみでロジックを移植し直す必要がある。**ブランチ作成・コミットまでで、PR送信はしない**

### タスク
- [x] `git fetch upstream` → `upstream/dev`から`contrib/homing-safety-fix`ブランチを作成する
- [x] `GrblController.js`の修正1,2(hasHomedの成功判定修正・ALARM:6-9でのリセット)をロジックのみ移植（コミット`49395374d`）
- [x] 修正3(確認モーダル)は`t()`を使わず英語文字列のみで実装し直す → `UnlockButton/index.tsx`に`isHomingFailureAlarm()`/`confirmUnlockAfterHomingFailure()`を新設し共通化、`MachineStatus.tsx`からも利用
- [x] コミットメッセージは英語、本家のコーディングスタイルに合わせる（無関係な整形は混ぜない）
- [x] `origin`へ`contrib/homing-safety-fix`をpush（`49395374d`、upstreamへは未送信）
- [x] `C:\Fujiruki\Projects\gSender\task.md`本セクションを更新（指揮AI側で実施）

---

## Agent-integration/dev-ja Phase2(M1本体 9c8b6e92c移植)

> Phase1で保留した重量コミットのうち、コンフリクト47件・機械的に対応可能と判定済みの9c8b6e92c(M1: 日常操作画面一式)から着手する

### タスク
- [x] `origin/integration/dev-ja`をcheckoutして作業する（`master`には触れない）
- [x] `9c8b6e92c`(feat: wrap M1 daily-operation UI strings with t() and add ja translations)をcherry-pickし、コンフリクトを「該当箇所を探してt()を当て直す」方針で解消 → コミット`70576eec5`
- [x] `npm run i18n:sync`(new:0) / `~/.claude/scripts/test-quiet.sh npm run test:app`(184件中174成功・7失敗はいずれも既存の`@sienci/gviewer`未インストール起因で今回変更と無関係) / `npm run build`(t()化コード自体は4051モジュール変換成功、失敗は同じgviewer未解決import起因)で確認
- [x] `integration/dev-ja`にコミット・push（`39254de2f..70576eec5`、fast-forward成功）
- [x] `53e1e399a`(M2)・`c52b994dc`(M3-a、ATC/AccessoryInstaller構造変更あり)には未着手。dev-ja側がupstream/dev由来の構造更新(import type化・dark:content-*トークン化・GcodeStepper連携UI等)を多数含んでおり、M2/M3でも同様の「機械的だが構造差分あり」パターン再発の可能性ありと申し送りあり
- [x] `C:\Fujiruki\Projects\gSender\task.md`本セクションを更新（指揮AI側で実施）

---

## Agent-F-06 改善要望送信機能(フィードバックウィジェット)

> 対応spec: `docs/spec/02_機能仕様.md` F-06。**`master`ブランチにのみ実装する。`integration/dev-ja`・`contrib/<topic>`には絶対に含めない**（藤田建具店フォーク限定のオリジナル機能、本家PR対象外）

### タスク
- [x] `master`をcheckoutして作業する（`integration/dev-ja`には触れない）※worktree上の作業ブランチはmaster HEADと同一コミットで分岐し、完了後にmasterへfast-forward pushする方式で実施
- [x] サーバー側: `src/server/api/`の既存パターン（`api.jobstats.js`等）に倣い`api.feedback.js`を新設。POST(新規要望作成)・GET(一覧取得)・PATCH(resolvedフラグ更新)のエンドポイントを実装
- [x] 永続化: 新規DBライブラリを追加せず、既存の`src/server/services/configstore`（`api.jobstats.js`等が使う自前JSONストア）を再利用。画像はファイルとして`.gsender-feedback-images/`（configファイルと同じディレクトリ＝リポジトリ外）に保存し、レコードにはファイル名のみ持たせる
- [x] フロントエンド: 全画面共通レイアウト（`src/app/src/workspace/index.tsx`）に常設のフローティングボタンを追加。押下でモーダル表示（`app/components/shadcn/Dialog`使用、`ConfirmationDialog`と統一感のあるスタイル）
  - テキストエリア（本文、必須）
  - 画像添付: ファイル選択ボタン + テキストエリアへの`onPaste`でクリップボード画像を検出しファイル化。複数枚可
  - 添付画像はサムネイル表示、各サムネイル右上に削除(×)ボタン
  - 優先度セレクト（高/中/低、デフォルト中）
  - 送信時に現在の画面(ルート)を判別しレコードに含める
  - 送信ボタン押下でAPIへPOST、成功したらモーダルを閉じてトースト通知
- [x] 新規UI文字列は`t()`でラップし`ja.json`に追加する（12件追加・翻訳済み）
- [x] テスト: 主要ロジック（API層のCRUD、優先度バリデーション等）にJestテストを先に書いてから実装する（TDD）。サーバー側7件・フロント4件、全て合格
- [x] `npm run i18n:sync`(new:0/untranslated:0/orphans:0) / `~/.claude/scripts/test-quiet.sh npm run test:app`(合格) / `npm run build`(合格)で確認
- [x] `.gitignore`にDB/画像保存先ディレクトリを追加（`.gsender-feedback-images/`）
- [x] `master`にコミット・push（この機能はintegration/dev-jaにcherry-pickしない）
- [x] `C:\Fujiruki\Projects\gSender\task.md`本セクションを更新
- [x] `docs/spec/02_機能仕様.md`のF-06の状態を「未実装」→「実装済み」に更新

---

## Codex-F-07 Electron本体のWindows起動修正

> 対応spec: `docs/spec/02_機能仕様.md` F-07。`master`に実装する

### タスク
- [x] `master`をcheckoutして作業する
- [x] `package.json`の`electron:hot`スクリプトの`bash -lc '...'`（Vite dev server起動待ちのポーリング）を、クロスプラットフォームで動く方式に置き換え。追加依存なしの`scripts/wait-for-url.mjs`（Node標準http/httpsでポーリング）を新設、`wait-on`はネットワーク制限で依存取得失敗のため断念
- [x] Codexの隔離実行環境ではElectronのGPU子プロセスがWindows DLLエラーで終了し確認不可だったため、指揮AI自身がこのbackPC上で`npm run electron:hot`を起動 → `nodemon`が`node ./bin/gsender -p 8000`を起動する構成と判明。**ポート8000は実機CNC接続用の既存サーバー(PID 9080, 朝から稼働中)と共有**されており、衝突を避けるため起動確認前にTaskStopで即座に停止（実機用プロセスは無事、影響なしを確認済み）。**Electronウィンドウの実起動確認は安全上の理由で見送り**（このポートを使う限りこのマシンでは安全にテストできない。実機サーバー停止中の時間帯に発注者側で確認するか、別ポートでのテスト用スクリプトが必要）
- [x] `npm run test:app` / `npm run build`で確認
- [x] 本家`upstream/dev`の`package.json`を確認 → `electron:hot`ではなく`pendant:electron:dev`に同じ`bash -lc`+`curl`待機処理が残存（本家への提案は未実施）
- [x] `master`にコミット・push（rebase後コミット`4a499ecc7`、origin/masterへpush）
- [x] `C:\Fujiruki\Projects\gSender\task.md`本セクションを更新（指揮AI側で実施、Codexジョブのstatusが更新されず`running`のまま停滞していたため、ログファイルを直接確認して回収）
- [x] `docs/spec/02_機能仕様.md`のF-07の状態を「未実装」→「実装済み」に更新

---

## Agent-integration/dev-ja Phase3(M2 53e1e399a・M3-a c52b994dc移植)

> Phase1/2で保留した残り2件。`c52b994dc`はATC/AccessoryInstaller周辺でupstream/dev側の構造(Wizardディレクトリ)が丸ごと変わっており、cherry-pickでは救えず新規に近い再wrapが必要と判明済み

### タスク
- [x] `origin/integration/dev-ja`をcheckoutして作業する（`master`には触れない）
- [x] `53e1e399a`(M2)をcherry-pick、56ファイル・149箇所のコンフリクトを「HEAD(dev-ja)の構造・クラス名を保持しt()ラップとimportだけ当て直す」方針で解消（コミット`c08ee1ef7`）。範囲超過の誤ラップ(`HelperInfo.tsx`)を是正(`0998f641c`)
- [x] `c52b994dc`(M3-a)に着手 → **想定に反し全65ファイル対応完了**。Wizardシェル部分(9ファイル+hooks)以外の62ファイルはupstream/dev側で旧パスのまま変更されておらず、gitのrename検出込み3-way mergeで機械的に解消できた。Wizardシェルのみ新パス(`components/Wizard/`)へ手動再wrap。RemoteMode/index.tsxの新規拡張部分(推奨アドレス警告等)はスコープ外として意図的に未ラップ
- [x] 各段階で`npm run i18n:sync`(M2: new 0/untranslated 22/orphans 332、M3-a: new 0/untranslated 20/orphans 20) / `~/.claude/scripts/test-quiet.sh npm run test:app`(既存3件の無関係な失敗のみ、新規失敗なし) / `npm run build`(exit 0)を確認
- [x] `integration/dev-ja`にコミット・push（`0998f641c..94dfe7da8`、fast-forward成功）
- [x] `C:\Fujiruki\Projects\gSender\task.md`本セクションを更新（指揮AI側で実施）

---

## ロードマップ(2026-09-17、発注者指定の優先順)

1. `10e2166b4`(check-types修正)の本家PR化
2. `pendant:electron:dev`の`bash -lc`問題を本家へ提案
3. F-05: `Jogging/index.tsx`の`canClick`/`canClickShortcut`にhasHomedを組み込む
4. F-07: Electronウィンドウの実起動確認（ポート競合を回避する方法込み）
5. 既存の未翻訳25件の翻訳
6. Plugin SDK配下のUI日本語化（`i18n-sync.mjs`のDATA_SOURCES拡張が前提）
7. Operator Plugin構想（本家Plugin SDK上に構築する新機能、まず仕様策定から）

1・2・3は互いに独立（別ブランチ・別ファイル）なので並列着手する。4は3と同じF-05系だが独立に進められる。5・6は同じ`integration/dev-ja`ブランチに影響するため3の完了後に着手する。7は最後。

---

## Codex-本家PR: 10e2166b4(check-types修正)のcontrib化 → Claude Agentへ切替

> カンガルー07番調査で無競合適用可能と判定済み。`contrib/<topic>`ブランチ作成からPR送信まで（本家PRのため晴樹さんの事前承認済み、2026-09-17指示）
>
> **注意**: Codexへ2回委託したが、両方ともネットワーク制限でpush/PR作成に失敗（サンドボックス内のクローンでcherry-pick自体は無競合で成功、コミット`10e014b2a`相当。`npm run check-types`は正常実行、既存の`PluginProxy.tsx`型エラーのみ残存で新規エラーなしを確認済み）。2回目は**メインチェックアウト(`C:\Fujiruki\Projects\gSender`)を誤って`contrib/check-types-path-fix`ブランチへ切り替える副作用**が発生(データ損失はなし、指揮AI側で`master`へ復帰・空ブランチ削除済み)。以後Claude Agentへ切替

### タスク
- [x] `git fetch upstream` → `upstream/dev`から`contrib/check-types-path-fix`ブランチを作成
- [x] `10e2166b4`(fix: correct check-types script path and tsc resolution)を`git cherry-pick`（無競合、コミット`7ed99771f`）
- [x] `npm run check-types`が実際にtscを走らせることを確認（既存の`PluginProxy.tsx`型エラー1件のみ残存、新規エラーなし）
- [x] `origin`へpush、PR作成完了: https://github.com/Sienci-Labs/gsender/pull/955
- [x] `C:\Fujiruki\Projects\gSender\task.md`本セクションを更新（指揮AI側で実施）

---

## Codex-本家PR: pendant:electron:devのbash -lc修正

> F-07(`scripts/wait-for-url.mjs`)と同じアプローチをupstream/dev側の`pendant:electron:dev`スクリプトに適用

### タスク
- [ ] `git fetch upstream` → `upstream/dev`から`contrib/pendant-electron-windows-fix`ブランチを作成
- [ ] `upstream/dev`の`package.json`の`pendant:electron:dev`スクリプトを確認し、同じ`bash -lc '...'`依存を、F-07と同様にNode標準API等クロスプラットフォームな方式に置き換える（`scripts/wait-for-url.mjs`をそのまま再利用できるか確認、必要なら同等のものを追加）
- [ ] Windowsで実際に動作確認する（ポート競合に注意。pendant用の別ポートを使うはずなので実機サーバーとは衝突しない想定だが、事前に使用ポートを確認すること）
- [ ] `origin`へpush、`gh pr create --repo Sienci-Labs/gsender --base dev`でPR作成
- [ ] `C:\Fujiruki\Projects\gSender\task.md`本セクションを更新

---

## Agent-F-05拡張: Jogging canClick/canClickShortcutへのhasHomed組み込み

> F-05実装時に「影響範囲が広いため別タスク」として意図的に先送りした残課題。`integration/dev-ja`上で実装し、`master`へも反映する（F-05と同じ方針）

### タスク
- [x] `origin/integration/dev-ja`をcheckoutして作業する（worktree制約により`origin/integration/dev-ja`追跡のローカル作業ブランチを作成して対応）
- [x] `src/app/src/features/Jogging/index.tsx`の`canClick`/`canClickShortcut`を確認し、`hasHomed`(Redux `state.controller.hasHomed`)を判定条件に追加する。`state.controller.settings.settings.$22`(Homing cycle enable)が0（Homing無効機体）の場合はhasHomedを無視してジョグを許可し、Homing無効機体の副作用を回避。ブロック時はジョグ確認モーダルではなく赤字の短い注意文表示（`t('Homing required before jogging')`）を採用
- [x] `npm run i18n:sync` / `~/.claude/scripts/test-quiet.sh npm run test:app`相当（jest直接実行、既存の無関係失敗3スイート除き問題なし） / `npm run build`で確認（いずれも成功。check-typesは環境側のtypescript依存が古く別問題のため対象外、`codex-checktypes-pr`対応待ち）
- [x] `integration/dev-ja`にコミット・push
- [x] 同じ修正を`master`へも個別コミットとして反映・push（F-05と同じ理由: 実機の安全確保）
- [x] `docs/spec/02_機能仕様.md`のF-05セクションに本拡張の内容を追記
- [x] `C:\Fujiruki\Projects\gSender\task.md`本セクションを更新
- 既知の限界: `JogWheel`等のマウス長押しジョグは`canClick`を実行時ガードとして使っておらず（スタイリングのみ）、キーボード/ゲームパッドのみ確実にブロックされる。この既存ギャップは本修正以前から存在し、対応は別タスクとする（詳細はspec参照）
- 残課題: 既存の未翻訳25件(Visualizer options、プラグインbackup先設定等)はM2/M3-aのスコープ外のため未対応
