import { _decorator, Animation, Node, Vec3 } from 'cc';
import { Enemy } from './Enemy';

const { ccclass, property } = _decorator;

/**
 * Boss类，继承自Enemy
 * 实现特殊的移动和行为模式
 */
@ccclass('Boss')
export class Boss extends Enemy {
    // Boss特有属性
    @property
    targetY: number = 240;  // Boss停留的目标Y坐标
    
    @property
    moveSpeedY: number = 150;  // Boss移动速度(Y轴)

    @property
    moveSpeedX: number = 20;  // Boss移动速度(X轴)

    @property
    dashSpeed: number = 300;  // Boss冲刺速度(Y轴)

    @property
    isPositioned: boolean = false;  // 是否已到达指定位置
    
    @property
    dashTimer: number = 0; //dash计时器

    isDashing: boolean = false;  // 是否正在dash
    isReturning: boolean =  false;  // dash是否完成
    start() {
        super.start();  // 调用父类的start方法
        
        // Boss特有的初始化
        this.hp =100;  // 生命值
        this.score =20000;  // 分数奖励
        this.node.scale = new Vec3(1.3, 1.3, 1);  // 放大1.5倍
        
        console.log("Boss已生成!生命值:", this.hp);
    }
    
    update(deltaTime: number) {
        // 只有在Boss还活着时才处理移动
        if (this.hp > 0) {
            const p = this.node.position;
            
            if (!this.isPositioned && p.y > this.targetY) {
                // 还没到达目标位置，继续向下移动
                this.node.setPosition(p.x, p.y - this.moveSpeedY * deltaTime, p.z);
            } else {
                //没在冲刺，且已经回到原点之后，开始左右移动
                if (!this.isDashing && !this.isReturning) {
                    this.move(deltaTime);
                    this.dashTimer += deltaTime;
                    //每8秒冲刺一次
                    if (this.dashTimer > 8) {
                        this.isDashing = true;
                        this.dashTimer = 0;  // 重置dash计时器
                    }
                }
                // 调用dash方法处理dash和返回逻辑
                if (this.isDashing || this.isReturning) {
                    this.dash(deltaTime);
                }
            }
        } else if (this.hp <= 0 && !this.isDyied) {
            // 如果Boss已死亡，调用死亡方法
            this.die();
        }
        
    }
    move(deltaTime: number) {
        const p = this.node.position;
        this.node.setPosition(p.x + this.moveSpeedX * deltaTime, p.y, p.z);
        if (p.x > 115) {
            this.moveSpeedX = -this.moveSpeedX;
        } else if (p.x < -115) {
            this.moveSpeedX = -this.moveSpeedX;
        }
    }
    dash(deltaTime: number) {
        const p = this.node.position;
        
        if (this.isDashing) {
            // 向下冲刺
            this.node.setPosition(p.x, p.y - this.dashSpeed * deltaTime, p.z);
            
            // 检查是否达到最低点
            if (p.y <= -180) {
                this.isDashing = false;
                this.isReturning = true;
            }
            // 返回阶段
        } else if (this.isReturning) {          
            this.node.setPosition(p.x, p.y + this.dashSpeed * 2 * deltaTime, p.z);
            
            // 检查是否返回到原始位置
            if (p.y >= this.targetY) {
                // dash完成，恢复正常状态
                this.isReturning = false;
                this.node.setPosition(p.x, this.targetY, p.z);  // 确保精确返回到targetY
            }
        }
    }
    
}