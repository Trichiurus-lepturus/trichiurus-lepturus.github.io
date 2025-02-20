---
title: How to Run Katago at Full CPU on Linux (TL;DR)
date: 2025-02-19 09:04:30
tags:
  - Katago
---

Take openSUSE Tumbleweed as an example.

```bash
# katago
sudo zypper in eigen3-devel
git clone https://github.com/lightvector/KataGo.git
cd KataGo/cpp
cmake . -DUSE_BACKEND=EIGEN -DUSE_AVX2=1
make -j7 # see https://github.com/lightvector/KataGo/blob/master/Compiling.md
cd ../..
# visit https://katagotraining.org/networks/
aria2c https://media.katagotraining.org/uploaded/networks/models/kata1/kata1-b28c512nbt-sxxxxxxxxxx-dxxxxxxxxxx.bin.gz

# sabaki
# visit https://github.com/SabakiHQ/Sabaki/releases
aria2c https://github.com/SabakiHQ/Sabaki/releases/download/v0.52.2/sabaki-v0.52.2-linux-x64.AppImage
# see https://github.com/SabakiHQ/Sabaki/blob/master/docs/README.md

# or ogatak
# visit https://github.com/rooklift/ogatak/releases
aria2c https://github.com/rooklift/ogatak/releases/download/vx.y.z/ogatak-x.y.z-linux.zip
unar ogatak-x.y.z-linux.zip
cd ogatak-x.y.z-linux
chmod +x ogatak
./ogatak --no-sandbox # see https://github.com/rooklift/ogatak/blob/main/README.md
```
