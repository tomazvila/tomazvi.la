---
title: 'Kiek investuoti? Keli formulė'
date: '2023-11-07T00:00:00.000Z'
tags: ['investing']
author:
  name: Tomas Mažvila
  picture: '/assets/blog/authors/TomasMazvilaSatanProfile.png'
---

Ar yra kada tekę nusipirkti įmonės akcijų, ir, pamačius, kaip kyla kaina parduoti jas vien tik tam, kad pelno džiaugsmą greit pakeistų kartėlis stebint, kaip akcijos kaina ir toliau kyla vis aukštyn ir aukštyn? Man yra tekę (FB, NVDA)... Iš to išmokau pamoką, kad, prieš investuojant, yra labai svarbu turėti strategiją. Manau, privalu žinoti ne tik, ką perki, ir, kodėl perki, bet ir kam, kada bei už kiek parduosi. Kaip vertinti įmones radau daug informacijos, tačiau, tik neseniai atradau kaip matematiškai tinkamai paskirstyti savo kapitalą atsižvelgiant į numanomą riziką. Mane nustebino, kad net būnant tobulai informuotam apie investicijas ir jų sėkmės tikimybes, netinkamai pasirinkus investicines sumas galima nudegti ir prarasti investuotus pinigus. Kad tuo įsitikintumėt, kviečiu pažaisti žaidimą. Žaidimas prasideda su 100€. Yra metama moneta. Jei iškrenta skaičius laimima 20% pastatytos sumos, jei iškrenta herbas prarandama 17% pastatytos sumos. Ar verta žaisti? Kiek kartų žaistumėt? Kiek reikėtų pastatyti su tikslu gauti kuo didesnę gražą?

Tarkim kiekvienu metimu atliekam statymą su visais turimais pinigais. Žaidžiant vieną kartą, klausimo ar verta žaisti, atsakymas yra akivaizdus 0.5 * 0.2 - 0.5 * 0.17 = 0.015. Kadangi 0.015 yra daugiau už 0 žaisti apsimoka. Tikėtinas pelnas yra 1.5€.

O dabar, tarkim, metam monetą du kartus. Jei pirma iškrenta skaičius, o po to herbas, rezultate liks 99.6€. Jei pirma iškrenta herbas ir tada skaičius rezultate irgi liks 99.6€. Matome, kad nėra svarbus eiliškumas. Taigi, kuo ilgiau žaisim šį žaidimą, tuo labiau tikėtina, kad skaičius ir herbas iškris tiek pat kartų, ir mes prarasim pinigus.

Dabar, tarkim, jei iškrenta skaičius, laimima 80% pastatytos sumos, o, jei herbas, pralaimima 50% sumos. Šį kartą 0.5 * 0.8 - 0.5 * 0.5 = 0.15. Žaisti apsimoka dar labiau! Bet ar tikrai apsimoka? Kad patikrinčiau, pasitelkiau Monte-Carlo metodą[2] ir susimuliavau 50 statymų su milijonu lošėjų. Rezultatai tokie, kad nepaisant to, jog žaidimo pabaigoje visų lošėjų vidutinė turima suma lygi net 161899.33€, 47.74% žaidėjų bankrutavo (pabaigė su mažiau nei 1€), o iš likusių net 55.31% pabaigė su mažiau pinigų nei pradėjo. Taigi, pakartotinai atlikti statymus su visu savo turimu kapitalu nėra gera strategija.

O kas nutiks jei visada atliksime statymus su fiksuota suma po 20€? Šį kartą simuliacijos pabaigoje vidutinė gauta žaidėjo sąskaita yra tik 162.09€, tačiau bankrutavo tik 1.74% ir žaidimą baigė su mažiau pinigų nei pradėjo tik 4.73% žaidėjų.

Kas jei visada vietoj visos sumos statymus atliksim su 20% turimų pinigų?

Šį kartą gauta vidutinė žaidėjo sąskaitos suma - 439.16€, tačiau nebankrutavo nei vienas žaidėjas, na o daugiau uždirbo nei pradėjo net 90% žaidžiusių.

Iškur tokie didžiuliai skirtumai? Kokia yra efektyviausia strategija?

Tikimybių teorijoje į šiuos klausimus atsako ,,Keli" formulė, kuri skirta maksimizuoti pelną. Ši formulė pavadinta jos kūrėjo, mokslininko John Larry Kelly Jr. vardu. Jis šią formulę aprašė 1956 dirbdamas Bell Labs[4].

Formulė nurodo, kuomet dalyvis vienu sandoriu su tikimybe p gali gauti pelną, A kartų viršijantį investuotą kapitalą x arba su q = 1 - p tikimybe patirti nuostolį, B kartų didesnį už investuotą kapitalą x, tuomet pagal ,,Keli" formulę optimali sandorio reikšmė f = p/A - q/B. Laikoma, kad sandorio rezultatas bus teigiamas, kai pA - qB > 0.

Grįžtant prie pirmo pavyzdžio pasinaudojus ,,Keli" formule gaunam 0.5/0.17 - 0.5/0.2 ≈ 0.44. Antrame pavyzdyje 0.5/0.5 - 0.5/0.8 = 0.375. Taigi, pirmajame pavyzdyje geriausia strategija yra vietoj visos sumos statyti 44%, o, antrame pavyzdyje, 37% turimo kapitalo.

Vienas labai paprastas būdas kaip investuotojas gali pasinaudoti ,,Keli" formule optimizuoti savo investicinėm sumom - pasiimti istorinius savo sandorių rezultatus ir išsivesti, kiek sandorių buvo sėkmingi, o kiek ne, ir kiek vidutiniškai pelno ar nuostolio atnešė. Tuomet su sąlyga, kad ir toliau investicijos bus vienodai sėkmingos ir pelningos, galima apsiskaičiuoti optimalią sekančios investicijos sumą. Tačiau svarbu atkreiptį dėmesį, gauti kokybiškiems rezultatams reikia daug sandorių, ilgos investavimo istorijos, o ir finansų rinkos nėra lengvai nuspėjamos. ,,Keli" funkcija tėra tik matematiniai skaičiavimai, realūs rezultatai yra labai priklausomi nuo rizikos vertinimo klaidų. ,,Keli" funkciją galima laikyti diversifikavimo laike funkcija, todėl yra rekomenduotina[3] sumažinti klaidos riziką naudojant pusę gautos ,,Keli" reikšmės.

Iš mano pateiktų simuliacijų matome, kokią didžiulę įtaką rezultatams gali turėti blogai pasirinkta investicinė suma. Taip pat galima pastebėti ir kokią įtaką rezultatams turi diversifikacija. Diversifikuojant investicijas laike, simuliacijose gavau mažesnius pelnus, tačiau, jie yra daug labiau tikėtini. Procentinės grąžos reiškia, jog investuojant portfelio vertė auga geometrine progresija, todėl kuo ilgiau investuojame, tuo didesnę svarbą rezultatui turi tinkamai pasirinkta strategija. Taigi, matematiškai optimaliausia investuoti pasitelkiant ,,Keli" funkciją, tačiau, ji nepaiso tokių parametrų kaip rinkos volatilumas, žmonių psichologija ir t.t. Bet apie strategijas, kurios bando spręsti šią problemą parašysiu kitą kartą.
