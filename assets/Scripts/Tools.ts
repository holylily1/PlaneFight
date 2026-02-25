import { Asset, assetManager, Component, director, instantiate, Node, NodePool, Prefab, Quat, sys, tween, v3, Vec3 } from "cc";

/**事件函数委托 */
type EventCb = (a0?: any, a1?: any, a2?: any, a3?: any, a4?: any) => void;
/**集成工具类 */
export class Tools {
  private static _: Tools;
  // 全局事件目标节点签到
  static eventTarget: Node = new Node();
  static get ins() {
    this._ || (this._ = new Tools());
    return this._;
  }

  /**随机种子 */
  private rSed = 0;
  /**随机倍 */
  private rTime = 25214903917;
  /**随机偏移 */
  private rOff = 11;
  /**随机模 */
  private rMod = 281474976710656; //2 ** 48
  /**随机数 */
  random() {
    this.rSed = (this.rTime * this.rSed + this.rOff) % this.rMod;
    return this.rSed / this.rMod;
  }
  /**随机索引 */
  randomIdx(len: number) {
    let idx = Math.floor(this.random() * len);
    idx == len && idx--;
    return idx;
  }
  /**权重随机 */
  randWeight<T>(arr: T[], wKey: string) {
    let allWeight = 0;
    arr.forEach((v) => {
      allWeight += v[wKey];
    });
    const rand = this.random() * allWeight;
    let cur = 0;
    for (let i = 0; i < arr.length; i++) {
      const next = cur + arr[i][wKey];
      if (rand >= cur && rand < next) {
        return arr[i];
      }
      cur = next;
    }
    return arr[arr.length - 1];
  }
  /**随机整数 */
  randomInt(min: number, max: number) {
    return min + this.randomIdx(max - min + 1);
  }

  /**
   * 取随机范围内整数
   * @param m
   * @param n
   * @returns
   */
  static RandomInt(m: number, n: number): number {
    return Math.ceil(Math.random() * (n - m + 1) + m - 1);
  }

  /**限制值范围 */
  static clampf(value: number, min_inclusive: number, max_inclusive: number): number {
    if (min_inclusive > max_inclusive) {
      const temp = min_inclusive;
      min_inclusive = max_inclusive;
      max_inclusive = temp;
    }
    return value < min_inclusive ? min_inclusive : value < max_inclusive ? value : max_inclusive;
  }

  /**设置随机种子 */
  setRandSeed(sed: number) {
    sed %= this.rMod;
    sed < 0 && (sed += this.rMod);
    this.rSed = sed;
  }
  /**欧拉角转四元数 */
  eularToQuat(x: number, y: number, z: number) {
    const cx = Math.cos(x * 0.5);
    const sx = Math.sin(x * 0.5);
    const cy = Math.cos(y * 0.5);
    const sy = Math.sin(y * 0.5);
    const cz = Math.cos(z * 0.5);
    const sz = Math.sin(z * 0.5);
    const quat = new Quat();
    quat.w = cx * cy * cz + sx * sy * sz;
    quat.x = sx * cy * cz - cx * sy * sz;
    quat.y = sx * cy * sz + cx * sy * cz;
    quat.z = cx * cy * sz - sx * sy * cz;
    return quat;
  }

  /** 四元数转角度 */
  quaternionToEulerAngles(quat: Quat): Vec3 {
    const euler = new Vec3();
    // 四元数转欧拉角（弧度）
    const x = Math.atan2(2 * (quat.w * quat.x + quat.y * quat.z), 1 - 2 * (quat.x * quat.x + quat.y * quat.y));
    const y = Math.asin(2 * (quat.w * quat.y - quat.z * quat.x));
    const z = Math.atan2(2 * (quat.w * quat.z + quat.x * quat.y), 1 - 2 * (quat.y * quat.y + quat.z * quat.z));
    // 弧度转角度
    euler.x = (x * 180) / Math.PI;
    euler.y = (y * 180) / Math.PI;
    euler.z = (z * 180) / Math.PI;
    return euler;
  }

