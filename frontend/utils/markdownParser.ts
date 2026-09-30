import { NovelSettings, Episode, CommenterPersona, EpisodeComment, ProjectFullData } from '../types';

export function serializeProjectToMarkdown(
  settings: NovelSettings,
  episodes: Episode[],
  personas: CommenterPersona[],
  comments: EpisodeComment[]
): string {
  const metaObject: ProjectFullData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    settings,
    episodes,
    personas,
    comments
  };

  const jsonBlock = JSON.stringify(metaObject, null, 2);

  let md = `# [웹소설 집필 원고] ${settings.title}\n\n`;
  md += `> **장르**: ${settings.genre}\n`;
  md += `> **태그**: ${settings.tags.map(t => `#${t}`).join(' ')}\n`;
  md += `> **타깃 독자**: ${settings.targetAudience}\n`;
  md += `> **문체**: ${settings.writingStyle}\n`;
  md += `> **시점 및 시제**: ${settings.storyPov} / ${settings.narrativeTense}\n\n`;

  md += `## 1. 작품 기획 및 등장인물 설정\n\n`;
  md += `### 시놉시스\n${settings.synopsis}\n\n`;
  md += `### 남주인공\n${settings.maleLead}\n\n`;
  md += `### 여주인공\n${settings.femaleLead}\n\n`;
  md += `### 주요 조연\n${settings.supportingChars}\n\n`;

  md += `---\n\n`;
  md += `## 2. 영웅의 여정 12단계 에피소드 본문\n\n`;

  episodes.forEach((ep, idx) => {
    md += `### ${ep.title} (${ep.stageTitle})\n\n`;
    md += `* **줄거리 요약**: ${ep.summary}\n`;
    md += `* **핵심 사건**: ${ep.keyEvents.join(' -> ')}\n`;
    md += `* **주요 갈등**: ${ep.conflict}\n\n`;
    md += `#### [원고 본문]\n\n`;
    md += `${ep.content || '(아직 작성된 본문이 없습니다.)'}\n\n`;
    
    // Comments for this episode
    const epComments = comments.filter(c => c.episodeId === ep.id);
    if (epComments.length > 0) {
      md += `##### [독자 정주행 댓글]\n`;
      epComments.forEach(c => {
        md += `- **${c.personaName}** [${c.platform}] (${c.createdAt}) : ${c.content} (👍 ${c.likes})\n`;
      });
      md += `\n`;
    }
    md += `---\n\n`;
  });

  md += `## 3. 독자 페르소나 (총 ${personas.length}명)\n\n`;
  personas.forEach((p, idx) => {
    md += `${idx + 1}. **${p.name}** (${p.platform} / ${p.age} ${p.gender})\n`;
    md += `   - 성향: ${p.personality}\n`;
    md += `   - 말투: "${p.toneStyle}"\n`;
  });

  md += `\n\n<!-- STORYFORGE_DATA_START\n${jsonBlock}\nSTORYFORGE_DATA_END -->\n`;

  return md;
}

export function parseProjectFromMarkdown(markdownText: string): ProjectFullData | null {
  try {
    const startTag = '<!-- STORYFORGE_DATA_START';
    const endTag = 'STORYFORGE_DATA_END -->';

    const startIndex = markdownText.indexOf(startTag);
    const endIndex = markdownText.indexOf(endTag);

    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      const jsonStr = markdownText.substring(startIndex + startTag.length, endIndex).trim();
      const parsed = JSON.parse(jsonStr) as ProjectFullData;
      if (parsed && parsed.settings && Array.isArray(parsed.episodes)) {
        return parsed;
      }
    }

    // Fallback: If no structured JSON comment block, attempt light parsing
    return null;
  } catch (err) {
    console.error('Failed to parse StoryForge markdown data block:', err);
    return null;
  }
}
