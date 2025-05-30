import { _decorator, Animation, AudioClip, Collider, Collider2D, Component, Contact2DType, director, Enum, EventTouch, input, Input, instantiate, IPhysics2DContact, Node, Prefab, UITransform, view } from 'cc';
import { Reward, RewardType } from './Reward';
import { GameManager } from './GameManager';
import { HpUI } from './UI/HpUI';
import { AudioMgr } from './AudioMgr';
const { ccclass, property } = _decorator;

/**
 * 射击类型枚举
 */
enum ShootType {
    None,       // 无射击
    OneShoot,   // 单发射击
    TwoShoot,   // 双发射击
}

/**
 * 玩家控制类
 * - 处理玩家飞机移动、射击、碰撞等行为
 * - 管理玩家状态（生命值、射击模式等）
 */
@ccclass('Player')
export class Player extends Component {
    // ======================
    // 射击相关属性
    // ======================
    @property
    shootRate: number = 0.5;  // 射击间隔时间(秒)
    shootTimer: number = 0;   // 射击计时器

    @property(Prefab)
    bullet1Prefab: Prefab = null;  // 单发子弹预制体
    @property(Prefab)
    bullet2Prefab: Prefab = null;  // 双发子弹预制体

    @property(Node)
    bulletParent: Node = null;     // 子弹父节点

    @property(Node)
    bulletPosition1: Node = null;  // 单发子弹发射位置
    @property(Node)
    bulletPosition2: Node = null;  // 双发子弹左发射位置
    @property(Node)
    bulletPosition3: Node = null;  // 双发子弹右发射位置

    @property({ type: Enum(ShootType) })
    shootType: ShootType = ShootType.OneShoot;  // 当前射击模式

    // ======================
    // 生命值相关属性
    // ======================
    @property
    hp: number = 3;  // 当前生命值
    @property
    HpUI: HpUI = null;  // 生命值UI

    // ======================
    // 动画相关属性
    // ======================
    @property(Animation)
    anim: Animation = null;  // 动画组件
    @property
    animHit: string = ""     // 受击动画名称
    @property
    animDown: string = ""    // 坠毁动画名称

    // ======================
    // 碰撞相关属性
    // ======================
    @property(Collider2D)
    Collider: Collider2D = null;  // 碰撞体组件
    @property
    invincibleTime: number = 1;    // 无敌时间(秒)
    isInvincibleTime: boolean = false;  // 是否处于无敌状态

    // ======================
    // 双发子弹计时器
    // ======================
    @property
    twoShootTime: number = 5;     // 双发持续时间(秒)
    private twoShootTimer: number = 0;  // 双发计时器

    // ======================
    // 音频相关属性
    // ======================
    @property(AudioClip)
    bulletAudio: AudioClip = null;     // 子弹发射音效
    @property(AudioClip)
    getBombAudio: AudioClip = null;    // 获取炸弹音效
    @property(AudioClip)
    getTwoShootAudio: AudioClip = null;// 获取双发子弹音效

    // ======================
    // 生命周期方法
    // ======================
    protected onLoad(): void {
        // 注册触摸移动事件
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);

        // 注册碰撞开始事件
        let collider = this.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    protected onDestroy(): void {
        // 移除触摸移动事件
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);

        // 移除碰撞开始事件
        let collider = this.getComponent(Collider2D);
        if (collider) {
            collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }
    // ======================
    // 碰撞处理方法
    // ======================
    lastReward: Reward = null;  // 记录上次碰撞的道具，避免重复处理