  /**注册事件 */
  addEvent(type: string, cb: EventCb, tar: any) {
    director.on(type, cb, tar);
  }
  /**注销事件 */
  removeEvent(type: string, cb: EventCb, tar: any) {
    director.off(type, cb, tar);
  }
  /**派发事件 */
  dispatchEvent(type: string, a0?: any, a1?: any, a2?: any, a3?: any, a4?: any) {
    director.emit(type, a0, a1, a2, a3, a4);
  }
  /**二维向量转弧度角 */
  vecToRad(x: number, y: number) {
    if (x == 0) {
      if (y > 0) {
        return Math.PI / 2;
      }
      if (y < 0) {
        return (Math.PI * 3) / 2;
      }
      return -1;
    }
    const rad = Math.atan(y / x);
    if (x < 0) {
      return Math.PI + rad;
    }
    if (y < 0) {
      return Math.PI * 2 + rad;
    }
    return rad;
  }
  /**加载资源promise。代替回调？？？算了，感觉没什么必要 */
  loadResPromise<T extends Asset>(bundleName: string, type: { new (): T }, path: string) {
    return new Promise<T>((reso) => {
      assetManager.loadBundle(bundleName, (err, bundle) => {
        if (err) {
          this.error(err);
          return;
        }
        bundle.load(path, type, (err, res) => {
          if (err) {
            this.error(err);
            return;
          }
          reso(res);
        });
      });
    });
  }
  /**加载资源 */
  loadRes<T extends Asset>(bundleName: string, type: { new (): T }, path: string, cb?: (res: T) => void) {
    assetManager.loadBundle(bundleName, (err, bundle) => {
      if (err) {
        this.error(err);
        return;
      }
      bundle.load(path, type, (err, res) => {
        if (err) {
          console.log(bundleName, path);
          this.error(err);
          return;
        }
        res.addRef();
        cb?.(res);
      });
    });
  }

  /**释放资源 */
  releaseRes(bundleName: string, type: { new (): Asset }, path: string) {
    assetManager.loadBundle(bundleName, (err, bundle) => {
      if (err) {
        this.error(err);
        return;
      }
      bundle.release(path, type);
    });
  }

  /**读取数据 */
  loadData<T>(key: string, cb: (data: T) => void) {
    const str = sys.localStorage.getItem(key);
    if (!str) {
      cb(null);
      return;
    }
    const data = JSON.parse(str);
    cb(data);
  }
  /**保存数据 */
  saveData(key: string, data: any) {
    const str = JSON.stringify(data);
    sys.localStorage.setItem(key, str);
  }

  /**打印错误 */
  error(...err: any) {
    console.error(...err);
  }
  /**对象池组 */
  private ndPools = new Map<{ prototype: Component }, NodePool>();
  /**从对象池获取对象 */
  getNodeFromPool<T extends Component>(cls: { prototype: T }, prefab: Prefab = null) {
    const np = this.ndPools.get(cls);
    if (!np) {
      return null;
    }
    return np.size() > 0 ? np.get() : prefab ? instantiate(prefab) : null;
  }
  /**加入对象池 */
  putNodeToPool(cls: { prototype: Component }, nd: Node) {
    let np = this.ndPools.get(cls);
    if (!np) {
      np = new NodePool();
      this.ndPools.set(cls, np);
    }
    np.put(nd);
  }

  /**
   * 预生成对象池
   * @param cls    对象组件
   * @param prefab 预制体
   * @param nodeNum 数量
   * @method prePool
   */
  preloadPoolNode<T extends Component>(cls: { prototype: T }, prefab: Prefab = null, nodeNum: number = 1) {
    if (!prefab) return;
    let np = this.ndPools.get(cls);
    if (!np) {
      np = new NodePool();
      this.ndPools.set(cls, np);
    }
    for (let j = 0; j < nodeNum; j++) {
      const node = instantiate(prefab);
      np.put(node);
    }
  }

  clearPool<T extends Component>(cls: { prototype: T }) {
    let np = this.ndPools.get(cls);
    np?.clear();
  }

  /**复制对象 */
  copyObj<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  static cloneObject<T>(data: T): T {
    if (!data) return null;
    let clone: T = new (data.constructor as any)();
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        clone[key] = data[key];
      }
    }
    return clone;
  }

  /**
   *  二阶贝塞尔曲线 运动
   * @param target
   * @param {number} duration
   * @param {} c1 起点坐标
   * @param {} c2 控制点
   * @param {Vec3} to 终点坐标
   * @param opts
   * @returns {any}
   */
  public static bezierTo(target: Node, duration: number, c1: Vec3, c2: Vec3, to: Vec3, opts: any = null, isWorld: boolean = false, forwardTime: number = 0): any {
    opts = opts || Object.create(null);
    let twoBezier = (t: number, p1: Vec3, cp: Vec3, p2: Vec3) => {
      let x = (1 - t) * (1 - t) * p1.x + 2 * t * (1 - t) * cp.x + t * t * p2.x;
      let y = (1 - t) * (1 - t) * p1.y + 2 * t * (1 - t) * cp.y + t * t * p2.y;
      let z = (1 - t) * (1 - t) * p1.z + 2 * t * (1 - t) * cp.z + t * t * p2.z;
      return v3(x, y, z);
    };
    opts.onUpdate = (arg: Vec3, ratio: number) => {
      if (isWorld) {
        target.worldPosition = twoBezier(ratio, c1, c2, to);
        if (forwardTime > 0) {
          let forRatio = ratio + forwardTime;
          if (forRatio > 1) forRatio = 1;
          target["forwardPosition"] = twoBezier(forRatio, c1, c2, to);
        }
      } else target.position = twoBezier(ratio, c1, c2, to);
    };
    return tween(target).to(duration, {}, opts);
  }
}
