# cache-install

可以加速 `npm install`，在有缓存的情况下，默认去从缓存拉取，然后再执行 `npm install`，完成后再将 `node_modules` 拷贝回缓存系统。主要用于 `cicd` 等流程中，它很快。

## 注意点

+ 为了保证速度，不要依赖其他 `npm` 包
+ 通过 `npx` 的形式运行，需保证其兼容性

## 待优化

+ 缓存删除机制完善
+ 缓存版本控制
+ 缓存命中优化
+ 整体实现优化

## 坑

+ 未在 `windows` 测试
+ 部分功能为了适配 `cloud-admin-fullstack` 而实现，当然它也可以用于通常项目
