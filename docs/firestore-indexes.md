# Firestore インデックス設定ガイド

## 複合インデックスの設定

Firestoreでは、単一フィールドのインデックスは自動的に作成されますが、複数フィールドを組み合わせたクエリや、並び替えを含むクエリには複合インデックスが必要です。

## 必要なインデックス

### 1. プロジェクト一覧の取得
```javascript
// ユーザーのプロジェクトを更新日時順で取得
firestore.collection('projects')
  .where('userId', '==', uid)
  .orderBy('updatedAt', 'desc')
```

**インデックス設定:**
- コレクション: `projects`
- フィールド:
  - `userId`: 昇順
  - `updatedAt`: 降順

### 2. ステータス別プロジェクト一覧
```javascript
// 特定ステータスのプロジェクトを作成日時順で取得
firestore.collection('projects')
  .where('userId', '==', uid)
  .where('status', '==', 'draft')
  .orderBy('createdAt', 'desc')
```

**インデックス設定:**
- コレクション: `projects`
- フィールド:
  - `userId`: 昇順
  - `status`: 昇順
  - `createdAt`: 降順

### 3. 段落の順序取得
```javascript
// プロジェクト内の段落を順序通りに取得
firestore.collection('projects').doc(projectId)
  .collection('paragraphs')
  .orderBy('order', 'asc')
```

**インデックス設定:**
- コレクション: `paragraphs`（サブコレクション）
- フィールド:
  - `order`: 昇順

### 4. プロジェクト検索（テキスト検索）
```javascript
// タイトルまたはテーマで検索（部分一致）
// 注: Firestoreはネイティブの全文検索をサポートしていないため、
// 以下のような前方一致検索を使用
firestore.collection('projects')
  .where('userId', '==', uid)
  .where('title', '>=', searchTerm)
  .where('title', '<=', searchTerm + '\uf8ff')
  .orderBy('title')
  .orderBy('updatedAt', 'desc')
```

**インデックス設定:**
- コレクション: `projects`
- フィールド:
  - `userId`: 昇順
  - `title`: 昇順
  - `updatedAt`: 降順

## Firebaseコンソールでの設定方法

### 方法1: コンソールから手動で作成

1. [Firebase Console](https://console.firebase.google.com)にアクセス
2. 「Firestore Database」→「インデックス」タブを選択
3. 「インデックスを作成」をクリック
4. 以下の情報を入力：
   - コレクションID
   - インデックスするフィールド（フィールド名と並び順）
   - クエリスコープ（コレクション or コレクショングループ）
5. 「作成」をクリック

### 方法2: エラーメッセージから自動作成

1. アプリケーションでクエリを実行
2. インデックスが必要な場合、エラーメッセージにリンクが表示される
3. リンクをクリックして自動的にインデックスを作成

エラーメッセージの例：
```
The query requires an index. You can create it here: 
https://console.firebase.google.com/v1/r/project/...
```

### 方法3: Firebase CLIを使用

`firestore.indexes.json`ファイルを作成：

```json
{
  "indexes": [
    {
      "collectionGroup": "projects",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "updatedAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "projects",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "projects",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "title",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "updatedAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "paragraphs",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "order",
          "order": "ASCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

デプロイコマンド：
```bash
firebase deploy --only firestore:indexes
```

## インデックスの最適化

### 1. 不要なインデックスの削除
使用されていないインデックスは削除してコストを削減：
- Firebase Console → Firestore → インデックス
- 使用状況を確認（使用回数が表示される）
- 不要なインデックスを削除

### 2. インデックスの例外設定
特定のフィールドでインデックスを無効化する場合：

```json
{
  "fieldOverrides": [
    {
      "collectionGroup": "projects",
      "fieldPath": "generatedContent",
      "indexes": []  // このフィールドのインデックスを無効化
    }
  ]
}
```

### 3. コレクショングループクエリ
サブコレクションを横断してクエリする場合：

```javascript
// すべてのプロジェクトの段落を検索
firestore.collectionGroup('paragraphs')
  .where('status', '==', 'error')
  .orderBy('updatedAt', 'desc')
```

インデックス設定：
```json
{
  "collectionGroup": "paragraphs",
  "queryScope": "COLLECTION_GROUP",  // コレクショングループスコープ
  "fields": [
    {
      "fieldPath": "status",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "updatedAt",
      "order": "DESCENDING"
    }
  ]
}
```

## パフォーマンスの考慮事項

### 1. インデックスのビルド時間
- 小規模なコレクション: 数分
- 大規模なコレクション: 数時間かかる場合がある
- インデックス作成中もクエリは実行可能（遅い場合がある）

### 2. インデックスのコスト
- ストレージコスト: インデックスサイズに応じて課金
- 書き込みコスト: インデックス更新時に追加の書き込み操作

### 3. クエリの最適化
```javascript
// 非効率的: 大量のドキュメントを読み込む
const allProjects = await firestore.collection('projects')
  .where('userId', '==', uid)
  .get();

// 効率的: ページネーションを使用
const recentProjects = await firestore.collection('projects')
  .where('userId', '==', uid)
  .orderBy('updatedAt', 'desc')
  .limit(20)
  .get();
```

## トラブルシューティング

### よくある問題

1. **「The query requires an index」エラー**
   - エラーメッセージのリンクからインデックスを作成
   - または手動でインデックスを設定

2. **インデックスが作成されない**
   - ビルド中の可能性（Consoleで状態を確認）
   - フィールド名のタイポを確認
   - クエリスコープが正しいか確認

3. **クエリが遅い**
   - 適切なインデックスが存在するか確認
   - limit()を使用してデータ量を制限
   - 不要なフィールドを除外

## モニタリング

### Firebase Console でのモニタリング
1. 使用状況タブでインデックスの使用回数を確認
2. パフォーマンスタブでクエリの実行時間を確認
3. 使用量タブでインデックスのストレージサイズを確認

### Cloud Monitoring での詳細分析
```javascript
// Cloud Functions でクエリパフォーマンスをログ
exports.logQueryPerformance = functions.https.onCall(async (data, context) => {
  const startTime = Date.now();
  
  const result = await firestore.collection('projects')
    .where('userId', '==', context.auth.uid)
    .orderBy('updatedAt', 'desc')
    .limit(20)
    .get();
  
  const duration = Date.now() - startTime;
  
  console.log({
    query: 'getUserProjects',
    userId: context.auth.uid,
    resultCount: result.size,
    duration: duration,
    timestamp: new Date().toISOString()
  });
  
  return result.docs.map(doc => doc.data());
});
```

## 次のステップ
1. [Firebase Authentication設定](./firebase-auth-setup.md)
2. [アプリケーションへのFirebase統合](./firebase-integration.md)