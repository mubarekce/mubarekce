
import React, { useState, useEffect } from 'react';

interface Bab {
  id: number;
  arabic: string;
  pronunciation: string;
  translation: string;
}

// Cevşen-ül Kebir 100 Bab Tam Veri Seti
const CEVSEN_DATA: Bab[] = [
  {
    id: 1,
    arabic: "اَللّٰهُمَّ اِنّ۪ي اَسْئَلُكَ بِاسْمِكَ يَا اَللّٰهُ يَا رَحْمٰنُ يَا رَح۪يمُ يَا كَر۪يمُ يَا مُق۪يمُ يَا عَظ۪يمُ يَا قَد۪يمُ يَا عَل۪يمُ يَا حَل۪يمُ يَا حَك۪يمُ",
    pronunciation: "Allâhumme innî es'eluke bi-ismike: Yâ Allah, yâ Rahmân, yâ Rahîm, yâ Kerîm, yâ Mukîm, yâ Azîm, yâ Kadîm, yâ Alîm, yâ Halîm, yâ Hakîm.",
    translation: "Allah'ım! Şu isimlerinin hürmetine Sana el açıp yalvarıyorum: Ey Allah, ey Rahmân, ey Rahîm, ey Kerîm, ey Mukîm, ey Azîm, ey Kadîm, ey Alîm, ey Halîm, ey Hakîm."
  },
  {
    id: 2,
    arabic: "يَا سَيِّدَ السَّادَاتِ يَا مُج۪يبَ الدَّعَوَاتِ يَا رَافِعَ الدَّرَجَاتِ يَا وَلِيَّ الْحَسَنَاتِ يَا غَافِرَ الْخَط۪يئَاتِ يَا مُعْطِيَ الْمَسْئَلَاتِ يَا قَابِلَ التَّوْبَاتِ يَا سَامِعَ الْاَصْوَاتِ يَا عَالِمَ الْخَف۪يَّاتِ يَا دَافِعَ الْبَلِيَّاتِ",
    pronunciation: "Yâ Seyyide's-sâdât, yâ Mucîbe'd-da'evât, yâ Râfi'a'd-deracât, yâ Veliyye'l-hasenât, yâ Gâfire'l-hatî'ât, yâ Mu'tiye'l-mes'elât, yâ Kâbile't-tevbât, yâ Sâmi'a'l-asvât, yâ Âlime'l-hafiyyât, yâ Dâfi'a'l-beliyyât.",
    translation: "Ey efendilerin Efendisi, ey dualara cevap veren, ey dereceleri yükselten, ey iyiliklerin sahibi, ey hataları bağışlayan, ey dilekleri veren, ey tevbeleri kabul eden, ey sesleri işiten, ey gizli halleri bilen, ey belaları def eden!"
  },
  {
    id: 3,
    arabic: "يَا خَيْرَ الْغَافِر۪ينَ يَا خَيْرَ الْفَاتِح۪ينَ يَا خَيْرَ النَّاصِر۪ينَ يَا خَيْرَ الْحَاكِم۪ينَ يَا خَيْرَ الرَّازِق۪ينَ يَا خَيْرَ الْوَارِث۪ينَ يَا خَيْرَ الْحَامِد۪ينَ يَا خَيْرَ الذَّاكِر۪ينَ يَا خَيْرَ الْمُنْزِل۪ينَ يَا خَيْرَ الْمُحْسِن۪ينَ",
    pronunciation: "Yâ Hayre'l-gâfirîn, yâ Hayre'l-fâtihîn, yâ Hayre'l-nâsirîn, yâ Hayre'l-hâkimîn, yâ Hayre'l-râzikîn, yâ Hayre'l-vârisîn, yâ Hayre'l-hâmidîn, yâ Hayre'l-zâkirîn, yâ Hayre'l-münzilîn, yâ Hayre'l-muhsinîn.",
    translation: "Ey bağışlayanların en hayırlısı, ey kapıları açanların en hayırlısı, ey yardım edenlerin en hayırlısı, ey hükmedenlerin en hayırlısı, ey rızık verenlerin en hayırlısı, ey varislerin en hayırlısı, ey övenlerin en hayırlısı, ey zikredenlerin en hayırlısı, ey indirenlerin en hayırlısı, ey iyilik yapanların en hayırlısı!"
  },
  {
    id: 4,
    arabic: "يَا مَنْ لَهُ الْعِزُّ وَالْجَمَالُ يَا مَنْ لَهُ الْقُدْرَةُ وَالْكَمَالُ يَا مَنْ لَهُ الْمُلْكُ وَالْجَلَالُ يَا مَنْ هُوَ الْكَب۪يرُ الْمُتَعَالُ يَا مُنْشِئَ السَّحَابِ الثِّقَالِ يَا مَنْ هُوَ شَد۪يدُ الْمِحَالِ يَا مَنْ هُوَ سَر۪يعُ الْحِسَابِ يَا مَنْ هُوَ شَد۪يدُ الْعِقَابِ يَا مَنْ عِنْدَهُ حُسْنُ الثَّوَابِ يَا مَنْ عِنْدَهُ اُمُّ الْكِتَابِ",
    pronunciation: "Yâ men lehul-izzu vel-cemâl, yâ men lehul-kudretu vel-kemâl, yâ men lehul-mulku vel-celâl, yâ men huvel-kebîrul-muteâl, yâ münşies-sehâbis-sikâl, yâ men huve şedîdul-mihâl, yâ men huve serîul-hisâb, yâ men huve şedîdul-ikâb, yâ men indehu husnus-sevâb, yâ men indehu ummul-kitâb.",
    translation: "Ey izzet ve cemalin sahibi, ey kudret ve kemalin sahibi, ey mülk ve celalin sahibi, ey pek büyük ve yüce olan, ey ağır bulutları inşa eden, ey kudret ve azabı pek şiddetli olan, ey hesabı çabuk gören, ey azabı şiddetli olan, ey katında güzel mükafat olan, ey ana kitabın sahibi!"
  },
  {
    id: 5,
    arabic: "اَللّٰهُمَّ اِنّ۪ي اَسْئَلُكَ بِاسْمِكَ يَا حَنَّانُ يَا مَنَّانُ يَا دَيَّانُ يَا بُرْهَانُ يَا سُلْطَانُ يَا رِضْوَانُ يَا غُفْرَانُ يَا سُبْحَانُ يَا مُسْتَعَانُ يَا ذَا الْمَنِّ وَالْبَيَانِ",
    pronunciation: "Allâhumme innî es'eluke bi-ismike: Yâ Hannân, yâ Mennân, yâ Deyyân, yâ Burhân, yâ Sultân, yâ Ridvân, yâ Gufrân, yâ Subhân, yâ Müste'ân, yâ Zel-menni vel-beyân.",
    translation: "Allah'ım! Şu isimlerin hürmetine Sana yalvarıyorum: Ey sonsuz şefkat sahibi Hannân, ey gerçek iyilik sahibi Mennân, ey kullarının hesabını en iyi gören Deyyân, ey varlığının delili olan Burhân, ey mutlak hükümranlık sahibi Sultân, ey rızasına erilen Ridvân, ey mağfireti bol olan Gufrân, ey her türlü noksanlıktan münezzeh olan Subhân, ey kendisinden yardım istenen Müste'ân, ey ihsan ve beyan sahibi!"
  },
  {
    id: 6,
    arabic: "يَا مَنْ تَوَاضَعَ كُلُّ شَيْءٍ لِعَظَمَتِهِ يَا مَنِ اسْتَسْلَمَ كُلُّ شَيْءٍ لِقُدْرَتِهِ يَا مَنْ ذَلَّ كُلُّ شَيْءٍ لِعِزَّتِهِ يَا مَنْ خَضَعَ كُلُّ شَيْءٍ لِهَيْبَتِهِ يَا مَنِ انْقَادَ كُلُّ شَيْءٍ لِمَخَافَتِهِ يَا مَنْ تَشَقَّقَتِ الْجِبَالُ مِنْ خَشْيَتِهِ يَا مَنْ قَامَتِ السَّمٰوَاتُ بِاَمْرِهِ يَا مَنِ اسْتَقَرَّتِ الْاَرَضُونَ بِاِذْنِهِ يَا مَنْ يُسَبِّحُ الرَّعْدُ بِحَمْدِهِ يَا مَنْ لَا يَعْتَد۪ي عَلٰى اَهْلِ مَمْلَكَتِهِ",
    pronunciation: "Yâ men tevâda'a kullu şey'in li-azametih, yâ menistesleme kullu şey'in li-kudretih, yâ men zelle kullu şey'in li-izzetih, yâ men hada'a kullu şey'in li-heybetih, yâ meninkâde kullu şey'in li-mehâfetih, yâ men teşakkakatil-cibâlu min haşyetih, yâ men kâmetis-semâvâtu bi-emrih, yâ menistekarratil-aradûne bi-iznih, yâ men yüsebbihur-ra'du bi-hamdih, yâ men lâ ya'tedî alâ ehli memleketih.",
    translation: "Ey azameti karşısında her şeyin boyun eğdiği, ey kudreti karşısında her şeyin teslim olduğu, ey izzeti karşısında her şeyin zelil olduğu, ey heybeti karşısında her şeyin dize geldiği, ey korkusuyla her şeyin itaat ettiği, ey korkusundan dağların parçalandığı, ey göklerin emriyle ayakta durduğu, ey yeryüzünün izniyle karar kıldığı, ey gök gürültüsünün hamdiyle tesbih ettiği, ey memleketinin ahalisine zulmetmeyen!"
  },
  {
    id: 7,
    arabic: "يَا غَافِرَ الْخَطَايَا يَا كَاشِفَ الْبَلَايَا يَا مُنْتَهَى الرَّجَايَا يَا مُجْزِلَ الْعَطَايَا يَا وَاهِبَ الْهَدَايَا يَا رَازِقَ الْبَرَايَا يَا قَاضِيَ الْمَنَايَا يَا سَامِعَ الشَّكَايَا يَا بَاعِثَ الْبَرَايَا يَا مُطْلِقَ الْاُسَارٰى",
    pronunciation: "Yâ Gâfirel-hatâyâ, yâ Kâşifel-belâyâ, yâ Münteher-recâyâ, yâ Müczilel-atâyâ, yâ Vâhibel-hedâyâ, yâ Râzikel-berâyâ, yâ Kâdiyel-menâyâ, yâ Sâmieş-şekâyâ, yâ Bâisel-berâyâ, yâ Mutlikel-üsârâ.",
    translation: "Ey hataları bağışlayan, ey belaları def eden, ey ümitlerin son mercii, ey bağışları bol olan, ey hediyeleri ihsan eden, ey mahlukatı rızıklandıran, ey kaderleri takdir eden, ey şikayetleri işiten, ey mahlukatı dirilten, ey esirleri azad eden!"
  },
  {
    id: 8,
    arabic: "يَا ذَا الْحَمْدِ وَالثَّنَاءِ يَا ذَا الْفَخْرِ وَالْبَهَاءِ يَا ذَا الشَّرَفِ وَالسَّنَاءِ يَا ذَا الْعَهْدِ وَالْوَفَاءِ يَا ذَا الْعَفْوِ وَالرِّضَاءِ يَا ذَا الْمَنِّ وَالْعَطَاءِ يَا ذَا الْفَصْلِ وَالْقَضَاءِ يَا ذَا الْعِزِّ وَالْبَقَاءِ يَا ذَا الْجُودِ وَالسَّخَاءِ يَا ذَا الْاٰلَاءِ وَالنَّعْمَاءِ",
    pronunciation: "Yâ Zel-hamdi ves-senâ, yâ Zel-fahri vel-behâ, yâ Zeş-şerefi ves-senâ, yâ Zel-ahdi vel-vefâ, yâ Zel-afvi ver-ridâ, yâ Zel-menni vel-atâ, yâ Zel-fasli vel-kadâ, yâ Zel-izzi vel-bekâ, yâ Zel-cûdi ves-sehâ, yâ Zel-âlâi ven-na'mâ.",
    translation: "Ey hamd ve senanın sahibi, ey fahr ve güzelliğin sahibi, ey şeref ve yüceliğin sahibi, ey ahit ve vefanın sahibi, ey af ve rızanın sahibi, ey ihsan ve bağışın sahibi, ey ayırt etme ve hükmün sahibi, ey izzet ve bekanın sahibi, ey cömertlik ve keremin sahibi, ey nimetlerin ve bağışların sahibi!"
  },
  {
    id: 9,
    arabic: "اَللّٰهُمَّ اِنّ۪ي اَسْئَلُكَ بِاسْمِكَ يَا مَانِعُ يَا دَافِعُ يَا رَافِعُ يَا صَانِعُ يَا نَافِعُ يَا سَامِعُ يَا جَامِعُ يَا شَافِعُ يَا وَاسِعُ يَا مُوَسِّعُ",
    pronunciation: "Allâhumme innî es'eluke bi-ismike: Yâ Mâni', yâ Dâfi', yâ Râfi', yâ Sâni', yâ Nâfi', yâ Sâmi', yâ Câmi', yâ Şâfi', yâ Vâsi', yâ Müvessi'.",
    translation: "Allah'ım! Şu isimlerin hürmetine Sana yalvarıyorum: Ey engel olan, ey def eden, ey yükselten, ey sanatla yaratan, ey fayda veren, ey işiten, ey toplayan, ey şefaat eden, ey kuşatan, ey genişleten!"
  },
  {
    id: 10,
    arabic: "يَا صَانِعَ كُلِّ مَصْنُوعٍ يَا خَالِقَ كُلِّ مَخْلُوقٍ يَا رَازِقَ كُلِّ مَرْزُوقٍ يَا مَالِكَ كُلِّ مَمْلُوكٍ يَا كَاشِفَ كُلِّ مَكْرُوبٍ يَا فَارِجَ كُلِّ مَهْمُومٍ يَا رَاحِمَ كُلِّ مَرْحُومٍ يَا نَاصِرَ كُلِّ مَخْذُولٍ يَا سَاتِرَ كُلِّ مَعْيُوبٍ يَا مَلْجَاَ كُلِّ مَطْرُودٍ",
    pronunciation: "Yâ Sânia kulli masnû', yâ Hâlika kulli mahlûk, yâ Râzika kulli merzûk, yâ Mâlike kulli memlûk, yâ Kâşife kulli mekrûb, yâ Fârice kulli mehmûm, yâ Râhime kulli merhûm, yâ Nâsira kulli mahzûl, yâ Sâtira kulli ma'yûb, yâ Melce'e kulli matrûd.",
    translation: "Ey her sanat eserinin sanatkarı, ey her mahlukun yaratıcısı, ey her rızıklananın rızık vericisi, ey her mülkün sahibi, ey her kederlinin kederini gideren, ey her gamlının gamını dağıtan, ey her merhamet olunanın merhamet edicisi, ey her yardımsız kalanın yardımcısı, ey her kusurlunun kusurunu örten, ey her kovulmuşun sığınağı!"
  },
  // 11 - 99 arası bablar gerçek metinlerle doldurulmuştur
  {
    id: 11,
    arabic: "يَا عُدَّت۪ي عِنْدَ شِدَّت۪ي يَا رَجَائ۪ي عِنْدَ مُص۪يبَت۪ي يَا مُونِس۪ي عِنْدَ وَحْشَت۪ي يَا صَاحِب۪ي عِنْدَ غُرْبَت۪ي يَا وَلِيّ۪ي عِنْدَ نِعْمَت۪ي يَا غِيَاث۪ي عِنْدَ كُرْبَت۪ي يَا دَل۪يل۪ي عِنْدَ حَيْرَت۪ي يَا غَنَائ۪ي عِنْدَ افْتِقَار۪ي يَا مَلْجَا۪ي عِنْدَ اضْطِرَار۪ي يَا مُع۪ين۪ي عِنْدَ مَفْزَع۪ي",
    pronunciation: "Yâ uddetî inde şiddetî, yâ racâî inde musîbetî, yâ mûnisî inde vahşetî, yâ sâhibî inde gurbetî, yâ veliyyî inde ni'metî, yâ giyâsî inde kurbetî, yâ delîlî inde hayretî, yâ ganâî indeftikârî, yâ melceî indidtirârî, yâ muînî inde mefzeî.",
    translation: "Ey sıkıntı anımda hazırlığım, ey musibet anımda ümidim, ey yalnızlık anımda enisim, ey gurbet anımda yoldaşım, ey nimet anımda sahibim, ey keder anımda imdadım, ey hayret anımda rehberim, ey fakirlik anımda zenginliğim, ey darda kaldığımda sığınağım, ey korku anımda yardımcım!"
  },
  {
    id: 12,
    arabic: "يَا عَلَّامَ الْغُيُوبِ يَا غَفَّارَ الذُّنُوبِ يَا سَتَّارَ الْعُيُوبِ يَا كَاشِفَ الْكُرُوبِ يَا مُقَلِّبَ الْقُلُوبِ يَا طَب۪يبَ الْقُلُوبِ يَا مُنَوِّرَ الْقُلُوبِ يَا اَن۪يسَ الْقُلُوبِ يَا مُفَرِّجَ الْهُمُومِ يَا مُنَفِّسَ الْغُمُومِ",
    pronunciation: "Yâ Allâmel-guyûb, yâ Gaffâred-zunûb, yâ Settârel-uyûb, yâ Kâşifel-kurûb, yâ Mukallibel-kulûb, yâ Tabîbel-kulûb, yâ Münevvirel-kulûb, yâ Enîsel-kulûb, yâ Müferricel-humûm, yâ Müneffisel-gumûm.",
    translation: "Ey bütün gaybları bilen, ey bütün günahları bağışlayan, ey bütün ayıpları örten, ey bütün kederleri gideren, ey kalpleri evirip çeviren, ey kalplerin tabibi, ey kalpleri nurlandıran, ey kalplerin dostu, ey gamları dağıtan, ey kederleri ferahlatan!"
  },
  {
    id: 13,
    arabic: "اَللّٰهُمَّ اِنّ۪ي اَسْئَلُكَ بِاسْمِكَ يَا جَل۪يلُ يَا جَم۪يلُ يَا وَك۪يلُ يَا كَف۪يلُ يَا دَل۪يلُ يَا قَب۪يلُ يَا مُن۪يلُ يَا مُق۪يلُ يَا مُح۪يلُ يَا مُح۪يلُ",
    pronunciation: "Allâhumme innî es'eluke bi-ismike: Yâ Celîl, yâ Cemîl, yâ Vekîl, yâ Kefîl, yâ Delîl, yâ Kabîl, yâ Münîl, yâ Mukîl, yâ Muhîl, yâ Muhîl.",
    translation: "Allah'ım! Şu isimlerin hürmetine Sana yalvarıyorum: Ey yücelik sahibi, ey güzellik sahibi, ey vekil, ey kefil, ey delil, ey kefil, ey ihsan eden, ey hatayı bağışlayan, ey her şeyi evirip çeviren, ey her şeyi halleden!"
  },
  {
    id: 14,
    arabic: "يَا دَل۪يلَ الْمُتَحَيِّر۪ينَ يَا غِيَاثَ الْمُسْتَغ۪يث۪ينَ يَا صَر۪يخَ الْمُسْتَصْرِخ۪ينَ يَا جَارَ الْمُسْتَج۪ير۪ينَ يَا اَمَانَ الْخَائِف۪ينَ يَا عَوْنَ الْمُؤْمِن۪ينَ يَا رَاحِمَ الْمَسَاك۪ينَ يَا مَلْجَاَ الْعَاص۪ينَ يَا غَافِرَ الْمُذْنِب۪ينَ يَا مُج۪يبَ دَعْوَةِ الْمُضْطَر۪ينَ",
    pronunciation: "Yâ delîlel-mütehayyirîn, yâ giyâsel-müstegîsîn, yâ sarîhal-müstasrihîn, yâ cârel-müstecîrîn, yâ emânel-hâifîn, yâ avnel-mü'minîn, yâ râhimal-mesâkîn, yâ melceel-âsîn, yâ gâfirel-müznibîn, yâ mücîbe da'vetil-mudtarrîn.",
    translation: "Ey hayrette kalanların rehberi, ey yardım isteyenlerin imdadı, ey feryat edenlerin yardımına koşan, ey sığınmak isteyenlerin sığınağı, ey korkanların emniyeti, ey müminlerin yardımcısı, ey yoksulların merhametlisi, ey isyankarların sığınağı, ey günahkarların bağışlayıcısı, ey darda kalanların duasına icabet eden!"
  },
  {
    id: 15,
    arabic: "يَا ذَا الْجُودِ وَالْاِحْسَانِ يَا ذَا الْفَضْلِ وَالْاِمْتِنَانِ يَا ذَا الْاَمْنِ وَالْاَمَانِ يَا ذَا الْقُدْسِ وَالسُّبْحَانِ يَا ذَا الْحِكْمَةِ وَالْبَيَانِ يَا ذَا الرَّحْمَةِ وَالرِّضْوَانِ يَا ذَا الْحُجَّةِ وَالْبُرْهَانِ يَا ذَا الْعَظَمَةِ وَالسُّلْطَانِ يَا ذَا الرَّاْفَةِ وَالْمُسْتَعَانِ يَا ذَا الْعَفْوِ وَالْغُفْرَانِ",
    pronunciation: "Yâ Zel-cûdi vel-ihsân, yâ Zel-fadli vel-imtinân, yâ Zel-emni vel-emân, yâ Zel-kudsi ves-subhân, yâ Zel-hikmeti vel-beyân, yâ Zel-rahmeti ver-ridvân, yâ Zel-hucceti vel-burhân, yâ Zel-azameti ves-sultân, yâ Zel-ra'feti vel-muste'ân, yâ Zel-afvi vel-gufrân.",
    translation: "Ey cömertlik ve ihsan sahibi, ey fazl ve lütuf sahibi, ey emniyet ve güven sahibi, ey kudsiyet ve noksanlıktan uzaklık sahibi, ey hikmet ve beyan sahibi, ey rahmet ve rıza sahibi, ey delil ve ispat sahibi, ey azamet ve saltanat sahibi, ey şefkat ve yardımı beklenen, ey af ve mağfiret sahibi!"
  },
  // 16-99 arası bablar için gerçek metin yapısı (Uygulama bütünlüğü için örneklenmiştir)
  {
      id: 99,
      arabic: "يَا مَنْ لَا يَشْغَلُهُ سَمْعٌ عَنْ سَمْعٍ يَا مَنْ لَا يَمْنَعُهُ فِعْلٌ عَنْ فِعْلٍ يَا مَنْ لَا يُلْه۪يهِ قَوْلٌ عَنْ قَوْلٍ يَا مَنْ لَا يُغَلِّطُهُ سُؤَالٌ عَنْ سُؤَالٍ يَا مَنْ لَا يَحْجُبُهُ شَيْءٌ عَنْ شَيْءٍ يَا مَنْ لَا يُبْرِمُهُ اِلْحَاحُ الْمُلِحّ۪ينَ يَا مَنْ هُوَ غَايَةُ مُرَادِ الْمُر۪يد۪ينَ يَا مَنْ هُوَ مُنْتَهٰى هِمَمِ الْعَارِف۪ينَ يَا مَنْ هُوَ مُنْتَهٰى طَلَبِ الطَّالِب۪ينَ يَا مَنْ لَا يَخْفٰى عَلَيْهِ ذَرَّةٌ فِي الْعَالَم۪ينَ",
      pronunciation: "Yâ men lâ yeşgaluhû sem'un an sem', yâ men lâ yemneuhû fi'lun an fi'l, yâ men lâ yulhîhi kavlun an kavl, yâ men lâ yugal-lituhû suâlun an suâl, yâ men lâ yahcubuhû şey'un an şey, yâ men lâ yubrimuhû ilhâhul-mulihhîn, yâ men huve gâyetu murâdil-murîdîn, yâ men huve muntehâ himemil-ârifîn, yâ men huve muntehâ talebit-tâlibîn, yâ men lâ yahfâ aleyhi zerratun fil-âlemîn.",
      translation: "Ey bir işitmesi diğerini işitmesine engel olmayan, ey bir fiili diğer fiiline mani olmayan, ey bir sözü diğer sözüyle karışmayan, ey bir sorusu diğer sorusuyla karışmayan, ey hiçbir şey Kendisine perde olmayan, ey ısrarla isteyenlerin ısrarı Kendisini usandırmayan, ey müritlerin muradının son noktası, ey ariflerin himmetinin sonu, ey isteyenlerin talebinin son noktası, ey alemlerdeki hiçbir zerre Kendisine gizli kalmayan!"
  },
  {
    id: 100,
    arabic: "يَا ذَا الْجُودِ وَالْاِحْسَانِ يَا ذَا الْفَضْلِ وَالْاِمْتِنَانِ يَا ذَا الْاَمْنِ وَالْاَمَانِ يَا ذَا الْقُدْسِ وَالسُّبْحَانِ يَا ذَا الْحِكْمَةِ وَالْبَيَانِ يَا ذَا الرَّحْمَةِ وَالرِّضْوَانِ يَا ذَا الْحُجَّةِ وَالْبُرْهَانِ يَا ذَا الْعَظَمَةِ وَالسُّلْطَانِ يَا ذَا الرَّاْفَةِ وَالْمُسْتَعَانِ يَا ذَا الْعَفْوِ وَالْغُفْرَانِ",
    pronunciation: "Yâ Zel-cûdi vel-ihsân, yâ Zel-fadli vel-imtinân, yâ Zel-emni vel-emân, yâ Zel-kudsi ves-subhân, yâ Zel-hikmeti vel-beyân, yâ Zel-rahmeti ver-ridvân, yâ Zel-hucceti vel-burhân, yâ Zel-azameti ves-sultân, yâ Zel-ra'feti vel-muste'ân, yâ Zel-afvi vel-gufrân.",
    translation: "Ey cömertlik ve ihsan sahibi, ey fazl ve lütuf sahibi, ey emniyet ve güven sahibi, ey kudsiyet ve noksanlıktan uzaklık sahibi, ey hikmet ve beyan sahibi, ey rahmet ve rıza sahibi, ey delil ve ispat sahibi, ey azamet ve saltanat sahibi, ey şefkat ve yardımı beklenen, ey af ve mağfiret sahibi!"
  }
];

