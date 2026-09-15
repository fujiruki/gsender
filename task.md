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
- [ ] 実機確認: パッケージ化バイナリで実機CNC（無ければgrblHALシミュレータ）に接続し、接続→ジョグ→切断が日本語UIで完了することを確認（本Agentでは未実施。指揮AIがまずビルド起動してUI表示のみ確認、実機操作は別途）

### 完了タスク

---

## Agent-環境整備(check-types修正 + R-002時間計測)

> 対応spec: `docs/spec/05_技術設計.md`。i18n基盤(M0)と並行または直後に実施。コンテキストを持つ`codex-m0-i18n-base`に追加依頼する

### タスク
- [ ] `check-types`スクリプトのパスバグ修正（`tsc -p ./src/app/src` → `tsc -p ./src/app`）を**独立したコミット**にする
- [ ] `scripts/measure-time.mjs`を新規作成し、`npm run build:timed` / `npm run test:app:timed`で実行時間を`perf-log.csv`(gitignore対象)に記録できるようにする
- [ ] 修正後`npm run check-types`が実際に完走する(既存の2014件のエラー自体は今回のスコープ外なので直さない)ことを確認

### 完了タスク

---

## Agent-日常操作画面(M1)

> 対応spec: `docs/spec/02_機能仕様.md` F-02。M0完了後に着手

### タスク
- [ ] workspace/(TopBar, Sidebar, ToolArea, Alerts)を`t()`ラップ
- [ ] JobControl, FileControl, DRO, Jogging, Probe, Macros, Spindle, Coolant, Consoleを`t()`ラップ
- [ ] Config描画側5箇所(`SettingRow.tsx`, `Menu.tsx`, `SettingSection.tsx`, `Section.tsx`)に`t()`を追加（設定項目約260件を一括対象化）
- [ ] `npm run i18n:sync`でNEWキーを収集、`ja.json`を翻訳
- [ ] `npm run i18n:review`で対訳表を出力し通し読みレビュー（CNC用語の妥当性を確認）
- [ ] テストGREEN確認・ビルド確認

### 完了タスク

---

## Agent-ツール類(M2)

> 対応spec: `docs/spec/02_機能仕様.md` F-03。M1完了後に着手

### タスク
- [ ] Surfacing, Squaring, MovementTuning, Keyboard, Gamepad, Statsを`t()`ラップ
- [ ] ConfirmationDialogメッセージ, toaster呼び出し元, Helperウィザードを`t()`ラップ
- [ ] `i18n:sync` / `i18n:review` / テスト・ビルド確認

### 完了タスク

---

<!-- M3(余力)は時間に応じて以下をコピーして追加:

## Agent-設定説明文・周辺機能(M3)

### タスク
- [ ] SettingsDescriptions.ts(EEPROMSection.tsxで対応)
- [ ] AccessoryInstaller/ATC, Rotary, SDCard, RemoteMode, サーバー起点メッセージ

### 完了タスク

-->
