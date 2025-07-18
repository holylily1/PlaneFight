 飞机大战 (PlaneFight)

基于Cocos Creator 3.8.2开发的2D射击游戏
跟随视频开发：bilibili.com/video/BV1csHseJETT
在此基础上修复了更多问题：
1、改进了代码，原视频代码过度封装，单例模式功能未彻底实现，我用更简单的代码进行了替代，提高了可读性。
2、修复了一些原视频未处理的问题，如暂停时场景的销毁，对游戏bgm的暂停，无敌状态时由于刚体组件的停用无法捡起奖励道具。
3、完善了游戏逻辑，未及时消灭的敌人而飞行越界时，减少玩家生命值。

2025/7/4 单例模式实现了对象池管理，修改了一下游戏难度，降低了敌人生成速率。
2525/7/14 修复了对象池回收错误的bug，该bug会导致蓝色的双发子弹跑到黄色单发子弹的对象池中。
2525/7/17 场景新增了boss，将enemy2大飞机改造为boss，每一万分生成一次，增加了游戏难度。
2025/7/18 为boss写了行为动作，使其可以周期性的进行冲刺。
          修复了炸弹同一瞬间可以多次使用的bug，内置了一秒的炸弹使用cd。
          替换了血量ui。
## 项目结构

PlaneFight/

├── assets/ # 游戏资源

│ └── Scenes/ # 游戏场景

│ ├── 01-Start.scene # 开始场景

│ └── 02-GameScene.scene # 游戏主场景

├── settings/ # 项目设置

├── .creator/ # 编辑器配置

└── package.json # 项目配置文件


## 开发环境

- Cocos Creator 3.8.2
- Node.js 14+ (推荐)

## 快速开始

1. 安装Cocos Creator 3.8.2
2. 克隆本项目：
   ```bash
   git clone https://github.com/你的用户名/PlaneFight.git
   
3. 用Cocos Creator打开项目文件夹

4. 选择"01-Start.scene"点击运行按钮 ▶️
