# Electric Sheep 2025 planty ハピパス
 
## このリポジトリについて

今回のプロジェクトはフロントエンドとバックエンドサービス、ARサービスを分離して開発しています。開発の分担の責務を分割することで効率的な開発を実現しています。本リポジトリは以下の三つのリポジトリを審査用にモノリポにまとめたものです。

- Plantly 思い出
- Planty AR
- Backend API サーバー (hapipath_api)

ビルドや開発を行う場合は、いずれのリポジトリをクローンし、各ディレクトリで`pnpm install`を実行して依存関係をインストールしてください。
# 目次
- [Electric Sheep 2025 planty ハピパス](#electric-sheep-2025-planty-ハピパス)
  - [このリポジトリについて](#このリポジトリについて)
- [目次](#目次)
- [Plantly 植えた花の思い出共有と移動サービス](#plantly-植えた花の思い出共有と移動サービス)
  - [Abstract](#abstract)
  - [Technologies](#technologies)
  - [Design](#design)
  - [Directory Structure](#directory-structure)
  - [Function](#function)
    - [Install](#install)
  - [Next Steps](#next-steps)
  - [Production Url](#production-url)
- [Planty AR 植えた思い出の確認サービス](#planty-ar-植えた思い出の確認サービス)
  - [Abstract](#abstract-1)
  - [Technologies](#technologies-1)
  - [Install](#install-1)
  - [function](#function-1)
  - [Directory Structure](#directory-structure-1)
  - [Production Url](#production-url-1)
- [Backend API サーバー (hapipath\_api)](#backend-api-サーバー-hapipath_api)
  - [Abstract](#abstract-2)
  - [Technologies](#technologies-2)
  - [Features](#features)
  - [API Endpoints](#api-endpoints)
    - [Memories](#memories)
    - [Flowers](#flowers)
  - [Database Schema](#database-schema)
    - [Memories Table](#memories-table)
    - [Flowers Table](#flowers-table)
  - [Directory Structure](#directory-structure-2)
  - [Setup \& Development](#setup--development)
  - [Production URL](#production-url-2)

# Plantly 植えた花の思い出共有と移動サービス

## Abstract 
3D地球儀上に思い出を花として配置し、世界中の人々と思い出を共有できるインタラクティブなプラットフォームです。React、Three.js、TypeScriptを使用して構築され、美しい3D可視化と直感的なユーザーエクスペリエンスを提供します。

ユーザーは地球上の任意の場所に「花」を植え、その場所での思い出や体験を記録できます。世界中に植えられた花を探索し、他のユーザーの思い出を発見することも可能です。

## Technologies

技術選定の理由:

- **React 19.1.1** 
- **TypeScript 5.8.3** - 型安全と開発速度の向上
- **Three.js 0.180.0** - 地球を3Dレンダリングとカメラワークを作るために使用
- **@react-three/fiber** - ReactでThree.jsを使用するためのライブラリ
- **Vite 7.1.2** - モダンなビルドツールで、高速ビルド可能
- **pnpm** - 高速で効率的なパッケージ管理ツール 

## Design

アーキテクチャデザインはコンポーネントベースで、ReactとWebGL技術の組み合わせによりインタラクティブな3D体験を提供します。Three.jsと@react-three/fiberを使用して、リアルタイムでレンダリングされる3D地球儀と花のモデルを作成しています。mapAPIとモーダルウィンドを組み合わせ地球と地図の連携を実現しています。

またAPIレイヤレイヤーを設け、バックエンドとの連携を実現しています。swaggerによりAPIドキュメントを作成し、フロントエンドとバックエンドの連携をスムーズにしています。

UIデザインとして、ユーザーインターフェースの直感性と美しさを重視し、ユーザーが簡単に操作できるUI/UXを提供しています。
また近未来のデザインを意識し、タイトルページのタイトル選定やチームのカラーに合わせたカラーリングを行なっています。

またスマートフォンとPCの両方でシームレスに動作するようにレスポンシブデザインを採用しています。


## Directory Structure

コンポーネントに分割することによりコードの可読性と保守性の向上をさせています。またDBの連携を実装しています。
またDBの連携を実装しています。


```
start_screen/
├──public/
│   ├── data/
│   │   └── mock-flowers.json      # flowers）
│   ├── textures/               # 3D テクスチャファイル
│   ├── flower.PNG                 # Flower1 テクスチャ
│   ├── flower2.png                # Flower2 テクスチャ
│   ├── flower3.png                # Flower3 テクスチャ
│   ├── locations.json             # 地域データ
│   └── vite.svg                   # アイコン
├──src/
│   ├── components/
│   │   ├── Start.tsx              # スタート画面コンポーネント
│   │   └── Main.tsx               # メインアプリケーション
│   ├── services/
│   │   └── api.ts                 # API統合レイヤー
│   ├── utils/
│   │   └── validation.ts          # 座標検証ユーティリティ
│   ├── lib/
│   │   └── utils.ts               # 汎用ユーティリティ
│   ├── App.tsx                    # ルートコンポーネント
│   ├── Globe.tsx                  # メイン3D地球儀コンポーネント
│   ├── MapModal.tsx               # 地図モーダル＆メモリー管理
│   ├── Flower.tsx                 # 3D花コンポーネント
│   ├── CameraRig.tsx              # 3Dカメラ制御
│   ├── Pin.tsx                    # 位置ピン
│   └── main.tsx                   # アプリケーションエントリーポイント
├── dist/                       # ビルド出力
├── package.json                   # 依存関係設定
├── tsconfig.json                  # TypeScript設定
├── vite.config.ts                # Vite設定
├── eslint.config.js               # ESLint設定
└── README.md                      # このファイル
```

## Function

- リアルタイム3D地球儀表
- ユーザーが思い出を共有できるインタラクティブなプラットフォーム
- 植えた花を探索し、他のユーザーの思い出を発見する機能
- 自分の花と相手の花を共有することができる機能
- マップモーダルで花にデータを追加する機能
- 座標によるマップへの花の追加機能
- レスポンシブデザイン
- モバイルとデスクトップの両方でシームレスな体験


### Install
```bash
# プロジェクトクローン
git clone https://github.com/Happass/start_screen.git
cd start_screen

# 依存関係インストール
pnpm install

# 開発サーバー起動
pnpm run dev
```

## Next Steps 

- バックエンドとデータベースの統合
- ユーザー認証システムの追加
- 花への移動機能の実装
- 感覚共有機能の実装

## Production Url 

環境はcloudflare pagesを使用しています。
本番環境: https://planty.shakenokiri.me/


# Planty AR 植えた思い出の確認サービス

## Abstract

スマートフォンとPC対応のAR（拡張現実）マーカー認識アプリケーション。Webカメラやスマートフォンのカメラで花に対して思い出の3Dモデルを表示します。

## Technologies

- **React 19.1.1** 
- **TypeScript 5.8.3** - 型安全と開発速度の向上 A-Frame** - WebベースのAR体験を提供
- **Three.js 0.180.0** - 3Dレンダリング
- **pnpm** - 高速で効率的なパッケージ管理ツール

## Install

```bash
# リポジトリをクローン
git clone https://github.com/Happass/smartphone_screen.git
cd smartphone_screen

# 依存関係をインストール
pnpm install
# 開発サーバーを起動
pnpm run dev
```

## function

- **3Dモデル表示**: GLBフォーマットの3Dモデルをマーカー上に表示
- **カメラ選択**: 複数のカメラデバイスがある場合の切り替え機能
- **リアルタイム監視**: フレームレート、認識精度の表示
- **モバイル最適化**: スマートフォンでの使用に最適化
- **デバッグ情報**: AR.jsの状態、カメラ情報を表示


## Directory Structure

単一ファイルにAR機能を集約することで、短い期間での開発を実現しています。

```
smartphone_screen/
├── public/
│   ├── markers/          # ARマーカーファイル
│   │   ├── pattern1.patt
│   │   ├── pattern2.patt
│   │   └── pattern3.patt
│   ├── models/           # 3Dモデル
│   │   └── scene.glb
│   └── vite.svg
├── src/
│   ├── App.tsx          # メインアプリケーション
│   ├── App.css          # スタイル
│   ├── main.tsx         # エントリーポイント
│   └── index.css        # グローバルスタイル
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Production Url

環境はcloudflare pagesを使用しています。
本番環境: https://planty-ar-view.shakenokiri.me



# Backend API サーバー (hapipath_api)
  
  ## Abstract
  
  Cloudflare WorkersとD1データベースを使用したバックエンドAPIサービス。思い出（Memory）と花（Flower）の管理機能を提供し、位置情報に基づいたデー
 タの保存・取得を行います。
  
  ## Technologies
  
  - **Cloudflare Workers** - サーバーレス実行環境
  - **Cloudflare D1** - SQLiteベースのデータベース
  - **Hono 4.9.7** - 軽量で高速なWebフレームワーク
  - **TypeScript** - 型安全性とコード品質の向上
  - **Wrangler** - Cloudflare Workers開発ツール
  
  ## Features
  
  - **Memory Management**: 位置情報付きの思い出の作成・読み取り・更新・削除
  - **Flower System**: 仮想的な花の植え付けと管理（異なるテクスチャ対応）
  - **Geolocation Support**: 境界ボックスクエリとgeohashベースの位置グループ化
  - **Pagination**: カーソルベースのページネーションによる効率的なデータ取得
  - **Public API**: 認証不要のパブリックAPI
  
  ## API Endpoints
  
  ### Memories
  - `GET /locations/{locationId}/memories` - 位置別の思い出一覧取得
  - `POST /locations/{locationId}/memories` - 位置に思い出を作成
  - `PATCH /memories/{id}` - 思い出の更新
  - `DELETE /memories/{id}` - 思い出の削除
  
  ### Flowers
  - `GET /flowers` - 花の一覧取得（境界ボックス、所有者、タイプでフィルタ可能）
  - `POST /flowers` - 花の作成
  - `GET /flowers/{id}` - 花の詳細取得
  - `DELETE /flowers/{id}` - 花の削除
  
  ## Database Schema
  
  ### Memories Table
  - `id` (TEXT PRIMARY KEY)
  - `title` (TEXT, 1-200文字)
  - `description` (TEXT, 1-5000文字)
  - `memory_date` (TEXT, ISO日付)
  - `created_at` (TEXT, ISO日付)
  - `updated_at` (TEXT, ISO日付)
  - `user_id` (TEXT)
  - `location_id` (TEXT, geohash)
  - `lat` (REAL, -90〜90)
  - `lon` (REAL, -180〜180)
  - `location_name` (TEXT, オプション)
  
  ### Flowers Table
  - `id` (TEXT PRIMARY KEY)
  - `lat` (REAL, -90〜90)
  - `lon` (REAL, -180〜180)
  - `texture` (TEXT, flower1/flower2/withered)
  - `name` (TEXT, 1-120文字)
  - `created_at` (TEXT, ISO日付)
  - `wither_at` (TEXT, ISO日付, オプション)
  - `owner_id` (TEXT)
  - `type` (TEXT, mine/others)
  
  ## Directory Structure
  
  ```
  hapipath_api/
  ├── src/
  │   ├── index.ts                  # メインAPI実装（Honoアプリケーション）
  │   ├── types.ts                  # TypeScript型定義
  │   ├── database.ts               # データベース操作
  │   └── utils.ts                  # ユーティリティ関数
  ├── migrations/
  │   └── 001_initial_schema.sql    # 初期データベーススキーマ
  ├── package.json                  # 依存関係設定
  ├── wrangler.jsonc               # Cloudflare Workers設定
  ├── swagger.json                 # OpenAPI仕様書
  ├── test-suite.js                # APIテストスイート
  ├── test-api.http                # HTTPクライアントテスト
  └── README.md                    # API詳細ドキュメント
  ```
  
  ## Setup & Development
  
  ```bash
  # 依存関係インストール
  cd hapipath_api
  pnpm install
  
  # D1データベース作成
  pnpm wrangler d1 create hapipath-db
  
  # データベースマイグレーション実行
  pnpm wrangler d1 execute hapipath-db --file=./migrations/001_initial_schema.sql
  
  # 開発サーバー起動
  pnpm dev
  ```
  
  ## Production URL
  環境はCloudflare を使用しています。

  本番環境: https://planty-api.shakenokiri.me/

