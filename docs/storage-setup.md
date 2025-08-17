# Firebase Storage 設定ガイド

## ストレージ構造

### フォルダ構造
```
/
├── users/
│   └── {userId}/
│       ├── profile/
│       │   └── avatar.jpg (将来的な拡張用)
│       └── projects/
│           └── {projectId}/
│               └── pdfs/
│                   └── {fileId}_{fileName}.pdf
└── temp/
    └── {sessionId}/
        └── {tempFiles} (一時的なアップロード用)
```

## ファイル命名規則

### PDFファイル
- パス: `/users/{userId}/projects/{projectId}/pdfs/{fileId}_{fileName}.pdf`
- fileId: タイムスタンプまたはUUID
- fileName: オリジナルのファイル名（サニタイズ済み）

例：
```
/users/abc123/projects/proj456/pdfs/1699123456789_研究レポート.pdf
```

## Firebaseコンソールでの設定手順

### 1. Firebase Storageの有効化
1. [Firebase Console](https://console.firebase.google.com)にアクセス
2. プロジェクトを選択
3. 左メニューから「Storage」を選択
4. 「始める」をクリック
5. セキュリティルールのモードを選択（本番環境では「本番モード」を推奨）

### 2. CORSの設定
PDFのプレビューやダウンロードを可能にするためのCORS設定

1. Google Cloud SDKをインストール
2. 以下の内容で`cors.json`を作成：

```json
[
  {
    "origin": ["http://localhost:3000", "https://your-domain.com"],
    "method": ["GET", "POST", "PUT", "DELETE"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Content-Disposition"]
  }
]
```

3. 以下のコマンドを実行：
```bash
gsutil cors set cors.json gs://your-bucket-name
```

### 3. バケットの設定
Firebase Consoleの「Storage」セクションで：

1. **ファイルサイズ制限の確認**
   - デフォルト: 5GB
   - PDFファイルの制限: 10MB（アプリケーション側で制御）

2. **メタデータの活用**
   各アップロードファイルに以下のメタデータを設定：
   ```javascript
   metadata: {
     customMetadata: {
       userId: 'user123',
       projectId: 'project456',
       uploadedAt: '2024-01-01T00:00:00Z',
       originalName: '元のファイル名.pdf',
       fileSize: '2048576', // bytes
       contentType: 'application/pdf'
     }
   }
   ```

## ファイルアップロード処理

### 1. クライアント側の実装方針
```javascript
// アップロード前の検証
const validateFile = (file) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['application/pdf'];
  
  if (file.size > maxSize) {
    throw new Error('ファイルサイズが10MBを超えています');
  }
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('PDFファイルのみアップロード可能です');
  }
};

// アップロードパスの生成
const generateUploadPath = (userId, projectId, fileName) => {
  const timestamp = Date.now();
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `users/${userId}/projects/${projectId}/pdfs/${timestamp}_${sanitizedName}`;
};
```

### 2. アップロード進捗の管理
```javascript
// アップロードタスクの監視
uploadTask.on('state_changed',
  (snapshot) => {
    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    console.log('Upload is ' + progress + '% done');
  },
  (error) => {
    // エラーハンドリング
  },
  () => {
    // アップロード完了処理
  }
);
```

## ストレージの最適化

### 1. ファイルの自動削除
プロジェクト削除時に関連ファイルも削除：
```javascript
// Cloud Functions での実装例
exports.deleteProjectFiles = functions.firestore
  .document('projects/{projectId}')
  .onDelete(async (snap, context) => {
    const projectId = context.params.projectId;
    const userId = snap.data().userId;
    
    const bucket = admin.storage().bucket();
    await bucket.deleteFiles({
      prefix: `users/${userId}/projects/${projectId}/`
    });
  });
```

### 2. 一時ファイルのクリーンアップ
24時間以上経過した一時ファイルを自動削除：
```javascript
// Cloud Functions での定期実行
exports.cleanupTempFiles = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const bucket = admin.storage().bucket();
    const [files] = await bucket.getFiles({ prefix: 'temp/' });
    
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24時間
    
    for (const file of files) {
      const createdTime = new Date(file.metadata.timeCreated).getTime();
      if (now - createdTime > maxAge) {
        await file.delete();
      }
    }
  });
```

## 料金の考慮事項

### 1. ストレージ料金
- 保存容量: $0.026/GB/月
- ネットワーク転送: $0.12/GB（ダウンロード）
- オペレーション: $0.05/10,000回（読み取り）、$0.05/1,000回（書き込み）

### 2. コスト削減の方法
- 不要なファイルの定期削除
- PDFのテキスト抽出後、必要に応じて元ファイルを削除
- サムネイル生成など、派生ファイルは必要最小限に

## セキュリティのベストプラクティス

### 1. ファイル検証
- ファイルタイプの厳密な検証
- ファイルサイズの制限
- ファイル名のサニタイズ

### 2. アクセス制御
- ユーザーは自分のファイルのみアクセス可能
- プロジェクト共有機能を実装する場合は、適切な権限管理

### 3. 監査ログ
- アップロード/ダウンロードのログ記録
- 異常なアクセスパターンの検知

## 次のステップ
1. [セキュリティルールの設定](./firebase-security-rules.md)
2. [Firestoreインデックスの設定](./firestore-indexes.md)