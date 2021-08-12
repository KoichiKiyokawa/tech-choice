# cron

データを取得したり、DB に保存したりする処理を書く

## 一括で実行する例

`src/repositories`以下の ts ファイルをすべて実行する

```shell
find src/repositories -name "*.ts" | xargs -If yarn ts-node f
```
