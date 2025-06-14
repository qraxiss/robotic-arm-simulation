# THREE.JS TABANLI ROBOT KOL SİMÜLASYONU

**Proje Adı:** Three.js Tabanlı Dinamik Robot Kol Simülasyonu  
**Öğrenci:** Mehmet Fatih Güman  
**Danışman:** Erkan Ülker  
**Üniversite:** Konya Teknik Üniversitesi  
**Bölüm:** Bilgisayar Mühendisliği  
**Ders:** Bitirme Projesi  
**Teslim Tarihi:** 14 Haziran 2025

---

## İÇİNDEKİLER

1. [GİRİŞ](#1-giriş)
2. [ÖN BİLGİLER](#2-ön-bilgiler)
   - 2.1 [Three.js Kütüphanesi](#21-threejs-kütüphanesi)
   - 2.2 [Robot Kol Kinematiği](#22-robot-kol-kinematiği)
   - 2.3 [WebGL Teknolojisi](#23-webgl-teknolojisi)
3. [SİSTEMİN TASARIMI VE ÇALIŞMASI](#3-sistemin-tasarimi-ve-çalışmasi)
   - 3.1 [Sistem Mimarisi](#31-sistem-mimarisi)
   - 3.2 [Robot Kol Bileşenleri](#32-robot-kol-bileşenleri)
   - 3.3 [Kontrol Sistemi](#33-kontrol-sistemi)
   - 3.4 [Animasyon ve Hareket](#34-animasyon-ve-hareket)
4. [SONUÇ](#4-sonuç)
5. [KAYNAKLAR](#kaynaklar)

---

## ÖZET

Bu proje, Three.js kütüphanesi kullanılarak geliştirilmiş, web tabanlı bir robot kol simülasyonu uygulamasıdır. Nisan-Haziran 2025 tarihleri arasında iteratif olarak geliştirilen uygulama, kullanıcıların gerçek zamanlı olarak çok eklemli bir robot kolu kontrol etmesine olanak tanır. Sistem özellikleri arasında dinamik segment sayısı (0-5 arası ayarlanabilir), değiştirilebilir segment uzunluğu (10-40 birim), click-based inverse kinematics benzeri konumlandırma ve smooth sequential animasyonlar bulunmaktadır. React ve TypeScript teknolojileri ile tip güvenli olarak geliştirilmiş sistem, 20'den fazla iterasyon ile basit bir 3D platformdan karmaşık bir robot simülasyonuna evrilmiştir. Geliştirme sürecinde karşılaşılan ters kinematik hesaplama, dinamik segment yönetimi ve animasyon senkronizasyonu gibi zorluklar, binary search'ten reach ratio bazlı hesaplamaya geçiş, useRef hook kullanımı ve callback tabanlı animasyon sistemi gibi çözümlerle aşılmıştır. Proje, endüstriyel robot simülasyonları için eğitim amaçlı kullanılabilecek, platform bağımsız çalışan, kullanıcı dostu bir web uygulaması sunmaktadır.

---

## 1. GİRİŞ

Endüstri 4.0 ile birlikte robot teknolojileri ve otomasyon sistemleri üretim süreçlerinin vazgeçilmez bir parçası haline gelmiştir. Robot kolları, hassas montaj işlemlerinden ağır yük taşımaya kadar geniş bir yelpazede kullanılmaktadır (1). Bu sistemlerin tasarımı ve kontrolü, karmaşık kinematik hesaplamalar ve uzamsal görselleştirme gerektirmektedir.

Web tabanlı 3D görselleştirme teknolojilerinin gelişmesiyle birlikte, robot simülasyonları artık tarayıcı ortamında gerçekleştirilebilmektedir (3). Three.js kütüphanesi, WebGL teknolojisini kullanarak karmaşık 3D sahnelerin oluşturulmasını ve gerçek zamanlı render edilmesini sağlamaktadır (14). Bu teknoloji, robot kol simülasyonlarının geniş kitlelere ulaşmasını ve platform bağımsız çalışmasını mümkün kılmaktadır.

Bu proje, Nisan 2025'te başlatılmış (commit: 8c0a48aa) ve 2 aylık iteratif geliştirme süreciyle tamamlanmıştır. Proje kapsamında, dinamik segment sayısına sahip, ters kinematik hesaplamalar yapabilen ve kullanıcı etkileşimlerine gerçek zamanlı yanıt verebilen bir robot kol simülasyonu geliştirilmiştir. Toplam 20'den fazla major commit ile sistem, basit bir platform görselleştirmesinden (commit: b8e02410) karmaşık bir robot kol simülasyonuna evrilmiştir.

Geliştirilen uygulama, eğitim kurumlarında robotik eğitimi için kullanılabileceği gibi, endüstriyel uygulamalar için prototip geliştirme aşamasında da değerli bir araç olarak hizmet edebilir (7). Modern web teknolojilerinin robotik simülasyonlar için sunduğu olanakları göstermekte ve gelecekteki web tabanlı endüstriyel uygulamalar için bir temel oluşturmaktadır.

---

## 2. ÖN BİLGİLER

### 2.1 Three.js Kütüphanesi

Three.js, WebGL üzerine inşa edilmiş, JavaScript tabanlı bir 3D grafik kütüphanesidir (9). Ricardo Cabello tarafından 2010 yılında geliştirilen bu kütüphane, karmaşık WebGL API'sini soyutlayarak 3D içerik oluşturmayı kolaylaştırır (15). Kütüphane, sahne yönetimi, kamera kontrolü, ışıklandırma, malzeme sistemi ve geometri oluşturma gibi temel 3D grafik bileşenlerini içerir.

Projede kullanılan Three.js özellikleri ve implementasyonları:

- **Scene (Sahne):** Robot ve platform nesnelerinin bulunduğu ana konteyner (commit: b8e02410)
- **PerspectiveCamera:** 75° FOV ile perspektif görünüm, başlangıç pozisyonu (100, 50, 50)
- **WebGLRenderer:** Canvas elementi üzerinde render işlemleri
- **Mesh:** BoxGeometry ve CylinderGeometry ile robot parçaları oluşturma
- **Group/Object3D:** Hiyerarşik parent-child ilişkileri için segment yapıları
- **MeshPhongMaterial/MeshStandardMaterial:** Farklı yüzey özellikleri için malzemeler
- **GridHelper:** 500x500 birimlik referans ızgarası (commit: 390910ca)
- **Raycaster:** Mouse tıklama pozisyonunu 3D koordinata dönüştürme

Bu özellikler, projede modüler ve genişletilebilir bir 3D robot simülasyonu oluşturmayı mümkün kılmıştır.

### 2.2 Robot Kol Kinematiği

Robot kol kinematiği, eklem açıları ile uç işlevcinin (end-effector) pozisyonu arasındaki matematiksel ilişkiyi inceler (8). İki temel yaklaşım bulunmaktadır:

**İleri Kinematik:** Eklem açıları verildiğinde, uç işlevcinin pozisyonunu hesaplar. Denavit-Hartenberg parametreleri kullanılarak sistematik olarak çözülür (20).

**Ters Kinematik:** Hedef pozisyon verildiğinde, gerekli eklem açılarını hesaplar. Bu problem, özellikle çok eklemli sistemlerde karmaşık olup, genellikle iteratif yöntemlerle çözülür (10).

Projede, klasik ters kinematik yaklaşımı yerine pragmatik bir çözüm geliştirilmiştir:

- İlk denemede (commit: 64084142) standart IK algoritmaları kullanılmaya çalışılmış
- Binary search yaklaşımı (commit: d0fb7788) performans sorunları yaratmış
- Sonuçta reach ratio bazlı, kol sayısına göre dinamik açı hesaplama yöntemi geliştirilmiş
- Her kol konfigürasyonu için deneysel olarak optimal açı değerleri belirlenmiş (commit: 077de0d3, bce9eb91)

Bu yaklaşım, matematiksel olarak kesin olmasa da, kullanıcı deneyimi açısından tatmin edici sonuçlar vermiştir.

### 2.3 WebGL Teknolojisi

WebGL (Web Graphics Library), web tarayıcılarında donanım hızlandırmalı 3D grafikler oluşturmaya olanak tanıyan bir JavaScript API'sidir (5). OpenGL ES 2.0'a dayanan WebGL, eklenti gerektirmeden tarayıcıda yüksek performanslı grafikler üretir.

Three.js, WebGL'in düşük seviyeli işlemlerini soyutlayarak:

- Shader yönetimini otomatikleştirir
- Render optimizasyonları sağlar
- Çapraz tarayıcı uyumluluğu sunar

Projede WebGL'in sunduğu avantajlar:

- 500x500 birimlik geniş grid alanında performanslı render (commit: 390910ca)
- Gerçek zamanlı çoklu nesne animasyonları
- OrbitControls ile smooth kamera hareketi
- Ambient ve directional light ile gerçekçi aydınlatma
- Metalik malzemeler için roughness ve metalness özellikleri

Bu özellikler sayesinde, karmaşık robot kol hareketleri tarayıcıda sorunsuz şekilde görselleştirilebilmektedir.

---

## 3. SİSTEMİN TASARIMI VE ÇALIŞMASI

### 3.1 Sistem Mimarisi

Uygulama, React ve TypeScript kullanılarak komponent tabanlı bir mimari üzerine inşa edilmiştir (commit: 8c0a48aa). Sistem mimarisi proje sürecinde aşamalı olarak geliştirilmiştir:

**İlk Aşama (commit: 8c0a48aa):**

- React + TypeScript + Three.js temel yapısı kurulmuş
- Proje konfigürasyonu ve bağımlılıklar ayarlanmış

**İkinci Aşama (commit: b8e02410):**

- Platform komponenti implementasyonu
- 3D sahne ve temel platform geometrisi oluşturulmuş

**Üçüncü Aşama (commit: e456dbce):**

- Yeni 3D model yapısı implementasyonu
- Segment tabanlı komponent mimarisi geliştirilmiş

**Final Mimari:**

```
├── App.tsx                 # Ana uygulama bileşeni
├── components/
│   ├── MainCanvas.tsx      # 3D sahne ve render yönetimi
│   └── RobotControls.tsx   # Kullanıcı kontrol arayüzü
├── module-3D/
│   ├── canvas/            # Canvas ve sahne yönetimi
│   ├── segments/          # Robot kol parçaları
│   └── utils/             # Yardımcı fonksiyonlar
└── store/
    └── rotationStore.tsx   # Global durum yönetimi
```

State yönetimi için React Context API kullanılmış olup (commit: 41ade150), tüm rotasyon ve pozisyon verileri merkezi bir store'da tutulmaktadır (2). CSS stilleri modüler olarak import edilmiştir (commit: 41ade150).

### 3.2 Robot Kol Bileşenleri

Robot kol, hiyerarşik bir yapıda organize edilmiş segmentlerden oluşmaktadır. Her bileşen aşamalı olarak geliştirilmiştir:

1. **Platform (commit: b8e02410, 941bcfa4):**
   - İlk versiyonda basit platform
   - Sonrasında 4 tekerlek eklenerek hareketli taban platformu
   - Tekerlek rotasyon animasyonu implementasyonu

2. **RobotBase:**
   - Sabit robot tabanı
   - Platform üzerinde bağımsız rotasyon yapabilme yeteneği (commit: 941bcfa4)

3. **UpperArm (commit: ceb1ad09):**
   - Üst kol segmenti (30 birim uzunluk)
   - Progressive rotation sistemi (kol sayısına göre %60-85 arası açı kullanımı)

4. **MiddleArm (commit: 2f636699, efc4def6, 2916b81e):**
   - İlk olarak tek sabit middle arm
   - Sonra dinamik sayıda (0-5) middle arm desteği
   - Ayarlanabilir uzunluk (10-40 birim) özelliği
   - updateLength metodu ile runtime uzunluk değişimi

5. **LowerArm:**
   - Alt kol segmenti (30 birim uzunluk)

6. **Grip:**
   - Tutucu mekanizma

Her segment, `Segment` soyut sınıfından türetilmiş ve kendi geometri, malzeme ve animasyon özelliklerini içermektedir (16). Kinematik zincir, parent-child ilişkileri ile dinamik olarak yönetilmektedir (commit: 777b789c).

### 3.3 Kontrol Sistemi

Kontrol sistemi, proje geliştirme sürecinde önemli evrimler geçirmiştir:

**Manuel Kontroller (ilk implementasyon):**

- Slider tabanlı eklem açısı kontrolü
- Dinamik segment sayısı ayarı (0-5 arası) (commit: efc4def6)
- Segment uzunluk kontrolü (10-40 birim) (commit: 2916b81e)
- Platform pozisyon kontrolü (commit: 64084142)

**Otomatik Konumlandırma Evrimi:**

**Versiyon 1 - Mouse Takibi:**
İlk tasarımda handleMouseMove fonksiyonu ile sürekli mouse takibi yapılmıştır. Bu yaklaşım gerçekçi olmayan hareketlere neden olmuştur.

**Versiyon 2 - Basit Click Positioning (commit: 03b564b0):**
Mouse takibi kaldırılarak click-based sisteme geçilmiş, sabit 35° açı ile basit konumlandırma yapılmıştır.

**Versiyon 3 - Dinamik Açı Hesaplama (commit: 2d2b2ead):**
Kol sayısına göre dinamik açı hesaplama implementte edilmiştir:

- Base açı = 35° + (5° × middle arm sayısı)

**Versiyon 4 - Gelişmiş IK Sistemi (commit: d0fb7788):**
Binary search algoritması denenmiş ancak performans sorunları nedeniyle reach ratio bazlı sisteme geçilmiştir. useRef ile middle arm count güncelleme problemi çözülmüştür.

**Final Versiyon - İnce Ayarlar (commit: 077de0d3, bce9eb91):**
Her kol konfigürasyonu için optimize edilmiş açı değerleri ve platform mesafeleri belirlenmiştir (11). Differential bending ile ilk middle arm %70 oranında bükülerek daha doğal hareket sağlanmıştır.

### 3.4 Animasyon ve Hareket

Animasyon sistemi, commit geçmişinde görüldüğü üzere iteratif olarak geliştirilmiştir:

**İlk Aşama - Mouse Takibi (commit: 9bb2ff40 öncesi):**
Başlangıçta mouse hareketlerini takip eden sistem kullanılmış ancak kontrolsüz hareketler nedeniyle kaldırılmıştır.

**İkinci Aşama - Click-Based Positioning (commit: 03b564b0):**
Tıklama tabanlı konumlandırmaya geçilmiş, robot 45 birim arkada konumlandırılarak tüm eklemler 35° açıyla hedefe yönlendirilmiştir.

**Üçüncü Aşama - Smooth Animations (commit: cbd7bd4a):**
Birden fazla hareketin senkronize edilmesini sağlayan animasyon sistemi implementte edilmiştir:

1. **Kol Düzleştirme:** Tüm eklemler 0° açıya getirilir (500ms)
2. **Platform Rotasyonu:** Hedefe yönelim (400ms) (commit: 3a779118)
3. **Platform Hareketi:** Hedef konuma hareket (1000ms)
4. **Kol Bükülmesi:** Hesaplanan açılara göre bükülme (800ms)

Animasyonlar için cubic ease-out fonksiyonu kullanılarak doğal hareket sağlanmıştır (17):

```javascript
const easeProgress = 1 - Math.pow(1 - progress, 3);
```

**Platform Hareketi ve Tekerlek Sistemi (commit: 941bcfa4):**
Platform'a 4 tekerlek eklenerek gerçekçilik artırılmış, tekerlek rotasyonu hareket mesafesine göre hesaplanmıştır. Platform yüksekliği y=3 olarak ayarlanarak yer boşluğu sağlanmıştır.

---

## 4. SONUÇ

Bu projede, Three.js kütüphanesi kullanılarak web tabanlı, dinamik ve etkileşimli bir robot kol simülasyonu başarıyla geliştirilmiştir. Sistem, belirlenen hedeflere büyük ölçüde ulaşmıştır:

**Başarılar:**

- React + TypeScript + Three.js entegrasyonu ile tip güvenli 3D uygulama geliştirme (commit: 8c0a48aa)
- Platform tabanlı robot sistemi implementasyonu (commit: b8e02410)
- Dinamik middle arm segment yapısı (0-5 arası ayarlanabilir) (commit: efc4def6)
- Ayarlanabilir segment uzunluğu (10-40 birim) (commit: 2916b81e)
- Smooth sequential animasyon sistemi (500ms-1000ms arası fazlar) (commit: cbd7bd4a)
- Click-based inverse kinematics benzeri konumlandırma (commit: 64084142)
- Platform hareket sistemi ve tekerlek animasyonları (commit: 941bcfa4)
- Kullanıcı dostu slider tabanlı kontrol paneli

**Karşılaşılan Zorluklar ve Çözümler:**

Proje geliştirme sürecinde karşılaşılan zorluklar ve bunların çözüm yolları commit geçmişinde detaylı olarak takip edilebilmektedir:

**1. Ters Kinematik Hesaplama Problemi:**
İlk implementasyonda (commit: 64084142) klasik ters kinematik yaklaşımı denenmiş ancak çoklu segment yapısında yetersiz kalmıştır. Binary search algoritması ile açı hesaplama yaklaşımı (commit: d0fb7788) performans sorunları yaratmıştır. Çözüm olarak, reach ratio bazlı doğrudan açı hesaplama yöntemi geliştirilmiştir (18). Her kol konfigürasyonu için özel açı parametreleri tanımlanmıştır:

- 0 kol: 90° maksimum, 0.4 ratio
- 1 kol: 80° maksimum, 0.5 ratio  
- 2+ kol: Kademeli azalan açılar

**2. Dinamik Segment Yönetimi:**
Middle arm sayısının runtime'da değiştirilmesi (commit: efc4def6) kinematik zincirin bozulmasına neden olmuştur. useRef hook kullanılarak (commit: d0fb7788) component re-render'larında referans kaybolması sorunu çözülmüştür. Ayrıca segment uzunluğu değişimlerinde (commit: 777b789c) child segment'lerin pozisyonlarının güncellenmemesi nedeniyle oluşan boşluk ve örtüşme problemleri, updateLength metoduna child repositioning eklenerek giderilmiştir.

**3. Platform ve Robot Base Rotasyon Senkronizasyonu:**
İlk tasarımda platform rotasyonu robot base rotasyonunu etkileyerek hedefleme problemlerine yol açmıştır (commit: 941bcfa4). Platform'un sadece translasyon yapması, robot base'in bağımsız rotasyon yapması sağlanarak çözülmüştür (commit: 3a779118). Platform'un hedefe yönelmesi ve hareket etmesi için iki aşamalı animasyon sistemi implementte edilmiştir.

**4. Mouse Takibi vs Click-Based Kontrol:**
Başlangıçta mouse takibi yaklaşımı (handleMouseMove) kullanılmış ancak kontrolsüz ve gerçekçi olmayan hareketlere neden olmuştur (commit: 9bb2ff40). Click-based positioning'e geçilerek (commit: 03b564b0) daha kontrollü ve gerçekçi bir hareket sistemi oluşturulmuştur.

**5. Animasyon Senkronizasyonu:**
Çoklu hareketin (kol düzleştirme, platform rotasyonu, platform hareketi, kol bükülmesi) senkronize edilmesi zorlu olmuştur (commit: cbd7bd4a). Promise chain yerine callback bazlı sequential animation sistemi ile çözülmüştür. Her animasyon fazı için özel timing ve easing fonksiyonları tanımlanmıştır.

**6. Kol Sayısına Göre Dinamik Açı Ayarlaması:**
Farklı kol konfigürasyonlarında self-collision ve erişim problemleri yaşanmıştır. Progressive upper arm rotation (commit: ceb1ad09) ve differential middle arm bending (commit: bce9eb91) implementasyonları ile her konfigürasyon için optimal açılar bulunmuştur (11).

Bu proje, web teknolojilerinin karmaşık robotik simülasyonlar için yeterli olduğunu ve iteratif geliştirme sürecinin başarılı sonuçlar verdiğini göstermektedir. Modern web standartlarının ve 3D grafik kütüphanelerinin gelişmesiyle, bu tür uygulamaların kapsamı ve yetenekleri artmaya devam edecektir (19).

---

## KAYNAKLAR

(1) GitHub - automaticdai/robot-arm-webgl: Simulate a robot arm with three.js and WebGL. Erişim tarihi: 14.06.2025, <https://github.com/automaticdai/robot-arm-webgl>

(2) Robotics Simulation - Six DoF - Showcase - three.js forum. Erişim tarihi: 14.06.2025, <https://discourse.threejs.org/t/robotics-simulation-six-dof/16225>

(3) College 3D Model Rendering Using Three JS | IEEE Conference Publication | IEEE Xplore. Erişim tarihi: 14.06.2025, <https://ieeexplore.ieee.org/document/10039553/>

(4) Robotics Simulation - Six DoF - Showcase - three.js forum. Erişim tarihi: 14.06.2025, <https://discourse.threejs.org/t/robotics-simulation-six-dof/16225>

(5) Handmade kinematic robot arm simulation I made a while ago - Showcase - three.js forum. Erişim tarihi: 14.06.2025, <https://discourse.threejs.org/t/handmade-kinematic-robot-arm-simulation-i-made-a-while-ago/78433>

(6) Robot Arm Kinematics in Three.js – Marginally Clever Robots. Erişim tarihi: 14.06.2025, <https://www.marginallyclever.com/2019/10/robot-arm-kinematics-in-three-js/>

(7) GitHub - glumb/robot-gui: A three.js based 3D robot interface. Erişim tarihi: 14.06.2025, <https://github.com/glumb/robot-gui>

(8) Robot arm in three.js -- Starter. Erişim tarihi: 14.06.2025, <https://codepen.io/asterix77/pen/dLdraK?editors=1010>

(9) Robotic Arm Interactive Animation - Showcase - three.js forum. Erişim tarihi: 14.06.2025, <https://discourse.threejs.org/t/robotic-arm-interactive-animation/34094>

(10) GitHub - IacopomC/robot_arm_three_js: Robot arm with 3 degrees of freedom built using three.js. Erişim tarihi: 14.06.2025, <https://github.com/IacopomC/robot_arm_three_js>

(11) three.js webgl - collada - kinematics. Erişim tarihi: 14.06.2025, <https://threejs.org/examples/webgl_loader_collada_kinematics.html>

(12) GitHub - loristissino/RoboThree: A lightweight simulation environment for robots. Erişim tarihi: 14.06.2025, <https://github.com/loristissino/RoboThree>

(13) GitHub - wfwalker/robot-threejs: experiments in making a robot-based game using three.js and WebGL. Erişim tarihi: 14.06.2025, <https://github.com/wfwalker/robot-threejs>

(14) three.js examples. Erişim tarihi: 14.06.2025, <https://threejs.org/examples/>

(15) Three.js - Wikipedia. Erişim tarihi: 14.06.2025, <https://en.wikipedia.org/wiki/Three.js>

(16) Building up a basic demo with Three.js - Game development | MDN. Erişim tarihi: 14.06.2025, <https://developer.mozilla.org/en-US/docs/Games/Techniques/3D_on_the_web/Building_up_a_basic_demo_with_Three.js>

(17) GitHub - jsantell/THREE.IK: inverse kinematics for three.js. Erişim tarihi: 14.06.2025, <https://github.com/jsantell/THREE.IK>

(18) THREE.IK - inverse kinematics for three.js. Erişim tarihi: 14.06.2025, <https://jsantell.github.io/THREE.IK/>

(19) Three.js - JavaScript 3D Library - GeeksforGeeks. Erişim tarihi: 14.06.2025, <https://www.geeksforgeeks.org/three-js/>

(20) An inverse kinematics method of a soft robotic arm with three-dimensional locomotion for underwater manipulation | IEEE Conference Publication | IEEE Xplore. Erişim tarihi: 14.06.2025, <https://ieeexplore.ieee.org/document/8405378/>

---

## EKLER

### Ek 1: Proje Geliştirme Commit Geçmişi

Aşağıda projenin gelişim sürecini gösteren commit geçmişi kronolojik sırayla sunulmuştur:

#### 1. Proje Başlangıcı

**Commit:** `8c0a48aa` | **Tarih:** 12 Nisan 2025  
**Açıklama:** Three.js robot kol projesi başlatıldı

- React projesi TypeScript ile kuruldu
- Three.js 3D render için yapılandırıldı
- Temel proje yapısı oluşturuldu
- İlk bağımlılıklar ve konfigürasyon eklendi

#### 2. Robot Tabanı

**Commit:** `b8e02410` | **Tarih:** 12 Nisan 2025  
**Açıklama:** Robot taban platformu implementasyonu

- Robot tabanı için platform komponenti oluşturuldu
- Temel platform geometrisi ile 3D sahne kuruldu
- Robot kol montajı için temel oluşturuldu

#### 3. Model Geliştirmeleri

**Commit:** `e456dbce` | **Tarih:** 13 Mayıs 2025  
**Açıklama:** Yeni 3D model komponentleri eklendi

- Robot segmentleri için yeni model yapısı implementasyonu
- 3D görselleştirme yetenekleri geliştirildi
- Komponent mimarisi iyileştirildi

#### 4. Stil Yapılandırması

**Commit:** `41ade150` | **Tarih:** 14 Mayıs 2025  
**Açıklama:** CSS stilleri import edildi ve yapılandırıldı

- Komponentler için CSS import'ları eklendi
- Temel görsel stil yapısı kuruldu
- Stil yapılandırması tamamlandı

#### 5. Ters Kinematik ve Platform Kontrolü

**Commit:** `64084142` | **Tarih:** 14 Haziran 2025  
**Açıklama:** Ters kinematik ile platform kontrolü implementasyonu

- Görsel mesh ile Platform komponenti eklendi
- UI'da platform pozisyon kontrolleri entegre edildi
- Robot kol için ters kinematik hesaplamaları eklendi
- Canvas üzerinde tıkla-hareket et fonksiyonelliği implementasyonu
- Platform pozisyonunu takip için rotation store güncellendi
- Platform hareketi için smooth animasyon eklendi

#### 6. Orta Kol Segmenti

**Commit:** `2f636699` | **Tarih:** 14 Haziran 2025  
**Açıklama:** Robot yapısına orta kol segmenti eklendi

- Rotation store'a middleArmRotation eklendi
- 25 birim uzunluğunda yeni MiddleArm komponenti oluşturuldu
- Kinematik zincir güncellendi: Base → UpperArm → MiddleArm → LowerArm → Grip
- RobotControls'a orta kol rotasyon kontrolü eklendi

#### 7. Dinamik Orta Kol Sayısı

**Commit:** `efc4def6` | **Tarih:** 14 Haziran 2025  
**Açıklama:** Kontrol panelinden ayarlanabilir orta kol sayısı

- Rotation store'a middleArmCount state'i eklendi
- middleArmRotation, bireysel kontrol için middleArmRotations array'ine dönüştürüldü
- MainCanvas dinamik olarak kol ekleme/çıkarma özelliği kazandı
- Orta kol sayısı slider'ı (0-5) eklendi
- Kol sayısı değiştiğinde kinematik zincir yeniden bağlanması sağlandı

#### 8. Ayarlanabilir Kol Uzunluğu

**Commit:** `2916b81e` | **Tarih:** 14 Haziran 2025  
**Açıklama:** Yapılandırılabilir orta kol uzunluğu eklendi

- middleArmLength state'i rotation store'a eklendi (varsayılan: 25)
- MiddleArm sınıfı dinamik uzunluk için güncellendi
- Runtime uzunluk değişimi için updateLength metodu eklendi
- RobotControls'a orta kol uzunluk slider'ı (10-40) eklendi

#### 9. Child Segment Pozisyon Düzeltmesi

**Commit:** `777b789c` | **Tarih:** 14 Haziran 2025  
**Açıklama:** Orta kol uzunluğu değiştiğinde child segment pozisyonları güncellendi

- updateLength metodu child segmentleri yeniden konumlandıracak şekilde düzenlendi
- Kol uzunluğu ayarlandığında boşluk veya örtüşme önlendi
- Child segmentler parent segment uzunluk değişimlerini doğru takip eder hale getirildi

#### 10. Genişletilmiş Zemin Izgarası

**Commit:** `390910ca` | **Tarih:** 14 Haziran 2025  
**Açıklama:** Robot kol hareket aralığına uygun genişletilmiş zemin

- Grid boyutu 100x100'den 500x500 birime çıkarıldı
- Grid bölümleri görünürlük için 20'den 50'ye artırıldı
- Zemin artık robot kolunun tam erişim alanını kapsıyor

#### 11. Mouse Takibi Kaldırıldı

**Commit:** `9bb2ff40` | **Tarih:** 14 Haziran 2025  
**Açıklama:** Robot kontrolünden mouse takibi kaldırıldı

- Mouse pozisyonunu takip eden handleMouseMove fonksiyonu kaldırıldı
- Canvas'tan mousemove event listener kaldırıldı
- Robot artık otomatik olarak mouse hareketlerini takip etmiyor

#### 12. Tıklama Bazlı Konumlandırma

**Commit:** `03b564b0` | **Tarih:** 14 Haziran 2025  
**Açıklama:** Tilt ile tıklama bazlı robot konumlandırma

- Robot tıklanan noktanın 45 birim arkasında konumlanıyor
- Tüm eklemler hedefe doğru 35 derece eğiliyor
- Base tıklanan noktaya doğru dönüyor
- Ters kinematik yerine doğrudan açı kontrolü kullanılıyor

#### 13. Dinamik Kol Bükülmesi

**Commit:** `2d2b2ead` | **Tarih:** 14 Haziran 2025  
**Açıklama:** Kol sayısına göre dinamik kol bükülmesi

- setAllMiddleArmRotations fonksiyonu rotation store'a eklendi
- Tıklama handler'ı dinamik tilt açısı hesaplıyor
- Base açısı: 35 derece + orta kol başına 5 derece
- Orta kolların düzgün bükülmeme sorunu çözüldü

#### 14. Geliştirilmiş Ters Kinematik

**Commit:** `d0fb7788` | **Tarih:** 14 Haziran 2025  
**Açıklama:** Robot kol için geliştirilmiş ters kinematik

- useRef ile tıklama handler'ında orta kol sayısı güncelleme sorunu çözüldü
- Binary search yerine reach ratio bazlı doğrudan açı hesaplaması
- Kol sayısına özel bükülme açıları implementasyonu
- Dinamik platform offset: 40 + (20 × middleArmCount) birim

#### 15. İnce Ayarlı Bükülme Açıları

**Commit:** `077de0d3` | **Tarih:** 14 Haziran 2025  
**Açıklama:** Daha iyi konumlandırma için ince ayarlı robot kol bükülme açıları

- Self-collision önlemek için 2-5+ kol açıları azaltıldı
- Daha yumuşak hareket için reach ratio'lar ayarlandı

#### 16. Robot Kol Bükülme Mekaniği İyileştirmeleri

**Commit:** `bce9eb91` | **Tarih:** 14 Haziran 2025  
**Açıklama:** Robot kol bükülme mekaniği ve platform konumlandırma iyileştirildi

- 2+ kol için platform mesafesi hedefe yakınlaştırıldı
- Self-collision önlemek için bükülme açıları kademeli olarak azaltıldı
- Kol sayısı ≥ 2 olduğunda ilk orta kol için diferansiyel bükülme
- Kullanıcı geri bildirimlerine göre açı hesaplamaları ince ayar

#### 17. Progressive Üst Kol Rotasyonu

**Commit:** `ceb1ad09` | **Tarih:** 14 Haziran 2025  
**Açıklama:** Kol sayısına göre progressive üst kol rotasyonu

- Üst kol artık hesaplanan bükülme açısına göre yüzde bazlı rotasyon kullanıyor
- 0 koldan 5+ kola kadar kademeli azalan yüzdeler
- Fazla kol konfigürasyonlarında aşırı bükülme önlendi

#### 18. Smooth Animasyonlar

**Commit:** `cbd7bd4a` | **Tarih:** 14 Haziran 2025  
**Açıklama:** Robot kol hareketleri için smooth animasyonlar eklendi

- Kol düzleştirme ve bükülme fazları için animasyon
- En kısa yol hesaplaması ile smooth base rotasyon animasyonu
- Sıralı animasyon iş akışı oluşturuldu
- Doğal hareket için cubic ease-out easing kullanıldı

#### 19. Platform Tekerlekleri

**Commit:** `941bcfa4` | **Tarih:** 14 Haziran 2025  
**Açıklama:** Platforma tekerlek eklendi ve rotasyon bağımsızlığı sağlandı

- Platforma 4 dönen tekerlek eklendi
- Platform sistemi daha iyi yer boşluğu için y=3'e yükseltildi
- Hareket mesafesine göre tekerlek rotasyon animasyonu
- Robot base rotasyonunun platformdan bağımsız olması sağlandı
- Platform sadece translasyon yaparken robot base bağımsız dönüyor

#### 20. Bağımsız Platform Rotasyonu

**Commit:** `3a779118` | **Tarih:** 14 Haziran 2025  
**Açıklama:** Hareket öncesi bağımsız platform rotasyonu

- Platform hareket etmeden önce hedefe doğru dönüyor
- Robot base rotasyonu platform yönelimine göre ayarlanıyor
- Önemsiz hareketler için animasyon kontrolü eklendi
- Daha yumuşak sıralı animasyonlar için geliştirilmiş zamanlama

#### 21. Final Merge

**Commit:** `3533bb15` | **Tarih:** 14 Haziran 2025  
**Açıklama:** Ana dal ile birleştirme yapıldı
