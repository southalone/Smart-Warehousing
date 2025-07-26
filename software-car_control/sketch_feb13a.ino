// 步进电机控制引脚
#define ENA_PIN 2   // 使能引脚
#define DIR_PIN 3   // 方向引脚
#define PUL_PIN 4   // 脉冲引脚（PWM）
#define TRIGGER_PIN 5  // 电机触发引脚

void setup() {
  // 初始化串口

  // 初始化引脚7/8
  pinMode(7, OUTPUT);   // 引脚7作为输出
  pinMode(8, INPUT);    // 引脚8作为输入
  
  // 初始化电机控制引脚
  pinMode(ENA_PIN, OUTPUT);
  pinMode(DIR_PIN, OUTPUT);
  pinMode(PUL_PIN, OUTPUT);
  pinMode(TRIGGER_PIN, INPUT);
  
  // 初始状态
  digitalWrite(ENA_PIN, LOW);  // 电机默认禁用
  analogWrite(PUL_PIN, 0);     // 停止脉冲
  digitalWrite(7, digitalRead(8)); // 初始化引脚7状态
}

void loop() {
  // 功能1：同步引脚7和引脚8状态
  int pin8State = digitalRead(8);
  digitalWrite(7, pin8State);
  
  // 功能2：电机触发控制
  static unsigned long motorTimer = 0;
  static bool motorDirection = HIGH;
  
  if(digitalRead(TRIGGER_PIN) == HIGH) {
    digitalWrite(ENA_PIN, HIGH);  // 使能电机
    // 交替切换方向
    if(millis() - motorTimer > 18000) {
      motorDirection = !motorDirection;
      digitalWrite(DIR_PIN, motorDirection);
      motorTimer = millis();
    }
    
    analogWrite(PUL_PIN, 200);  // 输出PWM脉冲
  } 
  else {
    digitalWrite(ENA_PIN, LOW);  // 禁用电机
    analogWrite(PUL_PIN, 0);     // 停止脉冲
  }

  
  delay(10);  // 降低CPU占用
}