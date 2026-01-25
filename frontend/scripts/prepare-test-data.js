/**
 * 测试数据准备脚本
 *
 * 使用方法:
 * node frontend/scripts/prepare-test-data.js
 *
 * 该脚本会自动创建测试用的房间、植物和配置数据
 */

const API_BASE_URL = 'http://localhost:12801/api/v1';

// 测试数据配置
const TEST_ROOMS = [
  {
    name: '客厅',
    description: '阳光充足的客厅，朝南落地窗',
    locationType: 'indoor',
    icon: '🛋️',
    color: '#1890ff'
  },
  {
    name: '阳台',
    description: '开放式阳台，光照良好',
    locationType: 'balcony',
    icon: '☀️',
    color: '#52c41a'
  },
  {
    name: '书房',
    description: '安静的书房，散射光环境',
    locationType: 'indoor',
    icon: '📚',
    color: '#722ed1'
  },
  {
    name: '花园',
    description: '室外小花园，全日照',
    locationType: 'outdoor',
    icon: '🌿',
    color: '#fa8c16'
  }
];

const TEST_PLANTS = [
  {
    name: '龟背竹',
    scientificName: 'Monstera deliciosa',
    description: '喜欢温暖潮湿的环境，需要散射光',
    healthStatus: 'healthy',
    roomIndex: 0, // 客厅
    purchaseDate: '2024-01-15'
  },
  {
    name: '虎皮兰',
    scientificName: 'Sansevieria trifasciata',
    description: '耐阴植物，适合室内放置',
    healthStatus: 'healthy',
    roomIndex: 2, // 书房
    purchaseDate: '2024-02-20'
  },
  {
    name: '绿萝',
    scientificName: 'Epipremnum aureum',
    description: '容易养护，可以水培或土培',
    healthStatus: 'needs_attention',
    roomIndex: 0, // 客厅
    purchaseDate: '2024-03-10'
  },
  {
    name: '多肉植物组合',
    scientificName: 'Succulents',
    description: '喜光耐旱，放在阳台',
    healthStatus: 'healthy',
    roomIndex: 1, // 阳台
    purchaseDate: '2024-01-20'
  },
  {
    name: '仙人掌',
    scientificName: 'Cactaceae',
    description: '极耐旱，放置在阳台',
    healthStatus: 'critical',
    roomIndex: 1, // 阳台
    purchaseDate: '2023-12-05'
  },
  {
    name: '吊兰',
    scientificName: 'Chlorophytum comosum',
    description: '净化空气，悬挂放置',
    healthStatus: 'healthy',
    roomIndex: 2, // 书房
    purchaseDate: '2024-01-08'
  },
  {
    name: '薄荷',
    scientificName: 'Mentha',
    description: '清香植物，可食用',
    healthStatus: 'needs_attention',
    roomIndex: 3, // 花园
    purchaseDate: '2024-04-01'
  },
  {
    name: '罗勒',
    scientificName: 'Ocimum basilicum',
    description: '烹饪常用香料植物',
    healthStatus: 'healthy',
    roomIndex: 3, // 花园
    purchaseDate: '2024-04-15'
  }
];

const TEST_CONFIGS = [
  {
    taskType: 'watering',
    frequency: 7,
    frequencyUnit: 'day',
    plantName: '龟背竹'
  },
  {
    taskType: 'fertilizing',
    frequency: 1,
    frequencyUnit: 'month',
    plantName: '龟背竹'
  },
  {
    taskType: 'watering',
    frequency: 14,
    frequencyUnit: 'day',
    plantName: '虎皮兰'
  },
  {
    taskType: 'watering',
    frequency: 3,
    frequencyUnit: 'day',
    plantName: '绿萝'
  },
  {
    taskType: 'watering',
    frequency: 10,
    frequencyUnit: 'day',
    plantName: '多肉植物组合'
  },
  {
    taskType: 'pruning',
    frequency: 1,
    frequencyUnit: 'month',
    plantName: '吊兰'
  }
];

// API 请求封装
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// 创建房间
async function createRooms() {
  console.log('\n📦 开始创建房间...');
  const createdRooms = [];

  for (const room of TEST_ROOMS) {
    try {
      const response = await apiRequest('/rooms/', {
        method: 'POST',
        body: JSON.stringify(room)
      });
      createdRooms.push(response.data);
      console.log(`  ✅ 创建房间: ${room.icon} ${room.name}`);
    } catch (error) {
      if (error.message.includes('409')) {
        console.log(`  ⚠️  房间已存在: ${room.name}`);
      } else {
        console.error(`  ❌ 创建房间失败: ${room.name} - ${error.message}`);
      }
    }
  }

  return createdRooms;
}

// 创建植物
async function createPlants(rooms) {
  console.log('\n🌱 开始创建植物...');
  const createdPlants = [];

  for (const plant of TEST_PLANTS) {
    const room = rooms[plant.roomIndex];
    if (!room) {
      console.log(`  ⚠️  跳过植物（房间未找到）: ${plant.name}`);
      continue;
    }

    try {
      const plantData = {
        name: plant.name,
        scientificName: plant.scientificName,
        description: plant.description,
        roomId: room.id,
        healthStatus: plant.healthStatus,
        purchaseDate: plant.purchaseDate
      };

      const response = await apiRequest('/plants/', {
        method: 'POST',
        body: JSON.stringify(plantData)
      });
      createdPlants.push(response.data);
      console.log(`  ✅ 创建植物: ${plant.name} (${room.name})`);
    } catch (error) {
      if (error.message.includes('409')) {
        console.log(`  ⚠️  植物已存在: ${plant.name}`);
      } else {
        console.error(`  ❌ 创建植物失败: ${plant.name} - ${error.message}`);
      }
    }
  }

  return createdPlants;
}

