---
sidebar_position: 1
title: Interactive Marker로 조작하기
---

# Interactive Marker로 FFW-SG2 조작하기

:::note
VR 없이 **마우스로 마커를 끌어서** FFW-SG2의 팔을 움직이는 방법입니다.
동작 확인, 자세 잡기, IK 테스트처럼 정밀하게 한 번씩 움직여 볼 때 사용합니다.
연속 조작과 데이터 수집은 [VR Teleoperation](../4_vr-teleoperation/1_setup.md)을 쓰세요.
:::

## 두 가지 경로

| 경로 | 도구 | 특징 |
| --- | --- | --- |
| **우리 팀 노트북** | `real_joint_controller_sg2_teleop.ipynb` / `real_eef_controller_sg2_teleop.ipynb` | VR 파이프라인과 같은 ZMQ 브리지를 사용. 관절 단위 / EEF 단위로 조작 |
| **ROBOTIS 공식** | `cyclo_motion_controller_ros` + RViz2 InteractiveMarkers | MoveL 컨트롤러가 IK·구속 조건·궤적을 처리 |

## 사전 준비

- 로봇 전원 ON, Remote E-STOP **A 버튼**으로 토크 ON ([로봇 구동](../1_ai-worker/2_start.md) 참고)
- 맥북 conda 환경 `ri_motion_v5_env`, 저장소 `VAI_AIWORKER` ([VR Teleoperation 환경 구축](../4_vr-teleoperation/1_setup.md)과 동일)
- Orin 컨테이너 접속

```bash
ssh robotis@ffw-SNPR48A1115.local
docker exec -it ai_worker bash
```

:::danger[실제 로봇 구동 시 반드시 확인]
- **파괴력 주의**: 로봇의 힘이 매우 강합니다. (로봇 워크스테이션도 구겨질 수 있습니다)
- **인원 통제**: 로봇 작업 반경으로 사람이 지나다니지 않도록 합니다.
- **E-stop**: 비상 정지 버튼을 누를 사람 1명을 반드시 대기시킵니다.
:::

## 방법 1 — 우리 팀 노트북

### ROS 노드 실행

Orin 컨테이너에서 터미널 3개를 씁니다.

```bash
# 터미널 1 — bringup (완료될 때까지 대기)
worker_bringup

# 터미널 2 — 로봇 → 맥북 (현재 state)
worker_outbound

# 터미널 3 — 맥북 → 로봇 (목표 state)
worker_inbound
```

:::warning[`SG2_FIXED_QUEST` 값에 주의]
인터랙티브 마커는 `SG2_FIXED_QUEST=1` 이면 **동작하지 않습니다.** 이 값은 VR 파이프라인 전용 안전 규칙(`zmq/fixed_quest_protocol.py`)을 켜기 때문입니다.
마커를 쓸 때는 `SG2_FIXED_QUEST=0` 으로 두거나 환경 변수를 주지 않고 실행하세요.
:::

:::tip[실행 순서]
`worker_outbound` 를 먼저 띄우고 시뮬레이션에서 정상 동작을 확인한 뒤 `worker_inbound` 를 실행합니다.
실행 전에 각 파일의 IP·포트가 현재 접속 환경과 같은지 확인하세요.
:::

### IP 설정

맥북 IP는 DHCP라 바뀝니다. Orin 쪽 설정을 현재 맥북 IP로 맞춥니다.

- 경로: `~/ai_worker/zmq/inbound.py`

```python
ZMQ_SUB_IP = os.environ.get("SG2_ZMQ_SUB_IP", "맥북IP")
```

환경 변수로 넘기는 편이 더 간단합니다.

```bash
SG2_ZMQ_SUB_IP=<맥북 IP> worker_inbound
```

### 노트북 실행

Jupyter 커널을 **`ri_motion_v5_env`** 로 선택한 뒤 실행합니다.

| 노트북 | 조작 단위 |
| --- | --- |
| `real_notebook/real_joint_controller_sg2_teleop.ipynb` | **Joint controller** — 관절 각도를 직접 지정 |
| `real_notebook/real_eef_controller_sg2_teleop.ipynb` | **EEF controller** — 손끝(end-effector) 위치·자세를 지정하고 IK로 풀이 |

