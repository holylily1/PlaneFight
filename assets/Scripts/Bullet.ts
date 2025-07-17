import { _decorator, Component, Node, Prefab, resources } from 'cc';
import { BulletPoolManager } from './BulletPoolManager';
const { ccclass, property } = _decorator;

@ccclass('Bullet')
export class Bullet extends Component {
    @property
    speed: number = 500;

    // 是否是单发子弹（用于确定使用哪个对象池）
    public isOneShoot: boolean = true;
    
    // 记录子弹的原始预制体名称，用于确保回收到正确的对象池
    private prefabName: string = '';
    
    // 当节点被添加到场景时调用
    protected onEnable(): void {
        // 根据节点名称判断是哪种类型的子弹
        // 假设单发子弹预制体名称包含"bullet1"，双发子弹预制体名称包含"bullet2"
        this.prefabName = this.node.name;
    }

    protected update(dt: number): void {
        const position = this.node.position;
        this.node.setPosition(position.x, position.y + this.speed * dt, position.z);

        // 检查子弹是否超出屏幕
        if (position.y > 700) {
            // 使用对象池管理器回收子弹
            // 根据预制体名称决定回收到哪个对象池
            if (this.prefabName.includes('bullet1')) {
                // 黄色子弹回收到单发子弹对象池
                BulletPoolManager.instance.bullet1Pool.put(this.node);
            } else if (this.prefabName.includes('bullet2')) {
                // 蓝色子弹回收到双发子弹对象池
                BulletPoolManager.instance.bullet2Pool.put(this.node);
            } else {
                // 如果无法确定预制体类型，则根据isOneShoot属性决定
                if (this.isOneShoot) {
                    BulletPoolManager.instance.bullet1Pool.put(this.node);
                } else {
                    BulletPoolManager.instance.bullet2Pool.put(this.node);
                }
            }
        }
    }
}