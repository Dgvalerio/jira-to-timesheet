import type { WorklogComment } from '@/get-from-jira/types';

export const parseComment = (comment: WorklogComment | undefined): string => {
  if (!comment) return 'Sem descrição';
  if (typeof comment === 'string') return comment;

  if (comment.type === 'doc' && comment.content) {
    const paragraphs = comment.content
      .filter((node) => node.type === 'paragraph' && node.content)
      .flatMap((node) =>
        node
          .content!.filter((item) => item.type === 'text')
          .map((item) => item.text)
      )
      .filter((text) => text.length > 0);

    return paragraphs.length > 0 ? paragraphs.join(' ') : 'Sem descrição';
  }

  return 'Sem descrição';
};
