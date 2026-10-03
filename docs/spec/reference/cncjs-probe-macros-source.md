# CNCjsプローブ・原点マクロ 移植元資料

出典: `C:\Users\fjtsu\.cncrc`(このPC上のCNCjs設定ファイル、`macros`配列)。2026-10-04に発注者がよく使うと確認した5件を転記。Operator Plugin フェーズ1(T4: プローブ移植、T3: 原点保存/復元)の設計正本とする。`src/app/src/lib/Probing.ts`(gSender本体)は実装方法・安全処理の参考資料として使うのみで、ロジックの正本にはしない。

## 1. XYZ Probe右奥 軸径必要！(id: 8980ad0f-48cd-4a32-9e14-21c722c19a08)

エンドミル径 φ3.20。XYZ一括プローブのメイン版。

```gcode
; Based on https://github.com/cncjs/CNCjs-Macros/blob/master/C3D_3axis_probe
; エンドミルを穴に入れて、エンドミルの先はプレート表面より下にします

; 制御基板のプランナーキューが空になるまで待ちます
%wait

; 以下はユーザーが定義する変数です
%ENDMILL_DIAMETER = 3.20 ;エンドミルの直径
;%ENDMILL_DIAMETER = 1.4 ;エンドミルの直径

%PROBE_BLOCK_Z = 5.01 ;Z方向のプレートの厚さ
%PROBE_BLOCK_Y = 10.03 ;Y方向のプレートの厚さ
%PROBE_BLOCK_X = 10.00 ;X方向のプレートの厚さ
%PROBE_FEEDRATE_A = 70 ;プローブ時の送り速度 1回目
%PROBE_FEEDRATE_B = 30 ;プローブ時の送り速度 2回目
%Z_ESCAPE_DISTANCE = 10 ;Zの退避時の距離
%Z_PROBE_KEEPOUT_X = -13 ;穴の位置からのZを計測する点のX方向距離
%Z_PROBE_KEEPOUT_Y= -13 ;穴の位置からのZを計測する点のY方向距離
%XY_START_POS_DISTANCE = 20 ;穴位置からXYプローブ開始位置への移動距離（絶対値）
%XY_PROBE_Z_DISTANCE_FROM_SURF = -5 ;XYプローブ時のZ表面からの高さ

G21 ; mm単位
G92 X0 Y0 Z0 ;スタート地点を一旦0,0,0とする  
G91 ; 相対座標系

%X_WORK_CENTER_DIRECTON = Math.abs(Z_PROBE_KEEPOUT_X)/Z_PROBE_KEEPOUT_X ; 穴から見てプレートの中心X方向
%Y_WORK_CENTER_DIRECTON = Math.abs(Z_PROBE_KEEPOUT_Y)/Z_PROBE_KEEPOUT_Y ; 穴から見てプレートの中心Y方向

G0 Z[Z_ESCAPE_DISTANCE] ;穴から工具を出す
X[Z_PROBE_KEEPOUT_X] Y[Z_PROBE_KEEPOUT_Y] ;Zプロービングの位置へ移動

G38.2 Z[-Z_ESCAPE_DISTANCE] F[PROBE_FEEDRATE_A] ;Zプローブ
G0 Z1 ;Z1mm上げ
G38.2 Z[-Z_ESCAPE_DISTANCE] F[PROBE_FEEDRATE_B] ;Zプローブ
G4 P0.1;
G10 L20 Z[PROBE_BLOCK_Z] ;Zの厚さをセット
G4 P0.1;
G0 Z[Z_ESCAPE_DISTANCE] ;Zを退避させる

G0 X[-Z_PROBE_KEEPOUT_X - XY_START_POS_DISTANCE * X_WORK_CENTER_DIRECTON] ;X方向の端面側へ移動
G0 Z[-1 * Z_ESCAPE_DISTANCE - 3] ;Z下げる
G38.2 X[Z_PROBE_KEEPOUT_X] F[PROBE_FEEDRATE_A] ;X方向端面プロービング
G0 X[-1 * X_WORK_CENTER_DIRECTON] ;工具逃し
G38.2 X[Z_PROBE_KEEPOUT_X] F[PROBE_FEEDRATE_B] ;X方向端面プロービング
G4 P0.1
G10 L20 X[(-ENDMILL_DIAMETER/2 -PROBE_BLOCK_X) * X_WORK_CENTER_DIRECTON] ;Xの厚さと工具径を考慮した座標をセット
G4 P0.1
G0 X[-Z_PROBE_KEEPOUT_X/2] ;工具逃し

G0 Z[Z_ESCAPE_DISTANCE] ;Zを再び退避させる

;G0 Y[-Z_PROBE_KEEPOUT_Y - XY_START_POS_DISTANCE * Y_WORK_CENTER_DIRECTON ] ;Y方向の端面側へ移動
;G90 G0 X[Z_PROBE_KEEPOUT_X] ;工具が端面に当たる位置へX移動
;G91 ;incremental

; Y端面移動＋X端面移動を斜め一発で 絶対値指定
G90
G0 X[Z_PROBE_KEEPOUT_X] Y[-XY_START_POS_DISTANCE * Y_WORK_CENTER_DIRECTON]
G91

G0 Z[-1 * Z_ESCAPE_DISTANCE -3 ] ;Zを下げる
G38.2 Y[Z_PROBE_KEEPOUT_Y] F[PROBE_FEEDRATE_A] ;Y方向端面プロービング
G0 Y[-1 * Y_WORK_CENTER_DIRECTON] ;工具逃し
G38.2 Y[Z_PROBE_KEEPOUT_Y] F[PROBE_FEEDRATE_B] ;Y方向端面プロービング
G4 P0.1
G10 L20 Y[(-ENDMILL_DIAMETER/2 -PROBE_BLOCK_Y) * Y_WORK_CENTER_DIRECTON] ;Yの厚さと工具径を考慮した座標をセット
G4 P0.1
G0 Y[10 * Y_WORK_CENTER_DIRECTON * -1] ;工具逃し
G0 Z20 ;Z工具退避
G90
G0 X0Y0 ;Go to X0Y0
```