// 创建养护配置
async function createConfigs(plants) {
  console.log('\n⚙️  开始创建养护配置...');

  for (const config of TEST_CONFIGS) {
    const plant = plants.find(p => p.name === config.plantName);
    if (!plant) {
      console.log(`  ⚠️  跳过配置（植物未找到）: ${config.plantName}`);
      continue;
    }

    try {
      const configData = {
        plantId: plant.id,
        taskType: config.taskType,
        frequency: config.frequency,
        frequencyUnit: config.frequencyUnit
      };

      await apiRequest('/plants/configs', {
        method: 'POST',
        body: JSON.stringify(configData)
      });
      console.log(`  ✅ 创建配置: ${config.plantName} - ${config.taskType}`);
    } catch (error) {
      if (error.message.includes('409')) {
        console.log(`  ⚠️  配置已存在: ${config.plantName} - ${config.taskType}`);
      } else {
        console.error(`  ❌ 创建配置失败: ${config.plantName} - ${error.message}`);
      }
    }
  }
}

// 添加示例图片（使用 URL 方式）
async function addSampleImages(plants, rooms) {
  console.log('\n🖼️  开始添加示例图片...');

  const sampleImages = {
    '龟背竹': 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400',
    '虎皮兰': 'https://images.unsplash.com/photo-1600411833196-7c1f6b1a8b90?w=400',
    '绿萝': 'https://images.unsplash.com/photo-1599598425947-d3527b7d923e?w=400',
    '仙人掌': 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400',
    '薄荷': 'https://images.unsplash.com/photo-1564419538444-2216b519d221?w=400'
  };

  for (const [plantName, imageUrl] of Object.entries(sampleImages)) {
    const plant = plants.find(p => p.name === plantName);
    if (!plant) {
      continue;
    }

    try {
      await apiRequest(`/plants/${plant.id}/images`, {
        method: 'POST',
        body: JSON.stringify({
          url: imageUrl,
          caption: `${plantName}照片`,
          isPrimary: true
        })
      });
      console.log(`  ✅ 添加图片: ${plantName}`);
    } catch (error) {
      console.error(`  ❌ 添加图片失败: ${plantName} - ${error.message}`);
    }
  }
}

// 显示统计信息
async function showStats() {
  console.log('\n📊 数据统计:');

  try {
    const rooms = await apiRequest('/rooms/');
    const plants = await apiRequest('/plants/');
    const tasks = await apiRequest('/tasks/list');

    console.log(`  🏠 房间数量: ${rooms.data.total || rooms.data.items?.length || 0}`);
    console.log(`  🌿 植物数量: ${plants.data.total || plants.data.items?.length || 0}`);
    console.log(`  ✅ 今日任务: ${tasks.data.todayTasks?.length || 0}`);
    console.log(`  ⏰ 即将到期: ${tasks.data.upcomingTasks?.length || 0}`);
    console.log(`  ⚠️  逾期任务: ${tasks.data.overdueTasks?.length || 0}`);
  } catch (error) {
    console.error(`  ❌ 获取统计失败: ${error.message}`);
  }
}

// 主函数
async function main() {
  console.log('==================================================');
  console.log('🌿 植物数字孪生平台 - 测试数据准备脚本');
  console.log('==================================================');
  console.log(`📍 API 地址: ${API_BASE_URL}`);

  // 检查后端服务
  try {
    await apiRequest('/health');
    console.log('✅ 后端服务连接正常\n');
  } catch (error) {
    console.error('❌ 无法连接到后端服务，请确保后端正在运行');
    console.error(`   错误: ${error.message}`);
    process.exit(1);
  }

  try {
    // 创建测试数据
    const rooms = await createRooms();
    const plants = await createPlants(rooms);
    await createConfigs(plants);
    await addSampleImages(plants, rooms);

    // 显示统计
    await showStats();

    console.log('\n✨ 测试数据准备完成！');
    console.log('\n🌐 访问前端: http://localhost:12800');
    console.log('📚 查看API文档: http://localhost:12801/docs');

  } catch (error) {
    console.error('\n❌ 准备数据时出错:', error.message);
    process.exit(1);
  }
}

// 清理测试数据（可选）
async function cleanupTestData() {
  console.log('\n🗑️  清理测试数据...');

  try {
    const plants = await apiRequest('/plants/');
    const rooms = await apiRequest('/rooms/');

    // 删除所有植物
    if (plants.data.items) {
      for (const plant of plants.data.items) {
        await apiRequest(`/plants/${plant.id}`, { method: 'DELETE' });
      }
      console.log(`  ✅ 删除 ${plants.data.items.length} 个植物`);
    }

    // 删除所有房间
    if (rooms.data.items) {
      for (const room of rooms.data.items) {
        await apiRequest(`/rooms/${room.id}`, { method: 'DELETE' });
      }
      console.log(`  ✅ 删除 ${rooms.data.items.length} 个房间`);
    }

    console.log('\n✨ 清理完成！');
  } catch (error) {
    console.error('❌ 清理失败:', error.message);
  }
}

// 运行脚本
if (process.argv.includes('--cleanup')) {
  cleanupTestData();
} else {
  main();
}
