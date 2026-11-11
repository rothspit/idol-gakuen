# SEOパイプライン — アイドル学園（idolgakuen.jp）

方針:

1. **予約につながる語だけ**
2. **毎日最大3本の下書き + PNGサムネ**（自動公開しない）
3. **生成したら即公開**（`content/articles/*.md` はすべて `/blog` に出る。公開後に直す）
4. **在籍は18歳以上・高校非在籍のみ**（JK表現はコスプレコンセプト）
5. **X 自動投稿はしない**
6. 既存の固定ガイド `/funabashi/guide/*` とは別系統（こちらは日次MDブログ）

## GSC 連携

### CSV

```bash
cd /var/www/idol-gakuen
npm run seo:fetch-csv -- path/to/Performance.csv
npm run seo:find-rising
```

### API

| 変数 | 内容 |
|------|------|
| `GSC_SITE_URL` | `https://idolgakuen.jp/` |
| `GOOGLE_APPLICATION_CREDENTIALS` または `GSC_SERVICE_ACCOUNT_JSON` | SA鍵 |
| `ANTHROPIC_API_KEY` | 本文生成（任意） |

```bash
npm run seo:fetch-api
npm run seo:find-rising
npm run seo:daily:run
```

## 公開手順（公開優先）

1. `npm run seo:daily:run` で MD + PNG 生成
2. ビルド＆再起動 → `/blog/` に即反映
3. 公開後に年齢表現・料金などを直して再ビルド