## 2. XYZプローブ左奥 軸径必要！(id: f6d6c38c-5c8e-49e9-adb2-993079432ee7)

エンドミル径 φ3.16。1と同一ロジックで、`Z_PROBE_KEEPOUT_X`の符号のみ反転(左右対称の治具穴位置に対応)。

```gcode
; Based on https://github.com/cncjs/CNCjs-Macros/blob/master/C3D_3axis_probe
; エンドミルを穴に入れて、エンドミルの先はプレート表面より下にします

; 制御基板のプランナーキューが空になるまで待ちます
%wait

; 以下はユーザーが定義する変数です
%ENDMILL_DIAMETER = 3.16 ;エンドミルの直径

%PROBE_BLOCK_Z = 5.01 ;Z方向のプレートの厚さ
%PROBE_BLOCK_Y = 10.03 ;Y方向のプレートの厚さ
%PROBE_BLOCK_X = 10.00 ;X方向のプレートの厚さ
%PROBE_FEEDRATE_A = 70 ;プローブ時の送り速度 1回目
%PROBE_FEEDRATE_B = 30 ;プローブ時の送り速度 2回目
%Z_ESCAPE_DISTANCE = 10 ;Zの退避時の距離
%Z_PROBE_KEEPOUT_X = 13 ;穴の位置からのZを計測する点のX方向距離
%Z_PROBE_KEEPOUT_Y = -13 ;穴の位置からのZを計測する点のY方向距離
%XY_START_POS_DISTANCE = 20 ;穴位置からXYプローブ開始位置への移動距離（絶対値）
%XY_PROBE_Z_DISTANCE_FROM_SURF = -5 ;XYプローブ時のZ表面からの高さ

G21 ; mm単位
G92 X0 Y0 Z0 ;スタート地点を一旦0,0,0とする  
G91 ; 相対座標系

%X_WORK_CENTER_DIRECTON = Math.abs(Z_PROBE_KEEPOUT_X)/Z_PROBE_KEEPOUT_X ; 穴から見てプレートの中心X方向
%Y_WORK_CENTER_DIRECTON = Math.abs(Z_PROBE_KEEPOUT_Y)/Z_PROBE_KEEPOUT_Y ; 穴から見てプレートの中心Y方向

G0 Z[Z_ESCAPE_DISTANCE] ;穴から工具を出す
X[Z_PROBE_KEEPOUT_X] Y[Z_PROBE_KEEPOUT_Y] ;Zプロービングの位置へ移動

G38.2 Z[-Z_ESCAPE_DISTANCE] F[PROBE_FEEDRATE_A] ;Zプローブ
G0 Z1 ;Z1mm上げ
G38.2 Z[-Z_ESCAPE_DISTANCE] F[PROBE_FEEDRATE_B] ;Zプローブ
G4 P0.1;
G10 L20 Z[PROBE_BLOCK_Z] ;Zの厚さをセット
G4 P0.1;
G0 Z[Z_ESCAPE_DISTANCE] ;Zを退避させる

G0 X[-Z_PROBE_KEEPOUT_X - XY_START_POS_DISTANCE * X_WORK_CENTER_DIRECTON] ;X方向の端面側へ移動
G0 Z[-1 * Z_ESCAPE_DISTANCE - 3] ;Z下げる
G38.2 X[Z_PROBE_KEEPOUT_X] F[PROBE_FEEDRATE_A] ;X方向端面プロービング
G0 X[-1 * X_WORK_CENTER_DIRECTON] ;工具逃し
G38.2 X[Z_PROBE_KEEPOUT_X] F[PROBE_FEEDRATE_B] ;X方向端面プロービング
G4 P0.1
G10 L20 X[(-ENDMILL_DIAMETER/2 -PROBE_BLOCK_X) * X_WORK_CENTER_DIRECTON] ;Xの厚さと工具径を考慮した座標をセット
G4 P0.1
G0 X[-Z_PROBE_KEEPOUT_X/2] ;工具逃し

G0 Z[Z_ESCAPE_DISTANCE] ;Zを再び退避させる

;G0 Y[-Z_PROBE_KEEPOUT_Y - XY_START_POS_DISTANCE * Y_WORK_CENTER_DIRECTON ] ;Y方向の端面側へ移動
;G90 G0 X[Z_PROBE_KEEPOUT_X] ;工具が端面に当たる位置へX移動
;G91 ;incremental

; Y端面移動＋X端面移動を斜め一発で 絶対値指定
G90
G0 X[Z_PROBE_KEEPOUT_X] Y[-XY_START_POS_DISTANCE * Y_WORK_CENTER_DIRECTON]
G91

G0 Z[-1 * Z_ESCAPE_DISTANCE -3 ] ;Zを下げる
G38.2 Y[Z_PROBE_KEEPOUT_Y] F[PROBE_FEEDRATE_A] ;Y方向端面プロービング
G0 Y[-1 * Y_WORK_CENTER_DIRECTON] ;工具逃し
G38.2 Y[Z_PROBE_KEEPOUT_Y] F[PROBE_FEEDRATE_B] ;Y方向端面プロービング
G4 P0.1
G10 L20 Y[(-ENDMILL_DIAMETER/2 -PROBE_BLOCK_Y) * Y_WORK_CENTER_DIRECTON] ;Yの厚さと工具径を考慮した座標をセット
G4 P0.1
G0 Y[10 * Y_WORK_CENTER_DIRECTON * -1] ;工具逃し
G0 Z20 ;Z工具退避
G90
G0 X0Y0 ;Go to X0Y0
```

