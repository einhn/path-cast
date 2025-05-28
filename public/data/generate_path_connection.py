import pandas as pd
import os
import json

# 파일 경로 설정
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "bike_paths_utf8.csv")
OUT_PATH = os.path.join(BASE_DIR, "path_connection.json")

# CSV 로드
df = pd.read_csv(CSV_PATH)

# road 값 정리
roads = df["국토종주 자전거길"].astype(int).tolist()

# 연결 구조 저장용 딕셔너리
connections = {}

# 인접 road 추출
for i in range(len(roads) - 1):
    cur = roads[i]
    nxt = roads[i + 1]
    if cur != nxt:
        # 양방향 연결
        connections.setdefault(cur, set()).add(nxt)
        connections.setdefault(nxt, set()).add(cur)

# set → list 변환
connections = {str(k): sorted(list(v)) for k, v in connections.items()}

# 저장
with open(OUT_PATH, "w", encoding="utf-8") as f:
    json.dump(connections, f, ensure_ascii=False, indent=2)

print(f"✅ 연결 그래프 저장 완료: {OUT_PATH}")