---
title: “日本语西里尔字” / 日本語をキリル文字で表記してみる
date: 2024-06-30 18:28:38
tags:
  - Language/语言
  - Japanese/日语
  - Cyrillic script/西里尔字母
  - Russian/俄语
---

*The title Translated by Google:* Попробуйте написать японский язык кириллицей

## Yet Another 日本語のキリル文字表記 Scheme
一种使用西里尔字母来书写日语的方案，主要参考俄语的发音及字母表。

<!-- more -->

仿照日语罗马字的“训令式”与“平文式”，给出两套表记方案。  
下表中，若两种方案的写法不同，则“训令式”在前，“平文式”在后，以斜线`/`分隔；  
外来语用音节部分只有“平文式”。

| а | и | у ы | э е | о | я | ю | ё |
|---|---|---|---|---|---|---|---|
| あ а | い и / и й | う у | え э | お о | | | |
| か ка | き ки | く ку | け кэ | こ ко | きゃ кя | きゅ кю | きょ кё |
| が га | ぎ ги | ぐ гу | げ гэ | ご го | ぎゃ гя | ぎゅ гю | ぎょ гё |
| さ са | し си/щи | す су/сы | せ сэ | そ со | しゃ ся/ща | しゅ сю/щу | しょ сё/що |
| ざ за | じ зи/джи | ず зу/зы | ぜ зэ | ぞ зо | じゃ зя/джа | じゅ зю/джу | じょ зё/джо |
| た та | ち ти/чи | つ ту/цы | て тэ | と то | ちゃ тя/ча | ちゅ тю/чу | ちょ тё/чо |
| だ да | ぢ ди/джи | づ ду/зы | で дэ | ど до | ぢゃ дя/джа | ぢゅ дю/джу | ぢょ дё/джо |
| な на | に ни | ぬ ну | ね нэ | の но | にゃ ня | にゅ ню | にょ нё |
| は ха | ひ хи | ふ ху/фу | へ хэ | ほ хо | ひゃ хя | ひゅ хю | ひょ хё |
| ぱ па | ぴ пи | ぷ пу | ぺ пэ | ぽ по | ぴゃ пя | ぴゅ пю | ぴょ пё |
| ば ба | び би | ぶ бу | べ бэ | ぼ бо | びゃ бя | びゅ бю | びょ бё |
| ま ма | み ми | む му | め мэ | も мо | みゃ мя | みゅ мю | みょ мё |
| や я | | ゆ ю | | よ ё | | | |
| ら ра | り ри | る ру | れ рэ | ろ ро | りゃ ря | りゅ рю | りょ рё |
| わ ва/ва(ўа) | 〈ゐ ви/и〉 | | 〈ゑ вэ/э〉 | を во/о | | | |
| ん | нъ мъ | / | н нъ м мъ | | | | |
| | | | シェ ще | | | | |
| | | | ジェ дже | | | | |
| | ティ ти | トゥ ту | | | | テュ тю | |
| | | | チェ че | | | | |
| ツァ ца | ツィ ци | | ツェ цэ | ツォ цо | | | |
| | ディ ди | ドゥ ду | | | | デュ дю | |
| ファ фа | フィ фи | | フェ фэ | フォ фо | | フュ фю | |
| | | | イェ е | | | | |
| | ウィ ви(ўи) | | ウェ вэ(ўэ) | ウォ во(ўо) | | | |
| ヴァ ва | ヴィ ви | ヴ ву | ヴェ вэ | ヴォ во | | ヴュ вю | |

说明：
1. “平文式”书写时， 元音字母`(а и ы у э о я ю е ё)`后面的`и`可以写成`й`。  
2. “平文式”书写时，「ん」发音为`⟨m⟩`时要写成`м`，其他时候写成`н`；「ん」在元音字母前时，要在后面加硬音符号`ъ`。  
3. “平文式”书写时，「は」「へ」作助词时按照「わ」「え」标音。  
4. 表示促音的方式与平文式罗马字相同，将促音后面假名的第一个字母双写。由于な行和ま行前面不可能有促音，不会造成歧义。  
5. 表示长音的方式有两种：  
  > 1 直接按照假名逐字写出，如「う」写成`у`，「い」写成`и`，外来语的「ー」直接写成`-`；  
  > 2 不用任何方式表示长音，如「東京」写成`Токё`。一篇文章中表示长音的方式应当是统一的。  
6. `ў`这个字母来自白俄罗斯语，用于表示半元音`⟨ɰ⟩`。如果无需特别区分，都写成`в`即可。

挖坑：未来可能开发基于此套方案的输入法插件，用于ЙЦУКЕН键盘输入日语（