## 3. ホーミング＋いつもの左前XY0に設定する(id: f20a4594-dd60-45cf-99cf-5a135c641e61)

加工原点の保存・復元フローそのもの。ホーミング後に機械原点からの絶対値でWCS(G54)を再設定する。

```gcode
$H
G21
G90
G54
G10 L2 P1 X-345.801 Y-213.302 Z-57.665
```

## 4. Zプロービング(id: 7f9af4b1-8726-4550-9a35-0926b9977072)

Z軸のみの独立したプローブマクロ(最新作成)。使用方法のコメント付き。

```gcode
; ============================================
; Z軸のみプロービング
; CNCjs / GRBL
;
; 使用方法：
; 1. プローブプレートをワーク上面に置く
; 2. エンドミルをプレートの真上へ移動
; 3. Z先端をプレートから10mm以内程度まで近づける
; 4. このマクロを実行
; ============================================

; 制御基板のプランナーキューが空になるまで待つ
%wait

; ----- ユーザー設定 -----

%PROBE_BLOCK_Z = 5.01 ; プローブプレート厚さ
%PROBE_FEEDRATE_A = 70 ; 1回目のプローブ速度
%PROBE_FEEDRATE_B = 30 ; 2回目のプローブ速度
%Z_PROBE_DISTANCE = 10 ; 最大プローブ下降距離
%Z_ESCAPE_DISTANCE = 10 ; 測定後の退避距離

; ------------------------

G21 ; mm単位
G91 ; 相対座標

; 1回目：速めに接触
G38.2 Z[-Z_PROBE_DISTANCE] F[PROBE_FEEDRATE_A]

; 1mm逃がす
G0 Z1

; 2回目：ゆっくり接触
G38.2 Z[-Z_PROBE_DISTANCE] F[PROBE_FEEDRATE_B]

G4 P0.1

; 現在接触している位置を
; 「ワークZ = プローブプレート厚さ」として設定
G10 L20 P0 Z[PROBE_BLOCK_Z]

G4 P0.1

; 上へ退避
G0 Z[Z_ESCAPE_DISTANCE]

; 絶対座標へ戻す
G90
```

