---
title: How to Run Katago at Full CPU on Linux (TL;DR)
date: 2025-02-19 09:04:30
tags:
  - Katago
---

Take openSUSE Tumbleweed as an example.

```bash
sudo zypper in eigen3-devel
git clone https://github.com/lightvector/KataGo.git
cd KataGo/cpp
cmake . -DUSE_BACKEND=EIGEN -DUSE_AVX2=1
make -j7 # see https://github.com/lightvector/KataGo/blob/master/Compiling.md
cd ../..
# visit https://katagotraining.org/networks/
aria2c https://media.katagotraining.org/uploaded/networks/models/kata1/kata1-b28c512nbt-sxxxxxxxxxx-dxxxxxxxxxx.bin.gz
# visit https://github.com/rooklift/ogatak/releases
aria2c https://github.com/rooklift/ogatak/releases/download/vx.y.z/ogatak-x.y.z-linux.zip
unar ogatak-x.y.z-linux.zip
cd ogatak-x.y.z-linux
chmod +x ogatak
./ogatak --no-sandbox # see https://github.com/rooklift/ogatak/blob/main/README.md
```
