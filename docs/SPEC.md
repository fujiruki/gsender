# gSender(日本語化フォーク) 仕様書マップ (SPEC.md)

## プロジェクト概要

OSSのCNCコントローラ「gsender」をフォークし、独自のi18n基盤で日本語UIを追加するプロジェクト。当初の目的(日本語化)に加え、現在は以下3つの軸で進めている。

1. **日本語化**(本来の目的): M0〜M3で日常操作画面を日本語化、F-08でPlugin管理UIも日本語化
2. **本家への還元**: 日本語化の過程で見つけた不具合修正(F-05・F-07等)を本家にPRとして送る。2026-10-03時点でPR #953・#954・#955の3件がマージ済み
3. **Operator Plugin構想**(将来の独自機能): 本家Plugin SDK上に、CNC作業を標準化し誰でも安全に操作できる仕組みを構築する。詳細は[spec/07_OperatorPlugin.md](spec/07_OperatorPlugin.md)

---

## 仕様書一覧

### コア仕様書（`spec/`）

| # | ファイル | 概要 | 最終更新 |
|:--|:--|:--|:--|
| 01 | [概要](spec/01_概要.md) | 何を作るか・誰のためか・解決する課題 | 2026-09-15 |
| 02 | [機能仕様](spec/02_機能仕様.md) | F-01〜F-09の機能一覧と詳細仕様 | 2026-10-04 |
| 05 | [技術設計](spec/05_技術設計.md) | i18n基盤設計・rebase運用方針 | 2026-09-15 |
| 06 | [変更履歴](spec/06_変更履歴.md) | 仕様変更の経緯と理由 | 2026-09-15 |
| 07 | [Operator Plugin構想](spec/07_OperatorPlugin.md) | フェーズ1(標準作業Workflow)の技術設計詳細 | 2026-10-04 |

画面設計(03)・データ設計(04)は対象外（既存gsenderの画面構成・データ構造は変更しないため）。

### 参照資料

| ファイル | 役割 |
|:--|:--|
| [spec/reference/cncjs-probe-macros-source.md](spec/reference/cncjs-probe-macros-source.md) | Operator Plugin T3/T4の移植元。発注者が実機運用中のCNCjsプローブ・原点マクロ5件 |

### 要望管理

| ファイル | 役割 |
|:--|:--|
| [requests.md](requests.md) | 未対応の要望一覧（発注者が書く） |
| [request_log.md](request_log.md) | 全リクエストの対応履歴（指揮AIが管理） |

### 関連ドキュメント

| ファイル | 役割 |
|:--|:--|
| [docs/kaigi/2026-09-15-i18n設計レビュー.md](kaigi/2026-09-15-i18n設計レビュー.md) | fable提案に対するkaigi(AI専門家会議)のレビュー詳細 |

---

## 現在地(2026-10-04)

- 日本語化: M0〜M3＋F-08(Plugin管理UI)まで完了
- 本家還元: F-05(Homing安全性)・F-07(Electron起動修正)・check-types修正を本家PR化、PR #953/#954/#955すべてマージ済み。フォローアップIssue #965投稿済み(回答待ち)
- Operator Plugin構想: フェーズ1(標準作業Workflow)の技術設計完了([spec/07_OperatorPlugin.md](spec/07_OperatorPlugin.md))。T1(Plugin足場)の実装着手前

---

## ディレクトリ構成

```
gSender/
├── src/app/              # フロントエンド (React + TS + Vite)
│   └── src/i18n/         # i18n基盤: t()/ja.json/i18n-sync
├── src/server/           # バックエンド (Node.js + Express)
├── packages/plugin-sdk/  # 本家Plugin SDK(integration/dev-jaのみ)
├── plugins/               # Plugin本体(サンプル+operator-plugin、integration/dev-jaのみ)
├── scripts/              # i18n-sync.mjs 等
├── docs/                 # 仕様書群
│   ├── SPEC.md           # ← このファイル（目次）
│   ├── spec/             # コア仕様書 + reference/(移植元資料)
│   ├── kaigi/             # AI専門家会議の記録
│   ├── requests.md       # 未対応要望
│   ├── request_log.md    # 対応履歴
│   └── handover/         # Agent引き継ぎ資料
└── task.md               # 実装タスク（ダッシュボード連携）
```
