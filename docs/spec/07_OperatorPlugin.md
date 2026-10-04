# 07. Operator Plugin構想

## 位置づけ

2026-09-16にChatGPT＋晴樹で決めた開発方針(カンガルー内`2026-09-16_02_gSender_日本語化_PluginSDK_OperatorPlugin_開発方針_引き継ぎ.md`)に基づく。目的はAIがCNCを自由操縦することではなく、**CNC作業を標準化し、パート作業者を含め誰でも安全に操作できる仕組みを作ること**。本家Plugin SDKを徹底的に利用者として使い、不足は実需要から発見し、その不足だけを汎用機能として本家へ還元する方針は変更しない。

技術調査はfableモデルによるコード実査(2026-10-03〜04)で行った。カンガルー内`2026-10-04_01_gSender_OperatorPluginフェーズ1_技術調査_相談.md`に初版の相談記録がある。本ファイルはその後の発注者レビュー(5点修正)と最終調整を反映した確定版。

## フェーズ分け

- **フェーズ1: 標準作業Workflow**(本ファイルの対象): 加工原点の保存・復元、朝の起動シーケンス、プローブ(XYZ一括/XYのみ/Zのみ)、安全確認チェックリスト、ルーチンワークモード、管理者モード分離
- **フェーズ2: 商品レシピDB**(別途扱う、本ファイルの対象外): 商品ごとの必要ストック・エンドミル・設定を記録するDB、AIへの自然言語指示での呼び出し

## フェーズ1要求(発注者ヒアリング、2026-10-03)

1. **加工原点の保存・復元(最重要)**: リセット/緊急停止後も、ホーミングすれば毎回同じ加工原点(WCS)に復元できるようにする
2. **朝の起動シーケンス**: 接続確認→安全確認→ホーミング→加工原点復元→準備完了
3. **安全確認チェックリスト**: 実行直前に画像付きで複数項目を確認させる
4. **ルーチンワークモード**: 繰り返し加工中の誤操作防止、意図的操作でのみ解除
5. **管理者モード分離**: パスワードは任意(デフォルトはかけない)

## 開発ブランチ方針(発注者確定、2026-10-04)

- `master`(現場安定版)への本家Plugin SDKバックポートは**当面行わない**
- 開発ブランチは`integration/dev-ja`のみ。`contrib/*`(本家向け)にはPlugin本体を一切含めない
- Pluginが現場投入可能になった段階で、十分テストした`integration/dev-ja`系を次期現場版へ昇格させる(昇格判断は発注者)

## UIロック(ルーチンモード中の誤操作防止)の扱い

### 現状のSDKでできること(実測確認済み)

- Pluginが`tools-page`スロットで全画面表示されている間、本体のCarve領域(Jog/Console/DRO/JobControl/Probe/Macros/WorkspaceSelector)はCSSで非表示になる
- キーボードショートカットは全停止される(`holdShortcuts()`相当の既存機構)

### 現状のSDKでできないこと

- TopBar(接続/切断ボタン)・Sidebarナビゲーション・戻るボタンによる離脱は防げない
- ゲームパッドでのジョグは止まらない
- 離脱するとPlugin(iframe)がunmountされ、内部状態は消える(storageに永続化すれば復帰時に再現可能)

### 方針

本家issue/PR/branchに類似機能は見当たらない。`machine:busy:set`と同じ形の`ui:lock:set { locked, reason }`という小さなAPI提案が方向性として妥当だが、**今すぐ提案はしない**。

- 晴樹さん本人による試験期間: tools-pageの既存挙動(Carve非表示・キーボード停止)+暫定運用(ゲームパッド非接続、ナビ離脱しない)で進める
- 「手順書でカバー＝解決済み」とは扱わない。**Host側操作ロックAPIの実現は、パートさん向け正式Operator Modeの完成条件として明記して残す**
- T8(実機試験)で必要性を確認した後、T9で本家への提案を検討する

## 加工原点の保存・復元

