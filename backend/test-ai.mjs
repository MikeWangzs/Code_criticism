import 'dotenv/config';
import { runAICritic } from './src/services/ai-critic.service.js';

async function testAI() {
  console.log('=== 测试AI分析功能 ===\n');
  
  const testCode = `
function foo(x, y) {
  var tmp = x + y;
  if (tmp > 0) {
    return tmp * 2;
  } else {
    return tmp;
  }
}

var globalVar = 'I am global';
  `;

  console.log('测试代码:');
  console.log(testCode);
  console.log('\n开始分析...\n');

  try {
    const result = await runAICritic({
      code: testCode,
      language: 'javascript'
    });

    console.log('\n=== 分析成功 ===');
    console.log('模型:', result.model);
    console.log('严格评分:', result.strictScore);
    console.log('总结:', result.summary);
    console.log('开场吐槽:', result.openingRoast);
    console.log('问题数量:', result.issues.length);
    console.log('最终裁决:', result.finalVerdict);
    
    if (result.issues.length > 0) {
      console.log('\n问题列表:');
      result.issues.forEach((issue, index) => {
        console.log(`\n${index + 1}. [${issue.level.toUpperCase()}] ${issue.title}`);
        console.log(`   位置: ${issue.lineHint || '未知'}`);
        console.log(`   吐槽: ${issue.roast}`);
        console.log(`   修复: ${issue.fix}`);
      });
    }
  } catch (error) {
    console.error('\n=== 分析失败 ===');
    console.error('错误信息:', error.message);
    console.error('错误堆栈:', error.stack);
  }
}

testAI();