:::tip[먼저 시뮬레이션에서]
실제 로봇을 움직이기 전에 `sim_notebook/` 의 대응 노트북으로 동작을 확인하세요. MuJoCo 화면에서 마커를 끌어 팔이 의도대로 움직이는지 먼저 봅니다.
:::

### 종료

```bash
worker_shutdown
```

`completed` 로그를 확인한 뒤 **inbound → outbound → bringup** 순으로 종료합니다.

## 방법 2 — ROBOTIS `cyclo_control` MoveL 마커

ROBOTIS가 제공하는 방식입니다. IK·구속 조건·궤적 생성을 컨트롤러가 처리하므로 모션 컨트롤러 테스트에는 이쪽이 편합니다.

1. bringup을 띄워 둡니다.

   ```bash
   ros2 launch ffw_bringup ffw_sg2_follower_ai.launch.py
   ```

2. 새 터미널에서 환경을 설정합니다.

   ```bash
   cd ~/ai_worker
   ./docker/container.sh enter
   source /opt/ros/jazzy/setup.bash
   source ~/ros2_ws/install/setup.bash
   ```

3. 마커와 함께 MoveL 컨트롤러를 실행합니다.

   ```bash
   ros2 launch cyclo_motion_controller_ros ai_worker_controller.launch.py \
     controller_type:=movel start_interactive_marker:=true
   ```

   두 그리퍼가 서로 닿는 handover 동작이 필요하면 `disable_gripper_collisions:=true` 를 추가합니다.

4. RViz2를 띄웁니다.

   ```bash
   rviz2
   ```

5. RViz에서 fixed frame을 `base_link` 로 두고 다음 디스플레이를 추가합니다.
   - `RobotModel`
   - `InteractiveMarkers`

### 마커와 토픽

`start_interactive_marker:=true` 로 실행하면 마커 두 개가 생깁니다.

| 마커 | 발행 토픽 |
| --- | --- |
| `right_goal_marker` | `/r_goal_move` |
| `left_goal_marker` | `/l_goal_move` |

RViz에서 마커를 끌어 목표를 주거나, 토픽에 직접 명령을 발행할 수도 있습니다.

```bash
ros2 topic pub --once /r_goal_move robotis_interfaces/msg/MoveL "{
  pose: {
    header: {frame_id: 'base_link'},
    pose: {
      position: {x: 0.35, y: -0.20, z: 0.85},
      orientation: {x: 0.0, y: 0.0, z: 0.0, w: 1.0}
    }
  },
  time_from_start: {sec: 2, nanosec: 0}
}"
```

`movel` 은 `time_from_start` 를 직교 공간 보간 시간으로 사용합니다.

## 자주 겪는 문제

| 증상 | 원인 / 해결 |
| --- | --- |
| 마커를 끌어도 로봇이 안 움직임 | `SG2_FIXED_QUEST=1` 로 실행됨. `0` 으로 두고 inbound 재시작 |
| 목표를 줘도 팔이 반응 없음 | inbound의 `SG2_ZMQ_SUB_IP` 가 현재 맥북 IP와 다름 |
| RViz에 마커가 안 보임 | `start_interactive_marker:=true` 누락, 또는 `InteractiveMarkers` 디스플레이 미추가 |
| 관절에 힘이 없음 | torque-off 상태. Remote E-STOP **A 버튼** |
| 로봇이 흔들림 | VR 파이프라인이나 LG2 리더가 동시에 켜져 있음. 하나만 남기기 |

:::note[TODO]
원본 노트에 있던 RViz 스크린샷이 아직 옮겨지지 않았습니다. `static/img/` 에 이미지를 추가하고 `![설명](/img/파일명.png)` 으로 연결해 주세요.
:::

## 관련 문서

- [AI WORKER 로봇 구동](../1_ai-worker/2_start.md)
- [VR Teleoperation 환경 구축](../4_vr-teleoperation/1_setup.md)