G54〜G59オフセットは機械原点からの相対値としてファームウェアが保持しており、`$#`応答(`[G54:x,y,z]`)で読める。本体のATCウィザード(`RackPosition.tsx`)が`G10 L2 P<n> X.. Y.. Z..`(現在位置に依存しない絶対値指定)で同じ手法を使っている実績がある。

### L20とL2の使い分け(設計原則)

- `G10 L20` = 「今ここを基準にする」(プローブ直後のみ使用、位置依存)
- `G10 L2` = 「保存済みの機械座標値を書き戻す」(復元のみ使用、位置非依存、移動なし)。X/Y/Zのうち指定軸のみ更新し他は保持する

### G92問題と解決方針(最重要の技術的発見)

CNCjs実機マクロ(`docs/spec/reference/cncjs-probe-macros-source.md`のマクロ1・2)は`G92 X0 Y0 Z0`で一時基準点を設定し、`G91`(相対座標)でプローブ処理全体を行う。Grblの`G10 L20`計算式(`WCS = MPos − G92オフセット − 指定値`)により、**G54にはG92分が織り込まれた状態で確定し、マクロはG92を明示的にクリアしないまま終了する**。G92は通常リセット・電源断で消えるため、リセット後はG54単独 = 本来の原点から任意量ズレた状態になる。これが「リセット後に加工原点がバラバラになる」症状の直接原因と推定される(T8で`$#`の`[G92:...]`を実測し裏取りする)。

**採用方針(G92方針A、発注者承認済み)**: Plugin内のG-codeは**G92を一切生成しない**。原点操作の直前に`$#`でG92を検出し、非ゼロなら「一時オフセット(G92)が残っています。クリアしますか?」という確認ダイアログを出し、**承認後のみ`G92.1`を送る**(無条件実行はしない)。Operator Modeでは解消までREADY遷移をブロック、Admin Modeでは警告のみ。

### 復元フロー(最終版)

```
restoreOrigin(slot):
  guard: connected && activeState==='Idle' && workflow idle && hasHomed && !pluginBusy
  res = machine.query('$#')                         // G92・G54の現在値
  if G92≠0 → G92_PRESENT ダイアログ → 承認時のみ ['G92.1','$#'] → 再query → 続行 / 拒否なら中断
  machine.command('gcode', ['G21','G90','G54', `G10 L2 P1 X${x} Y${y} Z${z}`, '$#'])
  (Zのみスロット: `G10 L2 P1 Z${z + thickness}`)   // マクロ5「NC底面をZ0とする」系、材料厚み分ずらす運用
  verify = machine.query('$#') → G54 ≈ slot(±0.01mm以内) → ORIGIN_SET / 不一致 → ORIGIN_MISMATCH(人間判断)
```

朝の起動Workflowは「`homing`コマンド→`homing:has-homed`&&Idle待ち(60秒タイムアウトでALARM扱い)→上記復元」という2段構成(CNCjsマクロ3「ホーミング＋いつもの左前XY0に設定する」の`$H`部分をWorkflow側に分離した形)。

## プローブ(XYZ一括/XYのみ/Zのみ)

### 正本

`src/app/src/lib/Probing.ts`(gSender本体)は**設計正本にしない**(実装方法・安全処理の参考資料として使うのみ)。発注者が実機運用中のCNCjsマクロ5件(`docs/spec/reference/cncjs-probe-macros-source.md`)を正本として移植する。

### gSenderマクロエンジンの制約

gSenderのfeeder(`%VAR=式`/`[式]`を処理する機構)は、識別子解決に渡すcontext変数が`posx/posy/posz/mposx/mposy/mposz/modal/tool/parameters/programFeedrate/spindleRate/global`等の機械状態に限定されており、`Math`オブジェクトを含まない(`src/server/lib/evaluate-expression.js`で確認済み)。CNCjsマクロの`%X_WORK_CENTER_DIRECTON = Math.abs(...)/...`のような式はそのままでは評価できない。**対処**: マクロをそのまま流し込む方式は不採用。全数値はPlugin(TypeScript)側で決定論的に計算し、`%`行も`[式]`も含まない「数値リテラルだけのG-code行」を`machine.command('gcode', lines)`で送る。