## 5. NC底面をZ0とする。※その後材料厚み分ずらせ。(id: 5e801cc9-c1b5-485c-8f2f-e8f93f387a93)

材料厚みに応じてZ原点を再設定する運用マクロ(最新作成)。

```gcode
G21
G90
G54
G10 L2 P1 Z-100.118
```

## 設計上の注意点(マクロから読み取れる事実)

- マクロ1・2(XYZ一括)は`G92 X0 Y0 Z0`で一時的な基準点を設定し、`G91`(相対座標)でプローブ処理全体を行う。**処理完了後もG92は明示的にクリアされていない**(`G92.1`が呼ばれていない)。Operator Plugin側でG92の扱い(使用禁止にするか、既存G92を検出して確認するか)を整理する際の実例として扱うこと
- マクロ1・2は`G10 L20`(現在位置を基準にWCSオフセットを設定、位置依存)を使用。マクロ3・5は`G10 L2`(機械座標の絶対値でWCSオフセットを設定、位置非依存)を使用。両方の使い分けが実際の運用に存在する
- マクロ1・2の末尾は`G91`のまま(相対座標系のまま終わっている箇所がある)区間と、`G90`に戻している区間が混在しており、移植時は現在のモーダル状態(`G90`/`G91`)の復元漏れがないか要確認
- マクロ4(Zプロービング)は`G10 L20 P0`(アクティブなWCS、またはP0=現在のWCSの意味。P1〜P6はG54〜G59、P0はXXX要確認)でZのみ設定。マクロ1・2は`G10 L20`(Pパラメータ省略、アクティブWCSに対して設定)でX/Y/Zそれぞれ個別に設定。`G10 L20`のPパラメータ省略時の挙動(アクティブなWCSに対して作用)を実装時に確認すること
