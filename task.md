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

1. [x] `10e2166b4`(check-types修正)の本家PR化 → PR #955 MERGED
2. [x] `pendant:electron:dev`の`bash -lc`問題を本家へ提案 → PR #954 MERGED
3. [x] F-05: `Jogging/index.tsx`の`canClick`/`canClickShortcut`にhasHomedを組み込む
4. [x] F-07: Electronウィンドウの実起動確認（ポート競合を回避する方法込み）
5. [x] 既存の未翻訳25件の翻訳
6. [ ] Plugin SDK配下のUI日本語化（`i18n-sync.mjs`のDATA_SOURCES拡張が前提）
7. [ ] Operator Plugin構想（本家Plugin SDK上に構築する新機能、まず仕様策定から）

1〜5は完了。なお本家PR #953(F-05 Homing safety fix)もkglovern氏指摘を踏まえた追加対応(Rehomeダイアログ化)込みで2026-09-21にMERGED済み。6・7が残作業。

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
- [x] `git fetch upstream` → `upstream/dev`から`contrib/pendant-electron-windows-fix`ブランチを作成
- [x] `upstream/dev`の`package.json`の`pendant:electron:dev`スクリプトの`bash -lc '...'`依存を、`scripts/wait-for-url.mjs`(Node標準http/httpsでポーリング、追加依存なし)に置き換え(コミット`fc5bef793`)
- [x] `origin`へpush、PR作成・マージ完了: https://github.com/Sienci-Labs/gsender/pull/954 (2026-09-21、kglovern氏マージ)
- [x] `C:\Fujiruki\Projects\gSender\task.md`本セクションを更新（指揮AI側で発見・実施。2026-09-17時点で実施済みだったがtask.md更新漏れ）
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

---

## Agent-F-07続き: Electronウィンドウ実起動確認(別ポート対応込み)

> 前回Codexが安全上の理由で見送った実起動確認。ポート8000は実機CNC接続用サーバー(`start-gsender.bat`)が常時使用中のため、確認作業は別ポートで行う。`master`ブランチで作業する

### タスク
- [x] `start-dev:nodemon`(`node ./bin/gsender -vv -p 8000`)・`electron:hot`のポート8000ハードコードを、環境変数(例: `GSENDER_DEV_PORT`、未設定時は従来通り8000)で上書き可能にする
- [x] 作業前に`netstat -ano | grep ":<使用予定ポート>"`で衝突がないことを確認してから起動する。ポート8000(実機用サーバー)は絶対に停止・変更しない
- [x] 別ポート(例: 8099)で`electron:hot`相当を起動し、Electronウィンドウが実際に開きレンダラーが表示されることを確認する。確認方法はプロセス確認・ログ・可能ならスクリーンショット等、実行環境で可能な手段でよい
  - 実際は8099が別プロセス(無関係なpython)に使用中だったため8199を使用。electron.exeプロセス4個(メイン+子)が起動し、レンダラーがVite dev server(5173)にESTABLISHED接続、optimizeDeps再読み込みまで進行。GPU子プロセスのDLLクラッシュ等は発生せず(前回Codexの隔離サンドボックスでの問題は再現せず)
- [x] 確認後は起動したプロセスを確実に停止する(実機用ポート8000のプロセスに影響がないことも確認)
  - 併せて、削除済みworktree`agent-aac771097972a7467`由来の孤立プロセス(旧`electron:hot`残骸、ポート8000衝突で失敗したまま残留)も発見し終了させた
- [x] 恒久的な仕組みとして残す場合は`docs/spec/05_技術設計.md`または該当specに追記する
- [x] `npm run test:app` / `npm run build`で既存機能に影響がないことを確認
  - `test:app`は`.claude/worktrees/`配下の他Agentの並行worktreeをjestが誤って巻き込み(`testPathIgnorePatterns`に`.claude/worktrees`が未設定)失敗したが、これは既存の環境要因であり今回の変更とは無関係。`--testPathIgnorePatterns`でworktreeを除外して再実行し、対象10スイート・82件成功(3件skip)を確認済み
- [x] `master`にコミット・push
- [x] `C:\Fujiruki\Projects\gSender\task.md`本セクションを更新
- [x] `docs/spec/02_機能仕様.md`のF-07の状態・備考を実起動確認結果で更新

---

## Agent-integration/dev-ja残存未翻訳25件の翻訳

> Phase3完了時点の`i18n:sync`結果(`keys: 1655前後 new: 0 untranslated: 20 orphans: 20`)を踏まえ、残存未翻訳キーをすべて解消する。`integration/dev-ja`ブランチで作業する(`master`には触れない)。F-07(masterで作業中)とは別ブランチのため並行作業可能。メインチェックアウトの事故防止のため`git worktree`を使うこと

### タスク
- [x] `git worktree`で`origin/integration/dev-ja`追跡の作業ブランチを作成する(メインチェックアウト`C:\Fujiruki\Projects\gSender`本体は絶対にcheckoutし直さない)
- [x] `npm run i18n:sync --review`(または`i18n:review`)で現在の未翻訳キー一覧を洗い出す(Visualizer options、プラグインbackup先設定等が該当する見込み)
- [x] 各未翻訳キーの出現箇所を特定し、他のキーと同様の方針で自然な日本語訳を`ja.json`に追加する(意訳しすぎず、既存の訳文のトーン・専門用語の統一を踏襲する)
- [x] `npm run i18n:sync`が`new: 0 untranslated: 0`になることを確認
- [x] `~/.claude/scripts/test-quiet.sh npm run test:app` / `npm run build`で確認
- [x] `integration/dev-ja`にコミット・push
- [x] `C:\Fujiruki\Projects\gSender\task.md`本セクションを更新

---

## 残課題メモ(未着手、優先度低)

- **jest設定の`.claude/worktrees`除外漏れ**: `jest.config.js`の`testPathIgnorePatterns`が`.claude/worktrees`配下を除外しておらず、並行worktree作業中に他Agentの作業ファイルをjestが誤って巻き込み`npm run test:app`が不安定になることがある(F-07 Agent報告、2026-09-17)。次にworktreeを使うAgentタスクの際にでも合わせて修正する
- **ゾンビ化したworktree(`agent-aa3c45ae337d7315f`, `contrib/homing-safety-fix`用)**: 過去の「Codex-F-05 本家contrib準備」タスクの残骸とみられ、`claude.exe`(PID 20768、このセッションのteammateには存在しない孤立プロセス)にロックされたまま`49395374d`で停止している(2026-09-18確認)。発注者判断で当面放置。次にこのworktreeを使う/触る際は、originが`ea1128c50`まで進んでいることを踏まえ`git pull --ff-only`してから作業すること
- **`GcodeStepper.test.tsx`のフレーキーな失敗**: Operator Plugin T4完了確認時、`npm run test:app`の1回目実行でこのテストが失敗したが再実行で解消(2026-10-04 T4 Agent報告)。タイミング依存のモック検証が原因と推測され、T4の変更ファイルとは無関係。頻発するようなら原因調査する

---

## Agent-F-05追加: Homing失敗ダイアログのRehome化+ALARM8/9案内文言

