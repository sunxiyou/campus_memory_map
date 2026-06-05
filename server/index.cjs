const express = require('express');
const cors = require('cors');

const PORT = Number(process.env.PORT || 3001);

const ROLE_PROFILES = {
  roamer: {
    names: ['roamer', '漫游者'],
    label: '漫游者',
    style: '空间、路线、偶遇'
  },
  artist: {
    names: ['artist', '艺术家'],
    label: '艺术家',
    style: '形式美、诗意'
  },
  foody: {
    names: ['foody', 'Foody'],
    label: 'Foody',
    style: '食物相关线索'
  },
  ghost: {
    names: ['ghost', '校园幽灵'],
    label: '校园幽灵',
    style: '神秘但不恐怖'
  },
  archivist: {
    names: ['archivist', '档案员'],
    label: '档案员',
    style: '时间线、标签、主题总结'
  }
};

const ROLE_ALIASES = Object.entries(ROLE_PROFILES).reduce((aliases, [id, profile]) => {
  profile.names.forEach((name) => {
    aliases[String(name).toLowerCase()] = id;
  });
  return aliases;
}, {});

const app = express();

app.use(cors({
  origin(origin, callback) {
    const allowedOrigins = new Set([
      'http://127.0.0.1:5173',
      'http://localhost:5173'
    ]);
    if (!origin || allowedOrigins.has(origin)) callback(null, true);
    else callback(new Error(`CORS blocked origin: ${origin}`));
  }
}));
app.use(express.json({ limit: '1mb' }));

const normalizeRoleId = (role) => {
  const key = String(role || '').trim().toLowerCase();
  return ROLE_ALIASES[key] || key || 'roamer';
};

const getRoleProfile = (role) => {
  const roleId = normalizeRoleId(role);
  return ROLE_PROFILES[roleId] || {
    names: [roleId],
    label: String(role || roleId),
    style: '基于真实记录的简短解读'
  };
};

const normalizeMemories = (memories) => {
  if (!Array.isArray(memories)) return [];
  return memories.slice(0, 20).map((memory) => ({
    id: String(memory?.id || ''),
    title: String(memory?.title || '').trim(),
    content: String(memory?.content || memory?.text || '').trim(),
    tags: Array.isArray(memory?.tags) ? memory.tags.map((tag) => String(tag).trim()).filter(Boolean).slice(0, 8) : []
  }));
};

const summarizeMemories = (memories) => {
  const tags = [...new Set(memories.flatMap((memory) => memory.tags))].slice(0, 6);
  const titles = memories.map((memory) => memory.title).filter(Boolean).slice(0, 3);
  const snippets = memories.map((memory) => memory.content).filter(Boolean).slice(0, 2);
  return {
    count: memories.length,
    tags,
    titles,
    snippets,
    hasFood: memories.some((memory) => {
      const haystack = `${memory.title} ${memory.content} ${memory.tags.join(' ')}`.toLowerCase();
      return ['吃', '食', '饭', '餐', '咖啡', '奶茶', '面', '甜', 'food', 'foody'].some((word) => haystack.includes(word.toLowerCase()));
    })
  };
};

const buildInsightText = (role, areaId, memories) => {
  const profile = getRoleProfile(role);
  const summary = summarizeMemories(memories);
  if (!summary.count) return `${profile.label}：${areaId || 'unknown'} 暂无可解读的真实记录，我不会编造具体故事。`;

  const titles = summary.titles.length ? `「${summary.titles.join('」「')}」` : '未命名记录';
  const tags = summary.tags.length ? summary.tags.join('、') : '暂无标签';
  const snippets = summary.snippets.length ? `线索包括：${summary.snippets.join(' / ')}` : '文字内容较少，我会主要参考标题和标签。';

  switch (normalizeRoleId(role)) {
    case 'roamer':
      return `漫游者：我会从 ${areaId || 'unknown'} 的 ${summary.count} 条记录出发，沿着 ${titles} 和标签「${tags}」规划一段轻路线。${snippets}`;
    case 'artist':
      return `艺术家：${areaId || 'unknown'} 的 ${titles} 像几片被保存下来的光影，标签「${tags}」构成了这片地块的形式感。`;
    case 'foody':
      if (!summary.hasFood) return `Foody：${areaId || 'unknown'} 目前没有食物相关记录，我不会把非食物记忆硬说成美食。`;
      return `Foody：我只看食物线索。${areaId || 'unknown'} 里可读到 ${summary.count} 条记录中的餐饮气味，重点来自 ${titles}。`;
    case 'ghost':
      return `校园幽灵：${areaId || 'unknown'} 留下了 ${summary.count} 道很轻的回声，我只沿着 ${titles} 这些真实痕迹低声经过。`;
    case 'archivist':
      return `档案员：${areaId || 'unknown'} 共 ${summary.count} 条记录，主题来自 ${titles}，标签为「${tags}」。`;
    default:
      return `${profile.label}：我会按“${profile.style}”阅读 ${areaId || 'unknown'} 的 ${summary.count} 条真实记录：${titles}。`;
  }
};

