# 书库 Web API
> Express.js库  SQLite3  构建 RESTful风格下的 JSON 数据服务API
## 1 构建项目结构
- 创建项目目录
```bash
mkdir bookWebApi
cd bookWebApi
npm init
npx express-generator --no-view .
```
- 编辑`package.json`，新增`start-debug`
```json

  "scripts": {
    "start": "node ./bin/www",
    "start-debug": "SET DEBUG=expressjs:* & npm start" 
  },
```

- 启动项目
```bash
npm run start-debug
```
- Express项目热更新
```bash
npm install --save-dev nodemon
```
编辑编辑`package.json`，新增`start-dev`
```json
  "scripts": {
    "start": "node ./bin/www",
    "start-dev" : "SET DEBUG=expressjs:* & nodemon ./bin/www"
  }
```

- 从豆瓣获取书籍信息需要的网络访问和页面分析组件

```bash
npm install cheerio
npm install @types/cheerio --save-dev

npm install axios
```

- 安装DEBUG组件  debug
```bash
npm install debug
```

- 安装Sqlite数据库访问插件 sqlite3
```bash
npm install sqlite3
npm install @types/sqlite3 --save-dev
```
- 安装Session组件 express-session
```bash
npm install express-session
npm install @types/express-session --save-dev
```

- 安装Session存储组件 connect-sqlite3
```bash
npm install connect-sqlite3
npm install @types/connect-sqlite3 --save-dev
```

- 安装MD5生成模块
```bash
npm i blueimp-md5
```
