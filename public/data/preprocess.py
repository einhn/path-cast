import os
import pandas as pd
import numpy as np
from math import radians, sin, cos, sqrt, atan2

def haversine_np(lat1, lon1, lat2, lon2):
    R = 6371  # km
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
    return 2 * R * atan2(sqrt(a), sqrt(1 - a))

# 데이터 로드
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

bike_df = pd.read_csv(os.path.join(BASE_DIR, "bike_paths_utf8.csv"))
weather_df = pd.read_excel(os.path.join(BASE_DIR, "WeatherStations.xlsx"))

# 위경도 변환
bike_df["lat"] = bike_df["위도(LINE_XP)"].astype(float)
bike_df["lng"] = bike_df["경도(LINE_YP)"].astype(float)
weather_df["lat"] = weather_df["위도(초/100)"].astype(float)
weather_df["lng"] = weather_df["경도(초/100)"].astype(float)

# 관측소 리스트 준비
stations = weather_df[["격자 X", "격자 Y", "lat", "lng"]].dropna().values

# 매핑 결과 저장용 리스트
mapping = []

for _, row in bike_df.iterrows():
    lat1, lng1 = row["lat"], row["lng"]
    # 전체 관측소에 대해 거리 계산
    dists = [haversine_np(lat1, lng1, s[2], s[3]) for s in stations]
    min_idx = int(np.argmin(dists))
    closest = stations[min_idx]
    mapping.append({
        "road": int(row["국토종주 자전거길"]),
        "index": int(row["순서"]),
        "point": {"lat": lat1, "lng": lng1},
        "station": {
            "id": f"{int(closest[0])}_{int(closest[1])}",
            "gridX": int(closest[0]),
            "gridY": int(closest[1]),
            "lat": closest[2],
            "lng": closest[3],
            "distance_km": round(dists[min_idx], 2)
        }
    })

# 결과를 JSON 파일로 저장
import json
with open("bike_path_weather_map.json", "w", encoding="utf-8") as f:
    json.dump(mapping, f, ensure_ascii=False, indent=2)