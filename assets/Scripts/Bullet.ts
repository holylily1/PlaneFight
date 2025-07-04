import { _decorator, Component, Node } from 'cc';
import { Player } from './Player';
const { ccclass, property } = _decorator;

@ccclass('Bullet')
export class Bullet extends Component {
    @property
    speed: number = 500;

    // 静态引用到Player实例，用于访问对象池
    public static playerInstance: Player = null;

    // 是否是单发子弹（用于确定使用哪个对象池）
    public isBullet1: boolean = true;

    protected update(dt: number): void {
        const position = this.node.position;
        this.node.setPosition(position.x, position.y + this.speed * dt, position.z);
        if (position.y > 700) {
            // 如果有Player实例引用，则直接放回对应的对象池
            if (Bullet.playerInstance) {
                if (this.isBullet1) {
                    // 直接使用bullet1Pool的put方法
                    Bullet.playerInstance.bullet1Pool.put(this.node);
                } else {
                    // 直接使用bullet2Pool的put方法
                    Bullet.playerInstance.bullet2Pool.put(this.node);
                }
            } else {
                // 如果没有Player实例引用，则直接销毁
                this.node.destroy();
            }
        }
    }
}