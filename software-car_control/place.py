from ultralytics import YOLO
import cv2
from collections import defaultdict
import time
import binascii
import serial 
import struct
import Jetson.GPIO as GPIO

class_names = {
    0: "Double hexagonal column",
    1: "Flange nut",
    2: "Hexagon nut",
    3: "Hexagon pillar",
    4: "Hexagon screw",
    5: "Hexagonal steel column",
    6: "Horizontal bubble",
    7: "Keybar",
    8: "Plastic cushion pillar",
    9: "Rectangular nut",
    10: "Round head screw",
    11: "Spring washer",
    12: "T-shaped screw"
}

# 初始化YOLO模型
def init_yolo(choice):
    if choice == 'classification':
        return YOLO('best_classification.pt')  # 加载你的自定义模型
    elif choice == 'defect_detect':
        return YOLO('best_defect.pt')

# 将YOLO结果转换为detections结构
def process_yolo_results(results):
    detections = []
    for result in results:
        for cls, conf in zip(result.boxes.cls, result.boxes.conf):
            class_name = result.names[int(cls)]  # 获取类别名称
            detections.append((class_name, float(conf)))  # 转换为需要的格式
    return detections

def gstreamer_pipeline(
    sensor_id=0,
    capture_width=1920,
    capture_height=1080,
    display_width=960,
    display_height=540,
    framerate=30,
    flip_method=0,
):
    return (
        "nvarguscamerasrc sensor-id=%d ! "
        "video/x-raw(memory:NVMM), width=(int)%d, height=(int)%d, framerate=(fraction)%d/1 ! "
        "nvvidconv flip-method=%d ! "
        "video/x-raw, width=(int)%d, height=(int)%d, format=(string)BGRx ! "
        "videoconvert ! "
        "video/x-raw, format=(string)BGR ! appsink"
        % (
            sensor_id,
            capture_width,
            capture_height,
            framerate,
            flip_method,
            display_width,
            display_height,
        )
    )

def capture_and_process(choice,code=0):
    class_name = None
    yolo_model = init_yolo(choice)
    detection_history = defaultdict(list)
    start_time = time.time()
    detection_count = 0
    
    # 设置GStreamer管道
    cap = cv2.VideoCapture(gstreamer_pipeline(flip_method=0), cv2.CAP_GSTREAMER)
    
    if not cap.isOpened():
        print("Error: Unable to open camera")
        return
    
    while True:
        ret, frame = cap.read()
        if not ret:
            print("Error: Failed to capture frame")
            break
        
        current_time = time.time()
        if current_time - start_time >= 0.5 and detection_count < 5:
            # 进行YOLO检测
            #置信度需要微调
            results = yolo_model.predict(
                source=frame,
                conf=0.5,
                save=False,
                show=False
            )
            
            # 转换为标准格式
            detections = process_yolo_results(results)
            
            # 记录检测结果
            for class_name, confidence in detections:
                detection_history[class_name].append(confidence)
            
            detection_count += 1
            start_time = current_time
            print(f"Detection #{detection_count} completed")
        
        if detection_count == 5:
            print("\nFinal Results:")
            results = []
            for class_name, confidences in detection_history.items():
                count = len(confidences)
                if count >= 4:
                    avg_confidence = sum(confidences) / count
                    results.append((class_name, count, avg_confidence))
            
            results.sort(key=lambda x: x[1], reverse=True)
            
            for class_name, count, avg_confidence in results:
                print(f"{class_name}: appeared {count} times, average confidence {avg_confidence:.2f}")
            
            # 重置计数器
            detection_count = 0
            detection_history = defaultdict(list)
            start_time = time.time()
            break
    if choice == 'classification':
        if class_name == "Hexagon pillar" or class_name == "Hexagonal steel column":
            class_name = "Double hexagonal column"
        if class_name == "Flange nut":
            class_name = "Keybar"
        if class_name == "Hexagon screw":
            class_name = "Round head screw"
        if class_name != code:
            return False
    if choice == 'defect_detect':
        if class_name == 'product_defect':
            return False

