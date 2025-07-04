import { _decorator, NodePool, Prefab, instantiate, Node } from 'cc';
const { ccclass } = _decorator;

/**
 * 子弹对象池管理器 - 全局单例
 */
@ccclass('BulletPoolManager')
export class BulletPoolManager {
    // 单例实例
    private static _instance: BulletPoolManager = null;

    // 对象池
    public bullet1Pool: NodePool = new NodePool();
    public bullet2Pool: NodePool = new NodePool();

    // 获取单例实例
    public static get instance(): BulletPoolManager {
        if (!this._instance) {
            this._instance = new BulletPoolManager();
        }
        return this._instance;
    }

    /**
     * 初始化对象池
     * @param bullet1Prefab 单发子弹预制体
     * @param bullet2Prefab 双发子弹预制体
     * @param initCount 初始数量
     */
    public init(bullet1Prefab: Prefab, bullet2Prefab: Prefab, initCount: number = 10): void {
        // 预先创建对象
        for (let i = 0; i < initCount; i++) {
            this.bullet1Pool.put(instantiate(bullet1Prefab));
            this.bullet2Pool.put(instantiate(bullet2Prefab));
        }
    }

    /**
     * 清空所有对象池
     */
    public clear(): void {
        this.bullet1Pool.clear();
        this.bullet2Pool.clear();
    }
}