### XYZ一括プローブ(マクロ1・2のG92排除版)

マクロ1「XYZ Probe右奥 軸径必要！」(φ3.20)とマクロ2「XYZプローブ左奥 軸径必要！」(φ3.16)は同一ロジックで、`Z_PROBE_KEEPOUT_X`の符号のみが異なる(治具の左右対称バリエーション)。G92が担っていた「穴位置を基準にした絶対移動2箇所」は`G53`(機械座標系の非モーダル移動、G92非依存)に置き換える。

**Grbl 1.1固有の注意**: G91(相対座標)モード中の`G53`は増分として扱われるため、G53移動は必ず`G90`に切り替えてから発行し、直後に`G91`へ戻す(元マクロの`G90 / G0 … / G91`構造を踏襲)。

生成する行の構造(値は実行時にPlugin側で数値リテラル化、`H`=開始時MPos):
```
G21 G90 G54            ; モーダル固定(G92なし)
G4 P0.5                ; %wait相当
G91 G0 Z10
G91 G0 X-13 Y-13       ; keepout(符号は治具バリアント: 右奥/左奥)
G38.2 Z-10 F70 / G0 Z1 / G38.2 Z-10 F30 / G4 P0.1
G10 L20 P1 Z5.01
G4 P0.1 / G0 Z10
G0 X[−keepoutX − 20·dirX] / G0 Z-13
G38.2 X[keepoutX] F70 / G0 X[−dirX] / G38.2 X[keepoutX] F30 / G4 P0.1
G10 L20 P1 X[(−D/2 − 10.00)·dirX] / G4 P0.1 / G0 X[−keepoutX/2] / G0 Z10
G90 / G53 G0 X[H.x+keepoutX] Y[H.y − 20·dirY] / G91   ; G92絶対移動の置換(G90→G53→G91)
G91 G0 Z-13
G38.2 Y[keepoutY] F70 / G0 Y[−dirY] / G38.2 Y[keepoutY] F30 / G4 P0.1
G10 L20 P1 Y[(−D/2 − 10.03)·dirY] / G4 P0.1 / G0 Y[−10·dirY] / G0 Z20
G90 G0 X0 Y0
$#                     ; 結果取得→保存提案へ
```
入力パラメータ(すべて数値・範囲検証付き、管理者が設定): エンドミル径(プリセットφ3.20/φ3.16)、治具バリアント(`right-rear`: keepoutX=−13 / `left-rear`: +13、keepoutY=−13共通)、プレート厚Z=5.01/Y=10.03/X=10.00、送りA=70/B=30、退避10、XY開始距離20、側面探査深さ3。`G10 L20`は常に明示`P1`(Grbl 1.1はG10にP語必須)。

### XYのみプローブ(訂正版、マクロ1・2から派生)

**前提(発注者説明)**: Z原点は別途「機械原点〜機械底面の既知距離(機械依存・不変)+板厚みの理論値(実測)」から計算して設定済み(マクロ5系の操作)。そのため、XYのみプローブでは**Z方向の接触・退避を丸ごと行わない**。

X/Y接触に入る高さは「開始時の先端深さ」をそのまま側面探査の深さとして使う。治具プレート厚5.01mmの穴に先端を入れた深さは必ず5.01mm未満のため、Z退避10mmで常にプレート上面をクリアでき、未知の高さを一切使わない。XYZ版との差分は「Z探査区間の削除」と「Z下降量を−13→−10に変更」の2点のみで、ジェネレータは`includeZ: boolean`1フラグの分岐でXYZ版と共有する。

