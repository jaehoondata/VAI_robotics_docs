---
sidebar_position: 1
title: 환경 구축
---

# VR Teleoperation 환경 구축

:::note
Meta Quest 3 컨트롤러로 FFW-SG2 두 팔을 조작하고, 조작하는 동안 관절·카메라·명령을 맥북에 녹화하는 파이프라인입니다.
이 문서는 **처음 한 번만** 하는 준비를 다룹니다. 매번 하는 실행 절차는 [실행](./2_run.md)을 보세요.
:::

## 전체 구조

```
Quest 3 브라우저 ──(WebXR, wss:8443)──▶ 맥북 노트북 ──(ZMQ :5561 명령)──▶ Orin inbound.py ──ROS 2──▶ 로봇
                                    (IK·충돌검사·녹화)  ◀──(ZMQ :5560 관절)── Orin outbound.py ◀──ROS 2──┘
                                                        ◀──(ZMQ :5570/5571/5572 카메라)──┘
```

| 장치 | 역할 | 주소 |
| --- | --- | --- |
| Quest 3 | 브라우저로 맥북 페이지에 접속, 컨트롤러 위치·버튼 전송 | 192.168.6.100 |
| 맥북 | 노트북 실행: Quest 입력 → IK → 안전 검사 → 로봇 명령, 녹화 | 192.168.6.x (DHCP, 바뀔 수 있음) |
| Orin (로봇) | ROS 2 드라이버 + ZMQ 브리지 (`ai_worker` 도커 컨테이너) | 192.168.6.2 / `ffw-SNPR48A1115.local` |

- 세 장치 모두 같은 네트워크(**192.168.6.x**)에 있어야 합니다.
- Quest는 **컨트롤러만** 인식합니다. 맨손(핸드 트래킹)은 동작하지 않습니다.

## 1. 네트워크

- **Quest 3**: Wi-Fi `AIWORKER1115` 연결 (PW: `AIWORKER1115`) — [Meta Quest 3 초기 설정](../2_meta-quest-3/setup.md) 참고
- **맥북**: 같은 로봇 네트워크(192.168.6.x)에 유선 또는 무선으로 연결

## 2. 맥북 → Orin SSH / Docker 접속

`~/.ssh/config` 에 등록해 둡니다.

```
Host ffw-SNPR48A1115.local
    HostName ffw-SNPR48A1115.local
    User robotis
    ForwardX11 yes
```

```bash
ssh robotis@ffw-SNPR48A1115.local     # System password: root
docker exec -it ai_worker bash
```

비밀번호 없이 접속하려면(선택):

```bash
ssh-copy-id robotis@ffw-SNPR48A1115.local
```

## 3. 맥북 패키지 및 가상환경

저장소를 받습니다.

```bash
git clone https://github.com/jaehoondata/VAI_AIWORKER
```

conda 가상환경을 만들고 패키지를 설치합니다.

```bash
cd ri_motion_v5_package
conda create -n ri_motion_v5_env python=3.10 pip
conda activate ri_motion_v5_env
pip install -r requirements.txt
pip install -e .
```

Jupyter 커널을 등록합니다. (커널 표시 이름도 `ri_motion_v5_env`)

```bash
/opt/homebrew/Caskroom/miniforge/base/envs/ri_motion_v5_env/bin/python3 \
  -m ipykernel install --user --name ri_motion_v5_env --display-name ri_motion_v5_env
```

:::warning[macOS scipy 문제]
노트북 첫 셀에서 `ImportError ... _spropack ... __thread_bss` 가 나면 pip으로 설치된 scipy가 macOS와 맞지 않는 경우입니다.

```bash
mamba install -n ri_motion_v5_env -c conda-forge scipy
```
:::

## 4. 파일 구성

### 맥북 — `VAI_AIWORKER/VR_teleoperation/`

```
real_notebook/
  real_vr_teleop_record.ipynb   ← 실사용: 텔레옵 + 녹화 + 컨트롤러 버튼
  real_vr_teleop.ipynb          ← 원본 텔레옵 (녹화 없음)
sim_notebook/
  sim_vr_teleop.ipynb           ← 로봇 없이 연습
quest_client/                   ← Quest 가 여는 웹 페이지 (index.html, client.js)
package/
  intent_teleop.py              ← 텔레옵 메인 루프, 컨트롤 창
  quest_controller_server.py    ← 8443 HTTPS/WebSocket 서버
  fixed_quest_real.py           ← 로봇 명령·안전 검사
  fixed_quest_sim.py            ← IK 플래너
  episode_recorder.py           ← 녹화
  vr_buttons.py                 ← X/Y/B 버튼 동작
calibration/                    ← 개인 보정값 (v1)
```

### Orin — `~/ai_worker/` (컨테이너 `/root/ros2_ws/src/ai_worker/`)

```
zmq/outbound.py              ← 로봇 → 맥북 관절 (:5560), --meta 로 카메라도
zmq/camera_outbound.py       ← 카메라 3대 (:5570 head / :5571 wrist_left / :5572 wrist_right)
zmq/inbound.py               ← 맥북 → 로봇 명령 (:5561)
zmq/fixed_quest_protocol.py  ← 명령 안전 규칙 (SG2_FIXED_QUEST=1 일 때)
zmq/_old/                    ← 수정 전 백업
scripts/worker_aliases.sh    ← worker_* 명령 정의
ffw_bringup/launch/ffw_sg2_teleop.launch.py  ← worker_bringup_teleop
```

### Orin 명령 정리

| 명령 | 설명 |
| --- | --- |
| `worker_bringup_teleop` | follower 모터·통신·카메라만. 켤 때 헤드만 `[0, 0]` |
| `worker_bringup` | 전체 bringup. 켤 때 초기 자세로 이동 |
| `worker_outbound` / `worker_outbound_meta` | 관절 전송 / 관절 + 카메라 전송 |
| `worker_inbound` | 명령 수신 |
| `worker_shutdown` | 팔 접기 (inbound 를 먼저 끔) |

## 5. 시뮬레이션으로 먼저 연습

실제 로봇 없이 파이프라인을 한 번 돌려 봅니다.

1. `sim_notebook/sim_vr_teleop.ipynb` 를 엽니다.
2. 커널을 `ri_motion_v5_env` 로 선택합니다.
3. 설정 셀이 출력한 주소(`https://<맥북 IP>:8443/`)를 Quest 브라우저에 입력합니다.
4. MuJoCo 화면이 뜨면 양손 grip을 눌러 attach하고, 팔이 따라 움직이는지 확인합니다.

## 관련 문서

- [실행](./2_run.md)
- [녹화와 데이터](./3_recording.md)
- [문제 해결](./4_troubleshooting.md)
- [Meta Quest 3 초기 설정](../2_meta-quest-3/setup.md)
