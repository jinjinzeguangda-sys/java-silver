# Java Silver 演習コンソール（単体版）

claude.ai の artifact から取り出して、単体で配信できる形に組み直したもの。
claude.ai のヘッダーもブラウザのバーも出ない「ホーム画面アプリ」として使える。

## 中身
| ファイル | 役割 |
|---|---|
| `index.html` | 本体（問題82件を内蔵。外部通信なし） |
| `manifest.webmanifest` | `display:standalone` ＝ブラウザUIを出さない指定 |
| `sw.js` | Service Worker。初回に読んだものをキャッシュし、以降オフラインで開ける |

## 使い方（iPhone / iPad）
1. Safari で公開URLを開く
2. 共有ボタン → **ホーム画面に追加**
3. 以降はホーム画面のアイコンから起動 → **ブラウザUIが一切出ない**

※ Service Worker は **https** でないと登録されない（オフライン化に必須）。
　 LAN の `http://192.168.x.x:8731/` ではキャッシュされないので、常用するなら https の置き場にする。

## 使い方（Mac）
- Chrome で開く → メニュー →「キャスト、保存、共有」→「ページをアプリとしてインストール」
  → タブもアドレスバーも無い専用ウィンドウになる

## 作り直す手順
元の artifact が更新されたら:
```
# 1) artifact から index.html を落とす（Claude Code の Artifact read）
# 2) 1枚の正しい文書に組み直す
python3 ~/.local/share/jinji_maintenance/standalone/build_standalone.py \
        <落としたhtml> ~/.local/share/jinji_maintenance/standalone/java-silver-80.html
# 3) PWA一式に仕上げる
python3 ~/.local/share/jinji_maintenance/standalone/make_package.py
```
どちらも検査つき（陽性・陰性・冪等）で、落ちたら出力しない。