```
G21 G90 G54 / G4 P0.5
G91 G0 Z10
G0 X[−keepoutX − 20·dirX]
G0 Z-10                               ; 開始深さへ戻る(側面探査深さ)
G38.2 X[keepoutX] F70 / G0 X[−dirX] / G38.2 X[keepoutX] F30 / G4 P0.1
G10 L20 P1 X[(−D/2 − 10.00)·dirX] / G4 P0.1
G0 X[−keepoutX/2] / G0 Z10
G90 / G53 G0 X[H.x + keepoutX] Y[H.y − 20·dirY] / G91
G91 G0 Z-10
G38.2 Y[keepoutY] F70 / G0 Y[−dirY] / G38.2 Y[keepoutY] F30 / G4 P0.1
G10 L20 P1 Y[(−D/2 − 10.03)·dirY] / G4 P0.1
G0 Y[−10·dirY] / G0 Z20
G90 G0 X0 Y0 / $#
```
送信前ガード: `mpos.z + 10 ≤ 0`(Z上限超過なし)、`activeState==='Idle'`、G92=0。チェックリストに「先端をプレート上面から2〜4mm下、穴の中央に入れる」を画像付きで追加(深さ0に近いと側面接触が浅くなるため下限、5.01超は物理的に不可能)。UI上は「XYプローブ」と「Z原点=NC底面+材料厚み(マクロ5)」を並べて表示し、XYのみの直後にZスロット適用を促す導線を用意するが、連結は強制しない。

### Zのみプローブ(マクロ4の移植)

ほぼそのまま移植。`P0`→`P1`に変更、先頭に`G21 G54`、末尾`G90`を維持。

### 原点復元スロット(マクロ3・5)

| 操作 | 元マクロ | 設計 |
|:--|:--|:--|
| 原点復元(いつもの左前) | マクロ3「ホーミング＋いつもの左前XY0に設定する」 | `$H`は起動Workflow側に分離。残り`G21 G90 G54 G10 L2 P1 X.. Y.. Z.. $#`が復元処理。マクロ3の定数(X-345.801, Y-213.302, Z-57.665)を初期スロット「いつもの左前XY0」として投入 |
| NC底面Z0+材料厚み | マクロ5「NC底面をZ0とする。※その後材料厚み分ずらせ。」 | Zのみのスロット「NC底面Z0」(Z=−100.118)+材料厚み入力(mm、範囲検証)→`G10 L2 P1 Z[−100.118 + 厚み]`。L2は指定軸のみ更新しX/Yは保持 |

### プローブ完了判定・安全設計

- manifest parserで`^\[PRB:(?<x>[-\d.]+),(?<y>[-\d.]+),(?<z>[-\d.]+)(?:,[-\d.]+)*:(?<ok>[01])\]$`を登録、接触回数+`activeState==='Idle'`復帰+モーダル(`G90`)復帰を確認(T1実装時に`plugins/parser-demo`の実績パターンで確定。`..`は可読性のための省略表記だったため正しい正規表現に修正済み)
- 進行中は`machine.setBusy(true,'Probing')`
- `G38.2`(失敗=ALARM)のみ使用し`G38.3`は使わない。プローブ失敗時はGrbl 1.1のALARM:4(プローブ初期状態不正)/ALARM:5(未接触)の2コードに限定して案内文言を用意。回復は`unlock`コマンド(`feeder.reset()`→`$X`)

## ステートマシン設計

### 原則(発注者指示で確定)

Plugin storageに保存した状態名(HOMED/READY等)だけから復元する設計は**不採用**。再起動・再接続時は実機の現在状態を取得してWorkflow状態を再構築する。

### `deriveWorkflowState(snapshot, aux)`純関数

**snapshot(実機由来、毎回取得・`subscribeSelector`で追従)**: `connection.isConnected` / `controller.hasHomed` / `controller.state.status.activeState`(Idle/Run/Hold/Alarm/Home/Jog) / `controller.workflow.state`(idle/running/paused) / `controller.modal`(wcs, distance, units) / `controller.settings.parameters`(G54..G59, G92, PRB。`$#`発行時のみ更新されるため、Pluginはマウント時・接続時・原点操作後に`machine.query('$#')`を発行する) / `mpos,wpos,wco` / `fileInfo.fileLoaded, fileName` / `pluginState.busy`

