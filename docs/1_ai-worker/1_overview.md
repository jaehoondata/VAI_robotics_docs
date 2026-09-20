---
sidebar_position: 1
title: 개요
---

# AI WORKER (FFW-SG2) 개요

:::note
ROBOTIS의 semi-humanoid 로봇 **AI Worker**의 구성과 각 부분의 역할을 정리합니다. <br/>
원문 사양은 [ROBOTIS AI Worker 공식 문서](https://docs.robotis.com/docs/systems/aiworker/introduction)를 기준으로 하며, 이 문서는 우리 팀이 사용하는 FFW-SG2(follower)를 중심으로 정리한 것입니다.
:::

## 시스템 구성 (Leader / Follower)

AI Worker는 조작하는 쪽(leader)과 실제로 움직이는 쪽(follower)이 분리된 구조입니다.

| 구분 | 모델 | 역할 |
| --- | --- | --- |
| **Follower** | FFW-SG2 | 실제 로봇 본체. 명령을 받아 작업을 수행하고 센서 데이터를 발행합니다. |
| **Leader** | FFW-LG2 | 사람이 잡고 움직이는 조작 장치. 관절 각도를 follower에게 전달합니다. |
| **VR Teleoperation** | Meta Quest 3 | LG2 대신 VR 컨트롤러로 follower를 조작하는 경로입니다. |

## 하드웨어 구성

### FFW-SG2 (Follower) 주요 사양

| 구성 요소 | 사양 | 비고 |
| --- | --- | --- |
| 크기 (WxDxH) | 604 x 602 x 1,623 mm | |
| 무게 | 90 kg | |
| 자유도 | 총 25 DOF | 팔 7 DOF x 2, 그리퍼 1 DOF x 2, 헤드 2 DOF, 리프트 1 DOF, 모바일 6 DOF |
| 팔 도달 거리 | 641 mm (손목 기준) | 핸드 길이 별도 |
| 팔 가반하중 | 정격 3.0 kg (단완) / 6.0 kg (양완) | 최대 5.0 / 10.0 kg, 자세에 따라 변동 |
| 그리퍼 | RH-P12-RN | 1-DOF 2지 그리퍼, 자체 무게 500 g, 가반하중 5 kg |
| 이동 방식 | Swerve drive | 최대 속도 1.5 m/s |
| 전원 | 배터리 25 V, 80 Ah (2,040 Wh) | |
| 온보드 컴퓨터 | NVIDIA Jetson AGX Orin 32 GB | JetPack 6.2 |
| 내부 통신 | RS-485, 4 Mbps | DYNAMIXEL Protocol 2.0 (U2D2) |
| 호스트 인터페이스 | Ethernet (최대 100 Mbps) | 내부 라우터: TP-Link AC1200 |
| 동작 온도 | 0 ~ 40 ℃ | |

### 센서 구성

| 센서 | 모델 | 위치 | 용도 |
| --- | --- | --- | --- |
| RGBD 카메라 | Stereolabs ZED Mini | 헤드 | 광각 깊이 인식, SLAM, 장애물 회피 (FOV 102°x57°, 0.1~9 m) |
| RGBD 카메라 x2 | Intel RealSense D405 | 좌/우 손목 | 근거리 깊이 인식, 파지·조작 (FOV 87°x58°, 7~50 cm) |
| LiDAR x2 | LakiBeam 1 | 베이스 | 2D ToF, 수평 FOV 270°, 최대 25 m, 정밀도 ±2 cm |
| IMU | 내장 | 헤드(ZED Mini) / 본체 | 자세 추정 |

### 액추에이터

모든 관절은 DYNAMIXEL 시리즈로 구성되며, RS-485 단일 버스에 연결됩니다.

| 관절 | 시리즈 | 모델 |
| --- | --- | --- |
| 팔 Joint 1~3 | DYNAMIXEL-Y | YM080-230-R099-RH |
| 팔 Joint 4~6 | DYNAMIXEL-Y | YM070-210-R099-RH |
| 팔 Joint 7 | DYNAMIXEL-P | PH42-020-S300-R |
| 헤드 Pitch / Yaw | DYNAMIXEL-X | XH540-V150-R / XH430-V210-R |
| 리프트 | DYNAMIXEL-Y | YM080-230-B001-RH |
| 휠 조향 | DYNAMIXEL-Y | YM070-210-R051-RH |
| 그리퍼 | Robot Hands | RH-P12-RN |

### 관절 이름과 가동 범위

코드나 토픽에서 관절을 지정할 때 쓰는 이름입니다.

| ID | 관절 | Technical Name | 범위 |
| --- | --- | --- | --- |
| 1~7 | 오른팔 Shoulder Pitch/Roll/Yaw, Elbow, Wrist Yaw/Pitch/Roll | `arm_r_joint1` ~ `arm_r_joint7` | -180°~180° 등 관절별 상이 |
| 8 | 오른쪽 그리퍼 | `gripper_r_joint1` | 0 ~ 107.6 mm |
| 31~37 | 왼팔 (오른팔과 동일 구성) | `arm_l_joint1` ~ `arm_l_joint7` | 좌우 대칭 |
| 38 | 왼쪽 그리퍼 | `gripper_l_joint1` | 0 ~ 107.6 mm |
| 61 | 헤드 Pitch | `head_joint1` | -50° ~ 30° |
| 62 | 헤드 Yaw | `head_joint2` | -20° ~ 20° |
| 81 | 리프트 | `lift_joint` | 0 ~ 500 mm |

모바일 베이스는 삼각 배치된 바퀴 3개가 각각 조향/구동을 독립 제어합니다.
(`right_wheel_steer`, `left_wheel_steer`, `rear_wheel_steer`: -90°~90° / `*_wheel_drive`: -360°~360°)

:::tip
관절별 정확한 가동 범위와 도면은 [ROBOTIS Hardware Specification](https://docs.robotis.com/docs/systems/aiworker/specifications/hardware)에서 확인할 수 있습니다.
:::

### FFW-LG2 (Leader)

| 항목 | 사양 |
| --- | --- |
| 크기 (WxDxH) | 598 x 146 x 705 mm |
| 무게 | 3 kg |
| 자유도 | 총 22 DOF (팔 7 DOF x 2, 그리퍼 1 DOF x 2, 조이스틱 3 DOF x 2) |
| 액추에이터 | DYNAMIXEL-X (Joint 1~7) |
| 내부 통신 | TTL, 4 Mbps |

## 소프트웨어 구성

| 계층 | 구성 요소 | 설명 |
| --- | --- | --- |
| 컴퓨트 | NVIDIA Jetson AGX Orin 32GB | JetPack 6.2 + Docker 컨테이너 |
| OS / 미들웨어 | Ubuntu + **ROS 2 Jazzy** | 컨테이너 이미지: `robotis/ai-worker` |
| 모션 제어 | `ros2_control` | 100 Hz 관절 제어 루프 |
| 하드웨어 인터페이스 | DynamixelHardwareInterface | Dynamixel SDK, position/current 모드 |
| 통신 | RS-485 (U2D2) / Ethernet / Wi-Fi 6 | 4 Mbps, Protocol 2.0 |
| 센서 드라이버 | ZED SDK, RealSense ROS 2 드라이버 | 공식 ROS 2 드라이버 사용 |

### 주요 컨트롤러

| 컨트롤러 | 대상 | DOF | 입력 토픽 |
| --- | --- | --- | --- |
| `arm_l_controller` | 왼팔 + 그리퍼 | 8 | `/leader/joint_trajectory_command_broadcaster_left` |
| `arm_r_controller` | 오른팔 + 그리퍼 | 8 | `/leader/joint_trajectory_command_broadcaster_right` |
| `head_controller` | 헤드 (pan/tilt) | 2 | `/leader/joystick_controller_left` |
| `lift_controller` | 리프트 | 1 | `/leader/joystick_controller_right` |
| `swerve_drive_controller` | 모바일 베이스 | 6 | `/cmd_vel` |
| `joint_state_broadcaster` | 전체 관절 | – | `/joint_states` 발행 |

`joint_state_broadcaster`와 `swerve_drive_controller`를 제외한 모든 컨트롤러는 `JointTrajectoryController` 타입입니다.
기본적으로 모든 관절은 **position 모드**, 모바일 베이스만 **velocity 모드**로 동작합니다.
각 팔 컨트롤러의 마지막 관절은 그리퍼입니다.

### 주요 오픈소스 저장소

| 저장소 | 내용 |
| --- | --- |
| [ROBOTIS-GIT/ai_worker](https://github.com/ROBOTIS-GIT/ai_worker) | 로봇 description, bringup, 컨트롤러, 내비게이션, 텔레오퍼레이션 |
| [ROBOTIS-GIT/cyclo_intelligence](https://github.com/ROBOTIS-GIT/cyclo_intelligence) | 시연 데이터 기록, 데이터셋 준비, 학습·추론 웹 UI |
| [ROBOTIS-GIT/cyclo_control](https://github.com/ROBOTIS-GIT/cyclo_control) | MoveL/MoveJ, 양팔 제어, 구속 조건 처리, 궤적 필터링 |
| [ROBOTIS-GIT/cyclo_lab](https://github.com/ROBOTIS-GIT/cyclo_lab) | Isaac Lab 기반 시뮬레이션 환경과 USD 로봇 에셋 |
| [ROBOTIS-GIT/docs](https://github.com/ROBOTIS-GIT/docs) | 공식 문서 소스 (원문 확인용) |

시뮬레이션 모델은 URDF(`ai_worker/ffw_description/urdf`), MJCF(`robotis_mujoco_menagerie/robotis_ffw`), USD(`cyclo_lab`) 세 가지 형식으로 제공됩니다.

## 데이터 흐름

텔레오퍼레이션이든 AI 정책이든, 명령은 동일한 경로를 거쳐 액추에이터까지 전달됩니다.

```
입력 소스 (Leader 텔레오퍼레이션 / VR / AI 정책)
      ↓
ROS 2 JointTrajectory 토픽
      ↓
controller_manager (100 Hz)
      ↓
JointTrajectoryController
      ↓
resource_manager (인터페이스 중재)
      ↓
DynamixelHardwareInterface (position / current)
      ↓
RS-485 (Dynamixel SDK)
      ↓
DYNAMIXEL 액추에이터
```

1. **궤적 생성** — leader 장치, 조이스틱, GUI 또는 AI 모델이 목표 궤적을 만듭니다.
2. **토픽 발행** — `/leader/joint_trajectory_command_broadcaster_*`로 명령이 전달됩니다.
3. **controller_manager** — 100 Hz로 `read → update → write` 루프를 돕니다.
4. **JointTrajectoryController** — 궤적을 관절 단위 명령으로 분배합니다.
5. **resource_manager** — 컨트롤러 간 커맨드 인터페이스 충돌을 막습니다.
6. **하드웨어 인터페이스** — 명령을 RS-485 패킷으로 변환합니다.
7. **액추에이터** — 동작을 수행하고 position/current 피드백을 돌려줍니다.

센서 데이터(카메라·LiDAR·관절 상태)는 반대 방향으로 ROS 2 토픽에 올라가며, 모방학습용 데이터셋 기록과 정책 추론의 입력으로 사용됩니다.

:::info[구성도 이미지]
직접 만든 구성도는 `static/img/` 에 넣고 `![설명](/img/파일명.png)` 으로 참조합니다.
:::

## 안전 사항

- 관절 제한은 URDF와 컨트롤러 설정에서 강제되며, 범위를 벗어난 값은 하드웨어 인터페이스에서 clamp 됩니다.
- Dynamixel 하드웨어 인터페이스가 각 모터의 통신 오류를 상시 확인합니다.
- 구동 전에 **E-stop 리모컨**이 손이 닿는 곳에 있는지 확인하고, 팔 작업 반경 안에 사람이나 장애물이 없는지 확인합니다.

## 관련 문서

- [로봇 구동](./2_start.md) — 전원 인가부터 bringup까지
- [로봇 종료](./3_exit.md) — 팔 접기, 노드 종료, 전원 OFF
- [Interactive Marker로 조작하기](../3_Interactive-marker/interactive-marker.md)
- [VR Teleoperation](../4_vr-teleoperation/1_setup.md)
- [Meta Quest 3 개요](../2_meta-quest-3/overview.md)
- [ROBOTIS AI Worker 공식 문서](https://docs.robotis.com/docs/systems/aiworker/introduction)
