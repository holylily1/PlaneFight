import { _decorator, Component, Node } from 'cc';
import { BulletPoolManager } from './BulletPoolManager';
const { ccclass, property } = _decorator;

@ccclass('Bullet')
export class Bullet extends Component {
    @property
    speed: number = 500;

    // 是否是单发子弹（用于确定使用哪个对象池）
    public isBullet1: boolean = true;

    protected update(dt: number): void {
        const position = this.node.position;
        this.node.setPosition(position.x, position.y + this.speed * dt, position.z);

        // 检查子弹是否超出屏幕
        if (position.y > 700) {
            // 使用对象池管理器回收子弹
            if (this.isBullet1) {
                // 回收到单发子弹对象池
                BulletPoolManager.instance.bullet1Pool.put(this.node);
            } else {
                // 回收到双发子弹对象池
                BulletPoolManager.instance.bullet2Pool.put(this.node);
            }
        }
    }
}