    /**
     * 碰撞开始回调
     */
    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        const reward = otherCollider.getComponent(Reward);
        if (reward) {
            // 处理道具碰撞（无视无敌状态）
            this.onContactToReward(reward);

            // 延迟销毁道具节点
            this.scheduleOnce(() => {
                if (otherCollider.node && otherCollider.node.isValid && otherCollider.getComponent(Reward)) {
                    reward.getComponent(Collider2D).enabled = false;
                    otherCollider.node.destroy();
                }
            }, 0);
        } else {
            // 处理敌人碰撞（仅在非无敌状态下）
            if (!this.isInvincibleTime) {
                this.onContactToEnemy(selfCollider, otherCollider, contact);
            }
        }
    }

    /**
     * 处理道具碰撞
     */
    onContactToReward(reward: Reward) {
        if (reward == this.lastReward) {
            return;  // 避免重复处理同一个道具
        }
        this.lastReward = reward;

        switch (reward.rewardType) {
            case RewardType.TwoShoot:
                this.transitionToTwoShoot();  // 切换到双发射击模式
                AudioMgr.inst.playOneShot(this.getTwoShootAudio);  // 播放音效
                break;
            case RewardType.Bomb:
                AudioMgr.inst.playOneShot(this.getBombAudio);  // 播放音效
                GameManager.getInstance().AddBomb();  // 增加炸弹数量
                break;
        }
    }

    /**
     * 处理敌人碰撞
     */
    onContactToEnemy(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (this.isInvincibleTime) return;  // 无敌状态下不处理

        this.hp -= 1;  // 减少生命值
        GameManager.getInstance().SubHp();  // 通知游戏管理器

        if (this.hp <= 0) {
            // 生命值为0时的处理
            if (Collider) {
                this.Collider.enabled = false;  // 禁用碰撞体
            }
            this.shootType = ShootType.None;  // 停止射击

            // 播放坠毁动画
            let state = this.anim.play(this.animDown);
            this.anim.on(Animation.EventType.FINISHED, () => {
                this.node.destroy();  // 销毁玩家节点
                GameManager.getInstance().gameOver();  // 游戏结束
                this.anim.off(Animation.EventType.FINISHED);  // 移除动画完成监听
            }, this);
        } else {
            // 生命值大于0时的处理
            this.anim.play(this.animHit);  // 播放受击动画

            // 进入无敌状态
            this.isInvincibleTime = true;
            this.scheduleOnce(() => {
                this.isInvincibleTime = false;  // 无敌状态结束
            }, this.invincibleTime);
        }
    }
    // ======================
    // 射击模式转换方法
    // ======================
    /**
     * 切换到双发射击模式
     */
    transitionToTwoShoot() {
        this.shootType = ShootType.TwoShoot;
        this.twoShootTimer = 0;  // 重置计时器
    }

    /**
     * 切换到单发射击模式
     */
    transitionToOneShoot() {
        this.shootType = ShootType.OneShoot;
        this.twoShootTimer = 0;  // 重置计时器
    }
    // ======================
    // 触摸控制方法
    // ======================
    /**
     * 触摸移动回调
     */
    onTouchMove(event: EventTouch) {
        if (director.isPaused()) {
            return;  // 游戏暂停时不处理
        }
        if (this.hp <= 0) {
            return;  // 玩家死亡时不处理
        }

        const p = this.node.position;

        // 计算新位置
        let newX = p.x + event.getDelta().x;
        let newY = p.y + event.getDelta().y;

        // 边界检查
        newX = Math.max(-230, newX);  // 左边界
        newX = Math.min(230, newX);   // 右边界
        newY = Math.max(-400, newY);  // 下边界
        newY = Math.min(380, newY);   // 上边界

        // 更新位置
        this.node.setPosition(newX, newY, p.z);
    }

    protected update(dt: number): void {
        switch (this.shootType) {
            case ShootType.OneShoot:
                this.OneShoot(dt);
                break;
            case ShootType.TwoShoot:
                this.TwoShoot(dt);
                break;
        }

    }
    OneShoot(dt: number) {
        this.shootTimer += dt;
        if (this.shootTimer > this.shootRate) {
            AudioMgr.inst.playOneShot(this.bulletAudio, 0.05);
            this.shootTimer = 0;
            const bullet1 = instantiate(this.bullet1Prefab);
            this.bulletParent.addChild(bullet1);
            bullet1.setWorldPosition(this.bulletPosition1.worldPosition);
        }
    }
    TwoShoot(dt: number) {
        // 更新双发射击计时器
        this.twoShootTimer += dt;

        // 检查是否超过持续时间
        if (this.twoShootTimer >= this.twoShootTime) {
            AudioMgr.inst.playOneShot(this.bulletAudio);

            this.transitionToOneShoot();
            this.twoShootTimer = 0;
            return;
        }

        // 正常的射击逻辑
        this.shootTimer += dt;
        if (this.shootTimer > this.shootRate) {
            AudioMgr.inst.playOneShot(this.bulletAudio, 0.03);

            this.shootTimer = 0;
            const bullet1 = instantiate(this.bullet2Prefab);
            const bullet2 = instantiate(this.bullet2Prefab);
            this.bulletParent.addChild(bullet1);
            this.bulletParent.addChild(bullet2);
            bullet1.setWorldPosition(this.bulletPosition2.worldPosition);
            bullet2.setWorldPosition(this.bulletPosition3.worldPosition);
        }
    }
}