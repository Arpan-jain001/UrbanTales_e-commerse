import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Promotion from './models/Promotion.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

async function createNewYearPromotion() {
  try {
    console.log('\n🎊 Creating Happy New Year 2025 promotion...\n');

    // Delete old New Year promotions
    await Promotion.deleteMany({ theme: 'NEWYEAR' });

    // Create new promotion
    const promotion = await Promotion.create({
      title: "🎊 Happy New Year 2025!",
      description: "New Year, New Deals, New You!",
      type: "ANIMATION",
      duration: 8,
      placement: "HOMEPAGE_FULLSCREEN",
      isActive: true,
      priority: 10,
      clickAction: "/",
      targetAudience: "ALL",
      theme: "NEWYEAR",
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 10)), // 10 days
      viewCount: 0,
      clickCount: 0,
    });

    console.log('✅ Promotion Created Successfully!');
    console.log('📋 Details:');
    console.log('   ID:', promotion._id);
    console.log('   Title:', promotion.title);
    console.log('   Duration:', promotion.duration, 'seconds');
    console.log('   Active:', promotion.isActive);
    console.log('   Valid till:', promotion.endDate.toLocaleDateString('en-IN'));
    console.log('\n✨ Open homepage to see the magic!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createNewYearPromotion();
