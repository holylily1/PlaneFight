import { _decorator, AudioClip, Component, input, Input, instantiate, math, Node, Prefab } from 'cc';
import { GameManager } from './GameManager';
import { Enemy } from './Enemy';
import { AudioMgr } from './AudioMgr';
const { ccclass, property } = _decorator;

/**
 * 场景物品管理器
 * - 负责敌人和道具的生成与管理
 * - 处理双击使用炸弹逻辑
 */
@ccclass('SceneItemManager')
export class SceneItemManager extends Component {
    // ======================
    // 敌人相关属性
    // ======================
    @property(Prefab)
    enemy0Prefab: Prefab = null;  // 敌人0预制体
    @property
    enemy0SpawnRate: number = 1;  // 敌人0生成频率(秒)

    @property(Prefab)
    enemy1Prefab: Prefab = null;  // 敌人1预制体
    @property
    enemy1SpawnRate: number = 2;  // 敌人1生成频率(秒)

    @property(Prefab)
    enemy2Prefab: Prefab = null;  // 敌人2预制体
    @property
    enemy2SpawnRate: number = 4;  // 敌人2生成频率(秒)

    // ======================
    // 道具相关属性
    // ======================
    @property(Prefab)
    reward1Prefab: Prefab = null;  // 道具1预制体
    @property(Prefab)
    reward2Prefab: Prefab = null;  // 道具2预制体
    @property
    rewardSpawnRate: number = 3;   // 道具生成频率(秒)

    // ======================
    // 双击检测相关
    // ======================
    doubleClickInterval: number = 0.2;  // 双击间隔时间(秒)
    lastClickTime: number = 0;          // 上次点击时间

    // ======================
    // 敌人管理
    // ======================
    enemyArray: Enemy[] = [];  // 当前场景中的敌人数组

    // ======================
    // 音频相关
    // ======================
    @property(AudioClip)
    useBombAudio: AudioClip = null;  // 使用炸弹音效

    // ======================
    // 单例模式实现
    // ======================
    private static _instance: SceneItemManager;
    public static getInstance(): SceneItemManager {
        return SceneItemManager._instance;
    }

    // ======================
    // 生命周期方法
    // ======================
    protected onLoad(): void {
        SceneItemManager._instance = this;  // 设置单例实例
        this.lastClickTime = 0;             // 初始化点击时间
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);  // 注册触摸结束事件
    }

    start() {
        // 定时生成敌人和道具
        this.schedule(this.enemy0Spawn, this.enemy0SpawnRate);
        this.schedule(this.enemy1Spawn, this.enemy1SpawnRate);
        this.schedule(this.enemy2Spawn, this.enemy2SpawnRate);
        this.schedule(this.rewardSpawn, this.rewardSpawnRate);
    }

    protected onDestroy(): void {
        // 取消所有定时器
        this.unschedule(this.enemy0Spawn);
        this.unschedule(this.enemy1Spawn);
        this.unschedule(this.enemy2Spawn);
        this.unschedule(this.rewardSpawn);

        // 移除事件监听
        this.node.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    // ======================
    // 敌人管理方法
    // ======================
    /**
     * 从数组中移除敌人
     */
    public removeEnemy(enemy: Enemy) {
        const index = this.enemyArray.indexOf(enemy);
        if (index > -1) {
            this.enemyArray.splice(index, 1);
        }
    }

    // ======================
    // 生成逻辑方法
    // ======================
    update(deltaTime: number) {
        // 空实现，保留用于未来扩展
    }

    /**
     * 生成敌人0
     */
    enemy0Spawn() {
        const enemyNode = this.ItemSpawn(this.enemy0Prefab, -212, 212, 450);
        const enemyComponent = enemyNode.getComponent(Enemy);
        if (enemyComponent) {
            this.enemyArray.push(enemyComponent);
        }
    }

    /**
     * 生成敌人1
     */
    enemy1Spawn() {
        const enemyNode = this.ItemSpawn(this.enemy1Prefab, -200, 200, 475);
        const enemyComponent = enemyNode.getComponent(Enemy);
        if (enemyComponent) {
            this.enemyArray.push(enemyComponent);
        }
    }

    /**
     * 生成敌人2
     */
    enemy2Spawn() {
        const enemyNode = this.ItemSpawn(this.enemy2Prefab, -155, 155, 555);
        const enemyComponent = enemyNode.getComponent(Enemy);
        if (enemyComponent) {
            this.enemyArray.push(enemyComponent);
        }
    }

    /**
     * 随机生成道具
     */
    rewardSpawn() {
        const randomNumber = math.randomRangeInt(0, 2);
        let Prefab = null;
        if (randomNumber == 0) {
            Prefab = this.reward1Prefab;
        } else {
            Prefab = this.reward2Prefab;
        }
        this.ItemSpawn(Prefab, -210, 210, 470);
    }

    /**
     * 通用物品生成方法
     */
    ItemSpawn(enemyPrefab: Prefab, minX: number, maxX: number, y: number): Node {
        const enemy = instantiate(enemyPrefab);
        this.node.addChild(enemy);
        const randomX = math.randomRangeInt(minX, maxX);
        enemy.setPosition(randomX, y, 0);
        return enemy;
    }

    // ======================
    // 双击处理方法
    // ======================
    /**
     * 触摸结束回调，检测双击
     */
    onTouchEnd(event) {
        let currentTime = Date.now();
        let timeDiff = (currentTime - this.lastClickTime) / 1000;

        if (timeDiff < this.doubleClickInterval) {
            this.onDoubleClick(event);  // 检测到双击
        }
        this.lastClickTime = currentTime;  // 更新最后点击时间
    }

    /**
     * 双击处理逻辑 - 使用炸弹
     */
    onDoubleClick(event) {
        if (!GameManager.getInstance().isHaveBomb()) return;  // 没有炸弹则返回

        // 触发所有敌人的死亡动画
        const enemies = [...this.enemyArray];  // 创建数组副本以避免遍历时修改
        for (let enemy of enemies) {
            if (enemy && enemy.node && enemy.node.isValid) {
                enemy.hp = 0;  // 设置hp为0触发死亡
                if (enemy.anim && enemy.animDown) {
                    enemy.anim.play(enemy.animDown);  // 播放死亡动画
                }
            }
        }

        // 使用炸弹
        GameManager.getInstance().bombNumber--;  // 减少炸弹数量
        GameManager.getInstance().node.emit('onBombChange');  // 通知炸弹数量变化
        AudioMgr.inst.playOneShot(this.useBombAudio);  // 播放炸弹音效
    }
}