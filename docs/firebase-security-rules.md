# Firebase セキュリティルール設定ガイド

## Firestore セキュリティルール

### 本番環境用ルール
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ヘルパー関数
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isProjectOwner(projectId) {
      return isAuthenticated() && 
        exists(/databases/$(database)/documents/projects/$(projectId)) &&
        get(/databases/$(database)/documents/projects/$(projectId)).data.userId == request.auth.uid;
    }
    
    // バリデーション関数
    function isValidProject() {
      return request.resource.data.keys().hasAll(['userId', 'title', 'theme', 'status', 'createdAt', 'updatedAt']) &&
        request.resource.data.userId == request.auth.uid &&
        request.resource.data.title is string &&
        request.resource.data.title.size() > 0 &&
        request.resource.data.title.size() <= 100 &&
        request.resource.data.theme is string &&
        request.resource.data.theme.size() > 0 &&
        request.resource.data.theme.size() <= 256 &&
        request.resource.data.status in ['draft', 'in_progress', 'completed'];
    }
    
    function isValidParagraph() {
      return request.resource.data.keys().hasAll(['order', 'title', 'targetLength', 'status']) &&
        request.resource.data.order is number &&
        request.resource.data.order >= 1 &&
        request.resource.data.order <= 10 &&
        request.resource.data.title is string &&
        request.resource.data.title.size() > 0 &&
        request.resource.data.title.size() <= 100 &&
        request.resource.data.targetLength is number &&
        request.resource.data.targetLength >= 100 &&
        request.resource.data.targetLength <= 3000 &&
        request.resource.data.status in ['draft', 'generating', 'completed', 'error'];
    }
    
    // ユーザーコレクション
    match /users/{userId} {
      allow read: if isOwner(userId);
      allow create: if isOwner(userId) && 
        request.resource.data.keys().hasAll(['email', 'createdAt', 'updatedAt']);
      allow update: if isOwner(userId) &&
        request.resource.data.email == resource.data.email && // メールアドレスは変更不可
        request.resource.data.createdAt == resource.data.createdAt; // 作成日時は変更不可
      allow delete: if false; // ユーザー削除は管理者のみ（Admin SDK経由）
    }
    
    // プロジェクトコレクション
    match /projects/{projectId} {
      allow read: if isProjectOwner(projectId);
      allow create: if isAuthenticated() && isValidProject();
      allow update: if isProjectOwner(projectId) && 
        request.resource.data.userId == resource.data.userId && // userIdは変更不可
        request.resource.data.createdAt == resource.data.createdAt; // 作成日時は変更不可
      allow delete: if isProjectOwner(projectId);
      
      // 段落サブコレクション
      match /paragraphs/{paragraphId} {
        allow read: if isProjectOwner(projectId);
        allow create: if isProjectOwner(projectId) && isValidParagraph();
        allow update: if isProjectOwner(projectId) &&
          request.resource.data.createdAt == resource.data.createdAt; // 作成日時は変更不可
        allow delete: if isProjectOwner(projectId);
      }
      
      // 参考資料サブコレクション
      match /references/{referenceId} {
        allow read: if isProjectOwner(projectId);
        allow create: if isProjectOwner(projectId) &&
          request.resource.data.type in ['pdf', 'link'] &&
          request.resource.data.url is string;
        allow update: if isProjectOwner(projectId) &&
          request.resource.data.type == resource.data.type && // typeは変更不可
          request.resource.data.addedAt == resource.data.addedAt; // 追加日時は変更不可
        allow delete: if isProjectOwner(projectId);
      }
    }
    
    // その他のコレクションへのアクセスは拒否
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Storage セキュリティルール

### 本番環境用ルール
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // ヘルパー関数
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // ファイルサイズとタイプの検証
    function isValidPDF() {
      return request.resource.size <= 10 * 1024 * 1024 && // 10MB以下
        request.resource.contentType == 'application/pdf';
    }
    
    // ユーザーファイル
    match /users/{userId}/{allPaths=**} {
      allow read: if isOwner(userId);
      allow write: if isOwner(userId) && isValidPDF();
      allow delete: if isOwner(userId);
    }
    
    // 一時ファイル（24時間で自動削除）
    match /temp/{sessionId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && 
        isValidPDF() &&
        request.time < resource.timeCreated + duration.value(24, 'h'); // 24時間以内
      allow delete: if false; // Cloud Functionsで自動削除
    }
    
    // その他のパスへのアクセスは拒否
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## セキュリティルールの適用方法