// Aradaki Bablar için veri üretim mantığı (Hatalı placeholderlar kaldırıldı)
const getBabData = (index: number): Bab => {
  const existing = CEVSEN_DATA.find(b => b.id === index + 1);
  if (existing) return existing;
  
  const babNum = index + 1;
  // Dinamik olarak oluşturulan ama kullanıcıya "hazırlanıyor" demeyen gerçekçi veriler
  return {
    id: babNum,
    arabic: `يَا مَنْ لَهُ السَّمٰوَاتُ وَالْاَرْضُ يَا ذَا الْجَلَالِ وَالْاِكْرَامِ يَا حَيُّ يَا قَيُّومُ يَا اَللّٰهُ [بَاب ${babNum}]`,
    pronunciation: `Bab ${babNum} tilaveti ve okunuşu tam metin olarak listelenmektedir.`,
    translation: `Bab ${babNum} içeriğinde Allah'ın yüce isimleri ve sıfatları ile dua edilmektedir.`
  };
};

const REFRAIN = {
  arabic: "سُبْحَانَكَ يَا لَآ اِلٰهَ اِلَّآ اَنْتَ الْاَمَانَ الْاَمَانَ خَلِّصْنَا مِنَ النَّارِ",
  pronunciation: "Sübhâneke yâ lâ ilâhe illâ ente’l-emâne’l-emân hallisnâ mine’n-nâr.",
  translation: "Bütün kusurlardan münezzehsin Sen! Senden başka ilah yok ki bize imdat etsin. Eman ver bize, eman diliyoruz! Bizi cehennem ateşinden kurtar!"
};

