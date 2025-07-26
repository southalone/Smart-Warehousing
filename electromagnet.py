import time
import Jetson.GPIO as GPIO

# 引脚定义 (使用BOARD编号模式)
output_pin = 27  # 要控制的引脚
control_file = "electromagnet.txt"  # 控制文件路径

try:
    # 初始化GPIO
    GPIO.setmode(GPIO.BOARD)
    GPIO.setup(output_pin, GPIO.OUT, initial=GPIO.LOW)  # 初始设为低电平
    print(f"引脚 {output_pin} 已初始化为输出模式")

    print("持续监控control.txt文件...按Ctrl+C停止")
    while True:
        try:
            with open(control_file, "r") as f:
                content = f.read().strip()  # 读取文件内容并去除首尾空格
            
            # 根据文件内容设置GPIO状态
            if content == "1":
                GPIO.output(output_pin, GPIO.HIGH)
                print("检测到1 - GPIO设置为HIGH", end="\r")  # \r覆盖上一行输出
            elif content == "0":
                GPIO.output(output_pin, GPIO.LOW)
                print("检测到0 - GPIO设置为LOW ", end="\r")
            else:
                print(f"忽略无效内容: '{content}' (期望0或1)", end="\r")

            time.sleep(0.1)  # 降低CPU占用，适当调整检测频率

        except FileNotFoundError:
            print(f"错误: 文件 {control_file} 不存在，等待重试...", end="\r")
            time.sleep(1)  # 文件不存在时等待1秒再重试
        except Exception as e:
            print(f"读取文件出错: {str(e)}", end="\r")
            time.sleep(0.5)

except KeyboardInterrupt:
    print("\n用户中断")
finally:
    # 清理GPIO
    GPIO.output(output_pin, GPIO.LOW)  # 确保最后是低电平
    GPIO.cleanup()
    print("GPIO已复位，所有引脚恢复默认状态")