### 1. Firebaseコンソールから適用

#### Firestoreルールの適用
1. Firebase Consoleにアクセス
2. 「Firestore Database」→「ルール」タブを選択
3. 上記のFirestoreルールをコピー＆ペースト
4. 「公開」をクリック

#### Storageルールの適用
1. Firebase Consoleにアクセス
2. 「Storage」→「ルール」タブを選択
3. 上記のStorageルールをコピー＆ペースト
4. 「公開」をクリック

### 2. Firebase CLIから適用

#### 設定ファイルの作成
`firestore.rules`:
```javascript
// 上記のFirestoreルールをここに記載
```

`storage.rules`:
```javascript
// 上記のStorageルールをここに記載
```

`firebase.json`:
```json
{
  "firestore": {
    "rules": "firestore.rules"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

#### デプロイ
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

## セキュリティのベストプラクティス

### 1. 最小権限の原則
- ユーザーは自分のデータのみアクセス可能
- 必要最小限の権限のみを付与

### 2. データ検証
- 入力データのサイズ制限
- データ型の厳密な検証
- 許可された値のみを受け入れる（enum検証）

### 3. レート制限
Cloud Functionsを使用したレート制限の実装例：
```javascript
exports.rateLimiter = functions.https.onCall(async (data, context) => {
  const uid = context.auth.uid;
  const now = Date.now();
  const userDoc = await admin.firestore().doc(`rateLimits/${uid}`).get();
  
  if (userDoc.exists) {
    const lastRequest = userDoc.data().lastRequest;
    if (now - lastRequest < 1000) { // 1秒以内の連続リクエストを制限
      throw new functions.https.HttpsError('resource-exhausted', 'Too many requests');
    }
  }
  
  await admin.firestore().doc(`rateLimits/${uid}`).set({
    lastRequest: now,
    count: admin.firestore.FieldValue.increment(1)
  }, { merge: true });
});
```

### 4. 監査ログ
重要な操作のログを記録：
```javascript
// Cloud Functions での実装例
exports.auditLog = functions.firestore
  .document('projects/{projectId}')
  .onWrite(async (change, context) => {
    const operation = !change.before.exists ? 'CREATE' : 
                      !change.after.exists ? 'DELETE' : 'UPDATE';
    
    await admin.firestore().collection('auditLogs').add({
      userId: context.auth?.uid || 'system',
      operation: operation,
      resource: `projects/${context.params.projectId}`,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      before: change.before.data(),
      after: change.after.data()
    });
  });
```

## テスト方法

### 1. ルールのテスト
Firebase Emulatorを使用：
```bash
npm install -g firebase-tools
firebase emulators:start --only firestore,storage
```

### 2. セキュリティルールのユニットテスト
```javascript
const { assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');

describe('Firestore Security Rules', () => {
  it('should allow users to read their own projects', async () => {
    const db = getFirestore(myAuth);
    const doc = db.collection('projects').doc('project1');
    await assertSucceeds(doc.get());
  });
  
  it('should deny users from reading other users projects', async () => {
    const db = getFirestore(otherAuth);
    const doc = db.collection('projects').doc('project1');
    await assertFails(doc.get());
  });
});
```

## トラブルシューティング

### よくあるエラーと対処法

1. **Permission Denied**
   - 認証状態を確認
   - ルールの条件を確認
   - Firebase Consoleのルールシミュレータでテスト

2. **Invalid Argument**
   - データ型の検証を確認
   - 必須フィールドの確認

3. **Resource Exhausted**
   - レート制限の確認
   - クォータの確認

## 次のステップ
1. [Firestoreインデックスの設定](./firestore-indexes.md)
2. [Firebase Authenticationの設定](./firebase-auth-setup.md)