def magnet(condition):
    """
    根据condition的值写入electromagnet.txt文件
    :param condition: 控制信号（1或0）
    """
    try:
        # 检查输入是否合法
        if condition not in (0, 1):
            raise ValueError("condition必须是0或1")
        
        # 写入文件（覆盖模式）
        with open('electromagnet.txt', 'w') as f:
            f.write(str(condition))
        print(f"已写入: electromagnet = {condition}")
    
    except ValueError as e:
        print(f"参数错误: {e}")
    except IOError as e:
        print(f"文件写入失败: {e}")
    
def move(action_sequence):
    #等jetson nano的代码
    ser=serial.Serial("/dev/ttyTHS1",115200) #使用THS1连接串行口,THS1，对应nano上面的物理引脚8 10
    for i in range(len(action_sequence)):
        start_time = time.time()  # 记录开始时间
        while True:
            ser.write(b'63')      # 发送控制指令
            time.sleep(0.05)      # 短暂延迟防止串口堵塞
            
            # 检查是否超过1秒
            if time.time() - start_time >= 1.0:
                break             # 退出循环
        if action_sequence[i] == '右':
            start_time = time.time()  # 记录开始时间
            while True:
                ser.write(b'12')      # 发送控制指令
                time.sleep(0.05)      # 短暂延迟防止串口堵塞
                
                # 检查是否超过4秒
                if time.time() - start_time >= 4.0:
                    break             # 退出循环
            print('完成向右')
        elif action_sequence[i] == '左':
            start_time = time.time()  # 记录开始时间
            while True:
                ser.write(b'22')      # 发送控制指令
                time.sleep(0.05)      # 短暂延迟防止串口堵塞
                
                # 检查是否超过4秒
                if time.time() - start_time >= 4.0:
                    break             # 退出循环
            print('完成向左')
        elif action_sequence[i] == '上':
            start_time = time.time()  # 记录开始时间
            while True:
                ser.write(b'32')      # 发送控制指令
                time.sleep(0.05)      # 短暂延迟防止串口堵塞
                
                # 检查是否超过4秒
                if time.time() - start_time >= 4.0:
                    break             # 退出循环
            print('完成向前')
        elif action_sequence[i] == '下':
            start_time = time.time()  # 记录开始时间
            while True:
                ser.write(b'42')      # 发送控制指令
                time.sleep(0.05)      # 短暂延迟防止串口堵塞
                
                # 检查是否超过4秒
                if time.time() - start_time >= 4.0:
                    break             # 退出循环
            print('完成向后')

def rail():
    output_pins = [32]  # 要控制的引脚列表,这里是使能电机
    first_magnet = 1
    try:
        # 初始化 GPIO
        GPIO.setmode(GPIO.BOARD)  # 使用物理引脚编号
        
        # 设置所有引脚为输出模式，初始状态为 LOW
        for pin in output_pins:
            GPIO.setup(pin, GPIO.OUT, initial=GPIO.LOW)
            print(f"引脚 {pin} 已设置为输出模式")

        # 交替切换 HIGH 和 LOW，每次 5 秒
        print("开始交替切换 HIGH 和 LOW（5秒间隔）...按 Ctrl+C 停止")
        start_time = time.time()
        while True:
            # 切换到 HIGH
            for pin in output_pins:
                GPIO.output(pin, GPIO.HIGH)
            if time.time() - start_time >= 5.0 and first_magnet:
                magnet(0)
                first_magnet = 0
            time.sleep(0.5)  # 保持 5 秒
            if time.time() - start_time >= 10.0:
                break

            # 切换到 LOW
        for pin in output_pins:
            GPIO.output(pin, GPIO.LOW)
        print("当前状态: LOW")

    except KeyboardInterrupt:
        print("\n用户中断")
    finally:
        # 清理 GPIO
        GPIO.cleanup()
        print("GPIO 已复位，所有引脚恢复默认状态")