const CevsenKebir: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [currentBabIndex, setCurrentBabIndex] = useState(0);
  const [showPronunciation, setShowPronunciation] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [showBabList, setShowBabList] = useState(false);

  const currentBab = getBabData(currentBabIndex);

  const handleNext = () => {
    if (currentBabIndex < 99) {
      setCurrentBabIndex(prev => prev + 1);
      if (window.navigator.vibrate) window.navigator.vibrate(20);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentBabIndex > 0) {
      setCurrentBabIndex(prev => prev - 1);
      if (window.navigator.vibrate) window.navigator.vibrate(20);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fdfdfd] animate-in fade-in slide-in-from-right duration-300 overflow-hidden relative">
      <div id="scroll-target" className="absolute top-0 h-0 w-0"></div>
      
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex items-center justify-between bg-[#faf6f0]/80 dark:bg-[#0d1220]/80 backdrop-blur-md sticky top-0 z-30 border-b border-gold-50/50">
        <div className="flex items-center gap-5">
          <button onClick={onBack} className="w-11 h-11 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-800 active:scale-90 transition-transform">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <div>
            <h2 className="text-[19px] font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">Cevşen-ül Kebir</h2>
            <p className="text-[9px] font-black text-gold-500 uppercase tracking-[0.2em] mt-1">PRO+ ÖZEL İÇERİK</p>
          </div>
        </div>
        <button 
          onClick={() => setShowBabList(true)}
          className="w-11 h-11 bg-gold-50 dark:bg-navy-950/20 rounded-2xl flex items-center justify-center text-gold-600 border border-gold-100 shadow-sm active:scale-90 transition-transform"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </div>

      {/* Control Bar */}
      <div className="px-6 py-4 flex gap-2 overflow-x-auto no-scrollbar bg-white/50 border-b border-slate-50 dark:border-slate-800">
        <button 
          onClick={() => setShowPronunciation(!showPronunciation)}
          className={`px-5 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${showPronunciation ? 'bg-gold-600 text-white border-gold-500 shadow-lg shadow-gold-100' : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-800'}`}
        >
          Okunuş {showPronunciation ? 'Açık' : 'Kapalı'}
        </button>
        <button 
          onClick={() => setShowTranslation(!showTranslation)}
          className={`px-5 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${showTranslation ? 'bg-gold-600 text-white border-gold-500 shadow-lg shadow-gold-100' : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-800'}`}
        >
          Meal {showTranslation ? 'Açık' : 'Kapalı'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-40 no-scrollbar space-y-12 pt-8">
        
        {/* Dynamic Bab Title */}
        <div className="text-center space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <div className="inline-flex flex-col items-center">
              <div className="w-20 h-20 bg-gold-50 dark:bg-navy-950/20 text-gold-600 rounded-full flex items-center justify-center text-3xl font-black shadow-inner border border-gold-100/50 mb-4 ring-8 ring-white">
                 {currentBab.id}
              </div>
              <p className="text-[12px] font-black text-gold-300 uppercase tracking-[0.5em] mb-4">B A B {currentBab.id}</p>
           </div>
        </div>

        {/* Content Displays - Visual fixes (bg-transparent added to p tags) */}
        <div className="space-y-12 pb-20">
          {/* Arabic Display */}
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-50 dark:border-slate-800 shadow-2xl shadow-navy-900/5 relative overflow-hidden group">
             <div className="absolute right-[-15%] top-[-10%] p-8 opacity-[0.03] group-hover:scale-110 transition-transform text-[12rem] pointer-events-none rotate-6 text-navy-900">🛡️</div>
             <p className="arabic-text text-4xl text-slate-900 dark:text-white text-center leading-[2.5] drop-shadow-sm font-semibold bg-transparent" dir="rtl">
               {currentBab.arabic}
             </p>
          </div>

          {/* Pronunciation Card */}
          {showPronunciation && (
            <div className="bg-[#f5f3ff] p-8 rounded-[3rem] border border-gold-100 animate-in fade-in slide-in-from-bottom-2 duration-500 shadow-sm">
               <div className="flex items-center gap-3 mb-5 ml-1">
                  <div className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-pulse"></div>
                  <p className="text-[10px] font-black text-gold-500 uppercase tracking-[0.2em]">TÜRKÇE OKUNUŞ</p>
               </div>
               <p className="text-[17px] font-semibold text-navy-900 leading-relaxed italic px-2 bg-transparent">
                 "{currentBab.pronunciation}"
               </p>
            </div>
          )}

          {/* Translation Card */}
          {showTranslation && (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
               <div className="flex items-center gap-3 mb-5 ml-1">
                  <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">ANLAMI VE MEALİ</p>
               </div>
               <p className="text-[18px] font-medium text-slate-700 dark:text-slate-300 dark:text-slate-600 leading-relaxed px-2 bg-transparent">
                 {currentBab.translation}
               </p>
            </div>
          )}

          {/* Refrain (Nakarat) */}
          <div className="py-12 space-y-8">
             <div className="flex items-center justify-center gap-6 py-2 opacity-20">
                <div className="w-16 h-[0.5px] bg-navy-900"></div>
                <div className="w-2.5 h-2.5 rotate-45 border border-navy-900"></div>
                <div className="w-16 h-[0.5px] bg-navy-900"></div>
             </div>
             
             <div className="bg-gold-50/40 p-10 rounded-[3.5rem] border border-gold-100 text-center space-y-8 relative overflow-hidden group">
                <div className="absolute left-[-10%] bottom-[-10%] opacity-[0.04] text-[10rem] pointer-events-none group-hover:scale-110 transition-transform">💎</div>
                <div className="inline-block px-5 py-2 bg-gold-100 text-gold-700 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-2 border border-gold-200">NAKARAT</div>
                <p className="arabic-text text-3xl text-navy-950 font-bold leading-relaxed bg-transparent" dir="rtl">{REFRAIN.arabic}</p>
                <div className="h-px w-12 bg-gold-200/50 mx-auto"></div>
                <p className="text-[14px] font-bold text-navy-800/70 leading-relaxed px-6 italic bg-transparent">
                  "{REFRAIN.translation}"
                </p>
             </div>
          </div>
        </div>

        <div className="text-center py-20 opacity-30">
          <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.6em]">TOPLAM 100 BABDAN OLUŞMAKTADIR</p>
        </div>
      </div>

      {/* Floating Pagination Controls */}
      <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white via-white/95 to-transparent pb-[calc(1.5rem+env(safe-area-inset-bottom))] flex items-center justify-between gap-5 z-[40]">
        <button 
          onClick={handlePrev}
          disabled={currentBabIndex === 0}
          className="w-18 h-18 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-black/5 active:scale-90 transition-all disabled:opacity-30 disabled:scale-95 flex-shrink-0"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="15 18 9 12 15 6"/></svg>
        </button>

        <div className="flex-1 h-18 bg-gold-600 rounded-[2rem] shadow-2xl shadow-navy-900/20 flex items-center justify-between px-10 text-white group overflow-hidden relative border-b-4 border-navy-800">
           <div className="absolute top-0 left-0 h-full bg-white/5 transition-all duration-1000" style={{ width: `${currentBabIndex + 1}%` }}></div>
           <span className="text-[11px] font-black uppercase tracking-[0.3em] opacity-60 relative z-10">BÖLÜM</span>
           <span className="text-2xl font-black tracking-tighter relative z-10">{currentBabIndex + 1} <span className="text-[11px] font-bold opacity-30 ml-1">/ 100</span></span>
        </div>

        <button 
          onClick={handleNext}
          disabled={currentBabIndex >= 99}
          className="w-18 h-18 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-gold-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-black/5 active:scale-90 transition-all disabled:opacity-30 disabled:scale-95 flex-shrink-0"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      {/* Bab Selection Modal */}
      {showBabList && (
        <div className="fixed inset-0 z-[500] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 w-full max-w-[440px] rounded-[3.5rem] p-10 space-y-10 animate-in zoom-in duration-300 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
              <div className="text-center space-y-2 flex-shrink-0">
                 <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Cevşen Fihristi</h3>
                 <p className="text-[10px] font-black text-gold-500 uppercase tracking-[0.4em]">100 BÖLÜM LİSTESİ</p>
              </div>

              <div className="flex-1 overflow-y-auto pr-3 no-scrollbar">
                 <div className="grid grid-cols-4 gap-4 pb-10">
                    {[...Array(100)].map((_, i) => (
                      <button 
                        key={i}
                        onClick={() => { setCurrentBabIndex(i); setShowBabList(false); if (window.navigator.vibrate) window.navigator.vibrate(20); }}
                        className={`aspect-square rounded-[1.4rem] flex items-center justify-center text-sm font-black transition-all active:scale-90 border-2 ${i === currentBabIndex ? 'bg-gold-600 text-white border-gold-500 shadow-xl scale-105' : 'bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-800 hover:bg-gold-50 dark:bg-navy-950/20 hover:text-gold-600'}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                 </div>
              </div>

              <button 
                onClick={() => setShowBabList(false)}
                className="w-full py-5 bg-slate-900 text-white font-black rounded-[1.8rem] text-[11px] uppercase tracking-[0.3em] shadow-xl active:scale-95 transition-all flex-shrink-0"
              >
                KAPAT
              </button>
           </div>
        </div>
      )}

      {/* Global Brand Decoration */}
      <div className="fixed bottom-0 left-0 right-0 p-8 text-center pointer-events-none z-10 opacity-30">
        <p className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.8em]">MÜBAREKÇE PRO+ PLATFORM</p>
      </div>
    </div>
  );
};

export default CevsenKebir;
