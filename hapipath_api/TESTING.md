# Start Screen API Testing Guide

このドキュメントでは、Start Screen APIの包括的なテスト方法について説明します。

## テストファイル

### 1. `test-suite.js` - 自動テストスイート
Node.jsで実行できる包括的なテストスイートです。

```bash
# テスト実行
pnpm test
```

**テスト内容:**
- ヘルスチェック
- メモリのCRUD操作
- 花のCRUD操作
- バリデーションエラー
- 404エラー
- フィルタリング（BBox、オーナー）
- ページネーション
- クリーンアップ

### 2. `test-api.http` - HTTPリクエストファイル
VS CodeのREST Client拡張機能やPostmanで使用できるHTTPリクエストファイルです。

**使用方法:**
1. VS CodeでREST Client拡張機能をインストール
2. `test-api.http`ファイルを開く
3. 各リクエストの「Send Request」をクリック

## テスト手順

### 1. 環境準備

```bash
# 依存関係のインストール
pnpm install

# データベース作成
pnpm wrangler d1 create hapipath-db

# スキーマ実行
pnpm wrangler d1 execute hapipath-db --file=./migrations/001_initial_schema.sql

# 開発サーバー起動
pnpm dev
```

### 2. 自動テスト実行

```bash
# 別のターミナルでテスト実行
pnpm test
```

### 3. 手動テスト実行

`test-api.http`ファイルを使用して、各エンドポイントを個別にテストできます。

## テストケース詳細

### メモリエンドポイント

#### ✅ 正常系
- `POST /locations/{locationId}/memories` - メモリ作成
- `GET /locations/{locationId}/memories` - メモリ一覧取得
- `PATCH /memories/{id}` - メモリ更新
- `DELETE /memories/{id}` - メモリ削除

#### ❌ 異常系
- 無効なジオハッシュ（5文字未満）
- バリデーションエラー（空のタイトル、無効な座標）
- 存在しないメモリID

### 花エンドポイント

#### ✅ 正常系
- `POST /flowers` - 花作成
- `GET /flowers` - 花一覧取得
- `GET /flowers/{id}` - 花詳細取得
- `DELETE /flowers/{id}` - 花削除

#### 🔍 フィルタリング
- `?bbox=west,south,east,north` - バウンディングボックス
- `?owner=me` - 自分の花のみ
- `?type=mine` - 自分の花のみ
- `?limit=10` - 件数制限
- `?cursor=timestamp` - ページネーション

#### ❌ 異常系
- 無効なBBox形式
- 無効なテクスチャ（flower1, flower2以外）
- 無効な座標（緯度: -90〜90, 経度: -180〜180）
- 存在しない花ID

## 期待される結果

### 成功レスポンス
- **200 OK**: 正常な取得・更新
- **201 Created**: 正常な作成
- **204 No Content**: 正常な削除

### エラーレスポンス
- **400 Bad Request**: バリデーションエラー
- **404 Not Found**: リソースが見つからない

```json
{
  "code": "ERROR_CODE",
  "message": "Human readable message",
  "details": {}
}
```

## テストデータ

### サンプルメモリ
```json
{
  "title": "Beautiful Sunset",
  "description": "Watched an amazing sunset from this location",
  "memoryDate": "2024-01-15T18:30:00.000Z",
  "lat": 35.6762,
  "lon": 139.6503,
  "locationName": "Tokyo Station"
}
```

### サンプル花
```json
{
  "lat": 35.6762,
  "lon": 139.6503,
  "texture": "flower1",
  "name": "Cherry Blossom"
}
```

## トラブルシューティング

### よくある問題

1. **データベース接続エラー**
   - D1データベースが作成されているか確認
   - スキーマが正しく実行されているか確認

2. **バリデーションエラー**
   - 必須フィールドがすべて含まれているか確認
   - データ型が正しいか確認（文字列、数値、日付）

3. **404エラー**
   - リソースIDが正しいか確認
   - リソースが存在するか確認

### デバッグ方法

```bash
# ログ確認
pnpm dev

# データベース確認
pnpm wrangler d1 execute hapipath-db --command="SELECT * FROM memories LIMIT 5"
pnpm wrangler d1 execute hapipath-db --command="SELECT * FROM flowers LIMIT 5"
```

## 継続的テスト

本番環境でも定期的にテストを実行することを推奨します：

```bash
# 本番環境でのテスト
BASE_URL=https://your-api-domain.com pnpm test
```
