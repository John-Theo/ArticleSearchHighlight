# ArticleSearchHighlight

dev doc [here](https://paper.dropbox.com/doc/Highlight--AQkFFHEWssEyZmabAx6rhsCrAg-EIRkx2e3hrhBXb1q0yJeD).

## Change log

__2018/11/1__

 - 增加词数统计模块
 - 右侧信息栏悬浮固定
 - 更改 `POS-tagging` 类型


__2018/11/2__

 - 异步加载数据
 - 合并“文件上传”按钮到 `app` 页面
 - 主页自动重定向到 `spactParser/`
 - [ ] 对带有 `括号`、`横线复合`、`句号` 的词做进一步处理

 __2018/11/3__

  - 更新了UI
  - 增加了对 `json` 格式文件的支持，详见 `dev doc`

__2018/12/6__

 - 重写大量代码，大幅更新了UI
 - 支持 `json` 文件格式改变，使其更符合感官认知
 - 准备加入 `settings` 模块
 - `text` 和 `stat` 部分实现联动
 - 同样的词一起高亮
 - `label` 名称可以自行修改
 - 增加 `导出` 功能
 - 点击选中某词，点击空白或 ESC 取消选择
 - 一些词不可被选中，防止误操作

## TODOs

 - `setting` 模块
  - 后端选择
  - 是否展开 `infoPanel`
 - `stat` 右键修改可更改状态
 - 自动色彩方案
 - `stat` 分组
 - 改变词的 `label`
 - 重写代码使面相对象
 - 右侧功能栏是否支持滚动？
