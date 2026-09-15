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
- [x] サーバー起点メッセージを調査。GRBLエラーコード等の動的合成文字列でサーバー側変更が前提となるため対応見送り(妥当な判断)
- [x] `i18n:sync`(exit 0, keys 1235, untranslated 1=ATC), `test:app`, `build`確認。翻訳235件追加

### 完了タスク

---
