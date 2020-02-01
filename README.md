## 让egret进入命令行的方法
1. 检查电脑是否有`e:`盘，我们以`e:`作为工作目录  
2. 如果没有`e:`盘（公司目前应该都是不做分区的，使用`win10`的机器，也不建议进行分区），执行下列操作：    
    1. 在`c:`盘根目录创建`workspace`文件夹  
    2. 直接下载此脚本[startup.bat](http://common.h5.tpulse.cn/startup.bat)，放到`c:`根目录
    3. 执行`startup.bat`脚本  
    4. 运行 `gpedit.msc`，调出`组策略`  
    5. 找到 `本地计算机 策略`->`计算机配置`->`Windows 设置`->`脚本(启动/关机)`中的`启动`脚本设置，添加`C:\startup.bat` 设置成`开机自动执行`
3. 将项目 clone  至 `e:\egret-core` 下
    ```shell
    cd /d e:
    git clone http://gitlab.tpulse.cn/h5game/egret-core.git
    ```
4. 将此脚本[egret.cmd](http://common.h5.tpulse.cn/egret.cmd) 拷贝至`%userprofile%\AppData\Roaming\npm` 目录