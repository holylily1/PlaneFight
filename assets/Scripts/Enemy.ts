import { _decorator, Animation, Collider2D, Component, Contact2DType, IPhysics2DContact, Node, AnimationState, AudioClip } from 'cc';
import { Bullet } from './Bullet';
import { GameManager } from './GameManager';
import { SceneItemManager } from './SceneItemManager';
import { AudioMgr } from './AudioMgr';
import { Player } from './Player';
import { BulletPoolManager } from './BulletPoolManager';
const { ccclass, property } = _decorator;

/**
 * 敌人类，负责敌人的移动、碰撞检测和生命值管理
 */
@ccclass('Enemy')
export class Enemy extends Component {
    // 基础属性
    @property
    speed: number = 300;            // 敌人移动速度
    @property
    hp: number = 1;                 // 敌人生命值
    @property
    score: number = 100;            // 击败敌人获得的分数

    // 动画相关
    @property(Animation)
    anim: Animation = null;         // 动画组件
    @property
    animHit: string = "";          // 受击动画名称
    @property
    animDown: string = "";         // 死亡动画名称
    @property(AudioClip)
    enemyDownAudio: AudioClip = null; // 死亡音效

    // 组件引用
    private collider: Collider2D = null; // 碰撞器组件
    start() {
        this.collider = this.getComponent(Collider2D);
        if (this.collider) {
            this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }
    protected onDestroy(): void {
        // 从敌人数组中移除自己
        const sceneItemManager = SceneItemManager.getInstance();
        if (sceneItemManager) {
            sceneItemManager.removeEnemy(this);
        }

        // 移除碰撞监听
        let collider = this.getComponent(Collider2D);
        if (collider) {
            collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 延迟回收子弹，等待物理引擎完成当前帧的处理
        this.scheduleOnce(() => {
            if (otherCollider.node && otherCollider.node.isValid) {
                const bulletComp = otherCollider.getComponent(Bullet);
                if (bulletComp) {
                    // 使用对象池管理器回收子弹，而不是直接销毁
                    if (bulletComp.isBullet1) {
                        BulletPoolManager.instance.bullet1Pool.put(otherCollider.node);
                    } else {
                        BulletPoolManager.instance.bullet2Pool.put(otherCollider.node);
                    }
                }
            }
        }, 0);

        // 如果碰撞器已经禁用，说明正在播放动画，不处理新的碰撞
        if (!this.collider.enabled) {
            return;
        }

        this.hp -= 1;
        // 禁用碰撞器，防止动画播放过程中继续触发碰撞
        this.collider.enabled = false;

        // 检查动画组件是否存在
        if (this.hp <= 0) {
            AudioMgr.inst.playOneShot(this.enemyDownAudio)
            let state = this.anim.play(this.animDown);
            // 监听死亡动画完成事件
            this.anim.on(Animation.EventType.FINISHED, () => {
                // 死亡动画播放完成后销毁节点
                if (this.node.isValid) {
                    this.node.destroy();
                }
                // 移除事件监听
                this.anim.off(Animation.EventType.FINISHED);
            }, this);

            // 记录得分
            GameManager.getInstance().addScore(this.score);
        }
        else {
            let state = this.anim.play(this.animHit);
            // 监听受伤动画完成事件
            this.anim.on(Animation.EventType.FINISHED, () => {
                // 受伤动画播放完成后重新启用碰撞器
                if (this.collider && this.node.isValid) {
                    this.collider.enabled = true;
                }
                // 移除事件监听，避免重复触发
                this.anim.off(Animation.EventType.FINISHED);
            }, this);
        }
    }

    update(deltaTime: number) {
        if (this.hp > 0) {
            const p = this.node.position;
            this.node.setPosition(p.x, p.y - this.speed * deltaTime, p.z);
        } else if (this.hp <= 0) {

            // 检查是否有动画正在播放0
            if (!this.anim || !this.anim.getState(this.animDown).isPlaying) {
                // 如果没有动画或动画不在播放，销毁节点
                this.node.destroy();
            }
        }
        if (this.node.position.y < -470) {
            if (this.hp > 0) { // 只有活着的敌人越界才减血
                // 获取场景中的Player节点
                const player = this.node.scene.getComponentInChildren(Player);
                if (player) {
                    player.hp -= 1;
                    GameManager.getInstance().SubHp();

                    // 检查玩家生命值
                    if (player.hp <= 0) {
                        // 播放死亡动画
                        if (player.anim) {
                            const state = player.anim.play(player.animDown);
                            player.anim.on(Animation.EventType.FINISHED, () => {
                                player.node.destroy();
                                GameManager.getInstance().gameOver();
                                // 移除事件监听
                                player.anim.off(Animation.EventType.FINISHED);
                            }, player);
                        } else {
                            // 如果没有动画组件，直接结束游戏
                            player.node.destroy();
                            GameManager.getInstance().gameOver();
                        }

                    }
                }
            }
            this.node.destroy();
        }
    }
}