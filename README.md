# :watermelon: Chrome 扩展 - 录播姬

> 一键录制所有直播间视频，不用错过主播的精彩时刻。

## 安装

-   [在线 chrome 网上应用商店](https://chrome.google.com/webstore/detail/mceccjciahghnipaeabdclgjnfbkignk)
-   [离线 dist 目录](./dist/)

## 使用

进入任意包含视频的页面，点击右上角的录播姬图标，激活页面的录播姬浮标(如下图)，既可以点击开始进行录制，任意时间后点击停止，最后点击下载即可。

## 截图

<img src="./images/screenshot.png" width="640">

## 问题

#### 这个 录播姬 和 Bilibili 录播姬 有什么区别？

-   [Bilibili 录播姬](https://github.com/zhw2590582/bilibili-live-recorder)

`Bilibili 录播姬`只针对类似 Bilibili 这种使用`http-flv`做直播的平台有效，而且保存格式为`flv`。而当前这个`录播姬`是可以录制所有网站的视频，无论点播还是直播均可以，保存的格式是`webm`。

#### 为什么录制会突然中断？

因为视频流必须是一个完整的数据，假如录制开始后，发生了切换画质或者线路，又或者网络不好导致直播的心跳重连，都会引起视频流异常而导致中断，但你依旧可以下载中断前的视频数据。

#### 为什么有时候会出现多个录播姬浮标？

因为有的页面使用了`<iframe>`标签来嵌套视频，但默认情况下顶层浮标是无法访问到`<iframe>`里面的视频，所以只能在`<iframe>`再添加个直播姬浮标。

## 捐助

![捐助](./images/wechatpay.jpg)

## 交流

![QQ 群](./images/qqgroup.png)

## License

MIT © [Harvey Zack](https://sleepy.im/)
