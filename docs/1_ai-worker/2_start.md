---
sidebar_position: 2
title: 로봇 구동
---

# AI WORKER 구동

:::note
FFW-SG2의 전원을 넣고 ROS 2 노드가 올라오는 **bringup**까지의 절차입니다.
텔레오퍼레이션 파이프라인 실행은 [VR Teleoperation](../4_vr-teleoperation/1_setup.md), 인터랙티브 마커 조작은 [Interactive Marker](../3_Interactive-marker/interactive-marker.md)를 참고하세요.
:::

## 1. 전원 인가

1. `Key Switch` 를 꽂고 **2시 방향**으로 돌립니다.
2. `Power Button` 을 **3초간** 길게 누릅니다. 비프음이 나면 전원이 들어온 것이고, 로봇 머리에 불이 들어옵니다.

### 본체 후면 포트

| 포트 | 용도 |
| --- | --- |
| `WAN Port` | 외부 네트워크·인터넷 연결 |
| `LAN Port` | SSH·원격 데스크톱으로 로봇 PC 접속 |
| `USB Ports` | 키보드, 마우스, USB 드라이브 등 |
| `HDMI Port` | 모니터 직접 연결 |
| `Charge Port` | 배터리 충전 |

## 2. Remote E-STOP 해제

:::danger[처음 전원을 켜면 토크가 꺼져 있습니다]
AI WORKER는 전원을 켠 직후 **torque-off** 상태입니다. DYNAMIXEL과 통신하려면 Remote E-STOP의 **A 버튼**을 눌러야 합니다. 안전 잠금이 풀리면 비프음이 납니다.
:::

- 비상 정지: 빨간 버섯 버튼을 누릅니다.
- 해제: 버튼을 시계 방향으로 돌린 뒤 **A 버튼**을 누릅니다.
- 나머지 버튼은 기능이 없습니다.

:::danger[실제 로봇 구동 시 반드시 확인]
- **파괴력 주의**: 로봇의 힘이 매우 강합니다. (로봇 워크스테이션도 구겨질 수 있습니다)
- **인원 통제**: 로봇 작업 반경으로 사람이 지나다니지 않도록 합니다.
- **E-stop 대기**: 구동 시점부터 **비상 정지 버튼을 누를 사람 1명을 반드시 대기**시킵니다.
:::

## 3. 로봇 PC(Orin) 접속

우리 랩 장비 기준 호스트명은 `ffw-SNPR48A1115.local`, 계정은 `robotis` 입니다.

```bash title="맥북 터미널"
ssh robotis@ffw-SNPR48A1115.local     # System password: root
docker exec -it ai_worker bash
```

`~/.ssh/config` 에 등록해 두면 편합니다.

```text title="~/.ssh/config"
Host ffw-SNPR48A1115.local
    HostName ffw-SNPR48A1115.local
    User robotis
    ForwardX11 yes
```

비밀번호 없이 접속하려면(선택):

```bash
ssh-copy-id robotis@ffw-SNPR48A1115.local
```

## 4. Bringup

컨테이너 안에서 실행합니다. `worker_*` 명령은 `scripts/worker_aliases.sh` 에 정의된 단축 명령입니다.

```bash title="Orin 컨테이너"
worker_bringup
# = ros2 launch ffw_bringup ffw_sg2_follower_ai.launch.py
```

`command not found` 가 뜨면 `source ~/.bashrc` 후 다시 실행합니다.

### bringup 계열 명령

| 명령 | 설명 |
| --- | --- |
| `worker_bringup` | 전체 bringup. 켤 때 초기 자세로 이동 |
| `worker_bringup_teleop` | follower 모터·통신·카메라만. 켤 때 **헤드만** `[0, 0]` 으로 이동하고 팔·리프트·베이스는 그대로 |
| `worker_shutdown` | 팔 접기 (종료 시 사용) |

`worker_bringup_teleop` 이 헤드를 움직이는 이유는, 헤드가 가동 범위를 벗어나 있으면 VR 쪽에서 로봇 상태를 거부하기 때문입니다.

- 헤드도 그대로 두기: `worker_bringup_teleop init_head:=false`
- 전부 초기 자세로: `worker_bringup_teleop init_position:=true`

### ROBOTIS 공식 launch 옵션

`worker_*` 대신 launch 파일을 직접 쓸 수도 있습니다.

```bash
# Follower 단독
ros2 launch ffw_bringup ffw_sg2_follower_ai.launch.py

# Leader(FFW-LG2) + Follower 동시
ros2 launch ffw_bringup ffw_sg2_ai.launch.py   # 단축: ffw_sg2_ai
```

| 파라미터 | 설명 |
| --- | --- |
| `launch_cameras:=false` | 카메라를 띄우지 않고 실행 |
| `init_position:=false` | 초기 자세 정렬 없이 실행 |

:::tip[Leader(FFW-LG2)를 쓸 때]
LG2는 실행 후 **양손 트리거를 2초 이상** 눌러야 follower가 움직이기 시작합니다. 처음에는 천천히 leader 자세를 따라가다가 가까워지면 빨라집니다.
:::

## 5. 동작 확인

| 확인 항목 | 명령 / 방법 |
| --- | --- |
| 컨트롤러가 모두 active 인가 | `ros2 control list_controllers` |
| 관절 상태가 들어오는가 | `ros2 topic echo /joint_states` |
| 로봇 모델·TF가 정상인가 | RViz2 |
| 카메라 3대가 붙었는가 | `ros2 topic list` 에서 head / wrist_left / wrist_right |

## 6. 자주 겪는 문제

| 증상 | 원인 / 해결 |
| --- | --- |
| 전원을 켰는데 관절에 힘이 없음 | torque-off 상태. Remote E-STOP의 **A 버튼**을 누름 |
| `command not found` | `source ~/.bashrc` 후 재실행 |
| Orin 접속 안 됨 (`No route to host`) | 로봇 전원, 부팅 대기(1~2분), 랜선 확인 |
| 카메라가 안 잡힘 | `launch_cameras:=false` 로 켰거나 카메라 연결 불량 |
| 로봇이 두 곳에서 명령을 받는 듯 흔들림 | 다른 텔레옵 경로(ROBOTIS VR, LG2 리더)가 켜져 있음. 하나만 남기고 종료 |

## 관련 문서

- [개요](./1_overview.md)
- [로봇 종료](./3_exit.md)
- [VR Teleoperation 환경 구축](../4_vr-teleoperation/1_setup.md)
