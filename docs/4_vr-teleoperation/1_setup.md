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

```text title="VR Teleoperation 데이터 흐름"
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

```text title="~/.ssh/config"
Host ffw-SNPR48A1115.local
    HostName ffw-SNPR48A1115.local
    User robotis
    ForwardX11 yes
```

```bash title="맥북 터미널"
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

```bash title="conda 가상환경 생성"
conda create -n ri_motion_v5_env python=3.10 pip
conda activate ri_motion_v5_env

# VR Teleoperation 노트북용 의존성 (VR_teleoperation 폴더는 vendor/ 사본을 쓰므로 이것만으로 동작)
cd VAI_AIWORKER/VR_teleoperation
pip install -r requirements-notebook.txt
```

:::tip[Interactive Marker 노트북도 쓸 경우]
`ri_motion_v5_VR/project/ffw_sg2_vr_teleoperation/` 의 Joint/EEF 컨트롤러 노트북은 `vendor/` 사본이 아니라 `ri_motion_v5_package` 본체가 필요합니다. 같은 환경에 아래를 추가로 설치하세요.

```bash
cd VAI_AIWORKER/ri_motion_v5_VR/ri_motion_v5_package
pip install -r requirements.txt
pip install -e .
```
:::

Jupyter 커널을 등록합니다. (커널 표시 이름도 `ri_motion_v5_env`)

```bash title="Jupyter 커널 등록"
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

```text title="VAI_AIWORKER/VR_teleoperation/"
real_notebook/
  real_vr_teleop_record.ipynb   ← 실사용: 텔레옵 + 녹화 + 컨트롤러 버튼
  real_vr_teleop.ipynb          ← 원본 텔레옵 (녹화 없음)
sim_notebook/
  sim_vr_teleop.ipynb           ← 로봇 없이 연습
quest_client/                   ← Quest 가 여는 웹 페이지 (index.html, client.js)
package/
  intent_teleop.py              ← 텔레옵 메인 루프, 컨트롤 창
  controller_mapping.py         ← 컨트롤러 delta → 로봇 목표 (20cm 작업범위, 회전 데드밴드)
  quest_controller_server.py    ← 8443 HTTPS/WebSocket 서버
  fixed_quest_transport.py      ← ZMQ 송수신 (상태 5560 / 명령 5561)
  fixed_quest_real.py           ← 로봇 명령·안전 검사
  fixed_quest_sim.py            ← IK 플래너
  fixed_quest_scene.py          ← MuJoCo 장면 구성
  home_path.py                  ← Initial pose 복귀 경로 탐색
  episode_recorder.py           ← 녹화
  vr_buttons.py                 ← X/Y/B 버튼 동작
  init_project.py               ← 경로 설정 (vendor/ 사본을 sys.path 앞에 삽입)
  worker/                       ← 로봇에 올릴 worker 원본 3종
    inbound.py  outbound.py  fixed_quest_protocol.py
deploy/20260917-home-gripper-worker/   ← 로봇에 복사할 worker 배포본 + SHA256.json
docs/WORKER_SETUP.md            ← 로봇 worker 배포 안내
scripts/                        ← check_workspace.py, validate_intent_pipeline.py
tests/                          ← 오프라인 회귀 검사
vendor/ri_motion_v5_package/    ← 실행에 필요한 공용 런타임 사본
xml/                            ← SG2 MJCF 모델과 mesh
calibration/                    ← 개인 보정값 (v1)
requirements.txt                ← 런타임 의존성
requirements-notebook.txt       ← 위 + ipykernel, jupyterlab
```

### Orin — `~/ai_worker/` (컨테이너 `/root/ros2_ws/src/ai_worker/`)

```text title="Orin ~/ai_worker/"
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

## 5. 로봇 worker 배포

노트북이 보내는 명령을 로봇이 알아듣게 하려면, PC 쪽 저장소에 들어 있는 worker 3종을 **로봇 컨테이너에 복사**해야 합니다. 이 단계를 건너뛰면 B 버튼 reset pose가 30°/s로 돌지 않고, 그리퍼 속도 범위도 예전 값으로 동작합니다.

복사 대상은 `VR_teleoperation/package/worker/` 의 세 파일입니다.

```text title="로봇에 올릴 파일"
package/worker/inbound.py
package/worker/outbound.py
package/worker/fixed_quest_protocol.py
```

:::warning[deploy/ 폴더는 구버전입니다]
`deploy/20260917-home-gripper-worker/` 에도 같은 이름의 세 파일이 있지만, `fixed_quest_protocol.py` 가 **아직 home 10°/s 시절 버전**입니다. (`inbound.py` · `outbound.py` 는 `package/worker/` 와 동일)
현재 문서가 설명하는 동작(B 버튼 30°/s)을 쓰려면 반드시 `package/worker/` 쪽을 복사하세요.
:::

### 복사 절차

로봇 컨테이너의 실제 실행 위치는 `/root/ros2_ws/src/ai_worker/zmq/` 입니다.

1. 로봇 조작을 멈추고 실행 중인 inbound · outbound 프로세스를 종료합니다.
2. 컨테이너의 기존 `inbound.py`, `outbound.py`, `fixed_quest_protocol.py` 를 **그 디렉터리 바깥에** 백업합니다.
3. 위 세 파일을 **한 세트로** 덮어씁니다. bringup과 ROS 토픽은 건드리지 않습니다.
4. **outbound와 inbound를 모두 재시작**합니다. outbound는 코드가 그대로여도 새 protocol을 다시 불러오려면 재시작해야 합니다.
5. inbound 시작 로그에 `arm 120 deg/s, gripper 120 deg/s, home 30.0 deg/s` 가 보이는지 확인합니다.
6. 노트북 커널을 재시작하고, SIM → DRY RUN 순으로 확인한 뒤 실제 운용을 시작합니다.

### 롤백

제어를 정지하고, 로봇에서 백업해 둔 세 파일과 대응하는 PC 버전을 복원한 뒤 worker와 노트북을 재시작합니다.

## 6. 커널은 항상 새로 시작

`package/init_project.py` 는 `vendor/` 사본을 `sys.path` 앞에 넣어 모듈 경로를 고정합니다. 이때 **프로젝트 폴더 바깥에서 불러온 모듈이 이미 커널에 올라와 있으면 예외를 던지고 멈춥니다.**

```text title="이 오류가 나면 커널 재시작"
RuntimeError: An earlier project module is already loaded (...).
Restart this notebook's kernel before using VR_teleoperation.
```

다른 프로젝트 노트북을 돌린 커널을 재사용하지 말고, 항상 **Restart 후 첫 셀부터** 순서대로 실행하세요.

## 7. 시뮬레이션으로 먼저 연습

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
