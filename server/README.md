# server

## DB のバックアップコマンド

```shell
yarn db up
yarn db exec db ash
pg_dump -U postgres -Fc tech-choice > /backup/202107161543
```