const buildChatReply = ({ roleId, message, areaId, memories, history }) => {
  const profile = getRoleProfile(roleId);
  const normalizedRoleId = normalizeRoleId(roleId);
  const summary = summarizeMemories(memories);
  const cleanMessage = String(message || '').trim();
  const recentHistory = Array.isArray(history) ? history.slice(-4).map((item) => String(item?.text || '').trim()).filter(Boolean) : [];

  if (!cleanMessage) return `${profile.label}：我在这里，等你输入想聊的问题。`;

  const contextLine = summary.count
    ? `我会参考 ${areaId || 'unknown'} 的 ${summary.count} 条记录${summary.titles.length ? `，尤其是「${summary.titles.slice(0, 2).join('」「')}」` : ''}`
    : `这个地块暂无真实记录，所以我只回应你的问题本身，不补造校园细节`;
  const historyLine = recentHistory.length ? `我也记得刚才聊到过：“${recentHistory[recentHistory.length - 1]}”。` : '';

  switch (normalizedRoleId) {
    case 'roamer':
      return `漫游者：你问“${cleanMessage}”。${contextLine}。如果要开始走，我会先找一个最轻松的入口，再慢慢靠近记忆密集的地方。${historyLine}`;
    case 'artist':
      return `艺术家：你说“${cleanMessage}”。${contextLine}。我会把它看成一组形状和情绪的组合，而不是替它添加不存在的情节。${historyLine}`;
    case 'foody':
      if (!summary.hasFood) return `Foody：你问“${cleanMessage}”。这里暂时没有食物相关记录，我可以陪你聊，但不会硬把它解读成美食。${historyLine}`;
      return `Foody：你问“${cleanMessage}”。${contextLine}。我会优先留意食堂、咖啡、饭点和味道这些真实线索。${historyLine}`;
    case 'ghost':
      return `校园幽灵：你问“${cleanMessage}”。${contextLine}。我会轻一点回答，像从旧走廊里传来的回声，但不吓人。${historyLine}`;
    case 'archivist':
      return `档案员：收到问题：“${cleanMessage}”。${contextLine}。目前可用标签为「${summary.tags.join('、') || '暂无标签'}」，我会按已有资料回答。${historyLine}`;
    default:
      return `${profile.label}：你问“${cleanMessage}”。${contextLine}。${historyLine}`;
  }
};

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'campus-memory-api' });
});

app.post('/api/ai', (req, res) => {
  const areaId = String(req.body?.areaId || 'unknown');
  const memories = normalizeMemories(req.body?.memories);
  const selectedRoles = Array.isArray(req.body?.selectedRoles) ? req.body.selectedRoles : [];
  const responses = selectedRoles.map((role) => {
    const profile = getRoleProfile(role);
    return {
      role: profile.label,
      roleId: normalizeRoleId(role),
      text: buildInsightText(role, areaId, memories)
    };
  });

  res.json({ responses });
});

app.post('/api/chat', (req, res) => {
  const areaId = String(req.body?.areaId || 'unknown');
  const roleId = normalizeRoleId(req.body?.roleId);
  const memories = normalizeMemories(req.body?.memories);
  const reply = buildChatReply({
    roleId,
    message: req.body?.message,
    areaId,
    memories,
    history: req.body?.history
  });

  res.json({
    roleId,
    reply,
    createdAt: new Date().toISOString()
  });
});

app.use((err, _req, res, _next) => {
  res.status(400).json({
    error: 'bad_request',
    message: err.message || 'Request failed'
  });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Campus memory API listening on http://127.0.0.1:${PORT}`);
});
