# Gitワークフロー

Git操作とブランチ管理のルール。コミット、PR作成、機能実装時に適用。

---

## コミットメッセージ形式

```
<type>: <description>
```

| Type     | 用途             | 例                                       |
| -------- | ---------------- | ---------------------------------------- |
| feat     | 新機能追加       | `feat: Add boss phase encounter system`  |
| fix      | バグ修正         | `fix: Resolve collision detection drift` |
| refactor | リファクタリング | `refactor: Extract entity pool manager`  |
| docs     | ドキュメント     | `docs: Update architecture guide`        |
| test     | テスト追加・修正 | `test: Add unit tests for scoring`       |
| chore    | 雑務             | `chore: Update dependencies`             |
| perf     | パフォーマンス   | `perf: Optimize entity rendering loop`   |
| ci       | CI/CD設定        | `ci: Add EAS build workflow`             |

---

## プルリクエストワークフロー

PR作成時の必須ステップ:

1. `git log [base]..HEAD` で完全なコミット履歴を分析
2. `git diff [base-branch]...HEAD` ですべての変更を確認
3. PRサマリー作成（包括的な変更説明）
4. テスト計画をTODOリストで記載

---

## ブランチ命名規則

| プレフィックス | 用途             | 例                             |
| -------------- | ---------------- | ------------------------------ |
| `feature/`     | 新機能           | `feature/boss-encounter`       |
| `fix/`         | バグ修正         | `fix/collision-detection`      |
| `refactor/`    | リファクタリング | `refactor/entity-pool`         |
| `topic/`       | 複合的な変更     | `topic/update-claude-config`   |

---

## 禁止事項

| 操作                     | 理由                 |
| ------------------------ | -------------------- |
| `git push --force`       | 履歴破壊のリスク     |
| `git rebase -i` (共有後) | 他の開発者に影響     |
| main/devへの直接push     | レビュープロセス回避 |
| `.ai/` のコミット        | ローカル専用ファイル |

---

## 機能実装の順序

| 順序 | 作業内容             | 対象ファイル                         |
| ---- | -------------------- | ------------------------------------ |
| 1    | 型定義・データ定義   | `src/game/**/*.ts`, `src/types/*.ts` |
| 2    | エンジンロジック     | `src/engine/**/*.ts`                 |
| 3    | レンダリング         | `src/rendering/**/*.ts`              |
| 4    | ストア（状態管理）   | `src/stores/**/*.ts`                 |
| 5    | UIコンポーネント     | `src/ui/**/*.tsx`                    |
| 6    | 画面（ページ）       | `app/**/*.tsx`                       |