> 本家PR #953へのkglovern氏指摘を受け、kaigi(`docs/kaigi/2026-09-18-Homing失敗時UX再検討.md`)で再検討した結論(段階1)をfableが詳細設計。実装のみ担当(設計は完了済み、以下は設計の要約と実装指示)

### 背景・設計要約
- 対象は`src/app/src/features/UnlockButton/index.tsx`の`confirmUnlockAfterHomingFailure()`のみ(呼び出し元2箇所は無変更)
- ダイアログの2択を`Unlock/Cancel`→`Rehome(既定・強調、homeMachine()呼び出し)/Unlock Anyway`に変更
- ALARM:8/9(リミットスイッチ検出/解除異常。6/7とは性質が異なる)のときだけ、ダイアログ本文に追加段落を表示: 「スイッチ故障の可能性」+「Config>原点復帰／リミット>$22をオフ→設定を適用、という具体的な脱出手順」
- 3ブランチへの適用が必要。詳細は`docs/kaigi/2026-09-18-Homing失敗時UX再検討.md`とfableの報告(このセッションの会話ログ)を参照:
  1. `master`: 新規実装(下記コード例参照)
  2. `integration/dev-ja`: masterとほぼ同一hunk、cherry-pickベースで移植(import順で軽微な衝突の可能性あり)
  3. `contrib/homing-safety-fix`(PR #953用ブランチ): シグネチャが`(code, onUnlock)`ではなく`(onConfirm)`で`t()`無し・英語直書きのため手移植が必要。呼び出し元(`MachineStatus.tsx`)でcodeを渡す形に変更してからALARM判定を追加する

### masterでの実装コード例(fable提示、そのまま採用可)
```tsx
import { homeMachine } from 'app/features/DRO/utils/DRO';

const HOMING_FAILURE_ALARM_CODES = [6, 7, 8, 9]; // 既存
const LIMIT_SWITCH_FAULT_ALARM_CODES = [8, 9]; // 新規

export function isLimitSwitchFaultAlarm(code: string | number): boolean {
    return LIMIT_SWITCH_FAULT_ALARM_CODES.includes(code as number);
}

export function confirmUnlockAfterHomingFailure(code, onUnlock) {
    if (!isHomingFailureAlarm(code)) { onUnlock(); return; }
    Confirm({
        title: t('Homing Not Complete'),
        content: (
            <>
                <p>{t(BASE_TEXT)}</p>
                {isLimitSwitchFaultAlarm(code) && <p className="mt-2">{t(FAULT_TEXT)}</p>}
            </>
        ),
        confirmLabel: t('Rehome'),
        cancelLabel: t('Unlock Anyway'),
        onConfirm: homeMachine,
        onClose: onUnlock,
    });
}
```

### 文言(ja.jsonキー=英文そのもの、fable確定案)
- 基本文(既存キーを差し替え):
  - EN: `The last homing cycle failed, so the machine position is unknown. Re-home the machine before continuing. Unlocking without re-homing may let jogging or a job run past the limit switches.`
  - JA: `直前の原点復帰サイクルが失敗したため、マシンの位置が不明な状態です。続行する前に再度原点復帰してください。原点復帰せずにロック解除すると、ジョグやジョブの実行がリミットスイッチを超えてしまう可能性があります。`
- 追加文(ALARM:8/9限定、新規キー):
  - EN: `ALARM:8 and ALARM:9 mean a limit switch was not found or would not release, so re-homing will keep failing until the switch or its wiring is fixed. To use the machine without homing until then: choose Unlock Anyway, open Config > Homing/Limits, turn off "Homing cycle enable" ($22) and click Apply Settings.`
  - JA: `ALARM:8/9はリミットスイッチが検出できない、または解除されない状態を示します。スイッチ本体や配線を修理するまで、再原点復帰は失敗し続ける可能性があります。修理までの間、原点復帰なしでマシンを使うには「それでもロック解除」を選び、設定 > 原点復帰／リミット を開いて「原点復帰サイクル有効化」($22)をオフにし、「設定を適用」を押してください。`
- `Rehome`/`Unlock Anyway`/`Homing Not Complete`は既存キー流用、旧確認文キーはORPHAN化するので削除する

### タスク
- [x] `master`ブランチで実装(上記コード例・文言を適用)。`npm run i18n:sync`(旧キー削除・新キー追加を反映)、テスト新規作成(下記)、`~/.claude/scripts/test-quiet.sh npm run test:app` / `npm run build`確認
- [x] テスト新規作成: `src/app/src/features/UnlockButton/tests/confirmUnlockAfterHomingFailure.test.tsx`。`Confirm`(`ConfirmationDialogLib`)・`homeMachine`(`app/features/DRO/utils/DRO`)・`controller`(`app/lib/controller`)をモックし、以下を検証:
  1. code=3(非Homing系)→`onUnlock`即時呼び出し、`Confirm`未呼び出し
  2. code=6→confirmLabel==='Rehome'、cancelLabel==='Unlock Anyway'、onConfirmでhomeMachine呼び出し、onCloseでonUnlock呼び出し
  3. code=8,9(`test.each`)→追加案内文言が表示される
  4. code=6,7(`test.each`)→追加案内文言が表示されない
  5. code='Homing'→onUnlock素通り
- [x] `docs/spec/02_機能仕様.md`F-05の該当箇所(ダイアログ仕様・受け入れ条件)を更新
- [x] `master`にコミット・push
- [x] `git worktree`で`origin/integration/dev-ja`を作業し、同じ修正を移植。`npm run i18n:sync` / テスト / ビルド確認後、コミット・push(メインチェックアウトは触らない)
  - 既存worktree(`.claude/worktrees/agent-af3adeb91b76d108d`)を再利用。node_modulesが古く`npm run build`が失敗したため`yarn install`で更新(lockfileへの差分なし)。コミット`8bd49b953`
- [x] `git worktree`で`upstream/dev`ベースの`contrib/homing-safety-fix`(PR #953のブランチ、既存の`origin/contrib/homing-safety-fix`を継続)を作業し、シグネチャの違いを踏まえて手移植(英語のみ、`t()`無し)。テスト・ビルド確認後、`origin`へpush
  - 既存worktree(`.claude/worktrees/agent-aa3c45ae337d7315f`)は別Agent(pid 20768、稼働中)がロック中のため、衝突回避のため一時ブランチ`contrib-homing-safety-fix-f05addendum`で別worktreeを作成し作業。`origin/contrib/homing-safety-fix`へfast-forward push後、一時worktree・ブランチは削除済み。コミット`ea1128c50`
  - **注意**: ロック中worktree(`agent-aa3c45ae337d7315f`)はローカルで`49395374d`のまま(originは`ea1128c50`に進んだ)。そのAgentが次にpushする際は事前に`git pull --ff-only`が必要
- [x] PR #953にpushしたコミットを反映させた上で、kglovern氏への返信コメントを英語で下書きする(投稿は指揮AI確認後に行う。「dialog now offers Rehome as primary action, and ALARM 8/9 additionally explain how to disable homing via $22 to keep using the machine while the switch is repaired」等の趣旨)
  - 下書きは指揮AIへの完了報告に記載。投稿(`gh pr comment`)は未実施
- [x] `C:\Fujiruki\Projects\gSender\task.md`本セクションを更新
- [x] 段階2(本家Issue提起): https://github.com/Sienci-Labs/gsender/issues/965 (2026-10-03投稿。機能追加を要求せず方針相談のトーン。事前にPR#953/954/955のマージ状況・既存Issue・upstream/dev直近動向を確認済み、衝突や重複なし)
- [ ] 段階3(hasHomedの3値化等)は今回のスコープに含めない

---

## Agent-Plugin管理UIのi18n化

> ロードマップ6番目。`integration/dev-ja`ブランチ限定の作業(`master`には`packages/plugin-sdk`/`features/Plugins`が未取り込みのため存在しない。確認済み: `git ls-tree -r --name-only origin/master -- src/app/src/features/Plugins/` は0件)
>
> **スコープ確定(発注者承認2026-10-03)**: Plugin管理UI本体(`src/app/src/features/Plugins/`配下)の静的UI文字列のみ対象。サンプルPlugin(`plugins/*`の`gsender-plugin.json`)・SDK本体(`packages/plugin-sdk/`)は対象外(サンプルは開発者向けデモで日常使わない、将来のOperator Pluginは自作なので最初から日本語で書ける)

### タスク
- [x] `git worktree`で`origin/integration/dev-ja`を作業(既存worktree `.claude/worktrees/agent-af3adeb91b76d108d`を再利用可。originがbehind 1の可能性があるため`git pull --ff-only`してから開始すること)
- [x] 対象18ファイル(テスト`__tests__/*.test.tsx`除く)を確認し、ユーザー向け静的UI文字列(ボタンラベル・見出し・トースト/エラーメッセージ等)のみ`import { t } from 'app/i18n'` + `t('...')`でラップする
  - `src/app/src/features/Plugins/components/{InstallPluginDialog,PluginManager,PluginPage,PluginPanel,PluginProxy,PluginTabPanel,PluginVisualizerOverlayHost}.tsx`
  - `src/app/src/features/Plugins/hooks/{usePluginIframeTheme,usePluginInstall,usePlugins}.ts`
  - `src/app/src/features/Plugins/{index.ts,types.ts}`
  - `src/app/src/features/Plugins/utils/{capabilities,plugin-permissions,pluginBridge}.ts`
  - **ラップ禁止**: Plugin registryから取得した動的文字列(`plugin.name`/`plugin.description`等、各`gsender-plugin.json`由来のデータ)。固定のUI文字列のみが対象
  - 既存コーディングルール通り、無関係な整形・リファクタは混ぜない
  - 実際にt()でラップしたのは7ファイル(`InstallPluginDialog.tsx`/`PluginManager.tsx`/`PluginPage.tsx`/`PluginTabPanel.tsx`/`PluginVisualizerOverlayHost.tsx`/`usePluginInstall.ts`/`usePlugins.ts`)。残りは対象外と判明: `PluginPanel.tsx`・`usePluginIframeTheme.ts`・`index.ts`・`types.ts`・`utils/capabilities.ts`・`utils/plugin-permissions.ts`は固定UI文字列なし。`utils/pluginBridge.ts`のエラーメッセージはUI非表示のPlugin SDKプロトコルエラー(開発者向け)のため対象外。`PluginProxy.tsx`は構文エラーを含む未使用(どこからもimportされていない)ファイルと判明、対象外
  - `InstallPluginDialog.tsx`の`STEP_TITLE`/`EYEBROW`/`KIND_ACTION`(ステップ名・アクションボタンラベル)はプレーンRecordの値をそのまま`t()`で包むと機能しない(モジュールトップレベル評価のため`initI18n()`実行前に固定化される問題 + `i18n-sync.mjs`がリテラル`t('...')`呼び出ししか検出できない問題の二重理由)と判明したため、switch文ベースの関数(`stepTitle`/`eyebrowText`/`kindActionLabel`)に書き換えて対応
- [x] `npm run i18n:sync`で新規キー(new)を確認、`ja.json`に翻訳を追加（英文キー方式、既存の訳と語彙・文体を揃える）→ 新規103件追加・翻訳済み(new: 0 / untranslated: 0。既存の無関係なorphan7件は変更前と同一のまま)
- [x] `~/.claude/scripts/test-quiet.sh npm run test:app` / `npm run build`で確認(既知の無関係な失敗`StepThroughStatus`/`surfacing-output`/`InstallPluginDialog`以外に新規失敗がないこと) → 確認済み(Test Suites: 3 failed/23 passed、失敗3件は既知のもののみ。buildはexit 0)
- [x] `integration/dev-ja`にコミット・push → コミット`7615976a8`、push成功
- [x] `docs/spec/02_機能仕様.md`に本件の状態を追記(該当セクションがなければ新設) → F-08として新設
- [x] `C:\Fujiruki\Projects\gSender\task.md`本セクションを更新

---

## Agent-Operator Plugin T1: Plugin足場・SDK接続確認

> 対応spec: `docs/spec/02_機能仕様.md`(F-09)・`docs/spec/07_OperatorPlugin.md`(詳細設計、必読)。`integration/dev-ja`ブランチ限定(`master`へのバックポートは当面行わない)

### タスク
- [x] `git worktree`で`origin/integration/dev-ja`を作業する(既存worktree `.claude/worktrees/agent-af3adeb91b76d108d`を再利用可。originがbehindの可能性があるため`git pull --ff-only`してから開始すること) → 既にup to date(HEAD `7615976a8`)だった
- [x] `plugins/react-ts-app/`をテンプレートに`plugins/operator-plugin/`を新規作成。`gsender-plugin.json`の`id`は`com.fujiruki.operator`、`capabilities`は`machine:get:context, machine:command, machine:query, machine:busy:set, redux:get:state, storage:*`、topicsは`redux, controller, parser`、PRBパーサ(`^\[PRB:(?<x>..),(?<y>..),(?<z>..)(?:,[-\d.]+)*:(?<ok>[01])\]$`)を登録 → `storage:*`は実体の6requestType(`storage:get/set/delete/get:all/set:all/clear`)に展開して記載(`src/server/services/pluginregistry/grants.js`で確認)。PRBパーサは設計書の`..`プレースホルダーを、動作実績のある`parser-demo`と同じ`[-\d.]+`に置換(文字通り2文字一致では実データに合わないため)。グループ名`x/y/z/ok`は設計書通り維持
- [x] Tailwindを`plugins/basic-cam/`を参考に追加 → `@tailwindcss/vite`導入、`index.css`は`@custom-variant dark`含めbasic-camと同一パターンを踏襲
- [x] `plugins/README.md`の「Local development」手順に従い、devモードでPluginが自動ビルド・ロードされることを確認 → `node scripts/prepare-dev-plugins.js`を直接実行し、operator-pluginの`npm install`→`vite build`が自動実行され`ui/`が生成されることを確認(他の既存サンプルPluginと同じ扱いで動作)
- [x] 接続確認・`machine.query('$#')`での現在のWCS値取得・`storage.set/get`の疎通確認のみを行う最小UI(本格的な機能はT2以降) → `useTypedSelector`で接続状態表示、`machine.query('$#')`のレスポンスからG54行を正規表現抽出してX/Y/Z表示、`storage.set`/`storage.get`の往復確認UIを実装
- [x] `plugins/operator-plugin/README.md`に、ブランチ方針(開発は`integration/dev-ja`限定、`master`へのバックポートは当面行わない。現場投入可能になった段階で`integration/dev-ja`系を次期現場版へ昇格させる)を明記
- [x] `npm run test:app` / `npm run build`で確認(影響範囲が新規Pluginのみであることを確認) → `test:app`: Test Suites 23 passed/3 failed(失敗3件は`StepThroughStatus`/`InstallPluginDialog`/`surfacing-output`。既知の無関係な失敗で新規失敗なし)。`build`: exit 0、basic-camのみdefault pluginとしてバンドルされoperator-pluginは影響なし。加えて`plugins/operator-plugin`単体でも`npm run build`・`tsc --noEmit`を実行し成功を確認
- [x] `integration/dev-ja`にコミット・push → コミット`562971336`、push成功
- [x] `C:\Fujiruki\Projects\gSender\task.md`本セクションを更新(Agent側で実施)

---

## Agent-Operator Plugin T2: 機械状態取得＋ステートマシン骨格

> 対応spec: `docs/spec/07_OperatorPlugin.md`の「ステートマシン設計」節(必読)。T1で作った`plugins/operator-plugin/`に追加実装する。`integration/dev-ja`ブランチ限定

### タスク
- [x] `git worktree`(T1と同じ`.claude/worktrees/agent-af3adeb91b76d108d`)で作業。開始前に`git pull --ff-only`
- [x] TDDで進める(プロジェクト既定の開発方式)。まずテーブル駆動テストを書き、失敗を確認してからロジックを実装する → `deriveWorkflowState.test.ts`を先に作成(24ケース)→RED確認→実装→GREEN
- [x] `MachineSnapshot`型を定義
- [x] `aux`型(storage由来の補助データ)を定義。**状態名(HOMED/READY等)はstorageに保存しない**設計を徹底
- [x] `deriveWorkflowState(snapshot, aux)`純関数を実装。導出順7・8は「7でG54がスロットに一致した場合のみ8へ継続、不一致ならHOMED_UNVERIFIEDで終端」という入れ子構造として実装(design docの状態遷移図`ORIGIN_SET → FILE_LOADED → READY`と整合させる解釈。spec/07も明確化済み)
- [x] テーブル駆動テストで8分岐+境界値+優先順位を検証 → 24ケース全PASS
- [x] `controller.settings.parameters`は`$#`発行時のみ更新されるため、マウント時・接続時に`machine.query('$#')`を発行(fire-and-forget。ホスト側reduxが自動更新するためレスポンスは直接使わず、`useTypedSelector`購読で反映される)
- [x] `subscribeSelector`(`useTypedSelector`)で状態変化ごとに再評価するフックを実装
- [x] UIに導出状態名と理由を表示
- [x] `npm run test:app` / `npm run build`で確認 → 新規失敗なし(既知の3件のみ)
- [x] `integration/dev-ja`にコミット・push → コミット`c0c93cf46`
- [x] `C:\Fujiruki\Projects\gSender\task.md`本セクションを更新(指揮AI側で実施)

### 補足(実装上の発見)
- `controller.settings.parameters`のG54/G92は実サーバー実装上、軸値が文字列で届く(`{x:"...", y:"...", z:"..."}`)。型・比較ロジックとも文字列前提+`Number.parseFloat`で実装
- G54とスロットの一致判定は軸ごとの絶対差±0.01mm以内(ユークリッド距離ではなく各軸独立判定)
- aux型は5フィールド定義したが、T2で実際に読むのは`originSlots`のみ。他(`checklistHistory`/`routine`/`adminPinHash`/`pluginSettings`)はT3以降で使うプレースホルダー

---

## Agent-Operator Plugin T3: 加工原点保存/復元

> 対応spec: `docs/spec/07_OperatorPlugin.md`の「加工原点の保存・復元」節(必読)。T2の`deriveWorkflowState`に乗せる形で実装する。`integration/dev-ja`ブランチ限定

### タスク
- [x] `git worktree`(同じ`.claude/worktrees/agent-af3adeb91b76d108d`)で作業。開始前に`git pull --ff-only`
- [x] TDDで進める → 新規29テストケース、T2の24件と合わせてplugin内合計55件全PASS
- [x] 原点スロットのCRUD(storage永続化)を実装。マクロ3・5の初期データ投入
- [x] `$#`応答のパース(G54〜G59, G92, PRB)を実装
- [x] G92検出ダイアログ: `window.confirm`はPlugin iframeの`sandbox`に`allow-modals`が無いため動作しないと判明、自前モーダル(`ConfirmDialog`+`useConfirmDialog`)で実装。承認後のみ`G92.1`送信
- [x] 復元フロー実装(擬似コード通り)
- [x] 「現在のG54を新スロットとして保存」機能実装 → **要修正、下記参照**
- [x] ガード条件によるボタン無効化+理由表示
- [x] `npm run test:app` / `npm run build`で確認 → 新規失敗なし
- [x] `integration/dev-ja`にコミット・push → コミット`88a5577d6`
- [x] `C:\Fujiruki\Projects\gSender\task.md`本セクションを更新(指揮AI側で実施)

### 既知のギャップ(発注者確認済み、対応不要)
- Zのみスロット(「NC底面Z0」)復元後は`deriveWorkflowState`のORIGIN_SET判定(X/Y/Z全軸一致)にかからず`HOMED_UNVERIFIED`のままになる。発注者確認の結果、現状のままでよいとの判断(T8実機試験で実際の運用パターンを見てから、マッチャー拡張の要否を判断する)

### 要修正: 「現在のG54を新スロットとして保存」の実装
- [x] `G10 L20`の実機への送信処理を削除し、`$#`読み取りのみに修正 → `saveCurrentPosition.ts`から送信処理削除、依存を`Pick<RestoreDeps, 'query'>`に縮小
- [x] 関連テストを修正 → `query('$#')`が1回だけ呼ばれG-code送信が一切ないことを検証する形に修正
- [x] `npm run test:app` / `npm run build`で再確認 → 新規失敗なし
- [x] `integration/dev-ja`にコミット・push → コミット`5b9c6306e`
- [x] `C:\Fujiruki\Projects\gSender\task.md`本セクションを更新(指揮AI側で実施)

---

## Agent-Operator Plugin T4: 既存CNCjsプローブの移植(Z/XY/XYZ)

> 対応spec: `docs/spec/07_OperatorPlugin.md`の「プローブ(XYZ一括/XYのみ/Zのみ)」節(必読)。移植元は`docs/spec/reference/cncjs-probe-macros-source.md`のマクロ1・2・4(gSender本体の`Probing.ts`は参考資料のみ、正本にしない)。`integration/dev-ja`ブランチ限定

### 前提(必読)
- gSenderのマクロ処理エンジン(feeder)は`Math`等の関数をcontext変数に含まないため、CNCjsマクロの`Math.abs(...)`等はそのまま動かない。**全数値をPlugin(TypeScript)側で決定論的に計算し、数値リテラルだけのG-code行を`machine.command('gcode', lines)`で送ること**(`%`行・`[式]`を含むマクロをそのまま送信してはいけない)
- 実機ファームウェアはGrbl 1.1固定。grblHAL分岐は不要
- **G92は一切生成しない**(T3のG92方針と同じ)
- **Grbl 1.1固有の注意**: `G91`(相対座標)モード中の`G53`は増分として扱われるため、`G53`移動は必ず`G90`に切り替えてから発行し、直後に`G91`へ戻すこと

### タスク
- [x] `git worktree`(同じ`.claude/worktrees/agent-af3adeb91b76d108d`)で作業。開始前に`git pull --ff-only`
- [x] TDDで進める → 新規28テスト、T2/T3の55件と合わせてplugin内合計75件全PASS
- [x] ゴールデンテストを先に書く → マクロ1・2それぞれでG92関連行(開始`G92 X0 Y0 Z0`+絶対移動1箇所)を`G53`置換に差し替えた上で、それ以外の全行の計算値が元マクロの`%VAR`算術と一致することを検証(行の生テキスト一致ではなくspec/07の整理済み構造準拠+計算値一致という解釈。元マクロがcncjs固有記法を含むため妥当と判断)
- [x] XYZ一括プローブ生成関数を実装 → G92依存の絶対移動を`G90/G53 G0 X[H.x+keepoutX] Y[H.y-20·dirY]/G91`に置換、`G10 L20`は常時`P1`
- [x] XYのみプローブ生成関数を実装 → `includeZ`フラグでXYZ版と共有、Z接触ブロックのみ省略、側面探査深さ-10、送信前ガード`mpos.z+10≤0`
- [x] Zのみプローブ生成関数を実装(マクロ4、P0→P1、先頭`G21 G54`、末尾`G90`)
- [x] PRBパーサで完了判定実装(接触回数カウント+`activeState==='Idle'`かつ`modal.distance==='G90'`のポーリング待機、250ms間隔・60秒タイムアウト)
- [x] `machine.setBusy(true,'Probing')`実装
- [x] 失敗時(ALARM:4/5)案内文言+unlock回復導線実装(`machine.addListener('error', ...)`で検知)
- [x] プローブ結果を新規原点スロットとして保存する導線追加(T3の`saveOriginSlot`を再利用)
- [x] `npm run test:app` / `npm run build`で確認 → 新規失敗なし(1回目`GcodeStepper.test.tsx`が失敗したが再実行で解消、フレーキーと判断し残課題メモに記録)
- [x] `integration/dev-ja`にコミット・push → コミット`65f1367b0`
- [x] `C:\Fujiruki\Projects\gSender\task.md`本セクションを更新(指揮AI側で実施)

---

## Agent-Operator Plugin T5: 朝の起動Workflow

> 対応spec: `docs/spec/07_OperatorPlugin.md`の「加工原点の保存・復元」節の「復元フロー(最終版)」および全体の状態遷移図。T3の`restoreOrigin`をそのまま呼び出す。`integration/dev-ja`ブランチ限定

### 概要
CNCjsマクロ3「ホーミング＋いつもの左前XY0に設定する」(`$H` → `G10 L2 ...`)の`$H`部分をWorkflow側に分離した2段構成。「接続確認→安全確認(可動域確認ダイアログ)→ホーミング→加工原点復元(T3)→READY」という一連の手順を1つの画面で案内する。

### タスク
- [x] `git worktree`(同じ`.claude/worktrees/agent-af3adeb91b76d108d`)で作業。開始前に`git pull --ff-only`
- [x] TDDで進める → 新規11テスト、T2-T4の75件と合わせてplugin内合計85件全PASS
- [x] 接続状態の表示(未接続時は本体側での接続を促す案内のみ、Pluginから接続操作はしない)
- [x] 安全確認ダイアログ(簡易1項目確認、T3のG92確認ダイアログと同じ`useConfirmDialog`基盤を再利用)。承認後のみホーミングへ進む
- [x] ホーミング実行(`machine.command('homing')`)
- [x] `homing:has-homed`+`activeState==='Idle'`復帰待ち。60秒タイムアウトでALARM扱い
- [x] ホーミング完了後、T3の`restoreOrigin`を**そのまま呼び出す**(再実装せず合成)。スロットはプルダウンで選択可能(固定ではなく一覧から選択、デフォルトは一覧先頭)。ガード状態はホーミング完了**後**に読み取る設計(事前固定するとrestoreOriginが常にBLOCKEDになるため、テストで明示検証済み)
- [x] `deriveWorkflowState`の進行(ORIGIN_SET→READY等)をUIに表示
- [x] 1画面にまとめたWorkflow UI(Connect/Safety check/Homing/Restore origin/Readyの5段階ステッパー)
- [x] `npm run test:app` / `npm run build`で確認 → 新規失敗なし
- [x] `integration/dev-ja`にコミット・push → コミット`2cef6e107`
- [x] `C:\Fujiruki\Projects\gSender\task.md`本セクションを更新(指揮AI側で実施)

---

## Agent-Operator Plugin T6: 安全チェックリスト

> 対応spec: `docs/spec/07_OperatorPlugin.md`の状態遷移図(`READY → [安全チェックリスト全項目✓] → PRECHECK_OK → [実行] → RUNNING ⇄ PAUSED → JOB_DONE`)。`integration/dev-ja`ブランチ限定

### チェックリスト項目(発注者ヒアリング原文、2026-10-03)
1. 刃物交換が正しく行われているか
2. 集塵機が動いているか
3. 移動範囲に金属製の固定具等の干渉物がないか
4. ワークが固定されているか
5. 固定具の締め具合は確認したか
6. 一時停止・緊急停止ボタンがすぐ押せる体制か

### タスク
- [x] `git worktree`(同じ`.claude/worktrees/agent-af3adeb91b76d108d`)で作業。開始前に`git pull --ff-only`
- [x] TDDで進める → 新規12テスト、T2-T5の85件と合わせてplugin内合計97件全PASS
- [x] 6項目のチェックリストUI実装(チェックボックス+説明文+画像プレースホルダー、`imageSrc`未設定時は点線枠表示、差し替えやすい構造)
- [x] 全6項目チェック済みでないと実行ボタンを有効化しない → T2の`deriveWorkflowState`は変更せず、独立した純関数`canExecuteJob(workflowState, checklistComplete)`で「READY(実機由来)」と「チェック完了(操作者確認)」のANDとして判定。T2の既存24テストは無改修・無影響
- [x] Plugin再読込後は常にチェックを再要求する → チェック状態は`useState`のみで管理、storageに一切保存しない
- [x] チェック履歴はstorageに記録(安全判定には使わない、監査ログ用途)
- [x] 実行ボタン押下で`machine.command('gcode:start')`を送信
- [x] `workflow:state`購読でRUNNING⇄PAUSED⇄JOB_DONEを反映 → `idle`単体では「未実行」と「ちょうど完了」を区別できないため、セッションローカルな`wasRunningOrPaused`フラグと組み合わせた`deriveJobPhase`で解決
- [x] PAUSED中の一時停止/再開ボタン実装
- [x] `npm run test:app` / `npm run build`で確認 → 新規失敗なし
- [x] `integration/dev-ja`にコミット・push → コミット`344f2c203`
- [x] `C:\Fujiruki\Projects\gSender\task.md`本セクションを更新(指揮AI側で実施)

---

## Agent-Operator Plugin T7: Routine Mode

> 対応spec: `docs/spec/07_OperatorPlugin.md`の「UIロック(ルーチンモード中の誤操作防止)の扱い」節・状態遷移図(`JOB_DONE → mode=ROUTINE → ROUTINE_SWAP → PRECHECK_OK`)。`integration/dev-ja`ブランチ限定

### 今回のスコープに含めないもの(重要)
**本体(gSender)のナビゲーション・接続操作・ゲームパッドのロックはこのタスクでは実装しない。** 現状のPlugin SDKでは実現できないと判明済みで(T1調査済み)、「パートさん向け正式Operator Modeの完成条件」として本家への機能提案(`ui:lock:set`案)が必要という位置づけのまま、T9で検討する。今回はPlugin内でできる範囲(mode管理・短縮チェックリスト・離脱の意図的操作要求)のみ実装する。

**複数プログラム工程(プログラムA実行→人間が配置変更→プログラムB実行→1個完成、というサイクル)も今回のスコープ外。** 発注者が「特殊なケースなので後回し」と明言(2026-10-04)。今回は単一ファイルの繰り返し運用のみを対象にする。

### 短縮チェックリスト項目(発注者確認済み、2026-10-04確定)
- ワークが固定されているか
- 固定具の締め具合は確認したか

(刃物交換・集塵機・干渉物・非常停止の4項目は、同一ジョブの繰り返しでは状態が変わらないため省略)

### タスク
- [x] `git worktree`(同じ`.claude/worktrees/agent-af3adeb91b76d108d`)で作業。開始前に`git pull --ff-only`
- [x] TDDで進める → 新規18テスト、T2-T6の97件と合わせてplugin内合計117件全PASS
- [x] `mode`(NORMAL/ROUTINE)フラグをstorageに永続化、ROUTINE開始時にファイル名記録
- [x] `routine.active`の自動解除(ファイル名不一致時)
- [x] サイクルカウンターをstorageに記録・UI表示
- [x] JOB_DONE後、mode=ROUTINEの場合は確定2項目の短縮チェックリストを表示 → `cycleCount===0`なら常にフルチェック、`>=1`なら短縮版、という単一ルールで実装
- [x] 非常停止(ALARM/ERROR)からの復旧 → **T2の`deriveWorkflowState`・T5の`runStartupSequence`/`StartupPanel`は一切無改修**。既存のF-05修正(ALARM:6-9で`hasHomed`自動リセット)によりALARM解除後は自然に`CONNECTED_UNHOMED`へ遷移しT5が機能、READY復帰後は`cycleCount`(storage永続化)を読む単一ルールが自然にルーチン継続をカバーするため、ステートマシンへの特別な接続は不要だったとのこと(優れた設計判断、承認)。ALARM中バナー表示を実装
- [x] ROUTINEモードからの離脱を長押し(1.5秒、進捗バー付き自前実装)+確認ダイアログ+PIN入力(設定時のみ)の3段階で実装
- [x] 管理者PIN(WebCrypto SHA-256でハッシュ化、storageにはハッシュのみ保存。未設定なら自由/設定済みならPIN要求を、Admin Mode切替とROUTINE離脱の両方で共通利用)
- [x] `role`はセッション限定(storageに保存せず)
- [x] 副次対応: T3で未実装だった「現在位置を新スロットとして保存」のAdmin権限ゲートもこのタイミングで解消(`OriginPanel.tsx`修正)
- [x] `npm run test:app` / `npm run build`で確認 → 新規失敗なし
- [x] `integration/dev-ja`にコミット・push → コミット`cd7f35727`
- [x] `C:\Fujiruki\Projects\gSender\task.md`本セクションを更新(指揮AI側で実施)

### 将来タスク(今回は実装しない、記録のみ)
- 複数プログラム工程対応: ルーチン定義に複数ステップ(ファイル)を持たせる設計
- 非常停止復旧時に「どのステップ(プログラムA/B等)から再開するか」を人間に選ばせるUI(複数プログラム対応とセットで必要になる)

## Agent-Operator Plugin デバッグ: Tools→Operatorが真っ白になる問題

### 背景(指揮AI側で確認済み)
- T1〜T7実装後、発注者が`integration/dev-ja`のworktree(`.claude/worktrees/agent-af3adeb91b76d108d`)で`npm run dev:electron`を実際に起動して確認したところ、本体メニューは正しく日本語化されているが、**Tools→Operatorを開くと画面が真っ白**になる
- 本体のElectron/サーバー/Vite起動、Plugin registryでの`operator-plugin`認識・配信(`/plugins/operator-plugin`)は正常。`GSENDER_FORCE_PLUGIN_BUILD=1`で強制リビルドしても同じ結果
- `App.tsx`は`StartupPanel`/`ChecklistPanel`/`OriginPanel`/`ProbePanel`/`AdminControls`/`AdminRoleProvider`を正しくimport・レンダリングしている(コード上は配線済み)
- ビルド自体は成功(エラーなし)、`tsc --noEmit`もエラーなし、`vitest`もplugin単体で117件全PASS
- → ビルドエラーではなく、**実行時にReactツリーがクラッシュしている**可能性が高い(React 18はエラーバウンダリが無い場合、例外発生でツリー全体がアンマウントされ画面が真っ白になる)
- F12 / Ctrl+Shift+I / Altキーでのメニュー表示、いずれも効かずDevToolsを開けなかった(`--remote-debugging-port`フラグ・`ELECTRON_EXTRA_LAUNCH_ARGS`環境変数も不発)。原因不明(gSender本体のキーボードショートカット処理と干渉している可能性あり、深追いはしていない)

### タスク
- [x] 発生源の切り分け → `ErrorBoundary`を`main.tsx`のルートに追加し、スタックトレースを直接取得
- [x] 診断 → DevToolsはElectronウィンドウで開けなかったため、Chrome DevTools MCPで`http://localhost:5173`に直接接続してTools→Operatorを操作しコンソールエラーを取得(代替手段を採用)
- [x] 根本原因を特定し修正: **`vite.config.ts`の冗長な`rollupOptions.external`配列がReactの二重バンドルを引き起こしていた**(`gsenderPlugin()`は本来react/react-dom/JSXランタイムも自動外部化するが、Plugin側が自前で`external`配列を書くとそれが上書きされ、Reactがインライン化され2つのReactインスタンスが共存→`useTypedSelector`呼び出し時に片方のdispatcherがnullでクラッシュ)。**operator-plugin固有のバグではなくSDK全体(`plugins/README.md`記載の公式手順自体)のバグと判明**、同パターンの`basic-cam`/`controller-events-demo`/`nothing-plugin`/`react-ts-app`とREADMEも合わせて修正。バンドルサイズ264KB→40KBに縮小(二重バンドル解消の裏付け)
- [x] 修正後、`npm run dev:electron`実行、Tools→Operatorで画面表示を目視確認(Chrome DevTools MCP経由。全パネル正常表示、コンソールエラーなしを確認)
- [x] `npm run test:app` / `npm run build`で確認 → 新規失敗なし
- [x] `integration/dev-ja`にコミット・push → コミット`37ce671dd`
- [x] `C:\Fujiruki\Projects\gSender\task.md`本セクションを更新(指揮AI側で実施)

### 指揮AI判断: ErrorBoundaryを恒久的に残す(承認)
Agentの提案により、診断用に追加した`ErrorBoundary`(`plugins/operator-plugin/src/components/ErrorBoundary.tsx`)を一時コードとして削除せず、恒久的な安全網として残すことにした。理由: React 18はデフォルトでエラーバウンダリを持たないため、将来別のバグが入った場合も画面全体が無言で真っ白になるのを防ぎ、エラー内容が画面に直接表示されるようにするため。今回は根本原因(React二重バンドル)を特定・修正した上での追加であり、原因不明のまま症状を隠すものではないため、CLAUDE.mdの「symptom隠しのtry-catch禁止」の趣旨には反しないと判断。

### 副次発見(今回は対応していない、記録のみ)
- `plugins/corner-finder/vite.config.ts`が`gsenderPlugin()`自体をimportしていない(SDK連携設定が丸ごと欠落)。今回のバグとは別件、スコープ外のため未対応

---

## Agent-Operator Plugin UI日本語化

> 発注者確認済み(2026-10-05): T1〜T7で実装した画面はまだ英語のまま。本体メニューは日本語化済みなので、画面内の表記統一のため日本語化する

### 方針
- Operator Pluginは独立したバンドル(iframe内、別Reactツリー)のため、本体の`app/i18n`(`t()`/`ja.json`)を直接importすることはできない。Plugin SDKにi18n機能が提供されているか確認した上で、無ければ**本体のi18n基盤を模倣した機構は作らず、UI文字列を直接日本語に書き換える**方針とする(Operator Pluginは藤田建具店フォーク専用で本家contribに出す予定がなく、英語版を併存させる必要性が無いため。ponytail方針: このためだけにi18n機構を新設しない)
- 対象: `App.tsx`・`StartupPanel.tsx`・`ChecklistPanel.tsx`・`OriginPanel.tsx`・`ProbePanel.tsx`・`AdminControls.tsx`・`AdminRoleContext.tsx`・`PinPromptDialog.tsx`・`ConfirmDialog.tsx`・`ErrorBoundary.tsx`等、画面に表示される全ての文字列(ラベル・説明文・ボタン・プレースホルダー・エラーメッセージ・確認ダイアログ文言)
- **Workflow状態名(`DISCONNECTED`/`CONNECTED_UNHOMED`/`HOMING`/`READY`等)は内部のenum値のまま変更しない。** 画面表示する際だけ日本語ラベルにマッピングする表示層を追加する(T2の`deriveWorkflowState`本体・テストは変更しない)
- コード中のコメント・変数名・テストの説明文(`describe`/`it`)は英語のまま(コードは触らない方針を踏襲、変えるのはUIに表示される文字列のみ)
- 既存spec(`docs/spec/07_OperatorPlugin.md`)の状態遷移図や擬似コード中の英語表記はそのままでよい(仕様書は英語/日本語混在の既存スタイルを踏襲)

### タスク
- [x] Plugin SDKにi18n関連の機能が無いことを確認(`packages/plugin-sdk/src`をgrep、該当なし) → 方針通りUI文字列を直接日本語に置き換え
- [x] 画面に表示される全文字列を日本語化(31ファイル変更、新規6ファイル: `src/i18n/workflowStateLabel.ts`・`activeStateLabel.ts`・`translateWorkflowReason.ts`等の表示用マッピング層を新設)
- [x] Workflow状態名の表示用日本語マッピングを追加 → **T2の`deriveWorkflowState`本体・テストは完全に無改修**。enum値は内部では引き続き英語のまま、表示層でのみ変換。原点スロット名が埋め込まれる`reason`文字列(ORIGIN_SET/READY/FILE_LOADED)は正規表現でスロット名を抽出し日本語テンプレートに再埋め込みする方式
- [x] 安全チェックリスト6項目を発注者ヒアリング原文(task.md記載)に統一
- [x] `gsender-plugin.json`のname/description/label、原点スロットのデフォルト名(「いつもの左前XY0」「NC底面Z0」)も仕様書の表記に統一
- [x] `npm run test:app` / `npm run build`で確認 → 新規失敗なし(T3〜T7のロジックモジュールの英語文字列を検証していたテストのみアサーション更新、T2は無改修)
- [x] `npm run dev:electron`実行、Tools→Operatorで日本語表示を確認(Chrome DevTools MCP経由、全セクション・管理者モード切替含め確認、コンソールエラーなし)
- [x] `integration/dev-ja`にコミット・push → コミット`c5d7579de`
- [x] `C:\Fujiruki\Projects\gSender\task.md`本セクションを更新(指揮AI側で実施)

---

## Agent-Operator Plugin T8実機試験: 原点復元がORIGIN_MISMATCHになる(実測値0,0,0)

> T8実機試験(発注者、2026-10-05)の最初の検証で発覚。「朝の起動シーケンス」実行→ホーミング正常完了→原点復元の検証で不一致、実測値がX0 Y0 Z0と表示された(UI文言: 「原点復帰しましたが、復元後の検証で原点が一致しませんでした(実測値 X0 Y0 Z0)。自動再試行はせず、人による判断が必要です」)

### 指揮AI側で確認した手がかり(コード読み取りのみ、編集していません)
- `src/origin/restoreOrigin.ts`の`g54 = afterParams.G54 ?? { x: '0', y: '0', z: '0' }`というフォールバックがあり、「X0 Y0 Z0」はこのフォールバック値である可能性が高い(=`deps.query('$#')`の応答に`G54`行が含まれていなかった、またはパースに失敗した)
- `parseParameterLines.ts`の正規表現(`/^\[(G5[4-9]|G92):([-\d.]+),([-\d.]+),([-\d.]+)(?:,[-\d.]+)*\]$/`)自体はGrbl 1.1の標準的な`$#`応答形式と一致するはずで、パターン自体の誤りは見当たらなかった
- `restoreOrigin()`のフロー: `deps.sendGcode(buildRestoreGcode(target))`(`G21,G90,G54,G10 L2 P1 X.. Y.. Z..,$#`を送信)した**直後**に`deps.query('$#')`で検証している。`sendGcode`が「送信完了」(機械へ文字列が渡った)のみを意味し「実行完了」(ファームウェアが`G10 L2`のEEPROM/NVS書き込みまで終えた)を保証しないなら、**検証クエリがG10 L2の処理完了前に実行され、古い(まだ更新前の)G54を読んでしまうレースコンディション**が疑われる。T3設計時にfableが「厳密な実行順序保証はT8の実機検証に委ねる」と事前に明記していた懸念点そのもの

### タスク
- [x] `sendGcode`/`machine.command`/`machine.query`(Plugin SDK)の完了保証の実態を再確認 → サーバー側`CNCEngine.js`を確認し確定。`machine.command`(feederキュー経由)は「ackは配信完了のみを意味し、ほとんどのコマンドハンドラに完了シグナルは無い」とコード自体のコメントに明記。`machine.query`(`GrblController.pluginQuery`)はfeederを完全にバイパスしシリアルポートへ直接書き込み、実際のファームウェア応答を待ってresolveする
- [x] レースコンディションの有無を特定・修正 → **確定**。feeder経由の`sendGcode`(G10 L2送信)と、直接書き込みの`query('$#')`検証の2チャネル間に排他制御が存在せず、G10 L2未処理のうちに`$#`が先着し古い(または欠けた)G54を読んでいた。これが`{x:'0',y:'0',z:'0'}`フォールバックに落ち「実測値X0 Y0 Z0」として現れていた
- [x] 修正: `restoreOrigin.ts`の送信経路を`query()`一本に統一。G92.1クリア・G21/G90/G54/G10 L2の各行を1行ずつ`await`しながら`query()`で逐次送信(feeder/`sendGcode`は不使用に)。feeder末尾の無駄な`$#`も削除し、明示的な最終検証クエリ1回に整理。`RestoreDeps`型から`sendGcode`を完全削除、`OriginPanel.tsx`/`StartupPanel.tsx`の呼び出し側も追従
- [x] 回帰防止テスト追加: `$#`応答にG54行が無い場合にクラッシュせず`ORIGIN_MISMATCH`を返すことを検証。`restoreOrigin.test.ts`/`runStartupSequence.test.ts`を逐次`query()`呼び出しシーケンスの厳密検証に書き換え
- [x] `npm run test:app` / `npm run build`で確認 → plugin単体126件全PASS、新規失敗なし
- [x] `integration/dev-ja`にコミット・push → コミット`0869da28d`
- [x] `C:\Fujiruki\Projects\gSender\task.md`本セクションを更新(指揮AI側で実施)
- [ ] **発注者による実機再検証待ち**: 「朝の起動シーケンス」を再実行し、原点復元が正しくORIGIN_SET(一致)になるか確認

### 関連リスク(今回は未対応、記録のみ)
T4の`runProbe.ts`(プローブ実行)も同じ「`sendGcode`で送信→`waitForSettle`→`query`で検証」という形をしており、理論上は同じレースコンディションの可能性がある。ただし実際のモーション(G38.2)を伴うぶん処理に時間がかかり、`waitForSettle`のポーリングが偶然race を覆い隠している可能性が高い(保証ではない)。プローブ特有の実機検証と大きめの設計変更が必要なため今回は未対応。**T8でプローブ機能(Zのみ/XYのみ/XYZ一括)を試す際は、原点復元と同様の不一致が起きないか注視すること**

### 発注者への安全上の注意(指揮AI側で伝達済み)
修正前の状態ではホーミング後のG54が復元されず不一致のままの可能性があったため、ジョグ・加工を進めないよう案内済み。修正後は実機再検証をお願いしている。

### 実機再検証結果(2026-10-05、一部成功・新たな表示バグ発見)
- 原点復元の**実機動作自体は成功**。「準備完了: 原点をG54 X-345.801 Y-213.302 Z-57.665に復元しました。」というメッセージが表示され、発注者が物理的にも正しい位置であることを確認済み。レースコンディション修正は実機で効果を確認できた
- **ただし新たな表示不整合バグを発見**: 復元成功メッセージのすぐ下に「現在の状態: 原点未確認 -- G54が保存済みの原点スロットと一致しません。」という矛盾したメッセージが同時に表示される。画面上部の「ワークフロー状態」も「原点未確認」のまま。「朝の起動」ステッパーが4番目「原点復元」で止まり、5番目「準備完了」に進まない

### タスク(追加)
- [x] 指揮AI提示の仮説(reduxが`machine.query`経由だと更新されない)を検証 → **反証・否定**。サーバー側`GrblController.js`の受信処理(`connectionEventListener.data`→`runner.parse()`→`settings.parameters`更新→250ms`queryTimer`差分検出→`controller:settings`emit)は書き込みチャネル(`command`/`query`どちらか)に一切依存しないことをコードで確認。reduxは正しく更新されていた
- [x] 真の原因を特定: **`plugins/operator-plugin/src/workflow/useWorkflowState.ts`が原点スロット一覧を独自ロジックで読んでおり、デフォルトが空配列(`storage.get(..., [])`)だった**。一方`restoreOrigin.ts`/`OriginPanel.tsx`/`StartupPanel.tsx`は`origin/originSlotsStorage.ts`の`listOriginSlots()`(デフォルト値=「いつもの左前XY0」等あり)を使っていた。**同じstorageキーに対し2ファイルが食い違うデフォルト値を持っていた単純な実装ミス**で、レースコンディションでも実機固有のタイミング問題でもなかった。出荷時デフォルトのまま(まだ独自スロットを保存したことがない)環境でのみ発現: `deriveWorkflowState`に渡る`aux.originSlots`が常に空になり、G54がどんな値でも`matchedSlot`が絶対に見つからず`HOMED_UNVERIFIED`から進めなくなる
- [x] 修正: `useWorkflowState.ts`の独自読み込みを削除し`listOriginSlots()`に統一(1ファイル・10行)
- [x] テスト: 新規単体テストは追加せず(判断: `useWorkflowState.ts`は元々単体テストの無いSDKフック配線層で、委譲先の分岐ロジック自体は既存の`originSlotsStorage.test.ts`/`deriveWorkflowState.test.ts`でカバー済みのため、1箇所のためだけの新規モック基盤は過剰と判断。妥当)。`tsc --noEmit`エラーなし、vitest 126/126 PASS(既存のまま)、`npm run build`成功
- [x] `integration/dev-ja`にコミット・push → コミット`6e32a4905`
- [x] `C:\Fujiruki\Projects\gSender\task.md`本セクションを更新(指揮AI側で実施)
- [x] **発注者による実機再検証完了**: 表示不整合バグ解消を確認(「原点設定済み -- 原点が「いつもの左前XY0」と一致しています。」と正しく表示)

### 補足確認: ステッパーが4番目「原点復元」で止まる件 → 仕様通り、UI案内文を追加
発注者から「準備完了まで進まない」と再度報告があったが、調査の結果**バグではなく仕様通り**と判明。spec/07のステートマシン設計(`ORIGIN_SET → FILE_LOADED → READY`)通り、READYにはG-codeファイルのロードも必要で、今回は単に発注者がまだファイルをロードしていなかっただけ。ただしUIがその区別を示せていなかった(ORIGIN_SET正常時とバグで止まっている時が画面上で見分けられない)ため、`translateWorkflowReason.ts`のORIGIN_SET用メッセージに「続けるにはG-codeファイルを読み込んでください。」という案内を追加。TDD(テスト先行→RED→実装→GREEN)で実施、`integration/dev-ja`にコミット・push(`9f83f78c3`)。126/126 PASS、ビルド成功。

### 朝の起動Workflow、実機フルフロー確認完了(2026-10-05)
発注者がCarve画面でG-codeファイルをロード→Operatorに戻る、という手順で「準備完了 -- 原点が「いつもの左前XY0」と一致し、ファイルが読み込まれ、マシンは待機中です。」の表示まで到達。接続→安全確認→原点復帰(ホーミング)→原点復元→準備完了、朝の起動シーケンス全体が実機で正しく動作することを確認した。

**T8残りの確認項目**: プローブ機能(Zのみ/XYのみ/XYZ一括)の実機確認。`runProbe.ts`に理論上同じレースコンディションの可能性があるとAgentから報告済みのため、慎重に確認する。
