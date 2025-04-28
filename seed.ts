import type { InsertProduct } from "./shared/schema.ts";
import { storage } from "./server/storage/index.ts";

(async () => {

  const sampleProducts: InsertProduct[] = [
    {
      name: 'から丼',
      description: '揚げたてのから揚げをたっぷりと乗せた人気の一品',
      price: 420,
      image: 'https://images.unsplash.com/photo-1580822344078-5b9613767c37?auto=format&w=500&h=300&fit=crop'
    },
    {
      name: 'キムカラ丼',
      description: 'キムチとから揚げの絶妙な組み合わせ。ピリ辛で食欲そそる一品',
      price: 530,
      image: 'https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?auto=format&w=500&h=300&fit=crop'
    },
    {
      name: '鳥塩レモン丼',
      description: 'さっぱりとした塩味と爽やかなレモンの香りが特徴',
      price: 530,
      image: 'https://images.unsplash.com/photo-1604908177453-7462950a6a3b?auto=format&w=500&h=300&fit=crop'
    },
    {
      name: 'あまから丼',
      description: '甘辛いタレが絡んだ一品。ご飯がすすむ味付け',
      price: 530,
      image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&w=500&h=300&fit=crop'
    },
    {
      name: '牛カルビ丼',
      description: 'ジューシーな牛カルビをたっぷりと。特製タレで味付け',
      price: 530,
      image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&w=500&h=300&fit=crop'
    },
    {
      name: 'うま煮丼',
      description: '野菜と肉を甘辛く煮込んだうま煮をのせた丼',
      price: 530,
      image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&w=500&h=300&fit=crop'
    },
    {
      name: 'から玉子丼',
      description: 'から揚げと半熟玉子の相性抜群の組み合わせ',
      price: 530,
      image: 'https://images.unsplash.com/photo-1607103058027-4c5238e97a6e?auto=format&w=500&h=300&fit=crop'
    },
    {
      name: '月見カルビ丼',
      description: '当店特製の漬け込み液で味付けした特別なカルビ丼',
      price: 590,
      image: 'https://images.unsplash.com/photo-1602414350227-996eec5d9b25?auto=format&w=500&h=300&fit=crop'
    },
    {
      name: 'デラ丼',
      description: '当店自慢の具材をふんだんに使ったデラックス丼',
      price: 710,
      image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&w=500&h=300&fit=crop'
    },
    {
      name: '天津飯',
      description: 'ふわふわの玉子と特製あんかけのクラシックな一品',
      price: 430,
      image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&w=500&h=300&fit=crop'
    },
    {
      name: 'デラックス天津飯',
      description: '海鮮と具材をたっぷり使った贅沢な天津飯',
      price: 710,
      image: 'https://images.unsplash.com/photo-1617622141533-5df8ef2b19d8?auto=format&w=500&h=300&fit=crop'
    },
    {
      name: 'からあげ2個',
      description: 'トッピング用から揚げ2個',
      price: 90,
      image: 'https://images.unsplash.com/photo-1580822344078-5b9613767c37?auto=format&w=500&h=300&fit=crop'
    },
    {
      name: 'うま煮 2個',
      description: 'トッピング用うま煮2個',
      price: 90,
      image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&w=500&h=300&fit=crop'
    },
    {
      name: 'キムチ',
      description: 'トッピング用キムチ',
      price: 100,
      image: 'https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?auto=format&w=500&h=300&fit=crop'
    }
  ];

  await Promise.all(sampleProducts.map(product => storage.addProduct(product)));

  // Generate time slots
  // 現在時刻から5分後を最短時間として設定し、10分間隔で時間枠を生成
  const now = new Date();
  // 5分後の時間を計算（ミリ秒単位）
  const fiveMinutesLater = now.getTime() + 5 * 60000;
  // 10分単位に切り上げる（次の10分間隔の時間にする）
  const roundedTime = Math.ceil(fiveMinutesLater / (10 * 60000)) * (10 * 60000);

  // 12個の時間枠を生成（2時間分）
  for (let i = 0; i < 12; i++) {
    const slotTime = new Date(roundedTime + i * 10 * 60000);
    const hours = slotTime.getHours();
    const minutes = slotTime.getMinutes();
    const time = `${hours}:${minutes.toString().padStart(2, '0')}`;

    // すべての時間枠は最大10名まで
    const capacity = 10;
    // 初期値として8-10人分の空きがあるようにする
    const available = Math.floor(Math.random() * 3) + 8;

    await storage.addTimeSlot({
      time,
      capacity,
      available
    });
  }
})();