**aux(storage由来、補助データのみ。状態名は保存しない)**: 原点スロット一覧 / チェックリスト履歴 / `routine.{active,fileName}` / 管理者PINハッシュ(任意) / Plugin設定(プレート寸法等)

**導出順(上から優先)**:
1. `!connected` → DISCONNECTED
2. `activeState==='Alarm'` → ALARM
3. `workflow==='running'` → RUNNING / `'paused'` → PAUSED
4. `activeState==='Home'` → HOMING / `!hasHomed` → CONNECTED_UNHOMED
5. `pluginBusy` → PROBING(自分が出した処理の継続中)
6. `params.G92 ≠ 0` → G92_PRESENT(ブロッカー)
7. `params.G54`が保存スロットのどれかと軸ごとの絶対差±0.01mm以内(ユークリッド距離ではなく各軸独立判定)で一致 → 8へ継続 / 不一致 → HOMED_UNVERIFIED(選択肢: 復元/プローブ/現在のG54を新スロットとして保存=Admin限定)で終端
8. (7がORIGIN_SETの場合のみ到達) `fileLoaded` → FILE_LOADED → `Idle`なら READY

補足ルール: チェックリスト確認は機械から導出できないため、Plugin再読込後は常に再確認を要求する(安全側デフォルト)。履歴はstorageに記録のみ。`routine.active`はstorageから読むが、`fileName`が現在ロード中のファイルと一致しない場合は自動解除。`role`(Operator/Admin)はセッション限定(再読込で常にOperatorに戻る)。

### 状態遷移図(全体)

```
DISCONNECTED
  → CONNECTED_UNHOMED(リセット後もここへ戻る)
  → [確認ダイアログ] → HOMING → HOMED
HOMED
  → ORIGIN_RESTORING(復元・検証) / PROBING(プローブして保存) → ORIGIN_SET
ORIGIN_SET → FILE_LOADED → READY
READY → [安全チェックリスト全項目✓] → PRECHECK_OK → [実行] → RUNNING ⇄ PAUSED → JOB_DONE
JOB_DONE
  ├ mode=NORMAL → READY
  └ mode=ROUTINE → ROUTINE_SWAP(材料交換の短縮チェックリスト) → PRECHECK_OK
ALARM/ERROR(全状態から遷移) → [確認] → unlock/reset → CONNECTED_UNHOMED
```
`mode`(NORMAL/ROUTINE)と`role`(OPERATOR/ADMIN)は直交フラグ。ROUTINE離脱は長押し+確認(管理者PIN設定時はPIN要求)。

### T7確定仕様(発注者確認、2026-10-04)

- **短縮チェックリスト(ROUTINE_SWAP)は2項目**: 「ワークが固定されているか」「固定具の締め具合は確認したか」。刃物交換・集塵機・干渉物・非常停止の4項目は、同一ジョブの繰り返しでは状態が変わらない(ルーチン開始時のフルチェックで確認済み)という理由で省略
- **サイクルカウンター**: ルーチンモード中に何サイクル実行したかをstorageに記録する。ALARM/ERROR発生時もこの値は保持される
- **非常停止(ALARM/ERROR)からの復旧**: ルーチンモードの進行状況(mode=ROUTINE、サイクル数、対象ファイル名)を保持したまま、既存のステートマシン経路(`ALARM/ERROR → [確認] → unlock/reset → CONNECTED_UNHOMED`)をそのまま通り、通常のホーミング・原点復元(T5)を経てルーチンへ復帰する設計にする。ALARM発生時はルーチンモード中であることと現在のサイクル数をUIに案内すること
- **複数プログラム工程(プログラムA実行→人間が配置変更→プログラムB実行→1個完成、というサイクル)は今回のT7スコープ外**。発注者が「特殊なケースなので後回し」と明言(2026-10-04)。将来対応する場合、ルーチン定義に複数ステップ(ファイル)を持たせる設計と、非常停止復旧時に「どのステップから再開するか」を人間に選ばせるUIが必要になる

