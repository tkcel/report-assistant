# Firestore データベース設定ガイド

## コレクション構造

### 1. users コレクション
ユーザーの基本情報を管理

```
users/
└── {userId}/
    ├── email: string
    ├── displayName: string
    ├── createdAt: timestamp
    └── updatedAt: timestamp
```

### 2. projects コレクション
レポートプロジェクトを管理

```
projects/
└── {projectId}/
    ├── userId: string (作成者のUID)
    ├── title: string
    ├── theme: string
    ├── settings: {
    │   ├── language: string
    │   ├── writingStyle: string
    │   ├── tone: string
    │   ├── quality: string
    │   └── purpose: string (optional)
    │   }
    ├── status: string ('draft' | 'in_progress' | 'completed')
    ├── totalTargetLength: number
    ├── totalActualLength: number
    ├── generatedContent: string (optional)
    ├── editedContent: string (optional)
    ├── createdAt: timestamp
    └── updatedAt: timestamp
```

### 3. paragraphs サブコレクション
各プロジェクトの段落を管理

```
projects/{projectId}/paragraphs/
└── {paragraphId}/
    ├── order: number
    ├── title: string
    ├── description: string
    ├── content: string
    ├── targetLength: number
    ├── actualLength: number
    ├── status: string ('draft' | 'generating' | 'completed' | 'error')
    ├── error: string (optional)
    ├── createdAt: timestamp
    └── updatedAt: timestamp
```

### 4. references サブコレクション
各プロジェクトの参考資料を管理

```
projects/{projectId}/references/
└── {referenceId}/
    ├── type: string ('pdf' | 'link')
    ├── url: string
    ├── title: string (optional)
    ├── description: string (optional)
    ├── favicon: string (optional, リンクの場合)
    ├── fileName: string (optional, PDFの場合)
    ├── fileSize: number (optional, PDFの場合)
    ├── storagePath: string (optional, PDFの場合)
    ├── extractedText: string (optional, PDFの場合)
    └── addedAt: timestamp
```

## Firebaseコンソールでの設定手順

### 1. Firebaseコンソールにアクセス
1. [Firebase Console](https://console.firebase.google.com)にアクセス
2. プロジェクトを選択
3. 左メニューから「Firestore Database」を選択

### 2. 初期コレクションの作成（オプション）
以下のコレクションを手動で作成することで、構造を明確にできます：

1. **usersコレクションの作成**
   - 「コレクションを開始」をクリック
   - コレクションID: `users`
   - 最初のドキュメント: 自動ID or テスト用ID
   - フィールド例:
     ```
     email: "test@example.com"
     displayName: "テストユーザー"
     createdAt: timestamp
     updatedAt: timestamp
     ```

2. **projectsコレクションの作成**
   - コレクションID: `projects`
   - 最初のドキュメント: 自動ID
   - フィールド例:
     ```
     userId: "test-user-id"
     title: "サンプルレポート"
     theme: "AIについて"
     status: "draft"
     createdAt: timestamp
     updatedAt: timestamp
     ```

## データモデルの特徴

### 1. サブコレクションの利点
- **paragraphs**: 各プロジェクトの段落を個別に管理し、大量の段落でもパフォーマンスを維持
- **references**: 参考資料を個別に管理し、必要に応じて読み込み

### 2. インデックス要件
以下のクエリを効率的に実行するためのインデックスが必要：

- `projects` where `userId == X` order by `updatedAt DESC`
- `projects` where `userId == X` and `status == Y` order by `createdAt DESC`

### 3. データサイズの考慮事項
- Firestoreドキュメントの最大サイズは1MBです
- `generatedContent`や`editedContent`が大きくなる可能性がある場合、別コレクションまたはStorageの使用を検討
- PDFのテキスト抽出データ（`extractedText`）も同様に、サイズが大きい場合は分割保存を検討

## 次のステップ
1. [セキュリティルールの設定](./firebase-security-rules.md)
2. [Cloud Storageの設定](./storage-setup.md)
3. [複合インデックスの設定](./firestore-indexes.md)