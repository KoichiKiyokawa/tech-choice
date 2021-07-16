# server

## DB のバックアップコマンド

```shell
yarn db up
yarn db exec db ash
pg_dump -U postgres -Fc tech-choice > /backup/202107161543
```

## DB のリストアコマンド

```shell
yarn db up
yarn db exec db ash
psql -U postgres -c  'create database "tech-choice";' # db が存在しない場合
pg_restore -U postgres -d tech-choice /backup/202107161543
```
