import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminRole = await prisma.role.upsert({ where: { name: 'Admin' }, update: {}, create: { name: 'Admin' } });
  const staffRole = await prisma.role.upsert({ where: { name: 'Staff' }, update: {}, create: { name: 'Staff' } });
  const editorRole = await prisma.role.upsert({ where: { name: 'Editor' }, update: {}, create: { name: 'Editor' } });

  await prisma.permission.createMany({
    data: [
      { key: 'all', roleId: adminRole.id },
      { key: 'orders.manage', roleId: staffRole.id },
      { key: 'cases.manage', roleId: staffRole.id },
      { key: 'content.edit', roleId: editorRole.id }
    ],
    skipDuplicates: true
  });

  const passwordHash = await bcrypt.hash('Admin@1234', 10);
  await prisma.user.upsert({
    where: { email: 'admin@je-beauty.local' },
    update: {},
    create: { name: 'JE Admin', email: 'admin@je-beauty.local', passwordHash, roleId: adminRole.id }
  });

  const [retail, trial, pro] = await Promise.all([
    prisma.category.upsert({ where: { slug: 'retail' }, update: {}, create: { name: '正貨', slug: 'retail', type: 'product' } }),
    prisma.category.upsert({ where: { slug: 'trial' }, update: {}, create: { name: '沙貨', slug: 'trial', type: 'product' } }),
    prisma.category.upsert({ where: { slug: 'pro' }, update: {}, create: { name: '院線品', slug: 'pro', type: 'product' } })
  ]);

  const products = [
    { name: 'JE 胺基酸溫和潔顏霜', slug: 'je-cleanser', price: 880, stock: 60, categoryId: retail.id, description: '敏弱肌友善，術後可用。' },
    { name: 'JE 玻尿酸保濕精華液', slug: 'je-hyaluronic-serum', price: 1680, stock: 32, categoryId: retail.id, description: '高效補水，提升肌膚穩定。' },
    { name: 'JE 舒緩修護凍膜（沙龍版）', slug: 'je-soothing-mask-pro', price: 2200, stock: 20, categoryId: trial.id, description: '大容量沙貨，術後退紅急救。' },
    { name: 'JE 外泌體修護安瓶', slug: 'je-exosome-ampoule', price: 3600, stock: 15, categoryId: pro.id, description: '高階修護配方，問題肌專用。' }
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: { ...p, status: 'published' },
      create: {
        ...p,
        status: 'published',
        images: { create: [{ url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=900&q=80', alt: p.name }] },
        inventory: { create: { change: p.stock, reason: 'seed_init' } }
      }
    });
  }

  const services = [
    {
      name: '無痛清粉刺＋JE藻針', slug: 'je-painless-clean-plus-algae', category: '無痛清粉刺',
      targetAudience: '黑頭、閉鎖粉刺、毛孔堵塞困擾', process: '卸洗 > 軟化 > 無痛針清 > 鎮定 > 居家衛教',
      durationMinutes: 120, price: 2000, precautions: '24小時避免酸類、桑拿與高溫環境。',
      faq: '可加購外泌體/泥膜。', content: '核心經典療程，單次計費。', status: 'published'
    },
    {
      name: 'MTS皮膚管理', slug: 'mts-management', category: '問題肌處理', targetAudience: '痘疤、毛孔、肌理不平',
      process: '評估 > 清潔 > MTS操作 > 修護', durationMinutes: 90, price: 2000, precautions: '術後加強防曬。',
      faq: '建議療程間隔 2-4 週。', content: '改善毛孔與膚質細節。', status: 'published'
    },
    {
      name: '晶亮喚采療程', slug: 'radiance-revive', category: '晶亮喚采療程', targetAudience: '暗沉、膚色不均、上鏡需求',
      process: '溫和代謝 > 導入 > 修護膜', durationMinutes: 45, price: 2500, precautions: '避免立即曝曬。',
      faq: '可搭配清粉刺前置代謝。', content: '快速提亮與細緻。', status: 'published'
    },
    {
      name: '特別療程：棘皮/肚臍清潔/艾草溫罐', slug: 'special-care-series', category: '特別療程', targetAudience: '局部問題清潔與放鬆需求',
      process: '客製評估 > 區域施作 > 收尾衛教', durationMinutes: 30, price: 800, precautions: '視療程避免抓搔。',
      faq: '可與臉部療程搭配。', content: '多樣局部療程組合。', status: 'published'
    },
    {
      name: '熱蠟除毛（含VIO）', slug: 'wax-vio', category: '熱蠟除毛', targetAudience: '在意毛髮與清潔舒適度者',
      process: '清潔 > 隔離保護 > 熱蠟除毛 > 鎮定', durationMinutes: 60, price: 2000, precautions: '72小時避免高溫與摩擦。',
      faq: '孕媽咪可先諮詢評估。', content: '低敏熱蠟，私密處可做。', status: 'published'
    }
  ];

  for (const s of services) {
    await prisma.service.upsert({ where: { slug: s.slug }, update: s, create: s });
  }

  const caseSeeds = [
    {
      title: '鼻頭黑頭粉刺改善（高雄）', slug: 'case-nose-blackhead-kaohsiung', bodyPart: '鼻頭', skinCondition: '黑頭', store: '高雄',
      summary: '單次清除大量角栓，毛孔視覺乾淨。', treatmentFocus: '軟化角栓＋分區施作。', aftercare: '48小時內加強保濕。',
      treatmentDate: new Date('2025-01-10'), status: 'published', sort: 1, isAnonymous: true
    },
    {
      title: '人中敏感區痘痘處理（台東）', slug: 'case-philtrum-acne-taitung', bodyPart: '人中', skinCondition: '丘疹', store: '台東',
      summary: '敏感區減痛處理，降低二次刺激。', treatmentFocus: '減壓手法＋抗發炎修護。', aftercare: '避免摳抓、加強防曬。',
      treatmentDate: new Date('2024-09-22'), status: 'published', sort: 2, isAnonymous: true
    }
  ];

  for (const c of caseSeeds) {
    await prisma.case.upsert({
      where: { slug: c.slug },
      update: c,
      create: {
        ...c,
        images: {
          create: [
            { url: 'https://images.unsplash.com/photo-1596704017235-d974869542a8?auto=format&fit=crop&w=900&q=80', phase: 'before', sort: 1 },
            { url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=80', phase: 'after', sort: 2 }
          ]
        }
      }
    });
  }

  await prisma.faq.createMany({
    data: [
      { category: '付款', question: '可刷卡嗎？', answer: 'MVP 先提供匯款/轉帳。', sort: 1 },
      { category: '付款', question: '運費怎麼算？', answer: '滿 NT$3000 免運，未滿酌收 NT$100。', sort: 2 },
      { category: '預約', question: '如何預約療程？', answer: '建議透過 LINE OA 預約，回覆最快。', sort: 1 },
      { category: '術後', question: '術後可上妝嗎？', answer: '一般清粉刺建議隔日上妝。', sort: 1 },
      { category: '敏感肌', question: '敏感肌可以做嗎？', answer: '會先評估膚況再客製方案。', sort: 1 }
    ],
    skipDuplicates: true
  });

  await prisma.setting.upsert({
    where: { key: 'site_seo_defaults' },
    update: { value: 'JE心怡美顏館｜問題肌膚專門店' },
    create: { key: 'site_seo_defaults', value: 'JE心怡美顏館｜問題肌膚專門店' }
  });
  await prisma.setting.upsert({
    where: { key: 'stores_overview' },
    update: { value: '高雄/台東雙據點，含停車資訊與入樓方式。' },
    create: { key: 'stores_overview', value: '高雄/台東雙據點，含停車資訊與入樓方式。' }
  });
}

main().finally(() => prisma.$disconnect());