## 実装の置き場所

`integration/dev-ja`ブランチの`plugins/operator-plugin/`に新規Pluginとして作る。`react-ts-app`サンプルをテンプレに、Tailwindは`basic-cam`サンプルを参考にする。manifest `id`は`com.fujiruki.operator`。capabilities: `machine:get:context, machine:command, machine:query, machine:busy:set, redux:get:state, storage:*`、topics `redux, controller, parser`、PRBパーサ。

## ファームウェア前提

実機はGrbl 1.1で確定(grblHALではない)。`$#`応答形式・PRBパーサ・ALARM番号はGrbl 1.1固定で設計してよい(grblHAL分岐は不要)。

## 実装順序(T1〜T9)

| タスク | 内容 |
|:--|:--|
| T1 | Plugin足場・SDK接続確認。`plugins/operator-plugin/`作成、manifest、capabilities設定、接続・`$#`取得・storage読み書きの疎通確認。ブランチ方針(`integration/dev-ja`限定、masterバックポートなし)をREADMEとtask.mdに明記 |
| T2 | 機械状態取得+ステートマシン骨格。`MachineSnapshot`型、`deriveWorkflowState`純関数、遷移表、テーブル駆動テスト(TDD)。UIは状態名と理由の表示のみ |
| T3 | 加工原点保存/復元。スロットCRUD(マクロ3・5の値を初期データ)、`$#`パース、G92検出ダイアログ、L2復元、検証、Zのみ+材料厚み |
| T4 | 既存CNCjsプローブの移植(Z/XY/XYZ)。G-codeジェネレータ(G92排除、数値リテラルのみ、明示P1、`includeZ`フラグでXYZ/XYを共有)。ゴールデンテスト(マクロ1・2の定数を入力したとき、G92関連行以外が元マクロと行単位で一致すること)。PRB計数+Idle+G90復帰の完了判定、失敗時ALARM遷移、unlock回復 |
| T5 | 朝の起動Workflow。接続確認→可動域確認ダイアログ→homing→hasHomed検知→T3復元→READY |
| T6 | 安全チェックリスト。画像付き、全✓で実行可、再読込で再確認、履歴保存。実行=`gcode:start`、`workflow:state`/`job:*`追従 |
| T7 | Routine Mode。storageフラグ+再構築ルール、短縮チェックリスト、長押し+確認で離脱(PIN任意) |
| T8 | 実機試験→不足API整理。リセット後`$#`でG92が消えるか実測、`G10 L20`P省略挙動、XY-only開始深さ運用の再現性、ゲームパッド/ナビ離脱の実害 |
| T9 | 本家提案検討。`ui:lock:set`、SDKからプローブ生成関数の公開(任意)、`machine:command`のコマンド単位権限(`pluginBridge.ts:185`のTODO) |

T1→T2→(T3,T4並列可、同一Agent推奨)→T5→T6→T7→T8→T9。

## 未確定点・実機確認が必要な項目(T8で検証)

- リセット後に`$#`でG92オフセットが実際に消えるか(「原点バラバラ」原因説の裏取り)
- `G10 L20`のPパラメータ省略の実機挙動(旧マクロ資産の理解用。Pluginは常に`P1`を明示するため実装への影響はない)
- XY-only「開始深さ=側面探査深さ」運用の再現性

## 参照資料

- `docs/spec/reference/cncjs-probe-macros-source.md` — CNCjs実機マクロ5件の原文(プローブ・原点復元ロジックの正本)
- カンガルー`2026-09-16_02_gSender_日本語化_PluginSDK_OperatorPlugin_開発方針_引き継ぎ.md` — 9/16方針原本
- カンガルー`2026-10-04_01_gSender_OperatorPluginフェーズ1_技術調査_相談.md` — 技術調査の初版相談記録
